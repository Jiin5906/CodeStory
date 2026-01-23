package com.codestory.diary.neo4j;

import com.codestory.diary.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;
import java.util.Collection;
import java.util.Map;

@Service
public class GraphService {

    @Autowired
    private Neo4jClient neo4jClient;

    @Autowired
    private AiService aiService;

    // [기능 1] 일기를 뇌(Graph)에 저장하기
    public void saveDiaryToGraph(String diaryContent) {
        // 1. 프롬프트 생성
        String prompt = "[System Prompt]\n"
                + "당신은 심리 상담 전문가이자 데이터 엔지니어입니다.\n"
                + "사용자의 일기를 분석해서 Neo4j 그래프 데이터베이스에 넣을 수 있는 'Cypher Query' 문장만 딱 만들어주세요.\n"
                + "다른 말(설명)은 절대 하지 말고, 오직 코드만 출력하세요.\n"
                + "\n"
                + "[규칙]\n"
                + "1. 노드(점) 종류: (:Person), (:Event), (:Emotion), (:Action)\n"
                + "2. 관계(선) 종류: -[:DID]->, -[:FELT]->, -[:CAUSED]->\n"
                + "3. 사용자는 항상 'User'라는 이름의 Person으로 고정하세요.\n"
                + "\n"
                + "[예시]\n"
                + "사용자 입력: \"오늘 팀장님한테 깨져서 너무 우울해. 그래서 매운 떡볶이 먹었어.\"\n"
                + "출력:\n"
                + "MERGE (u:Person {name: 'User'})\n"
                + "MERGE (p:Person {name: '팀장님'})\n"
                + "MERGE (e:Event {name: '혼남'})\n"
                + "MERGE (em:Emotion {name: '우울함', intensity: 8})\n"
                + "MERGE (f:Action {name: '매운 떡볶이 먹기'})\n"
                + "MERGE (u)-[:INVOLVED]->(e)\n"
                + "MERGE (p)-[:CAUSED]->(e)\n"
                + "MERGE (e)-[:CAUSED]->(em)\n"
                + "MERGE (em)-[:CAUSED]->(f);";

        // 2. AiService의 getMultimodalResponse 메서드 호출
        String cypherQuery = aiService.getMultimodalResponse(prompt, diaryContent, null);

        // 3. 코드 정제 및 실행
        if (cypherQuery != null) {
            cypherQuery = cypherQuery.replace("```cypher", "").replace("```", "").trim();
            neo4jClient.query(cypherQuery).run();
            System.out.println("✅ 그래프 저장 완료: " + cypherQuery);
        }
    }

    // [기능 2] 관련된 기억 꺼내오기
    public String getRelatedMemories(String userMessage) {
        String query = "MATCH (e:Emotion)<-[:CAUSED]-(ev:Event) "
                + "WHERE e.name CONTAINS $keyword OR ev.name CONTAINS $keyword "
                + "RETURN ev.name AS event, e.name AS emotion "
                + "LIMIT 3";

        // 테스트용 키워드 (나중에 GPT로 추출하는 로직으로 변경 필요)
        String keyword = "우울";

        Collection<Map<String, Object>> results = neo4jClient.query(query)
                .bind(keyword).to("keyword")
                .fetch().all();

        return results.toString();
    }
}
