package com.codestory.diary.service;

import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;

import dev.langchain4j.model.chat.ChatLanguageModel;

@Service
public class GraphRagService {

    @Autowired
    private Neo4jClient neo4jClient;

    @Autowired
    private ChatLanguageModel langChainChatModel; // Config에서 만든 빈 주입

    public String analyzeRootCause(Long userId, String question) {

        // 1. Prompt: 기존 GraphService가 저장한 스키마(User, Event, Emotion)와 정확히 일치시킴
        String promptToGenerateCypher = """
            Task: Generate a Neo4j Cypher query to answer the user's question.
            
            Schema:
            (:User {userId: Integer})
            (:Event {name: String})
            (:Emotion {name: String})
            (:User)-[:DID]->(:Event)-[:CAUSED]->(:Emotion)
            
            Rules:
            1. Output ONLY the Cypher code. No markdown.
            2. **MUST** filter by User: match (u:User {userId: %d})
            3. Find patterns using [:CAUSED] relationship.
            4. LIMIT 5.
            
            Question: "%s"
            """.formatted(userId, question);

        String cypherQuery = langChainChatModel.generate(promptToGenerateCypher);

        // 정제 (Markdown 제거)
        cypherQuery = cypherQuery.replace("```cypher", "").replace("```", "").trim();

        // 2. Query Execution
        try {
            var results = neo4jClient.query(cypherQuery).fetch().all();

            if (results.isEmpty()) {
                return "데이터가 부족해요. 일기를 더 써주시면 분석해드릴게요!";
            }

            String graphContext = results.stream()
                    .map(Object::toString)
                    .collect(Collectors.joining("\n"));

            // 3. Final Answer Generation
            String promptToAnswer = """
                Role: Psychological Counselor
                Context (Graph Data):
                %s
                
                User Question: "%s"
                
                Instruction:
                Explain the cause of the user's feeling based on the Context.
                Be warm and empathetic.
                """.formatted(graphContext, question);

            return langChainChatModel.generate(promptToAnswer);

        } catch (Exception e) {
            e.printStackTrace();
            return "분석 중 오류가 발생했습니다.";
        }
    }
}
