package com.codestory.diary.service;

import com.codestory.diary.dto.AuthRequest;
import com.codestory.diary.entity.Member;
import com.codestory.diary.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    // 회원가입
    @Transactional
    public String signup(AuthRequest request) {
        // 1. 이메일 중복 검사
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("이미 가입된 이메일입니다.");
        }

        // 2. 멤버 생성 (Builder 사용)
        Member member = Member.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                // createdAt은 엔티티 내부에서 @PrePersist로 자동 생성되므로 안 넣어도 됨
                .build();

        // 3. 저장
        memberRepository.save(member);

        return "회원가입 성공";
    }

    // 로그인
    public String login(String email, String password) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("가입되지 않은 이메일입니다."));

        if (!passwordEncoder.matches(password, member.getPassword())) {
            throw new RuntimeException("비밀번호가 틀렸습니다.");
        }

        return "로그인 성공 (토큰 발급 대기중)";
    }
}