package com.codestory.diary.service;

import com.codestory.diary.dto.PetStatusDto;
import com.codestory.diary.entity.PetStatus;
import com.codestory.diary.repository.PetStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import java.util.Random;

@Service
@RequiredArgsConstructor
public class PetService {

    private final PetStatusRepository petStatusRepository;
    private static final Random random = new Random();

    // 신규 사용자이면 자동 생성, 기존이면 조회
    @Transactional
    public PetStatus getOrCreatePetStatus(Long userId) {
        return petStatusRepository.findByUserId(userId)
                .orElseGet(() -> {
                    PetStatus newPet = PetStatus.builder()
                            .userId(userId)
                            .build();
                    return petStatusRepository.save(newPet);
                });
    }

    // DTO 변환 반환
    @Transactional(readOnly = true)
    public PetStatusDto getPetStatusDto(Long userId) {
        PetStatus pet = getOrCreatePetStatus(userId);

        return PetStatusDto.builder()
                .userId(userId)
                .level(pet.getLevel())
                .currentExp(pet.getExp())
                .requiredExp(pet.getRequiredExp())
                .sunlight(pet.getSunlight())
                .affection(pet.getAffection())
                .evolutionStage(pet.getEvolutionStage())
                .affectionGauge(pet.getAffectionGauge())
                .energyGauge(pet.getEnergyGauge())
                .lastUpdate(pet.getLastUpdate())
                .build();
    }

    // 쓰다듬기 완료: EXP 30~50 랜덤, affection 리셋
    @Transactional
    @Retryable(
        retryFor = {ObjectOptimisticLockingFailureException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 100, multiplier = 2.0)
    )
    public PetStatusDto affectionComplete(Long userId) {
        PetStatus pet = getOrCreatePetStatus(userId);

        long expReward = 30 + random.nextInt(21); // 30~50
        pet.addExp(expReward);
        pet.resetAffection();

        // 명시적으로 저장 (낙관적 락으로 충돌 방지, 실패 시 재시도)
        petStatusRepository.save(pet);

        System.out.println("🐾 [PetService] 쓰다듬기 완료 - EXP+" + expReward + " - User: " + userId);

        return getPetStatusDto(userId);
    }

    // 감정 조각 수집: EXP+10, Sunlight+5
    @Transactional
    @Retryable(
        retryFor = {ObjectOptimisticLockingFailureException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 100, multiplier = 2.0)
    )
    public PetStatusDto collectEmotionShard(Long userId) {
        PetStatus pet = getOrCreatePetStatus(userId);

        pet.addExp(10);
        pet.addSunlight(5);

        // 명시적으로 저장 (낙관적 락으로 충돌 방지, 실패 시 재시도)
        petStatusRepository.save(pet);

        System.out.println("💎 [PetService] 감정 조각 수집 - EXP+10, Sunlight+5 - User: " + userId);

        return getPetStatusDto(userId);
    }

    // 채팅 시 30% 확률로 EXP 부여
    @Transactional
    @Retryable(
        retryFor = {ObjectOptimisticLockingFailureException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 100, multiplier = 2.0)
    )
    public void onChatInteraction(Long userId) {
        if (random.nextInt(100) < 30) {
            PetStatus pet = getOrCreatePetStatus(userId);
            pet.addExp(10);

            // 명시적으로 저장 (낙관적 락으로 충돌 방지, 실패 시 재시도)
            petStatusRepository.save(pet);

            System.out.println("🎲 [PetService] 채팅 확률 EXP+10 - User: " + userId);
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 게이지 저장 (데이터 영속성)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    @Transactional
    @Retryable(
        retryFor = {ObjectOptimisticLockingFailureException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 100, multiplier = 2.0)
    )
    public PetStatusDto saveGauges(Long userId, double affectionGauge, double energyGauge) {
        PetStatus pet = getOrCreatePetStatus(userId);
        pet.updateGauges(affectionGauge, energyGauge);

        // 명시적으로 저장 (낙관적 락으로 충돌 방지, 실패 시 재시도)
        petStatusRepository.save(pet);

        System.out.println("💾 [PetService] 게이지 저장 완료 - Affection: " + affectionGauge +
                ", Energy: " + energyGauge + " - User: " + userId);

        return getPetStatusDto(userId);
    }
}
