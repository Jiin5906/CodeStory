package com.codestory.diary.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.data.embedding.Embedding;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GraphRagService {

    private final Neo4jClient neo4jClient;
    private final ChatLanguageModel chatLanguageModel;
    private final EmbeddingModel embeddingModel; // ✨ Phase 2: 임베딩 모델 추가 

    /**
     * 🧠 Phase 2: Hybrid Search (Vector + Graph)
     *
     * [Step 1] 질문을 벡터로 변환 (Embedding)
     * [Step 2] Neo4j 벡터 검색으로 의미적으로 유사한 노드 찾기
     * [Step 3] 찾아진 노드들의 그래프 관계 확장 (Graph Traversal)
     * [Step 4] LLM에게 컨텍스트 전달 및 JSON 응답 생성
     */
    public String analyzeRootCause(Long userId, String question) {
        try {
            log.info("🔍 [Phase 2 Hybrid Search] 질문: {}", question);

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // Step 1: 질문을 벡터로 변환 (Embedding)
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            Embedding questionEmbedding = embeddingModel.embed(question).content();
            List<Float> questionVector = questionEmbedding.vectorAsList();

            log.info("  ✓ 벡터 변환 완료 (차원: {})", questionVector.size());

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // Step 2: 벡터 검색 (Vector Search) - 의미적으로 유사한 노드 찾기
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            String vectorSearchQuery = """
                // 🎯 벡터 유사도 검색: 질문과 의미적으로 가장 가까운 노드들 찾기
                CALL db.index.vector.queryNodes('event_vector_index', 10, $questionVector)
                YIELD node AS similarNode, score

                // 🔗 그래프 확장: 해당 노드와 연결된 유저의 다른 노드들 가져오기
                MATCH (u:User {userId: $userId})-[r]->(similarNode)
                OPTIONAL MATCH (similarNode)-[rel]-(connectedNode)

                RETURN
                    similarNode.name AS keyword,
                    labels(similarNode) AS types,
                    score AS similarity,
                    type(r) AS relationship,
                    collect(DISTINCT {
                        relType: type(rel),
                        nodeName: connectedNode.name,
                        nodeLabels: labels(connectedNode)
                    }) AS connectedNodes
                ORDER BY score DESC
                LIMIT 10
            """;

            Collection<Map<String, Object>> vectorResults = neo4jClient.query(vectorSearchQuery)
                    .bind(questionVector).to("questionVector")
                    .bind(userId).to("userId")
                    .fetch()
                    .all();

            log.info("  ✓ 벡터 검색 완료 (결과 수: {})", vectorResults.size());

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // Fallback: 벡터 검색 실패 시 기존 방식(그래프 탐색)으로 전환
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            if (vectorResults.isEmpty()) {
                log.warn("  ⚠️ 벡터 검색 결과 없음. 기존 그래프 검색으로 전환...");
                return fallbackGraphSearch(userId, question);
            }

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // Step 3: 검색 결과를 자연어 컨텍스트로 변환
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            StringBuilder contextBuilder = new StringBuilder();
            contextBuilder.append("🔍 [벡터 유사도 기반 검색 결과]\n\n");

            for (Map<String, Object> row : vectorResults) {
                String keyword = (String) row.get("keyword");
                String types = row.get("types").toString();
                Double similarity = (Double) row.get("similarity");
                String relationship = (String) row.get("relationship");

                contextBuilder.append(String.format(
                    "- [유사도: %.2f%%] (나) --[%s]--> [%s: %s]\n",
                    similarity * 100, relationship, types, keyword
                ));

                // 연결된 노드들도 추가
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> connectedNodes = (List<Map<String, Object>>) row.get("connectedNodes");
                if (connectedNodes != null && !connectedNodes.isEmpty()) {
                    for (Map<String, Object> connected : connectedNodes) {
                        if (connected.get("nodeName") != null) {
                            contextBuilder.append(String.format(
                                "    └─ [%s] → %s\n",
                                connected.get("relType"), connected.get("nodeName")
                            ));
                        }
                    }
                }
            }

            String graphContext = contextBuilder.toString();
            log.debug("  ✓ 컨텍스트 변환 완료:\n{}", graphContext);

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // Step 4: LLM에게 전달하여 JSON 응답 생성
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            String promptToAnswer = """
                당신은 '데이터 기반 심리 상담 AI'입니다.
                아래는 사용자의 내면 세계를 **벡터 유사도 검색**으로 분석한 결과입니다.
                유사도 점수가 높을수록 질문과 관련이 깊습니다.

                [내면 세계 그래프 데이터]
                %s

                [사용자 질문]
                "%s"

                [지시사항 - 매우 중요]
                1. 답변은 반드시 **JSON 형식**으로만 출력하세요. (Markdown 코드 블록이나 설명 금지)
                2. JSON 구조: {"emotion": "감정키워드", "message": "답변내용"}
                3. 'emotion' 필드에는 다음 중 하나를 선택해서 넣으세요: [happy, sad, angry, worry, calm, excited]
                4. 'message' 필드에는 그래프를 분석한 따뜻한 위로와 조언을 적으세요.
                5. 유사도 점수를 참고하여, 관련성 높은 패턴을 우선적으로 언급하세요.
                """.formatted(graphContext, question);

            String response = chatLanguageModel.generate(promptToAnswer);

            // AI가 습관적으로 ```json ... ``` 을 붙이는 것을 방지
            String cleanedResponse = response.replace("```json", "").replace("```", "").trim();

            log.info("  ✅ [Phase 2] 분석 완료!");
            return cleanedResponse;

        } catch (Exception e) {
            log.error("❌ [Phase 2] Hybrid Search 실패", e);
            // 에러 발생 시에도 JSON 형식 유지
            return """
                {
                    "emotion": "worry",
                    "message": "기억을 분석하는 도중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
                }
                """;
        }
    }

    /**
     * 🔄 Fallback: 벡터 검색 실패 시 기존 그래프 검색 방식 사용
     * (Phase 1 방식 - 단순 연결 노드 가져오기)
     */
    private String fallbackGraphSearch(Long userId, String question) {
        try {
            log.info("  🔄 Fallback: 기존 그래프 검색 실행");

            String cypherQuery = """
                MATCH (u:User {userId: $userId})
                MATCH (u)-[r]->(n)
                RETURN type(r) as relationship,
                       labels(n) as types,
                       n.name as keyword
                LIMIT 20
            """;

            Collection<Map<String, Object>> results = neo4jClient.query(cypherQuery)
                    .bind(userId).to("userId")
                    .fetch()
                    .all();

            if (results.isEmpty()) {
                return """
                    {
                        "emotion": "calm",
                        "message": "아직 분석할 데이터가 부족해요. 일기를 더 작성해주시면 내면의 지도를 그려드릴게요!"
                    }
                    """;
            }

            String graphContext = results.stream()
                    .map(row -> String.format(
                            "- 관계: (나) --[%s]--> [%s: %s]",
                            row.get("relationship"),
                            row.get("types"),
                            row.get("keyword")
                    ))
                    .collect(Collectors.joining("\n"));

            String promptToAnswer = """
                당신은 '데이터 기반 심리 상담 AI'입니다.
                아래 그래프 데이터를 분석하여 사용자의 질문에 답해주세요.

                [내면 세계 그래프 데이터]
                %s

                [사용자 질문]
                "%s"

                [지시사항 - 매우 중요]
                1. 답변은 반드시 **JSON 형식**으로만 출력하세요. (Markdown 코드 블록이나 설명 금지)
                2. JSON 구조: {"emotion": "감정키워드", "message": "답변내용"}
                3. 'emotion' 필드에는 다음 중 하나를 선택해서 넣으세요: [happy, sad, angry, worry, calm, excited]
                4. 'message' 필드에는 그래프를 분석한 따뜻한 위로와 조언을 적으세요.
                """.formatted(graphContext, question);

            String response = chatLanguageModel.generate(promptToAnswer);
            return response.replace("```json", "").replace("```", "").trim();

        } catch (Exception e) {
            log.error("❌ Fallback 검색도 실패", e);
            return """
                {
                    "emotion": "worry",
                    "message": "기억을 분석하는 도중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
                }
                """;
        }
    }
}