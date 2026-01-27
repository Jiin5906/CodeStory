package com.codestory.diary.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.codestory.diary.entity.ChatMessage;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /**
     * 특정 사용자의 최근 대화 히스토리를 시간 역순으로 조회
     * @param userId 사용자 ID
     * @return 최근 대화 리스트 (최신순)
     */
    List<ChatMessage> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * 특정 사용자의 전체 대화 개수
     * @param userId 사용자 ID
     * @return 대화 개수
     */
    int countByUserId(Long userId);
}
