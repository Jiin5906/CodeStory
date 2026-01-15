package com.codestory.diary.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String path = System.getProperty("user.dir");
        
        path = path.replace("\\", "/");
        
        String uploadPath = "file:///" + path + "/uploads/";

        System.out.println("=============================================");
        System.out.println("📸 이미지 접근 경로 설정됨: " + uploadPath);
        System.out.println("=============================================");

        // 4. 리소스 핸들러 등록
        registry.addResourceHandler("/images/**")
                .addResourceLocations(uploadPath);
    }
}