package com.codestory.diary.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 사용자 ID (nullable - 로그인하지 않은 사용자도 피드백 가능)
    @Column(name = "user_id")
    private Long userId;

    // 답변 받을 이메일
    @Column(nullable = false)
    private String email;

    // 피드백 분류 (문의, 건의, 버그 제보)
    @Column(nullable = false)
    private String category;

    // 피드백 내용
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // 생성 시간
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // 엔티티가 저장되기 직전에 실행되어 시간을 자동으로 넣어주는 로직
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
