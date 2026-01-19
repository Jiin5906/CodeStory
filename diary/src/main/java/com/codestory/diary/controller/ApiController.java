package com.codestory.diary.controller;

import com.codestory.diary.dto.AuthRequest;
import com.codestory.diary.dto.DiaryDto;
import com.codestory.diary.dto.DiaryRequestDto;
import com.codestory.diary.entity.Diary;
import com.codestory.diary.entity.Member;
import com.codestory.diary.repository.DiaryRepository;
import com.codestory.diary.repository.MemberRepository;
import com.codestory.diary.service.AuthService;
import com.codestory.diary.service.DiaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ApiController {

    private final AuthService authService;
    private final DiaryService diaryService;
    private final DiaryRepository diaryRepository;
    private final MemberRepository memberRepository;

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

            return DiaryDto.builder()
                    .id(d.getId())
                    .userId(d.getUserId())
                    .content(d.getContent())
                    .date(d.getDate())
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
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}