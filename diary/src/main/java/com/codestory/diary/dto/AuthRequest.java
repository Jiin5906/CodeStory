package com.codestory.diary.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
    private String nickname; // 회원가입 시에만 사용
}