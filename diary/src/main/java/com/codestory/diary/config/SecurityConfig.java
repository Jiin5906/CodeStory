package com.codestory.diary.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.codestory.diary.security.CustomOAuth2UserService;
import com.codestory.diary.security.OAuth2SuccessHandler;

import lombok.RequiredArgsConstructor;

/**
 * Spring Security 설정 클래스
 *
 * 주요 기능: - OAuth2 로그인 (Google) - CORS 설정 - CSRF 비활성화 (REST API용) - 모든 API 엔드포인트
 * 공개 (현재 인증 없음)
 *
 * 참고: PasswordEncoder는 AuthConfig에서 관리 (순환 의존성 방지)
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                // 명시적으로 정적 리소스 및 Actuator 경로 허용
                .requestMatchers("/", "/index.html", "/assets/**", "/favicon.ico", "/*.svg").permitAll()
                .requestMatchers("/api/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/login/oauth2/**", "/oauth2/**").permitAll() // OAuth2 경로 허용
                .anyRequest().permitAll()
                )
                // OAuth2 로그인 설정
                .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                .userService(customOAuth2UserService) // 커스텀 OAuth2 사용자 서비스
                )
                .successHandler(oAuth2SuccessHandler) // 로그인 성공 핸들러
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 운영 도메인인 logam.click과 HTTPS 주소를 추가합니다.
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "https://logam.click",
                "http://logam.click"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
