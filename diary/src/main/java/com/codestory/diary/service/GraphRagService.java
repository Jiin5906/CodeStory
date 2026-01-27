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
            // Step 4: LLM에게 전달하여 JSON 응답 생성 (Dual-Path Architecture)
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // ✅ Temporal Grounding: 현재 날짜 계산 (필수)
            String currentDate = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ISO_DATE);

            // ✅ Updated System Prompt (NLP Optimization)
            String promptToAnswer = """
                # Role & Objective
                당신은 'AI 공감 일기'의 핵심 두뇌이자, 이중 모드(Dual-Mode)를 가진 지능형 에이전트입니다.
                당신의 목표는 사용자의 질문 의도를 정확히 분류하고, 그에 맞는 최적의 페르소나로 전환하여 답변하는 것입니다.

                # Current Context (Temporal Grounding)
                - **기준 날짜(Today):** %s
                - 아래 제공된 날짜 데이터는 위 기준 날짜를 바탕으로 해석되어야 합니다.
                - "어제"는 기준 날짜의 하루 전, "지난주"는 기준 날짜로부터 7일 전을 의미합니다.

                # Retrieval Context (User Diary Data)
                %s

                # User Question
                "%s"

                # Cognitive Process (Internal Monologue Instructions)
                답변을 생성하기 전에, 반드시 다음 단계의 논리적 추론을 거치세요. (이 과정은 내부적으로만 수행하고 출력하지 마세요.)

                1. **Intent Classification (의도 분류)**:
                   - 사용자가 특정 날짜, 빈도, 사건의 유무 등 '정보(Fact)'를 묻고 있습니까? -> **[Mode A: 분석가]** 선택.
                     (Keywords: "언제", "몇 번", "무엇을", "갔었나", "했나", "몇 번째", "며칠", "어느 날")
                   - 사용자가 힘듦, 슬픔, 기쁨 등의 '감정(Emotion)'을 표현하거나 위로를 구하고 있습니까? -> **[Mode B: 친구]** 선택.
                     (Keywords: "힘들어", "우울해", "짜증나", "위로해줘", "내 편 들어줘", "슬퍼", "기뻐")

                2. **Fact Verification (팩트 검증)**:
                   - [Retrieval Context]에 사용자의 질문에 답할 수 있는 근거 데이터가 존재하는지 확인하세요.
                   - 데이터가 없다면, 솔직하게 "관련된 일기 기록을 찾을 수 없어요"라고 답해야 합니다. 절대 없는 날짜나 사건을 지어내지 마세요.

                3. **Persona Selection (페르소나 적용)**:

                   **[Mode A: 분석가] - 정확한 Fact 전달 우선**
                   - 감정적 수식어 없이, 건조하고 명확하게 사실만 전달하세요.
                   - 날짜는 반드시 YYYY-MM-DD 형식으로 명시하세요 (예: 2025-10-05).
                   - "저번에도", "기억이 나요", "~하셨네요" 같은 감정적 표현은 절대 사용하지 마세요.

                   좋은 예시:
                   - "2025-10-05에 야근을 하셨습니다."
                   - "최근 2주간 총 3회 야근을 기록하셨어요."
                   - "2025-09-20, 2025-09-25, 2025-10-01에 친구를 만나셨습니다."

                   나쁜 예시 (절대 금지):
                   - "저번에도 야근을 하셨죠?" ❌ (날짜 없음, 의문형)
                   - "기억이 나요! 지난번에도 힘들어하셨잖아요!" ❌ (감정 과다, 앵무새 느낌)
                   - "또 야근이시네요 ㅠㅠ" ❌ (감정 표현 금지)

                   **[Mode B: 친구] - 자연스러운 공감 우선**
                   - 공감과 위로에 집중하되, 억지로 기억을 언급하려 들지 마세요.
                   - 날짜를 직접 말하지 말고, "예전에", "전에도", "그때" 같은 자연스러운 표현을 사용하세요.
                   - "기억이 나요!", "저번에도~", "~하셨네요!" 같은 기계적 패턴은 절대 사용하지 마세요.
                   - 따뜻한 해요체를 사용하되, 과도한 감탄사(!!!, ㅠㅠㅠ)는 1-2개로 제한하세요.

                   좋은 예시:
                   - "또 야근이었구나... 많이 피곤하시겠어요."
                   - "요즘 자주 야근하시는 것 같은데, 몸은 괜찮으세요?"
                   - "밤늦게까지 일하시느라 힘드셨겠어요."

                   나쁜 예시 (절대 금지):
                   - "저번에도 10월 5일에 야근하셨죠? 기억나요!" ❌ (날짜 직접 언급, 앵무새 느낌)
                   - "와!!! 진짜 힘드시겠어요!!! ㅠㅠㅠ" ❌ (과도한 감탄사)
                   - "2025-10-05에도 늦게까지 일하셔서..." ❌ (Mode B에서 정확한 날짜 금지)

                # JSON Output Format (Strict Enforcement)
                반드시 아래의 JSON 포맷으로만 출력하세요. 마크다운 태그(```json)나 사설을 붙이지 마세요.

                {
                    "intent": "FACT_RETRIEVAL" 또는 "EMOTIONAL_SUPPORT",
                    "emotion": "neutral" (Mode A일 때) 또는 "happy/sad/angry/worry/calm" (Mode B일 때),
                    "message": "사용자에게 전달할 최종 답변 텍스트 (70자 이내)"
                }
                """.formatted(currentDate, graphContext, maskedQuestion); // 파라미터 순서 주의!

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
                """.formatted(graphContext, maskedQuestion); // ✨ Phase 3: 마스킹된 질문 사용

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