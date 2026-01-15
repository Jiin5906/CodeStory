package com.codestory.diary.exception; // 패키지명은 상황에 맞게 조정하세요

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice // 프로젝트 전역에서 발생하는 에러를 감시함
public class GlobalExceptionHandler {

    // AuthService에서 던진 IllegalArgumentException을 여기서 잡습니다!
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        // 500 에러 대신 409 (Conflict) 또는 400 (Bad Request)를 반환합니다.
        // 중복 가입은 보통 409 Conflict가 가장 적절합니다.
        return ResponseEntity
                .status(HttpStatus.CONFLICT) // 409 상태 코드
                .body(ex.getMessage());      // "이미 등록된 회원입니다." 메시지 반환
    }
}