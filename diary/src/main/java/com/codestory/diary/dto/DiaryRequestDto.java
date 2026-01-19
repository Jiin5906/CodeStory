package com.codestory.diary.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter
public class DiaryRequestDto {
    private Long userId;
    private String title;
    private String content;
    private LocalDate date;
    
    // 감정 데이터
    private int mood;
    private int tension;
    private int fun;
    private String emoji;
    private List<String> tags;
    private String aiResponse;

    // 인스타 기능
    private Boolean isPublic; // 공개 여부
    private Boolean isAnonymous; // 익명 여부
    private MultipartFile image; // 업로드할 이미지 파일
}