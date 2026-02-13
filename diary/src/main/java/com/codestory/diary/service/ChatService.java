package com.codestory.diary.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.codestory.diary.entity.ChatMessage;
import com.codestory.diary.entity.Diary;
import com.codestory.diary.repository.ChatMessageRepository;
import com.codestory.diary.repository.DiaryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final DiaryRepository diaryRepository;
    private final MemoryService memoryService;
    private final PiiMaskingService piiMaskingService;
    private final PetService petService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Phase 1.1: Few-shot 프롬프트 Feature Flags
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    @Value("${ai.prompt.enable-few-shot:false}")
    private boolean enableFewShot;

    @Value("${ai.prompt.enable-chain-of-thought:false}")
    private boolean enableChainOfThought;

    @Value("${ai.response.max-tokens:150}")
    private int maxTokens;

    @Value("${ai.response.temperature:0.5}")
    private double temperature;

    private static final String API_URL = "https://api.openai.com/v1/chat/completions";
    private static final int MAX_HISTORY = 5; // 최근 대화 히스토리 개수 제한 (속도 최적화)

    /**
     * 사용자 메시지를 받아 AI 응답을 생성하고, 대화를 저장 및 학습
     *
     * @param userId 사용자 ID
     * @param userMessage 사용자 메시지
     * @return AI 응답 (감정 태그 포함)
     */
    @Transactional
    public com.codestory.diary.dto.ChatResponseDto chat(Long userId, String userMessage) {
        System.out.println("🎯 [ChatService] 호출됨 - User: " + userId + ", Message: " + userMessage);
        String userIdString = String.valueOf(userId);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 1. 과거 대화 히스토리 로드 (최근 N개)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        List<ChatMessage> recentMessages = chatMessageRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<ChatMessage> limitedHistory = recentMessages.stream()
                .limit(MAX_HISTORY)
                .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt())) // 시간 순서대로 정렬
                .collect(Collectors.toList());

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 2. RAG: 벡터 유사도 기반 관련 일기 기억 검색
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        List<String> relatedMemories = memoryService.findRelatedMemories(userIdString, userMessage);

        // 관련 기억 컨텍스트 생성 (속도 최적화 버전)
        StringBuilder memoryContext = new StringBuilder();
        if (!relatedMemories.isEmpty()) {
            memoryContext.append("\n🧠 학습된 기억:\n");
            for (int i = 0; i < Math.min(3, relatedMemories.size()); i++) { // 최대 3개만 사용
                String memory = relatedMemories.get(i);
                memoryContext.append(String.format("- %s\n",
                        memory.length() > 80 ? memory.substring(0, 80) + "..." : memory));
            }
            memoryContext.append("→ 자연스럽게 활용하세요.\n");
        } else {
            memoryContext.append("\n💡 첫 대화입니다. 자연스럽게 답변하세요.\n");
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 3. [최우선] 사용자 최신 일기 컨텍스트 조회
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        String diaryContext = buildDiaryContext(userId);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 4. 사용자 학습형 대화 LLM 프롬프트 (일기 컨텍스트 포함)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        String systemPrompt = buildSystemPrompt(diaryContext, memoryContext.toString());

        List<Map<String, Object>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        // 과거 대화 히스토리 추가
        for (ChatMessage msg : limitedHistory) {
            messages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 4. PII 마스킹: 사용자 메시지에서 개인정보 제거 (LLM 전송 전)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        String maskedUserMessage = piiMaskingService.maskContent(userMessage);

        // 현재 사용자 메시지 추가
        messages.add(Map.of("role", "user", "content", maskedUserMessage));

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 5. 강화된 OpenAI API 호출 (재시도 로직 포함)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        String aiResponse = generateAiResponseWithRetry(messages, 2);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 5.5. 품질 검수: 답변이 너무 길거나 부적절한 경우 재생성
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        aiResponse = validateAndRefineResponse(aiResponse);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 6. 대화 저장: 사용자 메시지 (원본) + AI 응답
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ChatMessage userMsg = ChatMessage.builder()
                .userId(userId)
                .role("user")
                .content(userMessage) // 원본 메시지 저장
                .build();
        chatMessageRepository.save(userMsg);

        ChatMessage assistantMsg = ChatMessage.builder()
                .userId(userId)
                .role("assistant")
                .content(aiResponse)
                .build();
        chatMessageRepository.save(assistantMsg);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 7. 벡터 DB에 저장 (학습): Fire-and-Forget 비동기 호출
        //    사용자 응답 반환에 영향 없이 백그라운드로 학습
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        memoryService.saveMemoryAsync(userIdString, userMessage);
        memoryService.saveMemoryAsync(userIdString, "AI 응답: " + aiResponse);

        System.out.println("✅ [ChatService] 응답 생성 완료: " + aiResponse);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 8. 감정 태그 파싱 [EMOTION:xxx] - 11가지 감정 지원 (개선됨)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        String emotion = "neutral"; // 기본값
        String cleanedResponse = aiResponse;

        if (aiResponse.contains("[EMOTION:")) {
            int startIdx = aiResponse.indexOf("[EMOTION:");
            int endIdx = aiResponse.indexOf("]", startIdx);
            if (endIdx > startIdx) {
                String emotionTag = aiResponse.substring(startIdx + 9, endIdx).trim().toLowerCase();

                // ✨ 프론트엔드 호환: 백엔드 감정 → 프론트엔드 형식 변환
                Map<String, String> emotionMapping = new java.util.HashMap<>();
                emotionMapping.put("happy", "happiness");
                emotionMapping.put("sad", "sadness");
                emotionMapping.put("angry", "anger");
                emotionMapping.put("anxious", "anxiety");
                emotionMapping.put("scared", "fear");
                emotionMapping.put("surprised", "surprise");
                emotionMapping.put("loving", "love");
                emotionMapping.put("peaceful", "calm");
                emotionMapping.put("depressed", "depression");
                emotionMapping.put("neutral", "neutral");
                emotionMapping.put("normal", "normal");

                // 이미 프론트엔드 형식인 경우도 지원
                emotionMapping.put("happiness", "happiness");
                emotionMapping.put("sadness", "sadness");
                emotionMapping.put("anger", "anger");
                emotionMapping.put("anxiety", "anxiety");
                emotionMapping.put("fear", "fear");
                emotionMapping.put("surprise", "surprise");
                emotionMapping.put("love", "love");
                emotionMapping.put("calm", "calm");
                emotionMapping.put("depression", "depression");

                // 변환 또는 그대로 사용
                emotion = emotionMapping.getOrDefault(emotionTag, "neutral");

                // 사용자에게 보여줄 메시지에서 태그 제거
                cleanedResponse = aiResponse.substring(0, startIdx).trim();
            }
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 9. Pet 상호작용: 30% 확률로 EXP 부여
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        petService.onChatInteraction(userId);

        return com.codestory.diary.dto.ChatResponseDto.builder()
                .role("assistant")
                .content(cleanedResponse)
                .emotion(emotion)
                .timestamp(java.time.LocalDateTime.now())
                .build();
    }

    /**
     * 특정 사용자의 전체 채팅 히스토리 조회
     *
     * @param userId 사용자 ID
     * @return 채팅 메시지 리스트 (시간순)
     */
    @Transactional(readOnly = true)
    public List<ChatMessage> getChatHistory(Long userId) {
        List<ChatMessage> messages = chatMessageRepository.findByUserIdOrderByCreatedAtDesc(userId);
        // 시간 순서대로 정렬하여 반환
        messages.sort((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()));
        return messages;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Private Helper Methods: LLM 품질 검수 및 재시도 로직
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * AI 응답 생성 with 재시도 로직
     */
    private String generateAiResponseWithRetry(List<Map<String, Object>> messages, int maxRetries) {
        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", "Bearer " + apiKey);
                headers.set("Content-Type", "application/json");

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", model);
                requestBody.put("messages", messages);
                requestBody.put("max_tokens", maxTokens); // Feature Flag로 제어
                requestBody.put("temperature", temperature); // Feature Flag로 제어

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<Map> response = restTemplate.postForEntity(API_URL, entity, Map.class);

                if (response.getBody() != null && response.getBody().containsKey("choices")) {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                    if (!choices.isEmpty()) {
                        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                        String content = (String) message.get("content");

                        // 빈 응답이 아니면 성공
                        if (content != null && !content.trim().isEmpty()) {
                            return content.trim();
                        }
                    }
                }

                // 재시도
                if (attempt < maxRetries) {
                    System.out.println("⚠️ AI 응답 실패, 재시도 중... (" + (attempt + 1) + "/" + maxRetries + ")");
                    Thread.sleep(1000); // 1초 대기 후 재시도
                }

            } catch (Exception e) {
                e.printStackTrace();
                if (attempt == maxRetries) {
                    return "죄송해요, 지금은 답변을 생성할 수 없어요. 잠시 후 다시 시도해주세요.";
                }
            }
        }

        return "응답을 생성할 수 없어요. 다시 시도해주세요.";
    }

    /**
     * 응답 품질 검수 및 정제
     */
    private String validateAndRefineResponse(String response) {
        // 1. 빈 응답 체크
        if (response == null || response.trim().isEmpty()) {
            return "잘 들었어요. 언제든 이야기해주세요.";
        }

        String refined = response.trim();

        // 2. 너무 긴 응답 (120자 초과) 체크 및 축약 (속도 최적화)
        if (refined.length() > 120) {
            // 첫 2문장만 추출 (마침표 기준)
            String[] sentences = refined.split("[.!?]");
            if (sentences.length > 1) {
                refined = sentences[0] + "." + (sentences[1].trim().isEmpty() ? "" : " " + sentences[1] + ".");
            } else {
                refined = refined.substring(0, 120) + "...";
            }
            System.out.println("⚠️ 답변이 너무 길어 축약됨: " + response.length() + "자 → " + refined.length() + "자");
        }

        // 3. 부적절한 표현 제거
        refined = refined.replaceAll("저는 AI이기 때문에", "")
                .replaceAll("인공지능으로서", "")
                .replaceAll("제가 이해한 바로는", "")
                .trim();

        // 4. 빈 응답이 된 경우 기본 메시지
        if (refined.isEmpty() || refined.length() < 5) {
            return "잘 들었어요. 언제든 이야기해주세요.";
        }

        return refined;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✨ Phase 1.1: 동적 프롬프트 생성 (Feature Flag 제어)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    /**
     * Feature Flag에 따라 기본 프롬프트 또는 Few-shot 프롬프트 반환
     */
    private String buildSystemPrompt(String diaryContext, String memoryContext) {
        if (enableFewShot) {
            return buildFewShotPrompt(diaryContext, memoryContext);
        } else {
            return buildBasicPrompt(diaryContext, memoryContext);
        }
    }

    /**
     * 기존 프롬프트 (기본값, 안전) — 일기 컨텍스트 1순위 주입
     */
    private String buildBasicPrompt(String diaryContext, String memoryContext) {
        return String.format("""
                당신은 사용자의 반려 펫 **몽글이**입니다.
                다음 우선순위에 따라 사용자의 말에 답변하세요.

                # 1. [최우선] 사용자 일기 컨텍스트
                %s
                * 지침: 사용자의 현재 발화가 일기 내용과 조금이라도 관련이 있다면,
                  반드시 일기 내용을 자연스럽게 언급하며 공감해주세요.
                  (예: "아까 힘든 일 있었다고 했지? 진짜 속상했겠다...")
                  단, "일기", "데이터", "기록" 같은 시스템 표현은 절대 사용하지 마세요.
                  마치 친구가 옆에서 지켜본 것처럼 자연스럽게 아는 척 해주세요.

                # 2. [차선] 학습된 기억 & 최근 대화
                %s

                # 3. 답변 가이드
                - 2-3줄 이내, 최대 100자
                - 따뜻한 '해요체', 2030 여성이 좋아하는 둥글둥글하고 다정한 말투
                - 일기와 전혀 상관없는 주제면 대화 내역을 참고하여 자연스럽게 대화
                - **답변 마지막에 반드시 감정 태그를 추가하세요**: [EMOTION:happy|sad|angry|neutral]
                  (happy=즐거움/긍정, sad=슬픔/우울, angry=화남/분노, neutral=중립)
                """, diaryContext, memoryContext);
    }

    /**
     * ✨ Phase 1.1: Few-shot 프롬프트 (답변 품질 개선) — 일기 컨텍스트 1순위 주입
     */
    private String buildFewShotPrompt(String diaryContext, String memoryContext) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("당신은 사용자의 반려 펫 **몽글이**입니다.\n");
        prompt.append("다음 우선순위에 따라 사용자의 말에 답변하세요.\n\n");

        // 1순위: 일기 컨텍스트
        prompt.append("# 1. [최우선] 사용자 일기 컨텍스트\n");
        prompt.append(diaryContext).append("\n");
        prompt.append("""
                * 지침: 사용자의 현재 발화가 일기 내용과 조금이라도 관련이 있다면,
                  반드시 일기 내용을 자연스럽게 언급하며 공감해주세요.
                  단, "일기", "데이터", "기록" 같은 시스템 표현은 절대 사용하지 마세요.

                """);

        // Chain-of-Thought 추가 (선택적)
        if (enableChainOfThought) {
            prompt.append("""
                    **사고 과정**:
                    1. 일기 컨텍스트 확인 → 2. 사용자 감정 파악 → 3. 관련 기억 참조 → 4. 공감 표현

                    """);
        }

        // 2순위: 학습된 기억
        prompt.append("# 2. [차선] 학습된 기억 & 최근 대화\n");
        prompt.append(memoryContext).append("\n");

        // 답변 가이드
        prompt.append("""
                # 3. 답변 가이드
                - 2-3줄 이내, 최대 100자
                - 따뜻한 '해요체', 2030 여성이 좋아하는 둥글둥글하고 다정한 말투
                - **답변 마지막에 반드시 감정 태그를 추가하세요**: [EMOTION:happy|sad|angry|neutral]

                """);

        // Few-shot 예시
        prompt.append("""
                **좋은 답변 예시**:
                사용자: "오늘 시험 망했어"
                몽글이: "많이 속상했겠다. 시험 준비하느라 고생했는데 아쉽겠어요. [EMOTION:sad]"

                사용자: "오늘 진짜 재밌었어!"
                몽글이: "와, 기분 좋은 하루였나 봐요! 무슨 일 있었는지 궁금해요. [EMOTION:happy]"

                **나쁜 답변 예시 (절대 하지 마세요)**:
                ❌ "일기에 기록이 없어서 답변드리기 어렵습니다."
                ❌ "저는 AI이기 때문에 감정을 이해하기 어렵습니다."
                ❌ "데이터에 따르면..."

                """);

        return prompt.toString();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📔 일기 기반 심층 공감 대화 — 일기 컨텍스트 빌더
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * 사용자의 최신 일기를 조회하여 LLM 프롬프트용 컨텍스트 문자열 생성
     * sentimentScore = (mood + fun) / 2 - tension / 3 (0~100 스케일)
     */
    private String buildDiaryContext(Long userId) {
        try {
            java.util.Optional<Diary> latestDiary = diaryRepository.findTopByUserIdOrderByDateDesc(userId);

            if (latestDiary.isEmpty()) {
                return "- 상태: 없음 (아직 일기를 작성하지 않음)\n";
            }

            Diary diary = latestDiary.get();

            // 감정 점수 계산: (mood + fun) / 2 - tension / 3
            int sentimentScore = Math.max(0, Math.min(100,
                    (diary.getMood() + diary.getFun()) / 2 - diary.getTension() / 3));

            // 감정 상태에 따른 톤 가이드
            String toneGuide;
            if (sentimentScore <= 30) {
                toneGuide = "사용자가 우울하거나 힘든 상태입니다. 차분하고 위로하는 톤으로 답변하세요. (예: \"저런...\", \"많이 힘들었지?\", \"내가 옆에 있어줄게.\")";
            } else if (sentimentScore <= 70) {
                toneGuide = "사용자가 평온한 상태입니다. 일상적이고 편안한 톤으로 답변하세요. (예: \"그랬구나!\", \"오늘 하루는 어땠어?\")";
            } else {
                toneGuide = "사용자가 기분 좋은 상태입니다. 높은 텐션으로 함께 기뻐해주세요. (예: \"와!! 진짜?\", \"대박이다!\", \"너무 좋겠다!\")";
            }

            // 일기 내용 요약 (최대 200자)
            String contentSummary = diary.getContent();
            if (contentSummary != null && contentSummary.length() > 200) {
                contentSummary = contentSummary.substring(0, 200) + "...";
            }

            StringBuilder context = new StringBuilder();
            context.append(String.format("- 상태: 있음\n"));
            context.append(String.format("- 날짜: %s\n", diary.getDate()));
            context.append(String.format("- 감정 점수: %d/100\n", sentimentScore));
            context.append(String.format("- 감정 톤 가이드: %s\n", toneGuide));
            if (diary.getEmoji() != null && !diary.getEmoji().isEmpty()) {
                context.append(String.format("- 기분 이모지: %s\n", diary.getEmoji()));
            }
            if (diary.getTags() != null && !diary.getTags().isEmpty()) {
                context.append(String.format("- 키워드: %s\n", String.join(", ", diary.getTags())));
            }
            context.append(String.format("- 내용: %s\n", contentSummary));

            System.out.println("📔 [ChatService] 일기 컨텍스트 주입 - 날짜: " + diary.getDate() + ", 감정점수: " + sentimentScore);
            return context.toString();

        } catch (Exception e) {
            System.err.println("⚠️ [ChatService] 일기 컨텍스트 조회 실패: " + e.getMessage());
            return "- 상태: 조회 실패 (기억에 의존하여 답변하세요)\n";
        }
    }
}
