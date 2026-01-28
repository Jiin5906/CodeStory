package com.codestory.diary.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.codestory.diary.dto.AuthRequest;
import com.codestory.diary.dto.ChatRequestDto;
import com.codestory.diary.dto.ChatResponseDto;
import com.codestory.diary.dto.CommentDto;
import com.codestory.diary.dto.DiaryDto;
import com.codestory.diary.dto.DiaryRequestDto;
import com.codestory.diary.entity.ChatMessage;
import com.codestory.diary.entity.Diary;
import com.codestory.diary.entity.Member;
import com.codestory.diary.repository.CommentRepository;
import com.codestory.diary.repository.DiaryRepository;
import com.codestory.diary.repository.LikesRepository;
import com.codestory.diary.repository.MemberRepository;
import com.codestory.diary.dto.PetActionRequestDto;
import com.codestory.diary.service.AuthService;
import com.codestory.diary.service.ChatService;
import com.codestory.diary.service.DiaryService;
import com.codestory.diary.service.PetService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ApiController {

    private final AuthService authService;
    private final DiaryService diaryService;
    private final ChatService chatService;
    private final PetService petService;
    private final DiaryRepository diaryRepository;
    private final MemberRepository memberRepository;
    private final LikesRepository likesRepository;
    private final CommentRepository commentRepository;

    // --- 인증 API ---
    @PostMapping("/auth/signup")
    public ResponseEntity<?> signup(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request.getEmail(), request.getPassword()));
    }

    // --- 일기 및 AI API ---
    // [핵심] 주소가 프론트엔드와 동일하게 "/diaries/write"여야 합니다!
    @PostMapping(value = "/diaries/write", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> saveDiary(
            @RequestPart(value = "diary") DiaryRequestDto request,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        DiaryDto createdDiary = diaryService.createDiaryWithImage(request, image);
        return ResponseEntity.ok(createdDiary);
    }

    // 날짜별 일기 조회
    @GetMapping("/diaries")
    public ResponseEntity<?> getDiaries(@RequestParam Long userId) {
        List<Diary> diaries = diaryRepository.findAllByUserIdOrderByDateDesc(userId);

        List<DiaryDto> dtos = diaries.stream().map(d -> {
            // Get author nickname
            String authorNickname = "익명"; // Default to anonymous
            if (!d.isAnonymous()) {
                // Only fetch nickname if not anonymous
                authorNickname = memberRepository.findById(d.getUserId())
                        .map(Member::getNickname)
                        .orElse("익명");
            }

            // Get like and comment counts
            int likeCount = likesRepository.countByDiaryId(d.getId());
            int commentCount = commentRepository.countByDiaryId(d.getId());

            return DiaryDto.builder()
                    .id(d.getId())
                    .userId(d.getUserId())
                    .content(d.getContent())
                    .date(d.getDate())
                    .createdAt(d.getCreatedAt())
                    .title(d.getTitle())
                    .emoji(d.getEmoji())
                    .mood(d.getMood())
                    .tension(d.getTension())
                    .fun(d.getFun())
                    .tags(d.getTags())
                    .aiResponse(d.getAiResponse())
                    .imageUrl(d.getImageUrl())
                    .shared(d.isPublic())
                    .anonymous(d.isAnonymous())
                    .nickname(authorNickname)
                    .likeCount(likeCount)
                    .commentCount(commentCount)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // 특정 일기 상세 조회 (댓글 및 좋아요 포함)
    @GetMapping("/diary/{id}")
    public ResponseEntity<?> getDiaryDetail(@PathVariable Long id) {
        DiaryDto diary = diaryService.getDiaryDetail(id);
        return ResponseEntity.ok(diary);
    }

    // 댓글 작성
    @PostMapping("/diary/{id}/comment")
    public ResponseEntity<?> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        String content = request.get("content");
        String author = request.get("author");

        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("댓글 내용을 입력해주세요.");
        }
        if (author == null || author.trim().isEmpty()) {
            author = "익명";
        }

        CommentDto comment = diaryService.addComment(id, content, author);
        return ResponseEntity.ok(comment);
    }

    // 좋아요 토글
    @PostMapping("/diary/{id}/like")
    public ResponseEntity<?> toggleLike(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        String userIp = getClientIp(request);
        boolean liked = diaryService.toggleLike(id, userIp);
        return ResponseEntity.ok(Map.of("liked", liked));
    }

    // --- 채팅 API ---
    /**
     * 사용자 메시지를 받아 AI 응답을 생성하고 대화 히스토리를 저장
     * POST /api/chat
     */
    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody ChatRequestDto request) {
        if (request.getUserId() == null || request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("userId와 message는 필수입니다.");
        }

        ChatResponseDto aiResponse = chatService.chat(request.getUserId(), request.getMessage());
        return ResponseEntity.ok(Map.of(
            "response", aiResponse.getContent(),
            "emotion", aiResponse.getEmotion()
        ));
    }

    /**
     * 특정 사용자의 전체 채팅 히스토리 조회
     * GET /api/chat/history?userId={id}
     */
    @GetMapping("/chat/history")
    public ResponseEntity<?> getChatHistory(@RequestParam Long userId) {
        List<ChatMessage> messages = chatService.getChatHistory(userId);

        List<ChatResponseDto> dtos = messages.stream()
                .map(msg -> ChatResponseDto.builder()
                        .role(msg.getRole())
                        .content(msg.getContent())
                        .timestamp(msg.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // --- Pet (다마고치) API ---
    @GetMapping("/pet/status")
    public ResponseEntity<?> getPetStatus(@RequestParam Long userId) {
        return ResponseEntity.ok(petService.getPetStatusDto(userId));
    }

    @PostMapping("/pet/ventilate")
    public ResponseEntity<?> ventilate(@RequestBody PetActionRequestDto request) {
        return ResponseEntity.ok(petService.ventilate(request.getUserId()));
    }

    @PostMapping("/pet/affection-complete")
    public ResponseEntity<?> affectionComplete(@RequestBody PetActionRequestDto request) {
        return ResponseEntity.ok(petService.affectionComplete(request.getUserId()));
    }

    @PostMapping("/pet/collect-shard")
    public ResponseEntity<?> collectEmotionShard(@RequestBody PetActionRequestDto request) {
        return ResponseEntity.ok(petService.collectEmotionShard(request.getUserId()));
    }

    // Helper: 클라이언트 IP 추출
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
