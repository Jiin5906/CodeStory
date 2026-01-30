# 1. 실행 환경 설정 (Java 21)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# 2. 빌드된 JAR 복사 (폴더 구조 반영)
# Github Actions가 diary 폴더 안에서 빌드한 결과물을 가져옵니다.
COPY diary/build/libs/*.jar app.jar

# 3. 앱 실행
ENTRYPOINT ["java", "-jar", "app.jar"]