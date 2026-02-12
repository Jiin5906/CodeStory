package com.codestory.diary.repository;

import com.codestory.diary.entity.CoinRewardStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CoinRewardStatusRepository extends JpaRepository<CoinRewardStatus, Long> {
    Optional<CoinRewardStatus> findByUserId(Long userId);
}
