package com.codestory.diary.service;

import com.codestory.diary.dto.FeedbackRequest;
import com.codestory.diary.entity.Feedback;
import com.codestory.diary.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    /**
     * 피드백 제출
     */
    @Transactional
    public Feedback submitFeedback(FeedbackRequest request) {
        // 입력 검증
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("이메일은 필수 입력 항목입니다.");
        }

        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("내용은 필수 입력 항목입니다.");
        }

        if (request.getCategory() == null || request.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("분류는 필수 입력 항목입니다.");
        }

        // Feedback 엔티티 생성 및 저장
        Feedback feedback = Feedback.builder()
                .userId(request.getUserId())
                .email(request.getEmail().trim())
                .category(request.getCategory().trim())
                .content(request.getContent().trim())
                .build();

        Feedback saved = feedbackRepository.save(feedback);

        // 로그 출력 (추후 이메일 발송 등으로 확장 가능)
        log.info("새로운 피드백 제출됨 - ID: {}, 카테고리: {}, 이메일: {}",
                saved.getId(), saved.getCategory(), saved.getEmail());

        return saved;
    }

    /**
     * 사용자별 피드백 조회
     */
    public List<Feedback> getFeedbackByUserId(Long userId) {
        return feedbackRepository.findByUserId(userId);
    }

    /**
     * 카테고리별 피드백 조회
     */
    public List<Feedback> getFeedbackByCategory(String category) {
        return feedbackRepository.findByCategory(category);
    }

    /**
     * 모든 피드백 조회 (관리자용)
     */
    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }
}
