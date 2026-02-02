package com.codestory.diary.dto;

import lombok.Data;

@Data
public class FeedbackRequest {
    private Long userId;
    private String email;
    private String category; // 문의, 건의, 버그 제보
    private String content;
}
