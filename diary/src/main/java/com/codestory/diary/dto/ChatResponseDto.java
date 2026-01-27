package com.codestory.diary.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponseDto {
    private String role; // "user" or "assistant"
    private String content;
    private LocalDateTime timestamp;
    private String emotion; // "happy", "sad", "angry", "neutral"
}
