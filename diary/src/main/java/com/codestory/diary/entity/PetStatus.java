package com.codestory.diary.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pet_status")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PetStatus {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Version
    @Column(name = "version")
    private Long version;

    @Builder.Default
    private int level = 1;

    @Builder.Default
    private long exp = 0L;

    @Builder.Default
    private long sunlight = 0L;

    @Builder.Default
    private int affection = 0;

    @Builder.Default
    @Column(name = "evolution_stage", length = 10)
    private String evolutionStage = "BABY";

    // ━━━ 게이지 데이터 (프론트엔드 연동) ━━━
    @Builder.Default
    @Column(name = "affection_gauge")
    private Double affectionGauge = 50.0;

    @Builder.Default
    @Column(name = "energy_gauge")
    private Double energyGauge = 50.0;

    @Column(name = "last_update")
    private java.time.LocalDateTime lastUpdate;

    // 게이지 업데이트 메소드
    public void updateGauges(Double affection, Double energy) {
        if (affection != null) {
            this.affectionGauge = Math.max(0.0, Math.min(100.0, affection));
        }
        if (energy != null) {
            this.energyGauge = Math.max(0.0, Math.min(100.0, energy));
        }
        this.lastUpdate = java.time.LocalDateTime.now();
    }

    // 다음 레벨까지 필요한 EXP: Base(100) * Level^1.5
    public long getRequiredExp() {
        return (long) (100 * Math.pow(level, 1.5));
    }

    // EXP 추가 후 레벨업 체크
    public void addExp(long amount) {
        this.exp += amount;
        checkAndLevelUp();
        updateEvolutionStage();
    }

    public void addSunlight(long amount) {
        this.sunlight += amount;
    }

    public void resetAffection() {
        this.affection = 0;
    }

    // 레벨업 로직 (다중 레벨 처리)
    private void checkAndLevelUp() {
        while (this.exp >= getRequiredExp()) {
            this.exp -= getRequiredExp();
            this.level++;
            System.out.println("🎉 [PetService] 레벨업! Lv." + level);
        }
    }

    // 진화 단계 갱신
    private void updateEvolutionStage() {
        if (level >= 10) {
            this.evolutionStage = "ADULT";
        } else if (level >= 5) {
            this.evolutionStage = "KID";
        } else {
            this.evolutionStage = "BABY";
        }
    }
}
