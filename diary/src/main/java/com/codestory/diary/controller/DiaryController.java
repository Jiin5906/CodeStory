package com.codestory.diary.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.codestory.diary.dto.DiaryDto;
import com.codestory.diary.dto.DiaryRequestDto;
import com.codestory.diary.service.DiaryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://logam.click",
    "http://43.202.111.91",
    "https://logam.click"
})
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