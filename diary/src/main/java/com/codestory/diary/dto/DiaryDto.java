package com.codestory.diary.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiaryDto {
    private Long id;
    private Long userId;
    private String content;
    private LocalDate date;
    private String emoji;
    private String mood;
    private Integer tension;
    private Integer fun;
    private String tags;
    private String aiResponse;
    private String imageUrl;
}