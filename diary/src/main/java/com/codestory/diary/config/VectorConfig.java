package com.codestory.diary.config;

import io.pinecone.clients.Pinecone;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class VectorConfig {

    @Value("${pinecone.api-key}")
    private String pineconeApiKey;

    @Value("${pinecone.environment}")
    private String pineconeEnvironment;

    @Value("${pinecone.index-name}")
    private String pineconeIndexName;

    @Bean
    public Pinecone pineconeClient() {
        return new Pinecone.Builder(pineconeApiKey).build();
    }
}
