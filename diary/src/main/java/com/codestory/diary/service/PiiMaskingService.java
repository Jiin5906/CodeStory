package com.codestory.diary.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * PII(개인정보) 마스킹 서비스 (Phase 3: 프라이버시 보호)
 *
 * [역할]
 * - 일기 내용을 LLM에 전송하기 전에 민감한 개인정보 자동 마스킹
 * - 전화번호, 이메일, 주민등록번호 등 정규식 기반 탐지 및 치환
 *
 * [전략]
 * - RDB(MariaDB): 원본 저장 (사용자가 자신의 일기 볼 수 있도록)
 * - LLM 전송: 마스킹된 내용 전송 (프라이버시 보호)
 * - Neo4j: 마스킹된 내용 저장 (검색용, 개인정보 불필요)
 *
 * [예시]
 * - 입력: "제 전화번호는 010-1234-5678이고 이메일은 test@example.com입니다"
 * - 출력: "제 전화번호는 [PHONE_NUMBER]이고 이메일은 [EMAIL]입니다"
 */
@Slf4j
@Service
public class PiiMaskingService {

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 정규식 패턴 정의
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * 전화번호 패턴
     * - 010-1234-5678
     * - 01012345678
     * - 02-1234-5678 (지역번호)
     * - 031-987-6543
     */
    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "0\\d{1,2}[-\\s]?\\d{3,4}[-\\s]?\\d{4}"
    );

    /**
     * 이메일 패턴
     * - test@example.com
     * - user.name+tag@domain.co.kr
     */
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}"
    );

    /**
     * 주민등록번호 패턴
     * - 900101-1234567
     * - 900101-*******
     * - 앞 6자리는 생년월일 (YYMMDD)
     * - 하이픈 필수
     * - 뒤 7자리는 성별(1-4) + 6자리 숫자 또는 *
     */
    private static final Pattern ID_CARD_PATTERN = Pattern.compile(
            "\\d{6}[-][1-4*]\\d{6}"
    );

    /**
     * 계좌번호 패턴 (선택)
     * - 123-456-789012
     * - 123456789012
     */
    private static final Pattern ACCOUNT_PATTERN = Pattern.compile(
            "\\b\\d{3,6}[-]?\\d{2,6}[-]?\\d{6,12}\\b"
    );

    /**
     * 한국인 이름 패턴 (매우 조심스럽게)
     * - 3글자 한글 이름
     * - 단, 일반 단어와 구분 어려우므로 제한적으로만 사용
     */
    private static final Pattern KOREAN_NAME_PATTERN = Pattern.compile(
            "\\b[가-힣]{2,4}(?=\\s+씨|\\s+님|\\s+선생|\\s+교수|\\s+대표|\\s+부장|\\s+과장|께서|에게|한테)\\b"
    );

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 마스킹 메서드
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * 텍스트에서 모든 PII를 마스킹
     *
     * @param text 원본 텍스트
     * @return 마스킹된 텍스트
     */
    public String maskContent(String text) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }

        String masked = text;
        int totalMasked = 0;

        // 1. 전화번호 마스킹
        Matcher phoneMatcher = PHONE_PATTERN.matcher(masked);
        int phoneCount = 0;
        while (phoneMatcher.find()) {
            phoneCount++;
        }
        if (phoneCount > 0) {
            masked = PHONE_PATTERN.matcher(masked).replaceAll("[PHONE_NUMBER]");
            totalMasked += phoneCount;
            log.debug("  🔒 전화번호 {} 개 마스킹됨", phoneCount);
        }

        // 2. 이메일 마스킹
        Matcher emailMatcher = EMAIL_PATTERN.matcher(masked);
        int emailCount = 0;
        while (emailMatcher.find()) {
            emailCount++;
        }
        if (emailCount > 0) {
            masked = EMAIL_PATTERN.matcher(masked).replaceAll("[EMAIL]");
            totalMasked += emailCount;
            log.debug("  🔒 이메일 {} 개 마스킹됨", emailCount);
        }

        // 3. 주민등록번호 마스킹
        Matcher idCardMatcher = ID_CARD_PATTERN.matcher(masked);
        int idCardCount = 0;
        while (idCardMatcher.find()) {
            idCardCount++;
        }
        if (idCardCount > 0) {
            masked = ID_CARD_PATTERN.matcher(masked).replaceAll("[ID_CARD]");
            totalMasked += idCardCount;
            log.debug("  🔒 주민등록번호 {} 개 마스킹됨", idCardCount);
        }

        // 4. 계좌번호 마스킹 (선택적)
        // 주의: 너무 일반적인 숫자 패턴까지 잡을 수 있으므로 신중히 사용
        // 필요시 주석 해제
        /*
        Matcher accountMatcher = ACCOUNT_PATTERN.matcher(masked);
        int accountCount = 0;
        while (accountMatcher.find()) {
            accountCount++;
        }
        if (accountCount > 0) {
            masked = ACCOUNT_PATTERN.matcher(masked).replaceAll("[ACCOUNT_NUMBER]");
            totalMasked += accountCount;
            log.debug("  🔒 계좌번호 {} 개 마스킹됨", accountCount);
        }
        */

        // 5. 한국인 이름 마스킹 (매우 제한적)
        // 주의: "~씨", "~님" 등이 붙은 경우만 탐지하여 과도한 마스킹 방지
        Matcher nameMatcher = KOREAN_NAME_PATTERN.matcher(masked);
        int nameCount = 0;
        while (nameMatcher.find()) {
            nameCount++;
        }
        if (nameCount > 0) {
            masked = KOREAN_NAME_PATTERN.matcher(masked).replaceAll("[NAME]");
            totalMasked += nameCount;
            log.debug("  🔒 이름 {} 개 마스킹됨", nameCount);
        }

        if (totalMasked > 0) {
            log.info("🔒 PII 마스킹 완료: {} 개 항목 마스킹됨", totalMasked);
        }

        return masked;
    }

    /**
     * 마스킹 여부 확인 (테스트용)
     *
     * @param text 텍스트
     * @return PII가 포함되어 있으면 true
     */
    public boolean containsPii(String text) {
        if (text == null || text.trim().isEmpty()) {
            return false;
        }

        return PHONE_PATTERN.matcher(text).find()
                || EMAIL_PATTERN.matcher(text).find()
                || ID_CARD_PATTERN.matcher(text).find()
                || KOREAN_NAME_PATTERN.matcher(text).find();
    }

    /**
     * 마스킹된 텍스트 복원 (선택 기능)
     * - 현재는 구현하지 않음 (일방향 마스킹)
     * - 필요시 원본 텍스트와 마스킹 위치를 저장하여 복원 가능
     */
    @Deprecated
    public String unmaskContent(String maskedText, String originalText) {
        throw new UnsupportedOperationException("마스킹 복원은 지원하지 않습니다. 원본은 RDB에 저장되어 있습니다.");
    }
}
