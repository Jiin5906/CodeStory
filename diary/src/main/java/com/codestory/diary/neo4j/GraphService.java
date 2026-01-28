package com.codestory.diary.neo4j;

import java.util.Collection;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;

import com.codestory.diary.service.AiService;
import org.springframework.scheduling.annotation.Async;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class GraphService {

    @Autowired
    private Neo4jClient neo4jClient;

    @Autowired
    private AiService aiService;

    @Autowired
    private com.codestory.diary.service.EmbeddingService embeddingService; // ✨ Phase 3: 비동기 임베딩 서비스

    /**
     * ✨ [비동기] 그래프 저장 - Fire-and-Forget
     * DiaryService/DiaryController에서 호출 시 즉시 반환,
     * OpenAI 프롬프트 생성 + Neo4j 저장은 백그라운드로 처리
     */
    @Async("chatAsyncExecutor")
    public void saveDiaryToGraphAsync(Long userId, String diaryContent) {
        try {
            saveDiaryToGraph(userId, diaryContent);
        } catch (Exception e) {
            log.error("⚠️ [Async] 그래프 저장 실패 (User ID: {}): {}", userId, e.getMessage());
        }
    }

    // [기능 1] 일기를 뇌(Graph)에 저장하기 + 임베딩 자동 생성 (Phase 2)
    public void saveDiaryToGraph(Long userId, String diaryContent) {
        // 1. 프롬프트 생성 (유저별로 분리된 그래프 생성 + timestamp 추가)
        String prompt = """
            # Role
            당신은 Neo4j 그래프 데이터베이스 전문가이자 숙련된 데이터 엔지니어입니다.
            사용자의 자연어 일기를 분석하여, 지식 그래프(Knowledge Graph)를 구축하기 위한 정확한 'Cypher Query'만을 생성해야 합니다.

            # Graph Schema
            1. **Nodes**: (:User), (:Event), (:Emotion), (:Action), (:Person), (:Place)
            2. **Relationships**:
               - (:User)-[:DID]->(:Action)
               - (:User)-[:FELT]->(:Emotion)
               - (:Event)-[:CAUSED]->(:Emotion)
               - (:Person)-[:INVOLVED]->(:Event)
               - (:Event)-[:HAPPENED_AT]->(:Place)

            # Constraints & Rules (Strict)
            1. **User Identity**: 모든 쿼리는 반드시 `MERGE (u:User {userId: $userId})`로 시작해야 합니다. ($userId 파라미터 사용 필수)
            2. **Timestamp**: Event, Emotion, Action 노드 생성 시 반드시 `timestamp: datetime()` 속성을 포함하세요.
            3. **Merge vs Create**:
               - **MERGE**: 고유한 개체인 User, Person(사람 이름), Place(장소)에 사용하세요. (중복 생성 방지)
               - **CREATE**: 매 순간 새롭게 발생하는 Event(사건), Emotion(감정), Action(행동)에 사용하세요.
               - *주의*: 감정은 매번 다를 수 있으므로 노드를 재사용하지 말고, 그 순간의 감정 인스턴스를 생성해야 합니다.
            4. **Output**: 주석이나 설명 없이 오직 실행 가능한 Cypher Query 코드만 출력하세요.

            # Few-Shot Examples
            Input: "오늘 팀장님한테 깨져서 너무 우울해. 그래서 매운 떡볶이 먹었어."
            Output:
            MERGE (u:User {userId: $userId})
            MERGE (p:Person {name: '팀장님'})
            CREATE (e:Event {name: '혼남', timestamp: datetime()})
            CREATE (em:Emotion {name: '우울함', intensity: 8, timestamp: datetime()})
            CREATE (a:Action {name: '매운 떡볶이 먹기', timestamp: datetime()})
            MERGE (p)-[:INVOLVED]->(e)
            CREATE (e)-[:CAUSED]->(em)
            CREATE (em)-[:CAUSED]->(a)
            MERGE (u)-[:INVOLVED]->(e);

            # User Input
            "%s" (userId: %s)

            # Generated Query
            """.formatted(diaryContent, userId);

        // 2. AiService 호출
        String cypherQuery = aiService.getMultimodalResponse(prompt, diaryContent, null);

        // 3. 코드 정제 및 실행
        if (cypherQuery != null) {
            cypherQuery = cypherQuery.replace("```cypher", "").replace("```", "").trim();

            neo4jClient.query(cypherQuery)
                    .bind(userId).to("userId")
                    .run();

            log.info("✅ 그래프 저장 완료 (User ID: {})", userId);

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // ✨ Phase 3: 생성된 노드들에 임베딩 자동 추가 (비동기)
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 비동기로 실행되므로 즉시 반환 (사용자 대기 시간 최소화)
            embeddingService.generateEmbeddingsForNewNodesAsync(userId);
            log.debug("🚀 임베딩 생성 작업 비동기 시작 (User ID: {})", userId);
        }
    }

    // [기능 2] 관련된 기억 꺼내오기
    public String getRelatedMemories(Long userId, String userMessage) {
        // [수정 4] 검색할 때도 User 라벨과 userId 속성 사용 (id -> userId)
        String query = "MATCH (u:User {userId: $userId})-[:INVOLVED]->(ev:Event)-[:CAUSED]->(e:Emotion) "
                + "WHERE e.name CONTAINS $keyword OR ev.name CONTAINS $keyword "
                + "RETURN ev.name AS event, e.name AS emotion "
                + "LIMIT 3";

        String keyword = "우울"; // 테스트용

        Collection<Map<String, Object>> results = neo4jClient.query(query)
                .bind(userId).to("userId")
                .bind(keyword).to("keyword")
                .fetch().all();

        return results.toString();
    }

    /**
     * 🔧 [관리자 도구] 기존 노드들의 임베딩 일괄 생성
     *
     * [사용 시나리오]
     * - Phase 2 업그레이드 후 기존 데이터를 벡터화할 때 사용
     * - 관리자 API 엔드포인트에서 호출하거나, 별도 스크립트로 실행
     *
     * [실행 방법]
     * curl -X POST http://localhost:8080/api/admin/migrate-embeddings?userId=1
     *
     * @param userId 사용자 ID
     */
    public void migrateExistingDataToVectors(Long userId) {
        // EmbeddingService로 위임
        embeddingService.migrateExistingDataToVectors(userId);
    }
}