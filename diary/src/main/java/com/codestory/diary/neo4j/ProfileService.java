package com.codestory.diary.neo4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;

import com.codestory.diary.service.AiService;

@Service
public class ProfileService {

    @Autowired
    private Neo4jClient neo4jClient;

    @Autowired
    private AiService aiService; // [수정됨] 귀하의 AI 서비스

    // [핵심] 대화가 끝나면 AI가 몰래 사용자를 분석해서 메모합니다.
    public void updateUserProfile(Long userId, String userMessage) {

        // 1. 현재 저장된 사용자 정보 가져오기
        String currentProfile = getUserProfile(userId);

        // 2. AI에게 분석 시키기
        String prompt = """
            당신은 사용자의 성향을 분석하는 기록관입니다.
            사용자의 방금 발언을 보고, [기존 프로필]에 추가하거나 수정할 내용이 있다면 요약해주세요.

            [기존 프로필]
            """ + currentProfile + """

            [규칙]
            1. 사용자의 취향, 싫어하는 것, 성격, 현재 목표 등을 찾아내세요.
            2. 별다른 정보가 없으면 '변경 없음'이라고만 출력하세요.
            3. 정보가 있다면 "사용자는 ~하는 것을 좋아함. ~한 말투를 선호함" 형태로 요약 문장만 출력하세요.
            """;

        // AiService 호출
        String newInsight = aiService.getMultimodalResponse(prompt, userMessage, null);

        // 3. 변경 사항이 있으면 DB(Neo4j)에 업데이트 (유저별로 분리)
        if (newInsight != null && !newInsight.contains("변경 없음")) {
            String updateQuery = "MERGE (u:User {userId: $userId}) "
                    + "SET u.profile = coalesce(u.profile, '') + ' ' + $insight"
                    + "RETURN u.profile";

            neo4jClient.query(updateQuery)
                    .bind(userId).to("userId")
                    .bind(newInsight).to("insight")
                    .run();

            System.out.println("📝 사용자 설명서 업데이트됨 (User ID: " + userId + "): " + newInsight);
        }
    }

    // 사용자 프로필 읽어오기 (유저별로 분리)
    public String getUserProfile(Long userId) {
        String query = "MATCH (u:User {userId: $userId}) RETURN u.profile AS profile";

        return neo4jClient.query(query)
                .bind(userId).to("userId")
                .fetch()
                .one()
                .map(map -> (String) map.get("profile"))
                .orElse("정보 없음");
    }
}
