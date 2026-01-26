package com.codestory.diary.service;

import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.model.embedding.EmbeddingModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * 임베딩 생성 전담 서비스 (Phase 3: 비동기 처리)
 *
 * [역할]
 * - Neo4j 노드에 벡터 임베딩 자동 생성 및 저장
 * - 백그라운드에서 비동기로 처리하여 사용자 대기 시간 최소화
 *
 * [작동 흐름]
 * 1. 일기 저장 완료 → 사용자에게 즉시 응답
 * 2. 백그라운드에서 임베딩 생성 시작 (별도 스레드)
 * 3. 완료 또는 실패 로그 기록 (사용자에게 영향 없음)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmbeddingService {

    private final Neo4jClient neo4jClient;
    private final EmbeddingModel embeddingModel;

    /**
     * 🚀 [비동기] 임베딩이 없는 노드들에 자동으로 임베딩 생성 및 저장
     *
     * [작동 방식]
     * 1. 유저와 연결된 모든 노드 중 embedding 속성이 없는 노드 찾기
     * 2. 각 노드의 name 속성을 벡터로 변환 (OpenAI text-embedding-3-small)
     * 3. 해당 노드에 embedding 속성 추가
     *
     * [주의사항]
     * - @Async: 별도 스레드에서 실행 (호출자는 대기하지 않음)
     * - 이 메서드는 일기 저장 후 자동으로 호출됩니다
     * - Neo4j 5.11+ 버전에서만 벡터 인덱스가 지원됩니다
     * - 임베딩 생성 실패 시에도 일기 저장은 정상적으로 완료됩니다
     *
     * @param userId 사용자 ID
     */
    @Async
    public void generateEmbeddingsForNewNodesAsync(Long userId) {
        try {
            log.info("🚀 [비동기] 임베딩 생성 시작 (User ID: {}, Thread: {})",
                userId, Thread.currentThread().getName());

            // Step 1: embedding 속성이 없는 노드들 찾기 (Event, Emotion, Action 타입)
            String findNodesQuery = """
                MATCH (u:User {userId: $userId})-[r]->(n)
                WHERE (n:Event OR n:Emotion OR n:Action)
                  AND n.name IS NOT NULL
                  AND n.embedding IS NULL
                RETURN id(n) AS nodeId, labels(n) AS labels, n.name AS name
                LIMIT 50
            """;

            Collection<Map<String, Object>> nodes = neo4jClient.query(findNodesQuery)
                    .bind(userId).to("userId")
                    .fetch()
                    .all();

            if (nodes.isEmpty()) {
                log.debug("  ℹ️ 임베딩이 필요한 노드가 없습니다 (User ID: {})", userId);
                return;
            }

            log.info("  🔍 임베딩 생성 대상: {} 개 노드 (User ID: {})", nodes.size(), userId);

            // Step 2: 각 노드에 대해 임베딩 생성 및 저장
            int successCount = 0;
            for (Map<String, Object> node : nodes) {
                Long nodeId = (Long) node.get("nodeId");
                String name = (String) node.get("name");

                if (name == null || name.trim().isEmpty()) {
                    continue;
                }

                try {
                    // Step 2-1: 텍스트를 벡터로 변환
                    Embedding embedding = embeddingModel.embed(name).content();
                    List<Float> vector = embedding.vectorAsList();

                    // Step 2-2: Neo4j에 벡터 저장
                    String updateQuery = """
                        MATCH (n)
                        WHERE id(n) = $nodeId
                        SET n.embedding = $vector
                    """;

                    neo4jClient.query(updateQuery)
                            .bind(nodeId).to("nodeId")
                            .bind(vector).to("vector")
                            .run();

                    successCount++;
                    log.debug("    ✓ 임베딩 추가: {} (ID: {})", name, nodeId);

                } catch (Exception e) {
                    log.warn("    ⚠️ 임베딩 생성 실패: {} - {}", name, e.getMessage());
                }
            }

            log.info("  ✅ [비동기] 임베딩 생성 완료: {}/{} 성공 (User ID: {}, Thread: {})",
                successCount, nodes.size(), userId, Thread.currentThread().getName());

        } catch (Exception e) {
            log.error("❌ [비동기] 임베딩 생성 프로세스 실패 (User ID: {}): {}",
                userId, e.getMessage(), e);
            // 예외를 던지지 않음 (일기 저장은 이미 완료된 상태)
        }
    }

    /**
     * 🔧 [관리자 도구] 기존 노드들의 임베딩 일괄 생성
     *
     * [사용 시나리오]
     * - Phase 2 업그레이드 후 기존 데이터를 벡터화할 때 사용
     * - 관리자 API 엔드포인트에서 호출하거나, 별도 스크립트로 실행
     *
     * [실행 방법]
     * curl -X POST http://localhost:8080/api/admin/migrate-embeddings?userId=1
     *
     * @param userId 사용자 ID
     */
    public void migrateExistingDataToVectors(Long userId) {
        log.info("🔄 [마이그레이션] 기존 데이터 벡터화 시작 (User ID: {})", userId);

        try {
            // 동기 방식으로 실행 (관리 작업이므로)
            generateEmbeddingsForNewNodesSynchronous(userId);

            log.info("✅ [마이그레이션] 완료 (User ID: {})", userId);

        } catch (Exception e) {
            log.error("❌ [마이그레이션] 실패 (User ID: {}): {}", userId, e.getMessage(), e);
            throw new RuntimeException("마이그레이션 실패", e);
        }
    }

    /**
     * 동기 방식 임베딩 생성 (관리 작업용)
     */
    private void generateEmbeddingsForNewNodesSynchronous(Long userId) {
        // 비동기 메서드와 동일한 로직, @Async 없이 실행
        String findNodesQuery = """
            MATCH (u:User {userId: $userId})-[r]->(n)
            WHERE (n:Event OR n:Emotion OR n:Action)
              AND n.name IS NOT NULL
              AND n.embedding IS NULL
            RETURN id(n) AS nodeId, labels(n) AS labels, n.name AS name
            LIMIT 50
        """;

        Collection<Map<String, Object>> nodes = neo4jClient.query(findNodesQuery)
                .bind(userId).to("userId")
                .fetch()
                .all();

        if (nodes.isEmpty()) {
            log.info("  ℹ️ 임베딩이 필요한 노드가 없습니다");
            return;
        }

        log.info("  🔍 임베딩 생성 대상: {} 개 노드", nodes.size());

        int successCount = 0;
        for (Map<String, Object> node : nodes) {
            Long nodeId = (Long) node.get("nodeId");
            String name = (String) node.get("name");

            if (name == null || name.trim().isEmpty()) {
                continue;
            }

            try {
                Embedding embedding = embeddingModel.embed(name).content();
                List<Float> vector = embedding.vectorAsList();

                String updateQuery = """
                    MATCH (n)
                    WHERE id(n) = $nodeId
                    SET n.embedding = $vector
                """;

                neo4jClient.query(updateQuery)
                        .bind(nodeId).to("nodeId")
                        .bind(vector).to("vector")
                        .run();

                successCount++;
                log.debug("    ✓ 임베딩 추가: {} (ID: {})", name, nodeId);

            } catch (Exception e) {
                log.warn("    ⚠️ 임베딩 생성 실패: {} - {}", name, e.getMessage());
            }
        }

        log.info("  ✅ 임베딩 생성 완료: {}/{} 성공", successCount, nodes.size());
    }
}
