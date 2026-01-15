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
    public Member signup(AuthRequest request) {
        // 1. 중복 검사
        if (memberRepository.existsByEmail(request.getEmail())) {
            // [수정] RuntimeException -> IllegalArgumentException으로 변경 (더 명확함)
            throw new IllegalArgumentException("이미 등록된 회원입니다.");
        }

        // 2. 저장
        Member member = Member.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .build();

        return memberRepository.save(member);
    }

    // 로그인
    public Member login(String email, String password) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(password, member.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        return member;
    }
}