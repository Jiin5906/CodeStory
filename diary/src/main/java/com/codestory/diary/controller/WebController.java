package com.codestory.diary.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping(value = { "", "/", "/login", "/signup", "/write", "/diary/**", "/list" })
    public String redirect() {
        return "forward:/index.html";
    }
}