package com.codestory.diary.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.codestory.diary.service.GraphRagService;
import com.codestory.diary.neo4j.GraphService;

@RestController
@RequestMapping("/api")
public class GraphRagController {

    @Autowired
    private GraphRagService graphRagService;

    @Autowired
    private GraphService graphService;

    // 테스트 URL 1: 데이터 저장
    // POST /api/test/save?userId=7&content=어제 치킨을 먹었어
    @PostMapping(value = "/test/save", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> saveTestData(@RequestParam Long userId, @RequestParam String content) {
        try {
            graphService.saveDiaryToGraph(userId, content);
            String jsonResponse = """
                {
                    "status": "success",
                    "message": "데이터가 Neo4j에 저장되었습니다.",
                    "userId": %d,
                    "content": "%s"
                }
                """.formatted(userId, content);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(jsonResponse);
        } catch (Exception e) {
            String jsonResponse = """
                {
                    "status": "error",
                    "message": "저장 실패: %s"
                }
                """.formatted(e.getMessage());
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(jsonResponse);
        }
    }

    // 테스트 URL 2: 검색
    // GET /api/test/analysis?userId=7&q=내가 어제 뭐 먹었어
    @GetMapping(value = "/test/analysis", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> analyze(@RequestParam Long userId, @RequestParam("q") String question) {
        String jsonResponse = graphRagService.analyzeRootCause(userId, question);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonResponse);
    }
}