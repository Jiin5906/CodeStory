package com.codestory.diary.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * 비동기 처리 설정 (성능 최적화)
 *
 * [스레드 풀 구조]
 * - embeddingAsyncExecutor: 임베딩 생성 전용 (neo4j 벡터 작업)
 * - chatAsyncExecutor:      Chat/Graph 저장 전용 (Pinecone + Neo4j 그래프 저장)
 *
 * [호출 흐름]
 * 사용자 메시지 → AI 응답 생성 → 즉시 반환
 *                                  ↓ (백그라운드)
 *                           Pinecone 벡터 저장
 *                           Neo4j 그래프 저장 + 임베딩 생성
 */
@Slf4j
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    /**
     * 기본 Executor (fallback: @Async 이름 미지정 시 사용)
     */
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(3);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("Async-Default-");
        executor.initialize();
        log.info("✅ Default Executor 초기화 (Core: 3, Max: 8, Queue: 200)");
        return executor;
    }

    /**
     * Chat/Graph 저장 전용 Executor
     * - ChatService: Pinecone 벡터 저장 (saveMemoryAsync)
     * - GraphService: Neo4j 그래프 저장 (saveDiaryToGraphAsync)
     */
    @Bean
    public Executor chatAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("Async-Chat-");
        executor.initialize();
        log.info("✅ Chat Async Executor 초기화 (Core: 4, Max: 10, Queue: 200)");
        return executor;
    }

    /**
     * 임베딩 생성 전용 Executor
     * - EmbeddingService: Neo4j 노드 벡터화
     */
    @Bean
    public Executor embeddingAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("Async-Embedding-");
        executor.initialize();
        log.info("✅ Embedding Async Executor 초기화 (Core: 2, Max: 5, Queue: 100)");
        return executor;
    }

    /**
     * 비동기 작업 중 발생한 예외 처리
     */
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (ex, method, params) -> {
            log.error("❌ 비동기 작업 실패: 메서드 = {}, 에러 = {}", method.getName(), ex.getMessage(), ex);
        };
    }
}
