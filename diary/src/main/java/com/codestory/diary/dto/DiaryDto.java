package com.codestory.diary.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiaryDto {
    private Long id;
    private Long userId;
    private LocalDate date;
    private LocalDateTime createdAt; // 생성 시간 (시, 분 포함)
    private String title;
    private String content;
    private String emoji;
    private int mood;
    private int tension;
    private int fun;
    private List<String> tags;
    private String aiResponse;
    private String imageUrl;

    private boolean shared;
    private boolean anonymous;
    private String nickname; // Author nickname (or "익명" if anonymous)

    private List<CommentDto> comments;
    private int likeCount;
    private int commentCount;
}