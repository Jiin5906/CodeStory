package com.codestory.diary.neo4j;

import java.util.Collection;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;

import com.codestory.diary.service.AiService;

@Service
public class GraphService {

    @Autowired
    private Neo4jClient neo4jClient;

    @Autowired
    private AiService aiService;

    // [기능 1] 일기를 뇌(Graph)에 저장하기
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

            System.out.println("✅ 그래프 저장 완료 (User ID: " + userId + "): " + cypherQuery);
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
}