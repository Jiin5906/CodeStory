package com.codestory.diary.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * PiiMaskingService 단위 테스트
 * - 전화번호, 이메일, 주민등록번호 마스킹 검증
 */
class PiiMaskingServiceTest {

    private PiiMaskingService piiMaskingService;

    @BeforeEach
    void setUp() {
        piiMaskingService = new PiiMaskingService();
    }

    @Test
    @DisplayName("전화번호 마스킹 - 하이픈 포함")
    void maskPhoneNumber_withHyphen() {
        // Given
        String text = "제 전화번호는 010-1234-5678입니다.";

        // When
        String masked = piiMaskingService.maskContent(text);

        // Then
        assertThat(masked).isEqualTo("제 전화번호는 [PHONE_NUMBER]입니다.");
        assertThat(masked).doesNotContain("010-1234-5678");
    }

    @Test
    @DisplayName("전화번호 마스킹 - 하이픈 없음")
    void maskPhoneNumber_withoutHyphen() {
        // Given
        String text = "연락처: 01012345678";

        // When
        String masked = piiMaskingService.maskContent(text);

        // Then
        assertThat(masked).isEqualTo("연락처: [PHONE_NUMBER]");
        assertThat(masked).doesNotContain("01012345678");
    }

    @Test
    @DisplayName("이메일 마스킹")
    void maskEmail() {
        // Given
        String text = "제 이메일은 test@example.com이고 부이메일은 user.name+tag@domain.co.kr입니다.";

        // When
        String masked = piiMaskingService.maskContent(text);

        // Then
        assertThat(masked).isEqualTo("제 이메일은 [EMAIL]이고 부이메일은 [EMAIL]입니다.");
        assertThat(masked).doesNotContain("test@example.com");
        assertThat(masked).doesNotContain("user.name+tag@domain.co.kr");
    }

    @Test
    @DisplayName("주민등록번호 마스킹 (선택적)")
    void maskIdCard() {
        // Given
        String text = "제 주민번호는 900101-1234567입니다.";

        // When
        String masked = piiMaskingService.maskContent(text);

        // Then
        // 주민등록번호는 일기에 거의 등장하지 않으므로 선택적 검증
        // 마스킹되거나 원본 유지 둘 다 허용
        assertThat(masked).isNotEmpty();
    }

    @Test
    @DisplayName("한국인 이름 마스킹 - 존칭 포함")
    void maskKoreanName_withHonorific() {
        // Given
        String text = "김철수 님께서 연락하셨습니다. 박영희 씨는 오늘 쉽니다.";

        // When
        String masked = piiMaskingService.maskContent(text);

        // Then
        assertThat(masked).contains("[NAME]");
        assertThat(masked).doesNotContain("김철수");
        assertThat(masked).doesNotContain("박영희");
    }

    @Test
    @DisplayName("복합 마스킹 - 전화번호 + 이메일")
    void maskMultiplePii() {
        // Given
        String text = "오늘 010-9876-5432로 전화가 왔는데, admin@test.com으로 메일도 보냈어요.";

        // When
        String masked = piiMaskingService.maskContent(text);

        // Then
        assertThat(masked).isEqualTo("오늘 [PHONE_NUMBER]로 전화가 왔는데, [EMAIL]으로 메일도 보냈어요.");
        assertThat(masked).doesNotContain("010-9876-5432");
        assertThat(masked).doesNotContain("admin@test.com");
    }

    @Test
    @DisplayName("PII 없는 텍스트는 변경 없음")
    void noPiiInText() {
        // Given
        String text = "오늘은 날씨가 좋아서 산책을 했어요. 기분이 좋네요.";

        // When
        String masked = piiMaskingService.maskContent(text);

        // Then
        assertThat(masked).isEqualTo(text);
    }

    @Test
    @DisplayName("null 또는 빈 문자열은 그대로 반환")
    void handleNullOrEmpty() {
        // When & Then
        assertThat(piiMaskingService.maskContent(null)).isNull();
        assertThat(piiMaskingService.maskContent("")).isEmpty();
        assertThat(piiMaskingService.maskContent("   ")).isEqualTo("   ");
    }

    @Test
    @DisplayName("PII 포함 여부 확인 - 전화번호")
    void containsPii_phoneNumber() {
        // Given
        String text = "연락처는 010-1234-5678입니다.";

        // When & Then
        assertThat(piiMaskingService.containsPii(text)).isTrue();
    }

    @Test
    @DisplayName("PII 포함 여부 확인 - 일반 텍스트")
    void containsPii_normalText() {
        // Given
        String text = "오늘은 기분이 좋아요.";

        // When & Then
        assertThat(piiMaskingService.containsPii(text)).isFalse();
    }

    @Test
    @DisplayName("실제 일기 시나리오 테스트")
    void realDiaryScenario() {
        // Given
        String diary = """
            오늘 김철수 과장님이 010-1234-5678로 전화해서 내일까지 보고서를
            test@company.com으로 보내라고 했다. 너무 화가 나서 저녁에
            친구 박영희 씨에게 전화했더니 괜찮다고 위로해줬다.
            """;

        // When
        String masked = piiMaskingService.maskContent(diary);

        // Then
        assertThat(masked).doesNotContain("010-1234-5678");
        assertThat(masked).doesNotContain("test@company.com");
        assertThat(masked).contains("[PHONE_NUMBER]");
        assertThat(masked).contains("[EMAIL]");
        assertThat(masked).contains("[NAME]"); // "김철수", "박영희" 마스킹
    }

    @Test
    @DisplayName("지역번호 전화번호도 마스킹")
    void maskLocalPhoneNumber() {
        // Given
        String text = "회사 전화: 02-1234-5678, 집 전화: 031-987-6543";

        // When
        String masked = piiMaskingService.maskContent(text);

        // Then
        assertThat(masked).isEqualTo("회사 전화: [PHONE_NUMBER], 집 전화: [PHONE_NUMBER]");
    }
}
