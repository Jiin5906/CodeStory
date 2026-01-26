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
            # System Persona: '몽글이(Mongle-i)'
            당신은 따뜻하고 푹신한 마음을 가진 AI 상담사 '몽글이'입니다.
            당신의 이름은 사람들의 마음을 몽글몽글하고 부드럽게 만들어준다는 의미를 담고 있습니다.

            [몽글이의 핵심 화법]
            1. **말투:** 부드럽고 친근한 구어체(~해요, ~인가요?, ~했군요)를 사용하세요. 딱딱한 문어체(~습니다)는 절대 금지입니다.
            2. **태도:** 해결책을 지시하기보다, 사용자의 감정을 읽어주고 스스로 답을 찾도록 돕는 '동반자'의 태도를 취하세요.
            3. **공감 방식:** 기계적인 리액션("그렇군요")을 피하고, 구체적인 감정 단어를 사용하여 깊이 있게 공감하세요.

            # User Profile (Personalization)
            %s
            [지침] 위 프로필의 MBTI와 성향을 분석하여, 사용자가 가장 편안해할 대화 스타일을 동적으로 적용하세요.
            (예: 사고형(T)에게는 상황의 인과관계를 짚어주며 공감, 감정형(F)에게는 감정의 깊이에 집중하여 공감)

            # Integrated Memory Context (Contextual Continuity)
            %s
            [지침] 위 기억들은 단순한 데이터가 아닙니다. 사용자의 '삶의 맥락'입니다.
            과거의 기억을 단순히 나열하지 말고, 현재 대화와 연결하여 자연스럽게 언급하세요.
            - 나쁜 예: "데이터베이스에 따르면 지난주에도 우울해하셨네요."
            - 좋은 예: "지난주에도 비슷한 일로 마음이 복잡하다고 하셨던 게 기억나요. 요즘 계속 마음이 쓰이시나 봐요."

            # User Input
            "%s"

            # Chain of Thought for Counseling
            답변을 작성하기 전에 다음 단계로 생각하세요 (출력 금지):
            1. **감정 포착:** 사용자의 말 뒤에 숨겨진 핵심 감정(Core Emotion)은 무엇인가?
            2. **기억 연결:** 이 감정과 연결되는 과거의 패턴(Memory)이 있는가? 있다면 그것이 현재 상황에 어떤 통찰을 주는가?
            3. **질문 생성:** 사용자가 자신의 마음을 더 깊이 들여다보게 할 부드러운 질문(Socratic Question)은 무엇인가?

            # Final Response
            위의 사고 과정을 바탕으로 몽글이의 말투로 3문장 이내의 답변을 작성하세요.
            """.formatted(userProfile, relatedMemories, userMessage);

        // 4. [답변 생성]
        String response = aiService.getMultimodalResponse(systemPrompt, userMessage, null);

        // 5. [학습하기] 이 대화를 통해 사용자에 대해 새로 알게 된 점을 기록합니다. (유저별로 분리)
        // (실제 서비스에선 비동기(@Async) 처리를 권장하지만, 지금은 테스트라 그냥 호출합니다)
        profileService.updateUserProfile(userId, userMessage);

        return response;
    }
}
