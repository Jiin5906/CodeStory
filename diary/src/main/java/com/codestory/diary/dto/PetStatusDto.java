package com.codestory.diary.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PetStatusDto {

    private Long userId;
    private int level;
    private long currentExp;
    private long requiredExp;
    private long sunlight;
    private int affection;
    private String evolutionStage;
    private boolean ventilationAvailable;

    // 게이지 데이터 (프론트엔드 연동)
    private double affectionGauge;
    private double airGauge;
    private double energyGauge;
    private java.time.LocalDateTime lastUpdate;
}
