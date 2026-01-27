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

        // 관련 기억 컨텍스트 생성
        StringBuilder memoryContext = new StringBuilder();
        if (!relatedMemories.isEmpty()) {
            memoryContext.append("\n\n## 사용자의 과거 일기 기억:\n");
            for (int i = 0; i < relatedMemories.size(); i++) {
                String memory = relatedMemories.get(i);
                memoryContext.append(String.format("%d. %s\n",
                        i + 1,
                        memory.length() > 120 ? memory.substring(0, 120) + "..." : memory));
            }
            memoryContext.append(
                    "\n위 일기 기억들을 참고하여 사용자에게 공감하고 답변해주세요. 과거의 비슷한 경험을 자연스럽게 언급할 수 있습니다.\n");
        } else {
            memoryContext.append(
                    "\n\n사용자의 과거 일기에 관련된 기억이 없습니다. 일반적인 대화로 친근하게 응답해주세요.\n");
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 3. 강화된 LLM 프롬프트: 시스템 프롬프트 + 과거 대화 + 관련 기억 + 현재 질문
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        String systemPrompt = String.format("""
                # Identity & Mission
                당신은 **몽글이**입니다. 사용자의 감정을 깊이 공감하고, 과거 일기와 대화를 기억하며 자연스럽게 대화하는 AI 친구입니다.

                # Core Constraints (CRITICAL)
                1. **답변 길이**: 반드시 2-3줄 이내 (최대 100자)
                2. **말투**: 따뜻하고 부드러운 '해요체'
                3. **한 문장 길이**: 20-30자 이내로 짧고 간결하게
                4. **공감 우선**: 조언이나 설명보다 공감과 위로가 먼저
                5. **자연스러운 기억 언급**: 과거 기억이 있다면 "오래 알아온 친구처럼" 자연스럽게 언급

                # Response Quality Standards
                ✅ GOOD Examples:
                - "힘든 하루였네요. 충분히 쉬어가세요."
                - "저번에도 비슷한 걱정 하셨죠? 이번에도 잘하실 거예요."
                - "기분 좋은 일이 생겼군요! 더 좋은 일만 가득하길 바라요."

                ❌ BAD Examples (이렇게 하지 마세요):
                - "오늘 정말 많이 힘드셨을 것 같아요. 그런 날도 있는 거니까 너무 자책하지 마시고..." (너무 김)
                - "제가 이해한 바로는..." (기계적)
                - "저는 AI이기 때문에..." (자아 언급 금지)

                # Context
                %s

                # Instructions
                - 위 과거 기억과 대화를 참고하여, 사용자의 현재 메시지에 공감하고 답변하세요.
                - 과거 기억이 있다면 자연스럽게 언급하되, 강요하지 마세요.
                - 답변은 짧고 진심 어린 한 줄로 끝내는 것이 베스트입니다.
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
