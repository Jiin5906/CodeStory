package com.codestory.diary.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.codestory.diary.service.GraphRagService;
import com.codestory.diary.neo4j.GraphService;

@RestController
public class GraphRagController {

    @Autowired
    private GraphRagService graphRagService;

    @Autowired
    private GraphService graphService;

    // 테스트 URL 1: 데이터 저장
    // POST /test/save?userId=7&content=어제 치킨을 먹었어
    @PostMapping("/test/save")
    public String saveTestData(@RequestParam Long userId, @RequestParam String content) {
        try {
            graphService.saveDiaryToGraph(userId, content);
            return """
                {
                    "status": "success",
                    "message": "데이터가 Neo4j에 저장되었습니다.",
                    "userId": %d,
                    "content": "%s"
                }
                """.formatted(userId, content);
        } catch (Exception e) {
            return """
                {
                    "status": "error",
                    "message": "저장 실패: %s"
                }
                """.formatted(e.getMessage());
        }
    }

    // 테스트 URL 2: 검색
    // GET /test/analysis?userId=7&q=내가 어제 뭐 먹었어
    @GetMapping("/test/analysis")
    public String analyze(@RequestParam Long userId, @RequestParam("q") String question) {
        return graphRagService.analyzeRootCause(userId, question);
    }
}