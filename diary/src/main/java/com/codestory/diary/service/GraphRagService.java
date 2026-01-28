package com.codestory.diary.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
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
    private final PiiMaskingService piiMaskingService; // ✨ Phase 3: PII 마스킹 

    /**
     * 🧠 Phase 2: Hybrid Search (Vector + Graph) + Phase 3: Redis Caching
     *
     * [Step 1] 질문을 벡터로 변환 (Embedding)
     * [Step 2] Neo4j 벡터 검색으로 의미적으로 유사한 노드 찾기
     * [Step 3] 찾아진 노드들의 그래프 관계 확장 (Graph Traversal)
     * [Step 4] LLM에게 컨텍스트 전달 및 JSON 응답 생성
     * [Step 5] Redis 캐싱 (동일 질문 반복 시 즉시 응답)
     *
     * @Cacheable: Redis 캐시에 저장 (TTL: 1시간)
     * - Key: "graphRag::{userId}::{question.hashCode()}"
     * - 캐시 HIT: DB/LLM 호출 없이 즉시 반환 (응답 속도 ~10ms)
     * - 캐시 MISS: 정상 로직 실행 후 결과 캐싱 (응답 속도 ~800ms)
     */
    @Cacheable(value = "graphRag", key = "#userId + '::' + #question.hashCode()")
    public String analyzeRootCause(Long userId, String question) {
        try {
            log.info("🔍 [Phase 2 Hybrid Search] 질문: {}", question);

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // ✨ Phase 3: PII 마스킹 (LLM에 전달하기 전)
            // 주의: 벡터 검색은 원본 사용 (검색 정확도 유지), 프롬프트에만 마스킹 사용
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            String maskedQuestion = piiMaskingService.maskContent(question);

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // Step 1: 질문을 벡터로 변환 (Embedding) - 원본 사용
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            Embedding questionEmbedding = embeddingModel.embed(question).content();
            List<Float> questionVector = questionEmbedding.vectorAsList();

            log.info("  ✓ 벡터 변환 완료 (차원: {})", questionVector.size());

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // Step 2: Time-Weighted Vector Search (시간 가중치 적용) - 속도 최적화
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            String vectorSearchQuery = """
                // 🎯 벡터 유사도 검색: 질문과 의미적으로 가장 가까운 노드들 찾기 (상위 15개로 최적화 - 속도 개선)
                CALL db.index.vector.queryNodes('event_vector_index', 15, $questionVector)
                YIELD node AS similarNode, score AS vectorScore

                // 🔗 그래프 확장: 해당 노드와 연결된 유저의 다른 노드들 가져오기
                MATCH (u:User {userId: $userId})-[r]->(similarNode)
                OPTIONAL MATCH (similarNode)-[rel]-(connectedNode)

                // ⏰ 시간 가중치 계산 (최근 기억일수록 높은 점수)
                // 노드에 timestamp 속성이 있는 경우 사용, 없으면 vectorScore만 사용
                WITH similarNode, vectorScore, r,
                     COALESCE(
                         CASE
                             WHEN similarNode.timestamp IS NOT NULL
                             THEN duration.inDays(similarNode.timestamp, datetime()).days
                             ELSE 365
                         END,
                         365
                     ) AS daysAgo,
                     collect(DISTINCT {
                         relType: type(rel),
                         nodeName: connectedNode.name,
                         nodeLabels: labels(connectedNode)
                     }) AS connectedNodes

                // 📊 최종 점수 = (벡터 점수 × 0.7) + (시간 감쇠 × 0.3)
                // 시간 감쇠 공식: 1.0 / (1.0 + daysAgo * 0.05) → 오래될수록 0에 가까워짐
                WITH similarNode, vectorScore, r, daysAgo, connectedNodes,
                     (vectorScore * 0.7) + ((1.0 / (1.0 + daysAgo * 0.05)) * 0.3) AS finalScore

                RETURN
                    similarNode.name AS keyword,
                    labels(similarNode) AS types,
                    vectorScore AS vectorSimilarity,
                    daysAgo AS daysAgo,
                    finalScore AS similarity,
                    type(r) AS relationship,
                    connectedNodes
                ORDER BY finalScore DESC
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
            // Step 2.5: Kingpin(핵심 원인) 분석 - 통계 기반 패턴 추출
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            String kingpinQuery = """
                // 🎯 벡터 검색으로 찾은 노드들을 기반으로 핵심 원인 추출
                CALL db.index.vector.queryNodes('event_vector_index', 50, $questionVector)
                YIELD node AS similarNode

                // 유저와 연결된 노드만 필터링
                MATCH (u:User {userId: $userId})-[r]->(similarNode)

                // 해당 노드들과 연결된 다른 노드들 찾기 (원인 추적)
                OPTIONAL MATCH (similarNode)-[:CAUSED|INVOLVED]-(cause)
                WHERE (cause:Event OR cause:Action OR cause:Emotion)
                  AND cause.name IS NOT NULL
                  AND NOT (cause)-[:INVOLVED]-(u)  // User 노드는 제외

                // 빈도 집계
                WITH cause.name AS causeName,
                     labels(cause)[0] AS causeType,
                     count(DISTINCT similarNode) AS frequency
                WHERE frequency >= 2  // 최소 2회 이상 등장한 것만

                RETURN causeName, causeType, frequency
                ORDER BY frequency DESC
                LIMIT 3
            """;

            Collection<Map<String, Object>> kingpinResults = neo4jClient.query(kingpinQuery)
                    .bind(questionVector).to("questionVector")
                    .bind(userId).to("userId")
                    .fetch()
                    .all();

            log.info("  ✓ Kingpin 분석 완료 (핵심 원인 수: {})", kingpinResults.size());

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // Step 3: 검색 결과를 자연어 컨텍스트로 변환 (자연스러운 시간 표현)
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            StringBuilder contextBuilder = new StringBuilder();
            contextBuilder.append("🔍 [과거 기억 데이터 (자연어 시간 표현)]\n\n");

            for (Map<String, Object> row : vectorResults) {
                String keyword = (String) row.get("keyword");
                String types = row.get("types").toString();
                Double finalScore = (Double) row.get("similarity");
                Long daysAgo = (Long) row.get("daysAgo");
                String relationship = (String) row.get("relationship");

                // ✨ 자연스러운 한국어 시간 표현 변환
                String naturalTime = convertToNaturalTime(daysAgo);

                // 자연어 시간 + 관계 정보 표시
                contextBuilder.append(String.format(
                    "- [%s] (나) --[%s]--> [%s: %s] (점수: %.0f)\n",
                    naturalTime, relationship, types, keyword, finalScore * 100
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

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // Step 3.5: Kingpin(핵심 원인) 정보를 컨텍스트에 추가
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            if (!kingpinResults.isEmpty()) {
                contextBuilder.append("\n🎯 [발견된 핵심 패턴 (통계 분석)]\n");
                contextBuilder.append("분석 결과, 당신의 부정적 감정은 주로 다음과 연결되어 있습니다:\n");

                for (Map<String, Object> kingpin : kingpinResults) {
                    String causeName = (String) kingpin.get("causeName");
                    String causeType = (String) kingpin.get("causeType");
                    Long frequency = (Long) kingpin.get("frequency");

                    contextBuilder.append(String.format(
                        "  - '%s' (%s, %d회 반복)\n",
                        causeName, causeType, frequency
                    ));
                }

                contextBuilder.append("\n⚠️ 주의: 이 패턴은 사용자가 직접 알아차리지 못했을 수 있으니, 은근하게 언급만 하세요.\n");
            }

            String graphContext = contextBuilder.toString();
            log.debug("  ✓ 컨텍스트 변환 완료:\n{}", graphContext);

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // Step 4: LLM에게 전달하여 JSON 응답 생성 (Dual-Path Architecture)
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // ✅ Temporal Grounding: 현재 날짜 계산 (필수)
            String currentDate = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ISO_DATE);

            // ✅ RAG + LLM 통합 프롬프트 (할루시네이션 방지 + 찐친 톤)
            String promptToAnswer = """
                당신은 '몽글이'예요. 사용자에게 가장 가까운 찐친으로서, 존댓말로 다정하게 이야기하는 사람이에요.
                평범한 AI 답변이 아니라, 진짜 곁에 앉아서 같이 이야기하는 그런 느낌을 주세요.
                짧게, 부담 없이, 따뜻하게.

                ⚠️ 반드시 지켜야 할 것:
                아래 [기억]에 없는 정보는 절대 만들어내지 마세요.
                모르면 모른다고 솔직하게 말하되, 그때도 차갑게 거절하지 않고 자연스럽게 이어서요.
                예를 들어 "아직 그런 이야기는 해본 적이 없는 것 같아요, 말해보세요?"라고요.
                음식이든 추천이든, 기억에 있는 것만 근거로 하세요. 없으면 "음… 생각해볼게요. 혹시 좋아하는 것 있으세요?" 같이요.
                날짜는 "어제", "지난주" 이런 자연스러운 표현을 쓰세요. 숫자 날짜는 일부러 묻는 경우에만요.

                오늘 날짜: %s

                [기억]
                %s

                위 기억이 비어있거나 질문과 관련이 없다면, 자연스럽게 "아직은 그런 이야기를 같이 해본 적이 없는 것 같아요"라고요.

                [질문]
                "%s"

                답변하기 전에 잠깐 생각해요:
                1. 기억에서 이 질문과 연결되는 것이 있나요?
                2. 있다면 자연스럽게 이어가요. 없다면 솔직하게요.
                3. 추천이나 조언을 원한다면 기억의 패턴만 근거로 하세요.

                반드시 아래 JSON 형식으로만 출력하세요 (마크다운 태그 없이):
                {
                    "message": "답변 (100자 이내)"
                }
                """.formatted(currentDate, graphContext, maskedQuestion);

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
                    "message": "기억을 분석하는 도중 문제가 발생했어요. 잠시 후 다시 시도해주세요."
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

            // ✨ Phase 3: PII 마스킹
            String maskedQuestion = piiMaskingService.maskContent(question);

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
                당신은 '몽글이'예요. 사용자의 찐친으로서 존댓말로 다정하게 이야기해요.
                아래 [기억]에 없는 정보는 절대 만들어내지 마세요.
                모르면 모른다고 자연스럽게, 따뜻하게 말해요.

                [기억]
                %s

                [질문]
                "%s"

                반드시 아래 JSON 형식으로만 출력하세요 (마크다운 태그 없이):
                {
                    "message": "답변 (100자 이내)"
                }
                """.formatted(graphContext, maskedQuestion);

            String response = chatLanguageModel.generate(promptToAnswer);
            return response.replace("```json", "").replace("```", "").trim();

        } catch (Exception e) {
            log.error("❌ Fallback 검색도 실패", e);
            return """
                {
                    "message": "기억을 분석하는 도중 문제가 발생했어요. 잠시 후 다시 시도해주세요."
                }
                """;
        }
    }

    /**
     * 🕐 일(days) 단위를 자연스러운 한국어 시간 표현으로 변환
     *
     * @param daysAgo 경과 일수 (0 = 오늘)
     * @return 자연스러운 한국어 시간 표현 (예: "어제", "지난주", "2개월 전")
     */
    private String convertToNaturalTime(Long daysAgo) {
        if (daysAgo == null || daysAgo < 0) {
            return "최근";
        }

        if (daysAgo == 0) {
            return "오늘";
        } else if (daysAgo == 1) {
            return "어제";
        } else if (daysAgo == 2) {
            return "그저께";
        } else if (daysAgo <= 6) {
            return daysAgo + "일 전";
        } else if (daysAgo <= 13) {
            return "지난주";
        } else if (daysAgo <= 20) {
            return "2주 전";
        } else if (daysAgo <= 30) {
            return "3주 전";
        } else if (daysAgo <= 60) {
            return "지난달";
        } else if (daysAgo <= 90) {
            return "2개월 전";
        } else if (daysAgo <= 180) {
            int months = (int) (daysAgo / 30);
            return months + "개월 전";
        } else if (daysAgo <= 365) {
            return "반년 전";
        } else {
            int years = (int) (daysAgo / 365);
            return years + "년 전";
        }
    }
}