package com.codestory.diary.service;

import com.codestory.diary.entity.ChatMessage;
import com.codestory.diary.entity.Diary;
import com.codestory.diary.repository.ChatMessageRepository;
import com.codestory.diary.repository.DiaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MongleTalkService {

    private final ChatMessageRepository chatMessageRepository;
    private final DiaryRepository diaryRepository;

    private static final Random RANDOM = new Random();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1. 접속 시 인삿말
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    public Map<String, String> getGreeting(Long userId) {
        int hour = LocalTime.now().getHour();
        String timeSlot = getTimeSlot(hour);

        // 마지막 대화 시간으로 "오랜만" 판단
        List<ChatMessage> recent = chatMessageRepository
                .findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(userId, LocalDateTime.now().minusHours(48));

        boolean isLongAbsence = recent.isEmpty();

        List<String> pool = new ArrayList<>();

        // 시간대별 인삿말
        switch (timeSlot) {
            case "morning":
                pool.addAll(List.of(
                    "좋은 아침이야! 오늘 기분은 어때?",
                    "굿모닝~ 잘 잤어? 오늘도 좋은 하루 보내자!",
                    "아침이다! 오늘은 뭐 할 거야?",
                    "일어났구나~ 오늘 하루도 파이팅이야!"
                ));
                break;
            case "afternoon":
                pool.addAll(List.of(
                    "점심은 맛있게 먹었어?",
                    "오후도 힘내자! 나 여기 있을게~",
                    "오늘 하루 어떻게 보내고 있어?",
                    "나랑 잠깐 이야기하면서 쉬어가자~"
                ));
                break;
            case "evening":
                pool.addAll(List.of(
                    "오늘 하루 수고했어! 어떤 하루였어?",
                    "저녁이야~ 오늘 기분은 어땠어?",
                    "하루 마무리 잘 하고 있어?",
                    "오늘도 고생 많았어, 이야기해줄래?"
                ));
                break;
            case "night":
                pool.addAll(List.of(
                    "아직 안 잤어? 무슨 생각 하고 있어?",
                    "밤이 깊었네~ 오늘 하루는 어땠어?",
                    "이 시간에 왔네! 잠이 안 와?",
                    "늦은 밤인데 괜찮아? 나랑 이야기하자~"
                ));
                break;
        }

        // 오랜만에 접속한 경우 추가 멘트
        if (isLongAbsence) {
            pool.addAll(List.of(
                "오랜만이야! 보고 싶었어~",
                "어디 갔다 왔어? 기다리고 있었는데!",
                "드디어 왔구나! 그동안 잘 지냈어?"
            ));
        }

        String message = pool.get(RANDOM.nextInt(pool.size()));
        return Map.of("message", message, "timeSlot", timeSlot);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 2. 살아있는 질문 생성
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    public Map<String, String> getAliveQuestion(Long userId) {
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

        // 기록이 있는 경우: 맥락 기반 질문
        if (!recentChats.isEmpty() || !recentDiaries.isEmpty()) {
            message = generateContextQuestion(recentChats, recentDiaries);
            source = "context";
        } else {
            // 기록이 없는 경우: 스몰토크
            message = getSmallTalk();
            source = "smalltalk";
        }

        return Map.of("message", message, "source", source);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Private helpers
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private String getTimeSlot(int hour) {
        if (hour >= 5 && hour < 12) return "morning";
        if (hour >= 12 && hour < 18) return "afternoon";
        if (hour >= 18 && hour < 22) return "evening";
        return "night";
    }

    /**
     * 최근 대화/일기를 분석하여 맥락 기반 질문 생성
     */
    private String generateContextQuestion(List<ChatMessage> chats, List<Diary> diaries) {
        List<String> questions = new ArrayList<>();

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
                .collect(Collectors.toList());

        String allText = String.join(" ", userMessages) + " " + String.join(" ", diaryContents);
        String lowerText = allText.toLowerCase();

        // 키워드 기반 꼬리 질문 생성
        if (containsAny(lowerText, "피곤", "지치", "힘들", "졸려", "잠")) {
            questions.addAll(List.of(
                "좀 쉬었어? 컨디션은 괜찮아졌어?",
                "피곤하다고 했는데, 지금은 좀 나아졌어?",
                "푹 쉬었으면 좋겠다~ 지금 기분은 어때?"
            ));
        }
        if (containsAny(lowerText, "우울", "슬프", "슬퍼", "울었", "눈물")) {
            questions.addAll(List.of(
                "저번에 속상했던 거, 지금은 좀 괜찮아졌어?",
                "마음이 좀 풀렸어? 걱정됐어~",
                "힘든 일 있었는데, 지금은 어때?"
            ));
        }
        if (containsAny(lowerText, "맛있", "먹었", "밥", "점심", "저녁", "치킨", "파스타", "카페", "커피")) {
            questions.addAll(List.of(
                "저번에 맛있는 거 먹었다고 했잖아~ 또 먹고 싶은 거 있어?",
                "오늘은 뭐 먹었어? 맛있었어?",
                "배 안 고파? 맛있는 거 먹으러 가~"
            ));
        }
        if (containsAny(lowerText, "일", "회사", "시험", "공부", "과제", "프로젝트")) {
            questions.addAll(List.of(
                "요즘 바빠 보이던데, 좀 여유 생겼어?",
                "하고 있던 일은 잘 돼가고 있어?",
                "너무 무리하지 마~ 쉬는 것도 중요해!"
            ));
        }
        if (containsAny(lowerText, "친구", "사람", "만났", "약속")) {
            questions.addAll(List.of(
                "친구 만나서 재밌었어?",
                "좋은 사람들이랑 시간 보냈구나~ 어땠어?",
                "다음에 또 만나기로 했어?"
            ));
        }
        if (containsAny(lowerText, "기쁘", "행복", "좋았", "좋은", "신나")) {
            questions.addAll(List.of(
                "좋은 일 있었다며! 또 좋은 일 생겼어?",
                "기분 좋아 보여서 나도 기분 좋아~",
                "행복한 일이 계속 이어지면 좋겠다!"
            ));
        }
        if (containsAny(lowerText, "걱정", "불안", "무서", "두려")) {
            questions.addAll(List.of(
                "걱정되는 일은 좀 해결됐어?",
                "혹시 아직 마음이 불안해? 이야기해줘~",
                "괜찮아, 내가 옆에 있을게!"
            ));
        }

        // 키워드 매칭이 없으면 일반적인 맥락 질문
        if (questions.isEmpty()) {
            questions.addAll(List.of(
                "저번에 이야기하던 거, 그 뒤로 어떻게 됐어?",
                "요즘 어떻게 지내고 있어? 이야기해줘~",
                "지금 무슨 생각 하고 있어? 궁금해!",
                "오늘은 특별한 일 없었어?"
            ));
        }

        return questions.get(RANDOM.nextInt(questions.size()));
    }

    /**
     * 기록이 없을 때 가벼운 스몰토크
     */
    private String getSmallTalk() {
        List<String> talks = List.of(
            "심심하지 않아? 나랑 놀자!",
            "오늘 날씨가 참 좋다, 그치?",
            "뭐 하고 있어? 나 심심해~",
            "오늘 기분이 어때? 궁금해!",
            "간식 먹고 싶다~ 너는?",
            "요즘 재밌는 거 있어? 알려줘~",
            "나한테 오늘 있었던 일 얘기해줘!",
            "잠깐 나랑 이야기하자~ 기다리고 있었어!",
            "혹시 요즘 듣는 노래 있어?",
            "나 배고파... 너도 배고프지 않아?"
        );
        return talks.get(RANDOM.nextInt(talks.size()));
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) return true;
        }
        return false;
    }
}
