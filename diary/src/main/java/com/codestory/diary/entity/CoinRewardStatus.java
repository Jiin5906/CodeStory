package com.codestory.diary.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "coin_reward_status")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CoinRewardStatus {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Version
    @Column(name = "version")
    private Long version;

    @Builder.Default
    @Column(name = "affection_reward_given")
    private Boolean affectionRewardGiven = false;

    @Builder.Default
    @Column(name = "sleep_reward_given")
    private Boolean sleepRewardGiven = false;

    @Builder.Default
    @Column(name = "hunger_reward_given")
    private Boolean hungerRewardGiven = false;

    @Column(name = "last_diary_reward_date")
    private LocalDate lastDiaryRewardDate;

    public void resetGaugeReward(String gaugeType) {
        switch (gaugeType) {
            case "affection" -> this.affectionRewardGiven = false;
            case "sleep" -> this.sleepRewardGiven = false;
            case "hunger" -> this.hungerRewardGiven = false;
        }
    }

    public boolean isGaugeRewardGiven(String gaugeType) {
        return switch (gaugeType) {
            case "affection" -> Boolean.TRUE.equals(this.affectionRewardGiven);
            case "sleep" -> Boolean.TRUE.equals(this.sleepRewardGiven);
            case "hunger" -> Boolean.TRUE.equals(this.hungerRewardGiven);
            default -> true;
        };
    }

    public void markGaugeRewardGiven(String gaugeType) {
        switch (gaugeType) {
            case "affection" -> this.affectionRewardGiven = true;
            case "sleep" -> this.sleepRewardGiven = true;
            case "hunger" -> this.hungerRewardGiven = true;
        }
    }
}
