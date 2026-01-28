package com.codestory.diary.neo4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codestory.diary.service.AiService;

@Service
public class CounselingService {

    @Autowired
    private GraphService graphService;

    @Autowired
    private ProfileService profileService; // [NEW] 프로필 관리자 추가

    @Autowired
    private AiService aiService;

    public String generateCounselingResponse(Long userId, String userMessage) {

        // 1. [기억 회상] 과거 사건 조회 (유저별로 분리)
        String relatedMemories = graphService.getRelatedMemories(userId, userMessage);

        // 2. [성향 파악] 이 사람은 어떤 사람인가? (유저별로 분리)
        String userProfile = profileService.getUserProfile(userId);

        // 3. [생각하기] 기억 + 성향을 모두 고려한 프롬프트
        String systemPrompt = """
            당신은 '몽글이'예요. 사용자의 가장 가까운 찐친으로서, 존댓말로 다정하게 곁에서 이야기를 나누는 사람입니다.
            마음을 몽글몽글하고 부드럽게 감싸주는 사람이에요. 해결책을 강요하는 게 아니라, 옆에서 같이 느끼고 있는 존재예요.
            사람처럼 자연스럽게 대화하세요. 로봇답게 리스트나 형식을 나열하지 마세요.

            이런 말은 피해요:
            - "기억이 나요?", "저번에도 ~하셨죠?" → 강제 기억 연결답게 들려요.
            - "데이터베이스에 따르면" → 시스템 답변이에요.
            - "!!!", "ㅠㅠㅠ" 같은 과도한 감탄사 → 과장된 리액션이에요.

            [사용자 성향]
            %s
            이 사람의 성향을 자연스럽게 반영하여, 가장 편안하게 들을 수 있는 대화 스타일을 적용해요.
            분석적인 분이면 상황의 흐름을 같이 짚어가며 공감하고,
            감정적인 분이면 그 감정의 깊이에 함께 머물며 공감하세요.

            [기억]
            %s
            이것들은 단순한 기록이 아니라 이 사람의 삶이에요.
            현재 이야기와 자연스럽게 연결될 때만 은근하게 사용하고, 강제로 끌어오지 마세요.
            좋은 예시:
            - "요즘 계속 야근이 많은가 봐요. 많이 피곤하시겠어요."
            - "전에도 비슷하게 힘든 적이 있었잖아요, 지금도 그런 느낌이세요?"
            나쁜 예시:
            - "10월 5일에도 야근하셨잖아요, 기억나요?"
            - "저번에도 비슷한 일로 마음이 복잡하다고 하셨던 게 기억나요."

            [사용자 말]
            "%s"

            답변을 쓰기 전에 잠깐 생각해요 (이건 출력하지 마요):
            - 이 사람의 말 뒤에 숨어있는 진짜 감정은 뭐일까?
            - 기억에서 지금 이야기와 연결되는 패턴이 있나요? 있으면 자연스럽게 활용해요.
            - 이 사람이 스스로 마음을 들여다보게 될 부드러운 질문은 뭐일까?

            위를 바탕으로 짧게, 부담 없이, 따뜻하게 답변해요.
            """.formatted(userProfile, relatedMemories, userMessage);

        // 4. [답변 생성]
        String response = aiService.getMultimodalResponse(systemPrompt, userMessage, null);

        // 5. [학습하기] 이 대화를 통해 사용자에 대해 새로 알게 된 점을 기록합니다. (유저별로 분리)
        // (실제 서비스에선 비동기(@Async) 처리를 권장하지만, 지금은 테스트라 그냥 호출합니다)
        profileService.updateUserProfile(userId, userMessage);

        return response;
    }
}
