package com.codestory.diary.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Component;

/**
 * Neo4j 벡터 인덱스 자동 생성
 * - 애플리케이션 시작 시 한 번만 실행
 * - 이미 존재하면 스킵 (중복 생성 방지)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class Neo4jVectorIndexInitializer implements CommandLineRunner {

    private final Neo4jClient neo4jClient;

    @Override
    public void run(String... args) {
        try {
            log.info("🔍 Neo4j 벡터 인덱스 초기화 시작...");

            // Event 노드에 벡터 인덱스 생성 (OpenAI text-embedding-3-small: 1536차원)
            createVectorIndex("Event", "embedding", 1536);
            createVectorIndex("Emotion", "embedding", 1536);
            createVectorIndex("Action", "embedding", 1536);

            log.info("✅ Neo4j 벡터 인덱스 초기화 완료!");

        } catch (Exception e) {
            log.warn("⚠️ 벡터 인덱스 생성 실패 (이미 존재할 수 있음): {}", e.getMessage());
        }
    }

    private void createVectorIndex(String nodeLabel, String propertyName, int dimensions) {
        String cypherQuery = String.format("""
            CREATE VECTOR INDEX %s_vector_index IF NOT EXISTS
            FOR (n:%s) ON (n.%s)
            OPTIONS {
              indexConfig: {
                `vector.dimensions`: %d,
                `vector.similarity_function`: 'cosine'
              }
            }
            """, nodeLabel.toLowerCase(), nodeLabel, propertyName, dimensions);

        try {
            neo4jClient.query(cypherQuery).run();
            log.info("  ✓ 벡터 인덱스 생성: {}:{}", nodeLabel, propertyName);
        } catch (Exception e) {
            log.debug("  - 벡터 인덱스 이미 존재: {}:{}", nodeLabel, propertyName);
        }
    }
}
