package com.codestory.diary.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "member")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 로그인 아이디 (이메일)
    @Column(nullable = false, unique = true)
    private String email;

    // 비밀번호 (암호화 저장 예정)
    @Column(nullable = false)
    private String password;

    // 사용자 이름
    @Column(nullable = false)
    private String nickname;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // 엔티티가 저장되기 직전에 실행되어 시간을 자동으로 넣어주는 로직
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}