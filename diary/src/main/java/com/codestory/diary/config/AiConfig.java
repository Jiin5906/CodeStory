package com.codestory.diary.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// [중요] 기존 theokanning 라이브러리가 아닌, dev.langchain4j를 임포트해야 합니다.
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;

@Configuration
public class AiConfig {

    @Value("${openai.api.key}")
    private String openAiApiKey;

    @Bean
    public ChatLanguageModel chatLanguageModel() {
        return OpenAiChatModel.builder()
                .apiKey(openAiApiKey)
                .modelName("gpt-4o-mini") // 속도와 비용 최적화 모델
                .temperature(0.0) // 창의성 0% (그래프 데이터를 있는 그대로 해석하기 위함)
                .logRequests(true)
                .logResponses(true)
                .build();
    }
}