package com.codestory.diary.service;

import com.codestory.diary.config.VectorConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemoryService {

    private final VectorConfig vectorConfig;
    private final RestTemplate restTemplate = new RestTemplate();

    @org.springframework.beans.factory.annotation.Value("${openai.api.key}")
    private String openaiApiKey;

    @org.springframework.beans.factory.annotation.Value("${pinecone.host}")
    private String pineconeHost;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Phase 2.1: RAG 필터링 Feature Flags
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    @org.springframework.beans.factory.annotation.Value("${ai.rag.enable-similarity-filter:false}")
    private boolean enableSimilarityFilter;

    @org.springframework.beans.factory.annotation.Value("${ai.rag.similarity-threshold:0.7}")
    private double similarityThreshold;

    private static final String EMBEDDING_API_URL = "https://api.openai.com/v1/embeddings";
    private static final String EMBEDDING_MODEL = "text-embedding-3-small";
    private static final int TOP_K = 5; // 검색할 유사 메모리 개수

    /**
     * 텍스트를 OpenAI Embedding API를 통해 벡터로 변환
     */
    private List<Float> getEmbedding(String text) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + openaiApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", EMBEDDING_MODEL);
            requestBody.put("input", text);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(EMBEDDING_API_URL, entity, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("data")) {
                List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");
                if (!data.isEmpty()) {
                    List<Double> embedding = (List<Double>) data.get(0).get("embedding");
                    return embedding.stream()
                            .map(Double::floatValue)
                            .collect(Collectors.toList());
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to get embedding: " + e.getMessage());
        }
        throw new RuntimeException("Failed to get embedding from OpenAI");
    }

    /**
     * Pinecone API Base URL 반환
     */
    private String getPineconeApiUrl() {
        return pineconeHost;
    }

    /**
     * 메모리를 Pinecone에 저장
     * @param userId 사용자 ID
     * @param text 저장할 텍스트 (일기 내용)
     */
    public void saveMemory(String userId, String text) {
        try {
            // 1. 텍스트를 벡터로 변환
            List<Float> embedding = getEmbedding(text);

            // 2. 고유 ID 생성 (userId + timestamp)
            String vectorId = userId + "_" + Instant.now().toEpochMilli();

            // 3. Pinecone Upsert Request Body 생성
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("userId", userId);
            metadata.put("originalText", text);
            metadata.put("timestamp", Instant.now().toString());

            Map<String, Object> vector = new HashMap<>();
            vector.put("id", vectorId);
            vector.put("values", embedding);
            vector.put("metadata", metadata);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("vectors", Collections.singletonList(vector));
            requestBody.put("namespace", ""); // 기본 네임스페이스

            // 4. Pinecone API 호출
            HttpHeaders headers = new HttpHeaders();
            headers.set("Api-Key", vectorConfig.getPineconeApiKey());
            headers.setContentType(MediaType.APPLICATION_JSON);

            String upsertUrl = getPineconeApiUrl() + "/vectors/upsert";
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(upsertUrl, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("Memory saved successfully: " + vectorId);
            } else {
                throw new RuntimeException("Failed to save to Pinecone: " + response.getStatusCode());
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to save memory: " + e.getMessage());
        }
    }

    /**
     * 유사한 메모리를 검색
     * @param userId 사용자 ID
     * @param queryText 검색할 텍스트
     * @return 유사한 메모리 텍스트 리스트
     */
    public List<String> findRelatedMemories(String userId, String queryText) {
        try {
            // 1. 쿼리 텍스트를 벡터로 변환
            List<Float> queryEmbedding = getEmbedding(queryText);

            // 2. Pinecone Query Request Body 생성
            Map<String, Object> filter = new HashMap<>();
            Map<String, Object> userIdFilter = new HashMap<>();
            userIdFilter.put("$eq", userId);
            filter.put("userId", userIdFilter);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("vector", queryEmbedding);
            requestBody.put("topK", TOP_K);
            requestBody.put("includeMetadata", true);
            requestBody.put("includeValues", false);
            requestBody.put("filter", filter);
            requestBody.put("namespace", "");

            // 3. Pinecone API 호출
            HttpHeaders headers = new HttpHeaders();
            headers.set("Api-Key", vectorConfig.getPineconeApiKey());
            headers.setContentType(MediaType.APPLICATION_JSON);

            String queryUrl = getPineconeApiUrl() + "/query";
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(queryUrl, entity, Map.class);

            // 4. 결과에서 originalText 추출
            List<String> relatedMemories = new ArrayList<>();
            if (response.getBody() != null && response.getBody().containsKey("matches")) {
                List<Map<String, Object>> matches = (List<Map<String, Object>>) response.getBody().get("matches");
                for (Map<String, Object> match : matches) {
                    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    // ✨ Phase 2.1: 유사도 필터링 (Feature Flag로 제어)
                    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    if (enableSimilarityFilter && match.containsKey("score")) {
                        Double score = ((Number) match.get("score")).doubleValue();
                        if (score < similarityThreshold) {
                            System.out.println("⚠️ [RAG Filter] 낮은 유사도로 제외: score=" + score);
                            continue; // 임계값 이하 제외
                        }
                    }

                    if (match.containsKey("metadata")) {
                        Map<String, Object> metadata = (Map<String, Object>) match.get("metadata");
                        if (metadata.containsKey("originalText")) {
                            String originalText = (String) metadata.get("originalText");
                            relatedMemories.add(originalText);
                        }
                    }
                }
            }

            System.out.println("Found " + relatedMemories.size() + " related memories for user: " + userId
                + (enableSimilarityFilter ? " (filtered by similarity >= " + similarityThreshold + ")" : ""));
            return relatedMemories;

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Failed to find related memories: " + e.getMessage());
            return Collections.emptyList(); // 오류 발생 시 빈 리스트 반환
        }
    }
}
