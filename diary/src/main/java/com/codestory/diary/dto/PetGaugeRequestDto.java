package com.codestory.diary.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PetGaugeRequestDto {
    private Long userId;
    private double affectionGauge;
    private double airGauge;
    private double energyGauge;
    private String lastUpdate; // ISO 8601 형식
}
