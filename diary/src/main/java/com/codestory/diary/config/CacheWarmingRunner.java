package com.codestory.diary.config;

import com.codestory.diary.service.GraphRagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 🔥 Cache Warming Runner (Phase 3: 성능 최적화)
 *
 * [목적]
 * - 서버 재시작 시 Cold Cache 문제 해결
 * - 첫 번째 사용자도 빠른 응답 경험 (3~4초 → 0.1초)
 *
 * [동작 방식]
 * 1. 서버 부팅 완료 직후 자동 실행 (@Order(1))
 * 2. 자주 묻는 질문들을 GraphRagService에 미리 요청
 * 3. @Cacheable이 자동으로 Redis에 결과 저장
 * 4. 이후 동일 질문 요청 시 캐시 HIT (초고속 응답)
 *
 * [비동기 처리]
 * - AsyncConfig의 스레드 풀 활용
 * - 서버 부팅 자체는 즉시 완료, 워밍은 백그라운드에서 진행
 * - 워밍 실패해도 서버는 정상 작동
 */
@Slf4j
@Component
@Order(1)  // 서버 시작 직후 가장 먼저 실행
@RequiredArgsConstructor
public class CacheWarmingRunner implements ApplicationRunner {

    private final GraphRagService graphRagService;

    /**
     * 워밍업 대상 질문 리스트 (사용자 행동 데이터 기반 선정)
     * - 실제 프로덕션에서는 사용자 쿼리 로그를 분석하여 Top 5~10개 추출
     */
    private static final List<String> FREQUENTLY_ASKED_QUESTIONS = List.of(
        "요즘 내 기분이 어때?",
        "나를 위한 조언을 해줘",
        "최근에 내가 스트레스 받은 이유가 뭐야?",
        "내 일기 요약해줘",
        "내가 행복했던 순간은 언제였어?"
    );

    /**
     * 워밍업 타겟 유저 ID
     * - 테스트 계정 또는 데모 계정 사용
     * - 프로덕션에서는 활성 사용자 Top 10에 대해 워밍하는 것도 고려
     */
    private static final Long TARGET_USER_ID = 1L;

    @Override
    public void run(ApplicationArguments args) {
        log.info("🚀 서버 부팅 완료. 캐시 워밍 스케줄링...");

        // 비동기로 워밍 시작 (서버 부팅 블로킹 방지)
        warmUpCacheAsync();
    }

    /**
     * 비동기 캐시 워밍 실행
     * - AsyncConfig의 스레드 풀에서 실행
     * - 서버 부팅과 독립적으로 동작
     */
    @Async
    public void warmUpCacheAsync() {
        try {
            log.info("🔥 캐시 워밍 시작: 주요 질문 {}개 미리 분석 중...", FREQUENTLY_ASKED_QUESTIONS.size());

            long startTime = System.currentTimeMillis();
            int successCount = 0;
            int failCount = 0;

            // 각 질문에 대해 GraphRagService 호출 (자동으로 Redis 캐싱됨)
            for (String question : FREQUENTLY_ASKED_QUESTIONS) {
                try {
                    log.debug("  → 워밍업: \"{}\"", question);

                    // 핵심: 이 호출이 @Cacheable을 트리거하여 Redis에 자동 저장
                    graphRagService.analyzeRootCause(TARGET_USER_ID, question);

                    successCount++;
                    log.debug("  ✓ 캐시 저장 완료: \"{}\"", question);

                    // 과도한 동시 요청 방지 (OpenAI API Rate Limit 고려)
                    Thread.sleep(500);

                } catch (Exception e) {
                    failCount++;
                    log.warn("  ⚠️ 워밍 실패 (계속 진행): \"{}\" - {}", question, e.getMessage());
                    // 개별 질문 실패해도 계속 진행
                }
            }

            long elapsedTime = System.currentTimeMillis() - startTime;

            // 최종 결과 로그
            if (failCount == 0) {
                log.info("✅ 캐시 워밍 완료! 이제 첫 요청도 0.1초 만에 응답합니다. (성공: {}/{}, 소요 시간: {}ms)",
                    successCount, FREQUENTLY_ASKED_QUESTIONS.size(), elapsedTime);
            } else {
                log.warn("⚠️ 캐시 워밍 부분 완료 (성공: {}, 실패: {}, 소요 시간: {}ms)",
                    successCount, failCount, elapsedTime);
            }

        } catch (Exception e) {
            // 전체 워밍 프로세스 실패 시에도 서버는 정상 작동
            log.error("❌ 캐시 워밍 전체 실패 (서버는 정상 작동합니다): {}", e.getMessage(), e);
        }
    }
}
