package com.codestory.diary.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Diary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDate date;

    private String emoji;

    private String mood;    // 감정 분석 결과 (기쁨, 슬픔 등)
    private Integer tension; // 긴장도 (0~100)
    private Integer fun;     // 재미 (0~100)

    private String tags;    // 태그 (#여행 #맛집)

    @Column(columnDefinition = "TEXT")
    private String aiResponse; // AI의 조언/위로
    private String imageUrl;   // 업로드한 이미지 경로
}