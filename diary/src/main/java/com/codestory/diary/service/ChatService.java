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
        // 3. LLM 프롬프트 구성: 시스템 프롬프트 + 과거 대화 + 관련 기억 + 현재 질문
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        String systemPrompt = String.format("""
                # Role
                당신은 사용자의 감정을 공감하는 따뜻한 AI 친구 '몽글이'입니다.
                사용자의 과거 일기와 경험을 기억하고 있으며, 그것을 자연스럽게 언급하며 공감합니다.

                # 핵심 제약 조건 (절대 준수)
                - **답변 길이: 반드시 최대 3-4줄 이내로 작성**
                - 구구절절한 설명 금지, 핵심적인 위로와 공감만 전달
                - 말투: 부드럽고 다정한 '해요체'
                - 한 문장은 짧고 간결하게 (30자 이내 권장)
                - 과거 기억이 있다면 자연스럽게 언급하며 "오래 알아온 친구처럼" 말하기
                - 일기 기억이 없는 질문은 일반적인 지식으로 친근하게 답변

                # 예시
                - 좋은 예 (기억 없음): "궁금하신 게 있으시군요! 제가 아는 선에서 말씀드릴게요."
                - 좋은 예 (기억 있음): "저번 일기에서 비슷한 고민 하셨죠? 이번에도 잘 해결하실 거예요."
                - 나쁜 예: "오늘 정말 많이 힘드셨을 것 같아요. 그런 날도 있는 거니까 너무 자책하지 마시고 충분히 쉬면서 마음을 추스르는 시간을 가져보세요."

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
        // 5. OpenAI API 호출
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        String aiResponse;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("Content-Type", "application/json");

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 500);
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(API_URL, entity, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    aiResponse = (String) message.get("content");
                } else {
                    aiResponse = "응답을 생성할 수 없어요. 다시 시도해주세요.";
                }
            } else {
                aiResponse = "AI 서버에서 응답을 받지 못했어요.";
            }
        } catch (Exception e) {
            e.printStackTrace();
            aiResponse = "AI 서버 연결 오류: " + e.getMessage();
        }

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
}
