package com.codestory.diary.security;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.codestory.diary.entity.Member;
import com.codestory.diary.repository.MemberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // Google에서 사용자 정보 가져오기
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // Google에서 제공하는 사용자 정보 추출
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");

        log.info("[OAuth2] Google 로그인 시도 - Email: {}, Name: {}", email, name);

        // DB에서 사용자 조회 또는 생성
        Member member = memberRepository.findByEmail(email)
                .orElseGet(() -> {
                    log.info("[OAuth2] 신규 사용자 자동 가입 - Email: {}", email);
                    // OAuth2 사용자는 비밀번호가 없으므로 랜덤 UUID로 설정
                    String randomPassword = UUID.randomUUID().toString();
                    Member newMember = Member.builder()
                            .email(email)
                            .password(passwordEncoder.encode(randomPassword))
                            .nickname(name != null ? name : email.split("@")[0])
                            .build();
                    return memberRepository.save(newMember);
                });

        // Spring Security에서 사용할 수 있도록 속성에 userId 추가
        Map<String, Object> modifiedAttributes = new HashMap<>(attributes);
        modifiedAttributes.put("userId", member.getId());
        modifiedAttributes.put("nickname", member.getNickname());

        log.info("[OAuth2] 로그인 성공 - UserId: {}, Email: {}", member.getId(), email);

        // DefaultOAuth2User 반환 (nameAttributeKey는 Google의 경우 "sub")
        return new DefaultOAuth2User(
                oAuth2User.getAuthorities(),
                modifiedAttributes,
                "sub"
        );
    }
}
