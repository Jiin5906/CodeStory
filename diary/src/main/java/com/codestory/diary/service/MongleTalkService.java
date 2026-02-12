package com.codestory.diary.service;

import com.codestory.diary.entity.ChatMessage;
import com.codestory.diary.entity.Diary;
import com.codestory.diary.repository.ChatMessageRepository;
import com.codestory.diary.repository.DiaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MongleTalkService {

    private final ChatMessageRepository chatMessageRepository;
    private final DiaryRepository diaryRepository;

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String API_URL = "https://api.openai.com/v1/chat/completions";
    private static final Random RANDOM = new Random();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1. 접속 시 인삿말 (LLM 기반)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    public Map<String, String> getGreeting(Long userId, Integer clientHour) {
        int hour = resolveHour(clientHour);
        String timeSlot = getTimeSlot(hour);

        // 마지막 대화 시간으로 "오랜만" 판단
        List<ChatMessage> recent = chatMessageRepository
                .findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(userId, LocalDateTime.now().minusHours(48));
        boolean isLongAbsence = recent.isEmpty();

        String message = generateGreetingViaLLM(hour, timeSlot, isLongAbsence);
        return Map.of("message", message, "timeSlot", timeSlot);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 2. 살아있는 질문 생성 (LLM 기반)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    public Map<String, String> getAliveQuestion(Long userId, Integer clientHour) {
        int hour = resolveHour(clientHour);
        String timeSlot = getTimeSlot(hour);
        LocalDateTime since48h = LocalDateTime.now().minusHours(48);

        // 최근 48시간 대화 기록 조회
        List<ChatMessage> recentChats = chatMessageRepository
                .findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(userId, since48h);

        // 최근 이틀간 일기 조회
        List<Diary> recentDiaries = new ArrayList<>();
        for (int i = 0; i <= 2; i++) {
            diaryRepository.findByUserIdAndDate(userId, LocalDate.now().minusDays(i))
                    .ifPresent(recentDiaries::add);
        }

        String message;
        String source;

        if (!recentChats.isEmpty() || !recentDiaries.isEmpty()) {
            message = generateContextQuestionViaLLM(recentChats, recentDiaries, hour, timeSlot);
            source = "context";
        } else {
            message = generateSmallTalkViaLLM(hour, timeSlot);
            source = "smalltalk";
        }

        return Map.of("message", message, "source", source);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LLM 호출 메서드들
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * LLM에게 시간대에 맞는 인삿말을 생성 요청
     */
    private String generateGreetingViaLLM(int hour, String timeSlot, boolean isLongAbsence) {
        String systemPrompt = "너는 '몽글이'라는 귀여운 감정 친구 캐릭터야. "
                + "사용자가 앱에 접속했을 때 반갑게 맞이하는 인삿말을 한 문장으로 해줘. "
                + "반말(~야, ~어, ~지 등)로 친근하게 말해. "
                + "이모티콘이나 이모지는 사용하지 마. "
                + "반드시 1문장만, 30자 이내로 답변해.";

        String timeDesc = getTimeDescription(hour, timeSlot);
        String userPrompt = "현재 시간: " + hour + "시 (" + timeDesc + "). ";
        if (isLongAbsence) {
            userPrompt += "이 사용자는 48시간 넘게 접속하지 않았어. 오랜만에 온 것을 반가워해줘. ";
        }
        userPrompt += "이 시간대에 어울리는 자연스러운 인삿말을 해줘.";

        String result = callOpenAI(systemPrompt, userPrompt);
        if (result == null) {
            return getFallbackGreeting(timeSlot, isLongAbsence);
        }
        return result;
    }

    /**
     * LLM에게 맥락 기반 질문 생성 요청
     */
    private String generateContextQuestionViaLLM(List<ChatMessage> chats, List<Diary> diaries,
                                                  int hour, String timeSlot) {
        // 대화에서 사용자 메시지 추출 (최근 5개)
        List<String> userMessages = chats.stream()
                .filter(m -> "user".equals(m.getRole()))
                .limit(5)
                .map(ChatMessage::getContent)
                .collect(Collectors.toList());

        // 일기 내용 추출
        List<String> diaryContents = diaries.stream()
                .map(Diary::getContent)
                .filter(Objects::nonNull)
                .map(c -> c.length() > 100 ? c.substring(0, 100) + "..." : c)
                .collect(Collectors.toList());

        String systemPrompt = "너는 '몽글이'라는 귀여운 감정 친구 캐릭터야. "
                + "사용자의 최근 대화나 일기를 참고하여, 자연스럽게 대화를 이어갈 수 있는 질문을 해줘. "
                + "반말(~야, ~어, ~지 등)로 친근하게 말해. "
                + "이모티콘이나 이모지는 사용하지 마. "
                + "반드시 1문장만, 40자 이내로 답변해.";

        StringBuilder userPrompt = new StringBuilder();
        userPrompt.append("현재 시간: ").append(hour).append("시 (").append(getTimeDescription(hour, timeSlot)).append("). ");

        if (!userMessages.isEmpty()) {
            userPrompt.append("사용자의 최근 대화 내용: ");
            for (int i = 0; i < Math.min(3, userMessages.size()); i++) {
                String msg = userMessages.get(i);
                if (msg.length() > 80) msg = msg.substring(0, 80) + "...";
                userPrompt.append("\"").append(msg).append("\" ");
            }
        }
        if (!diaryContents.isEmpty()) {
            userPrompt.append("최근 일기: ");
            for (String dc : diaryContents) {
                userPrompt.append("\"").append(dc).append("\" ");
            }
        }
        userPrompt.append("이 맥락을 바탕으로 사용자에게 자연스럽게 건넬 수 있는 한 마디를 해줘.");

        String result = callOpenAI(systemPrompt, userPrompt.toString());
        if (result == null) {
            return getFallbackContextQuestion();
        }
        return result;
    }

    /**
     * LLM에게 스몰토크 생성 요청
     */
    private String generateSmallTalkViaLLM(int hour, String timeSlot) {
        String systemPrompt = "너는 '몽글이'라는 귀여운 감정 친구 캐릭터야. "
                + "사용자에게 가벼운 스몰토크를 해줘. "
                + "반말(~야, ~어, ~지 등)로 친근하게 말해. "
                + "이모티콘이나 이모지는 사용하지 마. "
                + "반드시 1문장만, 30자 이내로 답변해.";

        String userPrompt = "현재 시간: " + hour + "시 (" + getTimeDescription(hour, timeSlot)
                + "). 이 시간대에 어울리는 가벼운 한 마디를 해줘. 매번 다른 말을 해줘.";

        String result = callOpenAI(systemPrompt, userPrompt);
        if (result == null) {
            return getFallbackSmallTalk();
        }
        return result;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // OpenAI API 호출
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private String callOpenAI(String systemPrompt, String userPrompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("Content-Type", "application/json");

            List<Map<String, String>> messages = List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userPrompt)
            );

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 100);
            requestBody.put("temperature", 0.9);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(API_URL, entity, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String content = (String) message.get("content");
                    // 따옴표 제거 및 트리밍
                    return content.replace("\"", "").replace("'", "").trim();
                }
            }
        } catch (Exception e) {
            log.error("[MongleTalkService] OpenAI 호출 실패: {}", e.getMessage());
        }
        return null;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 헬퍼 메서드
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * 프론트엔드에서 전달된 시간을 우선 사용, 없으면 서버 시간 사용
     */
    private int resolveHour(Integer clientHour) {
        if (clientHour != null && clientHour >= 0 && clientHour <= 23) {
            return clientHour;
        }
        return LocalTime.now().getHour();
    }

    private String getTimeSlot(int hour) {
        if (hour >= 6 && hour < 12) return "morning";
        if (hour >= 12 && hour < 18) return "afternoon";
        if (hour >= 18 && hour < 22) return "evening";
        return "night";
    }

    private String getTimeDescription(int hour, String timeSlot) {
        switch (timeSlot) {
            case "morning": return "아침";
            case "afternoon": return "오후";
            case "evening": return "저녁";
            case "night": return hour >= 22 || hour < 2 ? "늦은 밤" : "새벽";
            default: return "";
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Fallback (LLM 호출 실패 시)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private String getFallbackGreeting(String timeSlot, boolean isLongAbsence) {
        if (isLongAbsence) {
            List<String> pool = List.of("오랜만이야! 보고 싶었어~", "어디 갔다 왔어? 기다리고 있었는데!", "드디어 왔구나! 그동안 잘 지냈어?");
            return pool.get(RANDOM.nextInt(pool.size()));
        }
        switch (timeSlot) {
            case "morning":
                return List.of("좋은 아침이야! 오늘 기분은 어때?", "일어났구나~ 오늘 하루도 파이팅이야!").get(RANDOM.nextInt(2));
            case "afternoon":
                return List.of("점심은 맛있게 먹었어?", "오후도 힘내자! 나 여기 있을게~").get(RANDOM.nextInt(2));
            case "evening":
                return List.of("오늘 하루 수고했어! 어떤 하루였어?", "하루 마무리 잘 하고 있어?").get(RANDOM.nextInt(2));
            case "night":
                return List.of("아직 안 잤어? 무슨 생각 하고 있어?", "밤이 깊었네~ 오늘 하루는 어땠어?").get(RANDOM.nextInt(2));
            default:
                return "안녕! 나 몽글이야~";
        }
    }

    private String getFallbackContextQuestion() {
        List<String> questions = List.of(
                "저번에 이야기하던 거, 그 뒤로 어떻게 됐어?",
                "요즘 어떻게 지내고 있어? 이야기해줘~",
                "지금 무슨 생각 하고 있어? 궁금해!",
                "오늘은 특별한 일 없었어?"
        );
        return questions.get(RANDOM.nextInt(questions.size()));
    }

    private String getFallbackSmallTalk() {
        List<String> talks = List.of(
                "심심하지 않아? 나랑 놀자!",
                "오늘 기분이 어때? 궁금해!",
                "나한테 오늘 있었던 일 얘기해줘!",
                "잠깐 나랑 이야기하자~ 기다리고 있었어!"
        );
        return talks.get(RANDOM.nextInt(talks.size()));
    }
}
