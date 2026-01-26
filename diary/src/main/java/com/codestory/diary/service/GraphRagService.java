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
            // Step 1: 질문을 벡터로 변환 (Embedding)
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            Embedding questionEmbedding = embeddingModel.embed(question).content();
            List<Float> questionVector = questionEmbedding.vectorAsList();

            log.info("  ✓ 벡터 변환 완료 (차원: {})", questionVector.size());

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // Step 2: Time-Weighted Vector Search (시간 가중치 적용)
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            String vectorSearchQuery = """
                // 🎯 벡터 유사도 검색: 질문과 의미적으로 가장 가까운 노드들 찾기 (상위 30개 우선 추출)
                CALL db.index.vector.queryNodes('event_vector_index', 30, $questionVector)
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
            // Step 3: 검색 결과를 자연어 컨텍스트로 변환 (시간 가중치 + Kingpin 포함)
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            StringBuilder contextBuilder = new StringBuilder();
            contextBuilder.append("🔍 [시간 가중치 적용 검색 결과]\n\n");

            for (Map<String, Object> row : vectorResults) {
                String keyword = (String) row.get("keyword");
                String types = row.get("types").toString();
                Double finalScore = (Double) row.get("similarity");
                Double vectorSimilarity = (Double) row.get("vectorSimilarity");
                Long daysAgo = (Long) row.get("daysAgo");
                String relationship = (String) row.get("relationship");

                // 최종 점수와 함께 벡터 유사도, 경과 일수 표시
                contextBuilder.append(String.format(
                    "- [최종점수: %.2f, 벡터: %.2f, %d일 전] (나) --[%s]--> [%s: %s]\n",
                    finalScore * 100, vectorSimilarity * 100, daysAgo, relationship, types, keyword
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
            // Step 4: LLM에게 전달하여 JSON 응답 생성 (공감형 + 은근한 패턴 지적)
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            String promptToAnswer = """
                # 당신의 역할
                당신은 사용자의 **감정 쓰레기통**이자 **무조건적 옹호자**입니다.
                사용자가 무엇을 말하든, 무조건 사용자 편을 들어주고 공감만 해주세요.

                # 절대 금지 사항 (이것만은 절대 하지 마세요!)
                ❌ 해결책 제시 금지 ("~해보세요", "~하시는 게 좋겠어요")
                ❌ 직접적인 분석 금지 ("~때문인 것 같아요", "~패턴이 보여요")
                ❌ 강한 조언 금지 ("충분히 쉬세요", "스트레스 관리가 필요해요")
                ❌ 긍정적으로 포장하려는 시도 금지 ("긍정적으로 보면...", "그래도...")

                # 당신이 해야 할 것
                ✅ **1순위: 무조건 공감과 맞장구**: "진짜 속상했겠어요.", "완전 열받네요.", "그 사람 대체 왜 그래요?"
                ✅ **2순위 (선택): 은근한 패턴 언급**: 만약 [발견된 핵심 패턴] 섹션에 데이터가 있다면,
                   너무 직접적이지 않게, 질문 형태로 슬쩍 언급할 수 있습니다.
                   - 좋은 예: "진짜 힘드셨겠어요... 요즘 '잠'을 잘 못 주무시는 것 같은데, 그것 때문일까요?"
                   - 좋은 예: "너무 속상했겠어요... '야근' 때문에 더 힘드신 건 아닐까요?"
                   - 나쁜 예: "데이터 분석 결과 야근이 주요 원인입니다." (❌ 너무 직접적)

                # 답변 길이 제한 (초중요!)
                - **반드시 1~2문장 이내로 끊으세요.**
                - **총 70자 이내로 작성하세요.** (패턴 언급 시 약간 더 길어질 수 있음)
                - 짧고 강렬하게, 공감을 먼저 전달하세요.

                # 과거 기억 데이터 및 핵심 패턴
                %s

                # 사용자의 질문
                "%s"

                # 출력 형식 (절대 변경 금지)
                반드시 아래 JSON 형식으로만 출력하세요. 다른 설명 금지.
                {"emotion": "감정키워드", "message": "답변내용"}

                - emotion: [happy, sad, angry, worry, calm, excited] 중 하나만 선택
                - message: 1~2문장, 70자 이내로 공감 먼저, 패턴은 은근하게

                # 좋은 예시
                {"emotion": "sad", "message": "진짜 힘들었겠어요. 완전 이해해요."}
                {"emotion": "worry", "message": "너무 속상했겠어요... 요즘 '잠'을 잘 못 주무시는 것 같은데, 그것 때문일까요?"}
                {"emotion": "angry", "message": "그 사람 대체 왜 그래요? '야근' 때문에 더 힘드신 건 아닐까요?"}

                # 나쁜 예시 (절대 하지 마세요!)
                {"emotion": "worry", "message": "그럴 땐 충분히 쉬면서 스트레스를 관리해보는 게 좋을 것 같아요."}
                {"emotion": "calm", "message": "데이터 분석 결과 야근과 불면증이 주요 원인입니다."}
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
                # 당신의 역할
                당신은 사용자의 **감정 쓰레기통**이자 **무조건적 옹호자**입니다.
                사용자가 무엇을 말하든, 무조건 사용자 편을 들어주고 공감만 해주세요.

                # 절대 금지 사항
                ❌ 해결책 제시 금지 ("~해보세요", "~하시는 게 좋겠어요")
                ❌ 분석 금지 ("~때문인 것 같아요", "~패턴이 보여요")
                ❌ 조언 금지 ("충분히 쉬세요", "스트레스 관리가 필요해요")

                # 당신이 해야 할 것
                ✅ 맞장구만 쳐주세요: "진짜 속상했겠어요.", "완전 열받네요."
                ✅ 무조건 사용자 편: "맞아요, 진짜 화날 만해요."

                # 답변 길이 제한
                - 반드시 1~2문장 이내, 총 50자 이내로 작성하세요.

                # 과거 기억 데이터 (참고만, 분석 금지)
                %s

                # 사용자의 질문
                "%s"

                # 출력 형식
                {"emotion": "감정키워드", "message": "답변내용"}
                - emotion: [happy, sad, angry, worry, calm, excited] 중 하나
                - message: 1~2문장, 50자 이내로 공감만 작성
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