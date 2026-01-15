package com.codestory.diary.controller;

import com.codestory.diary.dto.DiaryDto;
import com.codestory.diary.dto.DiaryRequestDto;
import com.codestory.diary.service.DiaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") 
public class DiaryController {

    private final DiaryService diaryService;

    // 일기 작성
    @PostMapping("/diary")
    public DiaryDto createDiary(
            @ModelAttribute DiaryRequestDto requestDto,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        return diaryService.createDiaryWithImage(requestDto, image);
    }

    // [추가] 일기 삭제
    @DeleteMapping("/diary/{id}")
    public void deleteDiary(@PathVariable Long id) {
        diaryService.deleteDiary(id);
    }

    // [추가] 공유 상태 변경 (토글)
    @PostMapping("/diary/{id}/status")
    public DiaryDto toggleShare(@PathVariable Long id) {
        return diaryService.toggleShareStatus(id);
    }

    // 피드 조회
    @GetMapping("/feed")
    public List<DiaryDto> getFeed() {
        return diaryService.getPublicFeed();
    }
}