package com.codestory.diary.neo4j;

import com.codestory.diary.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CounselingService {

    @Autowired
    private GraphService graphService; 
    
    @Autowired
    private ProfileService profileService; // [NEW] 프로필 관리자 추가

    @Autowired
    private AiService aiService; 

    public String generateCounselingResponse(String userMessage) {
        
        // 1. [기억 회상] 과거 사건 조회
        String relatedMemories = graphService.getRelatedMemories(userMessage);
        
        // 2. [성향 파악] 이 사람은 어떤 사람인가?
        String userProfile = profileService.getUserProfile();

        // 3. [생각하기] 기억 + 성향을 모두 고려한 프롬프트
        String systemPrompt = """
            당신은 AI 상담사 '포포'입니다.
            
            [사용자 성향(Profile)]
            """ + userProfile + """
            
            [관련된 과거 기억(Memory)]
            """ + relatedMemories + """
            
            [지침]
            1. [사용자 성향]에 맞춰서 말투와 태도를 조절하세요.
            2. [과거 기억]을 활용해 통찰력 있는 질문을 던지세요.
            3. 뻔한 위로는 금지입니다.
            """;

        // 4. [답변 생성]
        String response = aiService.getMultimodalResponse(systemPrompt, userMessage, null);
        
        // 5. [학습하기] 이 대화를 통해 사용자에 대해 새로 알게 된 점을 기록합니다.
        // (실제 서비스에선 비동기(@Async) 처리를 권장하지만, 지금은 테스트라 그냥 호출합니다)
        profileService.updateUserProfile(userMessage);
        
        return response;
    }
}