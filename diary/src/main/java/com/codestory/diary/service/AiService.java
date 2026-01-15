package com.codestory.diary.service; // [수정됨] diary가 추가되었습니다!

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service // 이게 있어야 스프링이 찾을 수 있습니다
@RequiredArgsConstructor
public class AiService {

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String API_URL = "https://api.openai.com/v1/chat/completions";

    public String getMultimodalResponse(String systemPrompt, String userMessage, MultipartFile image) {
        // ... (나머지 코드는 아까와 100% 동일합니다. 그대로 두세요) ...
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("Content-Type", "application/json");

            List<Map<String, Object>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));

            Map<String, Object> userMsgMap = new HashMap<>();
            userMsgMap.put("role", "user");
            List<Map<String, Object>> contentList = new ArrayList<>();
            contentList.add(Map.of("type", "text", "text", userMessage));

            if (image != null && !image.isEmpty()) {
                String base64Image = Base64.getEncoder().encodeToString(image.getBytes());
                String imageUrl = "data:" + image.getContentType() + ";base64," + base64Image;
                Map<String, Object> imageMap = new HashMap<>();
                imageMap.put("type", "image_url");
                imageMap.put("image_url", Map.of("url", imageUrl));
                contentList.add(imageMap);
            }
            userMsgMap.put("content", contentList);
            messages.add(userMsgMap);

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
                    return (String) message.get("content");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "AI 서버 연결 오류: " + e.getMessage();
        }
        return "AI 응답 없음";
    }
}