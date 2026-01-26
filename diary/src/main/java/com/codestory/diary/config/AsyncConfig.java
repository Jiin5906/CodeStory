package com.codestory.diary.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * 비동기 처리 설정 (Phase 3: 성능 최적화)
 *
 * [목적]
 * - 임베딩 생성을 백그라운드에서 처리하여 사용자 대기 시간 최소화
 * - 일기 저장 → 즉시 응답 → 임베딩 생성은 별도 스레드에서 처리
 *
 * [스레드 풀 설정]
 * - Core Pool Size: 2 (기본 유지 스레드)
 * - Max Pool Size: 5 (최대 동시 처리 스레드)
 * - Queue Capacity: 100 (대기 큐 크기)
 *
 * [예상 효과]
 * - 일기 저장 응답 속도: 800ms → 200ms (4배 개선)
 * - 동시 다발적 일기 작성 시에도 안정적 처리
 */
@Slf4j
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    /**
     * 비동기 작업용 Executor 설정
     * - 임베딩 생성 전용 스레드 풀
     */
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // 기본 스레드 수 (항상 유지)
        executor.setCorePoolSize(2);

        // 최대 스레드 수 (부하 증가 시)
        executor.setMaxPoolSize(5);

        // 대기 큐 크기 (스레드 풀이 꽉 찼을 때 대기할 작업 수)
        executor.setQueueCapacity(100);

        // 스레드 이름 접두사 (로그 추적용)
        executor.setThreadNamePrefix("Async-Embedding-");

        // 스레드 풀 초기화
        executor.initialize();

        log.info("✅ 비동기 Executor 초기화 완료 (Core: 2, Max: 5, Queue: 100)");

        return executor;
    }

    /**
     * 비동기 작업 중 발생한 예외 처리
     * - 임베딩 생성 실패 시에도 일기 저장은 이미 완료된 상태
     */
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (ex, method, params) -> {
            log.error("❌ 비동기 작업 실패: 메서드 = {}, 파라미터 = {}, 에러 = {}",
                method.getName(), params, ex.getMessage(), ex);

            // TODO: 필요시 알림 전송 (Slack, Email 등)
        };
    }
}
