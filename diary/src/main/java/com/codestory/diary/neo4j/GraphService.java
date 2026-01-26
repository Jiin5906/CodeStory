package com.codestory.diary.neo4j;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;

import com.codestory.diary.service.AiService;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.data.embedding.Embedding;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class GraphService {

    @Autowired
    private Neo4jClient neo4jClient;

    @Autowired
    private AiService aiService;

    @Autowired
    private EmbeddingModel embeddingModel; // ✨ Phase 2: 임베딩 모델 추가

    // [기능 1] 일기를 뇌(Graph)에 저장하기 + 임베딩 자동 생성 (Phase 2)
    public void saveDiaryToGraph(Long userId, String diaryContent) {
        // 1. 프롬프트 생성 (유저별로 분리된 그래프 생성)
        String prompt = "[System Prompt]\n"
                + "당신은 심리 상담 전문가이자 데이터 엔지니어입니다.\n"
                + "사용자의 일기를 분석해서 Neo4j 그래프 데이터베이스에 넣을 수 있는 'Cypher Query' 문장만 딱 만들어주세요.\n"
                + "다른 말(설명)은 절대 하지 말고, 오직 코드만 출력하세요.\n"
                + "\n"
                + "[규칙]\n"
                // [수정 1] Person -> User로 변경 (ProfileService와 통일)
                + "1. 노드(점) 종류: (:User), (:Event), (:Emotion), (:Action)\n"
                + "2. 관계(선) 종류: -[:DID]->, -[:FELT]->, -[:CAUSED]->, -[:INVOLVED]->\n"
                // [수정 2] Prompt에서도 Person -> User, 그리고 userId 속성 명시
                + "3. **중요**: 사용자 노드는 반드시 'MERGE (u:User {userId: $userId})'로 시작하세요.\n"
                + "   - $userId는 파라미터로 전달되며, 각 유저를 고유하게 식별합니다.\n"
                + "\n"
                + "[예시]\n"
                + "사용자 입력: \"오늘 팀장님한테 깨져서 너무 우울해. 그래서 매운 떡볶이 먹었어.\"\n"
                + "출력:\n"
                // [수정 3] 예시 코드도 User 라벨로 변경
                + "MERGE (u:User {userId: $userId})\n"
                + "MERGE (p:Person {name: '팀장님'})\n"
                + "MERGE (e:Event {name: '혼남'})\n"
                + "MERGE (em:Emotion {name: '우울함', intensity: 8})\n"
                + "MERGE (f:Action {name: '매운 떡볶이 먹기'})\n"
                + "MERGE (u)-[:INVOLVED]->(e)\n"
                + "MERGE (p)-[:CAUSED]->(e)\n"
                + "MERGE (e)-[:CAUSED]->(em)\n"
                + "MERGE (em)-[:CAUSED]->(f);";

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
            // ✨ Phase 2: 생성된 노드들에 임베딩 자동 추가
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            try {
                generateEmbeddingsForNewNodes(userId);
                log.info("✅ 임베딩 생성 완료 (User ID: {})", userId);
            } catch (Exception e) {
                log.warn("⚠️ 임베딩 생성 실패 (그래프 저장은 완료됨): {}", e.getMessage());
            }
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
     * ✨ [Phase 2] 임베딩이 없는 노드들에 자동으로 임베딩 생성 및 저장
     *
     * [작동 방식]
     * 1. 유저와 연결된 모든 노드 중 embedding 속성이 없는 노드 찾기
     * 2. 각 노드의 name 속성을 벡터로 변환 (OpenAI text-embedding-3-small)
     * 3. 해당 노드에 embedding 속성 추가
     *
     * [주의사항]
     * - 이 메서드는 일기 저장 후 자동으로 호출됩니다
     * - Neo4j 5.11+ 버전에서만 벡터 인덱스가 지원됩니다
     * - 임베딩 생성 실패 시에도 일기 저장은 정상적으로 완료됩니다
     */
    private void generateEmbeddingsForNewNodes(Long userId) {
        try {
            // Step 1: embedding 속성이 없는 노드들 찾기 (Event, Emotion, Action 타입)
            String findNodesQuery = """
                MATCH (u:User {userId: $userId})-[r]->(n)
                WHERE (n:Event OR n:Emotion OR n:Action)
                  AND n.name IS NOT NULL
                  AND n.embedding IS NULL
                RETURN id(n) AS nodeId, labels(n) AS labels, n.name AS name
                LIMIT 50
            """;

            Collection<Map<String, Object>> nodes = neo4jClient.query(findNodesQuery)
                    .bind(userId).to("userId")
                    .fetch()
                    .all();

            if (nodes.isEmpty()) {
                log.debug("  ℹ️ 임베딩이 필요한 노드가 없습니다");
                return;
            }

            log.info("  🔍 임베딩 생성 대상: {} 개 노드", nodes.size());

            // Step 2: 각 노드에 대해 임베딩 생성 및 저장
            int successCount = 0;
            for (Map<String, Object> node : nodes) {
                Long nodeId = (Long) node.get("nodeId");
                String name = (String) node.get("name");

                if (name == null || name.trim().isEmpty()) {
                    continue;
                }

                try {
                    // Step 2-1: 텍스트를 벡터로 변환
                    Embedding embedding = embeddingModel.embed(name).content();
                    List<Float> vector = embedding.vectorAsList();

                    // Step 2-2: Neo4j에 벡터 저장
                    String updateQuery = """
                        MATCH (n)
                        WHERE id(n) = $nodeId
                        SET n.embedding = $vector
                    """;

                    neo4jClient.query(updateQuery)
                            .bind(nodeId).to("nodeId")
                            .bind(vector).to("vector")
                            .run();

                    successCount++;
                    log.debug("    ✓ 임베딩 추가: {} (ID: {})", name, nodeId);

                } catch (Exception e) {
                    log.warn("    ⚠️ 임베딩 생성 실패: {} - {}", name, e.getMessage());
                }
            }

            log.info("  ✅ 임베딩 생성 완료: {}/{} 성공", successCount, nodes.size());

        } catch (Exception e) {
            log.error("❌ 임베딩 생성 프로세스 실패", e);
            throw new RuntimeException("임베딩 생성 실패", e);
        }
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
     */
    public void migrateExistingDataToVectors(Long userId) {
        log.info("🔄 [마이그레이션] 기존 데이터 벡터화 시작 (User ID: {})", userId);

        try {
            // 모든 노드(embedding 없는 것들)에 대해 임베딩 생성
            generateEmbeddingsForNewNodes(userId);

            log.info("✅ [마이그레이션] 완료!");

        } catch (Exception e) {
            log.error("❌ [마이그레이션] 실패", e);
            throw new RuntimeException("마이그레이션 실패", e);
        }
    }
}