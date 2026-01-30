package com.codestory.diary;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;

@SpringBootApplication
@EnableRetry
public class GongGamDiaryApplication {

	public static void main(String[] args) {
		SpringApplication.run(GongGamDiaryApplication.class, args);
	}

}
