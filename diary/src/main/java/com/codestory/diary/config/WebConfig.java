package com.codestory.diary.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
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

        // 업로드된 이미지 파일 핸들러
        registry.addResourceHandler("/images/**")
                .addResourceLocations(uploadPath);

        // React 빌드 파일 정적 리소스 핸들러 (명시적 설정)
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCachePeriod(86400); // 1일 캐싱

        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(86400);

        // 기타 정적 파일 (favicon, robots.txt 등)
        registry.addResourceHandler("/*.ico", "/*.png", "/*.svg", "/*.txt", "/*.json")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(86400);
    }

    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        // MIME 타입 명시적 설정
        configurer
                .favorPathExtension(false)
                .favorParameter(false)
                .ignoreAcceptHeader(false)
                .defaultContentType(MediaType.APPLICATION_JSON)
                .mediaType("css", MediaType.parseMediaType("text/css"))
                .mediaType("js", MediaType.parseMediaType("application/javascript"))
                .mediaType("json", MediaType.APPLICATION_JSON)
                .mediaType("html", MediaType.TEXT_HTML)
                .mediaType("png", MediaType.IMAGE_PNG)
                .mediaType("jpg", MediaType.IMAGE_JPEG)
                .mediaType("jpeg", MediaType.IMAGE_JPEG)
                .mediaType("svg", MediaType.parseMediaType("image/svg+xml"));
    }
}