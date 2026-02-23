package com.codestory.diary.service;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.codestory.diary.entity.CoinRewardStatus;
import com.codestory.diary.entity.Member;
import com.codestory.diary.repository.CoinRewardStatusRepository;
import com.codestory.diary.repository.DiaryRepository;
import com.codestory.diary.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CoinService {

    private final MemberRepository memberRepository;
    private final CoinRewardStatusRepository coinRewardStatusRepository;
    private final DiaryRepository diaryRepository;

    private static final long GAUGE_REWARD = 10L;
    private static final long SHARD_REWARD = 5L;
    private static final long DIARY_REWARD = 20L;

    // 보유 코인 조회
    @Transactional(readOnly = true)
    public Map<String, Object> getCoins(Long userId) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return Map.of("userId", userId, "coins", member.getCoins());
    }

    // CoinRewardStatus 조회 또는 생성
    private CoinRewardStatus getOrCreateRewardStatus(Long userId) {
        return coinRewardStatusRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CoinRewardStatus status = CoinRewardStatus.builder()
                            .userId(userId)
                            .build();
                    return coinRewardStatusRepository.save(status);
                });
    }

    // 게이지 100% 보상 (중복 방지)
    @Transactional
    @Retryable(
        retryFor = {ObjectOptimisticLockingFailureException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 100, multiplier = 2.0)
    )
    public Map<String, Object> giveGaugeReward(Long userId, String gaugeType) {
        CoinRewardStatus status = getOrCreateRewardStatus(userId);

        if (status.isGaugeRewardGiven(gaugeType)) {
            Member member = memberRepository.findById(userId).orElseThrow();
            return Map.of("userId", userId, "coins", member.getCoins(), "rewarded", false, "message", "이미 보상을 받았습니다.");
        }

        Member member = memberRepository.findById(userId).orElseThrow();
        member.addCoins(GAUGE_REWARD);
        memberRepository.save(member);

        status.markGaugeRewardGiven(gaugeType);
        coinRewardStatusRepository.save(status);

        System.out.println("[CoinService] 게이지 보상 +" + GAUGE_REWARD + "원 (" + gaugeType + ") - User: " + userId);

        return Map.of("userId", userId, "coins", member.getCoins(), "rewarded", true, "amount", GAUGE_REWARD);
    }

    // 감정 조각 수집 보상
    @Transactional
    @Retryable(
        retryFor = {ObjectOptimisticLockingFailureException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 100, multiplier = 2.0)
    )
    public Map<String, Object> giveShardReward(Long userId) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        member.addCoins(SHARD_REWARD);
        memberRepository.save(member);

        System.out.println("[CoinService] 감정 조각 보상 +" + SHARD_REWARD + "원 - User: " + userId);

        return Map.of("userId", userId, "coins", member.getCoins(), "rewarded", true, "amount", SHARD_REWARD);
    }

    // 일기 작성 보상 (하루 1회)
    @Transactional
    @Retryable(
        retryFor = {ObjectOptimisticLockingFailureException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 100, multiplier = 2.0)
    )
    public Map<String, Object> giveDiaryReward(Long userId) {
        CoinRewardStatus status = getOrCreateRewardStatus(userId);
        LocalDate today = LocalDate.now();

        if (today.equals(status.getLastDiaryRewardDate())) {
            Member member = memberRepository.findById(userId).orElseThrow();
            return Map.of("userId", userId, "coins", member.getCoins(), "rewarded", false, "message", "오늘은 이미 일기 보상을 받았습니다.");
        }

        Member member = memberRepository.findById(userId).orElseThrow();
        member.addCoins(DIARY_REWARD);
        memberRepository.save(member);

        status.setLastDiaryRewardDate(today);
        coinRewardStatusRepository.save(status);

        System.out.println("[CoinService] 일기 보상 +" + DIARY_REWARD + "원 - User: " + userId);

        return Map.of("userId", userId, "coins", member.getCoins(), "rewarded", true, "amount", DIARY_REWARD);
    }

    // 레벨업 보상: 100 + (level - 1) * 10
    @Transactional
    public Map<String, Object> giveLevelUpReward(Long userId, int newLevel) {
        long reward = 100L + ((long)(newLevel - 1) * 10);
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        member.addCoins(reward);
        memberRepository.save(member);

        System.out.println("🎉 [CoinService] 레벨업 보상 +" + reward + "원 (Lv." + newLevel + ") - User: " + userId);

        return Map.of("userId", userId, "coins", member.getCoins(), "rewarded", true, "amount", reward, "level", newLevel);
    }

    // 코인 사용 (상점 구매 등)
    @Transactional
    @Retryable(
        retryFor = {ObjectOptimisticLockingFailureException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 100, multiplier = 2.0)
    )
    public Map<String, Object> spendCoins(Long userId, Long amount) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (member.getCoins() < amount) {
            return Map.of("userId", userId, "coins", member.getCoins(), "success", false, "message", "코인이 부족합니다.");
        }

        member.addCoins(-amount);
        memberRepository.save(member);

        System.out.println("💸 [CoinService] 코인 사용 -" + amount + "원 - User: " + userId);

        return Map.of("userId", userId, "coins", member.getCoins(), "success", true, "spent", amount);
    }

    // 게이지 리셋 시 보상 플래그 해제
    @Transactional
    public void resetGaugeReward(Long userId, String gaugeType) {
        CoinRewardStatus status = getOrCreateRewardStatus(userId);
        status.resetGaugeReward(gaugeType);
        coinRewardStatusRepository.save(status);

        System.out.println("🔄 [CoinService] 게이지 보상 리셋 (" + gaugeType + ") - User: " + userId);
    }
}
