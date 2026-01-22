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

        // 프론트엔드 리디렉션 URL 결정 (로컬 vs 운영)
        String redirectUrl = determineRedirectUrl();

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
     * 환경에 따라 프론트엔드 리디렉션 URL 결정
     */
    private String determineRedirectUrl() {
        // 로컬 개발 환경
        if ("local".equals(activeProfile) || "default".equals(activeProfile)) {
            return "http://localhost:5173/login";
        }
        // 운영 환경
        return "https://logam.click/login";
    }
}
