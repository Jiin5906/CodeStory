package com.codestory.diary.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.codestory.diary.entity.ChatMessage;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByUserIdOrderByCreatedAtDesc(Long userId);

    int countByUserId(Long userId);

    /**
     * 특정 시점 이후의 사용자 대화를 최신순으로 조회 (능동적 대화용)
     */
    List<ChatMessage> findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(Long userId, LocalDateTime after);
}
