package com.codestory.diary.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class DiaryRequestDto {
    private Long userId;
    private String content;
    private LocalDate date;
}