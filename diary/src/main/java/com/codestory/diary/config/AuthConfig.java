package com.codestory.diary.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * 인증 관련 Bean 설정 클래스
 *
 * SecurityConfig에서 분리하여 순환 의존성(Circular Dependency) 문제 해결:
 * - SecurityConfig -> CustomOAuth2UserService -> PasswordEncoder -> SecurityConfig (순환!)
 *
 * 해결 방법:
 * - PasswordEncoder를 별도의 Configuration 클래스로 분리
 * - CustomOAuth2UserService는 이제 AuthConfig만 의존
 */
@Configuration
public class AuthConfig {

    /**
     * BCrypt 비밀번호 인코더 Bean
     *
     * BCrypt는 강력한 해시 알고리즘으로:
     * - Salt 자동 생성
     * - 느린 해싱 속도 (무차별 대입 공격 방지)
     * - 안전한 비밀번호 저장
     *
     * @return BCryptPasswordEncoder 인스턴스
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
