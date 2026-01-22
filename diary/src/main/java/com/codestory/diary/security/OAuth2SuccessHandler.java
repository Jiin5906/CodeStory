package com.codestory.diary.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // CustomOAuth2UserService에서 추가한 userId와 email 추출
        Long userId = ((Number) oAuth2User.getAttributes().get("userId")).longValue();
        String email = (String) oAuth2User.getAttributes().get("email");
        String nickname = (String) oAuth2User.getAttributes().get("nickname");

        log.info("[OAuth2SuccessHandler] 인증 성공 - UserId: {}, Email: {}", userId, email);

        // JWT Access Token 생성
        String accessToken = jwtTokenProvider.createAccessToken(userId, email);

        // JWT Refresh Token 생성
        String refreshToken = jwtTokenProvider.createRefreshToken(userId);

        log.info("[OAuth2SuccessHandler] JWT 토큰 생성 완료 - UserId: {}", userId);

        // 프론트엔드 리디렉션 URL 결정 (요청 Host 기반 동적 결정)
        String redirectUrl = determineRedirectUrl(request);

        // 토큰을 쿼리 파라미터로 전달하여 프론트엔드로 리디렉션
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUrl)
                .queryParam("token", accessToken)
                .queryParam("refreshToken", refreshToken)
                .queryParam("userId", userId)
                .queryParam("email", email)
                .queryParam("nickname", nickname)
                .build()
                .toUriString();

        log.info("[OAuth2SuccessHandler] 리디렉션 URL: {}", targetUrl);

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    /**
     * 요청이 들어온 Host를 기반으로 프론트엔드 리디렉션 URL 동적 결정
     *
     * @param request HTTP 요청 객체
     * @return 프론트엔드 로그인 페이지 URL
     */
    private String determineRedirectUrl(HttpServletRequest request) {
        // X-Forwarded-Host 헤더 확인 (Nginx 프록시를 통한 요청인 경우)
        String host = request.getHeader("X-Forwarded-Host");

        // X-Forwarded-Host가 없으면 일반 Host 헤더 사용
        if (host == null || host.isEmpty()) {
            host = request.getHeader("Host");
        }

        log.info("[OAuth2SuccessHandler] 요청 Host: {}", host);

        // Host 기반으로 환경 결정
        if (host != null && (host.contains("localhost") || host.contains("127.0.0.1"))) {
            // 로컬 개발 환경
            return "http://localhost:5173/login";
        } else {
            // 운영 환경 (logam.click 또는 기타 프로덕션 도메인)
            return "https://logam.click/login";
        }
    }
}
