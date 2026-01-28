package com.codestory.diary.repository;

import com.codestory.diary.entity.PetStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PetStatusRepository extends JpaRepository<PetStatus, Long> {

    Optional<PetStatus> findByUserId(Long userId);
}
