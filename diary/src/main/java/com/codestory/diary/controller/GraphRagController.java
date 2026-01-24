package com.codestory.diary.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.codestory.diary.service.GraphRagService;

@RestController
public class GraphRagController {

    @Autowired
    private GraphRagService graphRagService;

    // 테스트 URL: /test/analysis?userId=8&q=나왜우울해
    @GetMapping("/test/analysis")
    public String analyze(@RequestParam Long userId, @RequestParam("q") String question) {
        return graphRagService.analyzeRootCause(userId, question);
    }
}