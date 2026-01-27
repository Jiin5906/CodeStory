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
        // 3. 사용자 학습형 대화 LLM 프롬프트 (완전 개편)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        String systemPrompt = String.format("""
                당신은 **몽글이**, 사용자를 학습하는 AI 친구입니다.

                **핵심 규칙**:
                - 2-3줄 이내, 최대 100자
                - 따뜻한 '해요체'
                - 공감 우선, 자연스럽게
                - 과거 대화를 기억하면 자연스럽게 언급
                - "일기", "데이터", "정보 없음" 같은 시스템 표현 절대 금지
                - **답변 마지막에 반드시 감정 태그를 추가하세요**: [EMOTION:happy|sad|angry|neutral]
                  (happy=즐거움/긍정, sad=슬픔/우울, angry=화남/분노, neutral=중립)

                %s
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

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 8. 감정 태그 파싱 [EMOTION:xxx]
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        String emotion = "neutral"; // 기본값
        String cleanedResponse = aiResponse;

        if (aiResponse.contains("[EMOTION:")) {
            int startIdx = aiResponse.indexOf("[EMOTION:");
            int endIdx = aiResponse.indexOf("]", startIdx);
            if (endIdx > startIdx) {
                String emotionTag = aiResponse.substring(startIdx + 9, endIdx).trim().toLowerCase();
                if (emotionTag.equals("happy") || emotionTag.equals("sad") ||
                    emotionTag.equals("angry") || emotionTag.equals("neutral")) {
                    emotion = emotionTag;
                }
                // 사용자에게 보여줄 메시지에서 태그 제거
                cleanedResponse = aiResponse.substring(0, startIdx).trim();
            }
        }

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
                requestBody.put("max_tokens", 150); // 짧은 답변 유도 (속도 최적화)
                requestBody.put("temperature", 0.5); // 낮은 temperature로 빠른 생성

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
}
