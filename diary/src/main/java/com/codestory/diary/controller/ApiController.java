package com.codestory.diary.controller;

import com.codestory.diary.dto.AuthRequest;
import com.codestory.diary.dto.DiaryDto;
import com.codestory.diary.dto.DiaryRequestDto;
import com.codestory.diary.entity.Diary;
import com.codestory.diary.repository.DiaryRepository;
import com.codestory.diary.service.AuthService;
import com.codestory.diary.service.DiaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType; // import 추가 확인

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
// [추가] 컨트롤러 레벨에서도 CORS 허용 (보험)
@CrossOrigin(origins = {"http://localhost:5173", "http://logam.click", "https://logam.click"})
public class ApiController {

    private final AuthService authService;
    private final DiaryService diaryService;
    private final DiaryRepository diaryRepository;

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

    @PostMapping(value = "/diaries/write", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> saveDiary(
            @RequestPart(value = "diary") DiaryRequestDto request,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        DiaryDto createdDiary = diaryService.createDiaryWithImage(request, image);
        return ResponseEntity.ok(createdDiary);
    }

    @GetMapping("/diaries")
    public ResponseEntity<?> getDiaries(@RequestParam Long userId) {
        List<Diary> diaries = diaryRepository.findAllByUserIdOrderByDateDesc(userId);

        List<DiaryDto> dtos = diaries.stream().map(d -> DiaryDto.builder()
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
                .build()).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}