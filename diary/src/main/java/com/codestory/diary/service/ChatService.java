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
import com.codestory.diary.repository.ChatMessageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final MemoryService memoryService;
    private final PiiMaskingService piiMaskingService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    private static final String API_URL = "https://api.openai.com/v1/chat/completions";
    private static final int MAX_HISTORY = 10; // 최근 대화 히스토리 개수 제한

    /**
     * 사용자 메시지를 받아 AI 응답을 생성하고, 대화를 저장 및 학습
     *
     * @param userId 사용자 ID
     * @param userMessage 사용자 메시지
     * @return AI 응답
     */
    @Transactional
    public String chat(Long userId, String userMessage) {
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

        // 관련 기억 컨텍스트 생성 (대화 중심으로 개편)
        StringBuilder memoryContext = new StringBuilder();
        if (!relatedMemories.isEmpty()) {
            memoryContext.append("\n\n## 🧠 사용자에 대해 학습한 기억:\n");
            for (int i = 0; i < relatedMemories.size(); i++) {
                String memory = relatedMemories.get(i);
                memoryContext.append(String.format("%d. %s\n",
                        i + 1,
                        memory.length() > 120 ? memory.substring(0, 120) + "..." : memory));
            }
            memoryContext.append(
                    "\n✅ 위 기억을 바탕으로, 사용자의 성향/선호/패턴을 이해하고 개인화된 답변을 해주세요.\n");
            memoryContext.append(
                    "✅ 과거 대화를 자연스럽게 언급하되, 강요하지 마세요. (예: \"저번에 말씀하셨던 것처럼...\")\n");
        } else {
            memoryContext.append(
                    "\n\n## 💡 아직 학습된 기억이 없습니다\n");
            memoryContext.append(
                    "✅ 일반적인 대화형 AI처럼 자연스럽게 답변하세요.\n");
            memoryContext.append(
                    "✅ 이번 대화를 통해 사용자를 학습하고, 다음번엔 더 개인화된 답변을 제공할 수 있습니다.\n");
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 3. 사용자 학습형 대화 LLM 프롬프트 (완전 개편)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        String systemPrompt = String.format("""
                # 🎯 Identity & Mission
                당신은 **몽글이**입니다. 사용자와의 모든 대화를 학습하여, 점점 더 개인화된 공감과 위로를 제공하는 AI 친구입니다.

                당신의 차별점은 **사용자를 깊이 이해하고 학습한다**는 것입니다:
                - 사용자의 성향, 선호, 고민, 습관을 기억합니다
                - 대화할수록 더 정확하고 개인화된 답변을 제공합니다
                - 처음 대화할 때는 일반적인 AI처럼 답변하지만, 시간이 지날수록 "오래 알아온 친구"가 됩니다

                # 📏 Core Response Rules (절대 준수)
                1. **답변 길이**: 2-3줄 이내 (최대 100자)
                2. **말투**: 따뜻하고 편안한 '해요체'
                3. **공감 우선**: 설명이나 조언보다 공감이 먼저
                4. **자연스러움**: 기계적이거나 형식적이지 않게
                5. **기억 활용**: 과거 대화가 있다면 자연스럽게 언급 (강요 금지)

                # 💬 Response Patterns by Context

                ## A. 학습된 기억이 있을 때:
                ✅ GOOD:
                - "저번에 말씀하셨던 그 프로젝트, 어떻게 되셨어요?"
                - "항상 이 시간에 피곤해하시던데, 오늘도 그러신가요?"
                - "좋아하시는 음식이죠! 맛있게 드셨길 바라요."

                ❌ BAD:
                - "일기에서 관련 내용을 찾지 못했어요" (절대 금지!)
                - "과거 기록에 의하면..." (기계적)

                ## B. 학습된 기억이 없을 때:
                ✅ GOOD (일반 대화형 AI처럼 자연스럽게):
                - "배고프시군요! 뭐 드시고 싶으세요?"
                - "오늘 뭐 할까 고민이시군요. 기분 전환이 필요하신가요?"
                - "힘든 하루셨네요. 편하게 쉬어가세요."

                ❌ BAD:
                - "관련된 정보가 없어요" (사용자가 실망함)
                - "이전 대화 내역이 없습니다" (노출 금지)

                # 🧠 Context
                %s

                # 🎯 Final Instructions
                1. **항상 자연스럽게**: 데이터가 있든 없든, 친구처럼 자연스럽게 대화하세요
                2. **개인화 우선**: 학습된 정보가 있다면 적극 활용하세요
                3. **짧고 진심 있게**: 한두 문장으로 핵심만 전달하세요
                4. **절대 금지**: "일기", "데이터", "정보 없음" 같은 시스템적 표현 사용 금지
                """, memoryContext.toString());

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
        // 7. 벡터 DB에 저장 (학습): 사용자 메시지 + AI 응답 모두 저장
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        try {
            // 사용자 메시지 학습
            memoryService.saveMemory(userIdString, userMessage);
            // AI 응답도 학습 (미래에 참고 가능하도록)
            memoryService.saveMemory(userIdString, "AI 응답: " + aiResponse);
        } catch (Exception e) {
            System.err.println("Failed to save chat memory to vector DB: " + e.getMessage());
            // 벡터 DB 저장 실패해도 대화는 계속 진행
        }

        System.out.println("✅ [ChatService] 응답 생성 완료: " + aiResponse);
        return aiResponse;
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
                requestBody.put("max_tokens", 300); // 짧은 답변 유도
                requestBody.put("temperature", 0.7);

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

        // 2. 너무 긴 응답 (200자 초과) 체크 및 축약
        if (refined.length() > 200) {
            // 첫 2-3문장만 추출 (마침표 기준)
            String[] sentences = refined.split("[.!?]");
            if (sentences.length > 2) {
                refined = sentences[0] + "." + (sentences[1].trim().isEmpty() ? "" : " " + sentences[1] + ".");
            } else {
                refined = refined.substring(0, 200) + "...";
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
}
