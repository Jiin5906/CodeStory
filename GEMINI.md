# 💎 GEMINI.md - GongGam Diary (공감일기)

This file provides essential context and instructions for Gemini CLI when working in this repository.

## 🌟 Project Overview
**GongGam Diary (공감일기)** is an AI-powered journaling application designed to provide emotional support and empathetic feedback. It uses a modern stack with RAG (Retrieval-Augmented Generation) to remember past entries and provide personalized responses.

- **Frontend**: React 19 + Vite + Tailwind CSS 4
- **Backend**: Spring Boot 3.5.9 + Java 21
- **Databases**: 
  - **MariaDB 10.5**: Primary relational data (Users, Diaries)
  - **Neo4j**: Graph database for emotional relationship mapping
  - **Redis**: Performance caching (Phase 3)
  - **Pinecone**: Vector database for RAG (semantic search)
- **AI Integration**: OpenAI GPT-4o-mini, LangChain4j, text-embedding-3-small
- **Infrastructure**: Docker Compose, Nginx (Reverse Proxy + SSL), AWS EC2, GitHub Actions

---

## 🛠 Development Commands

### 📂 Backend (Spring Boot)
Located in `/diary`
```bash
./gradlew clean build          # Full build with tests
./gradlew bootRun              # Run locally (http://localhost:8080)
./gradlew test                 # Run JUnit tests
```

### 📂 Frontend (React)
Located in `/frontend/CodeStory/codestory-chatbot`
```bash
npm install                    # Install dependencies
npm run dev                    # Run dev server (http://localhost:5173)
npm run build                  # Production build (outputs to dist/)
npm run lint                   # Run ESLint
```

### 🐳 Docker (Full Stack)
```bash
docker-compose up -d           # Start all services
docker-compose logs -f backend # Follow backend logs
docker-compose down            # Stop services
```

---

## 🏗 Architecture & Key Features

### AI & RAG Pipeline
- **RAG System**: Uses Pinecone for vector search and Neo4j for graph-based context.
- **Empathetic Response**: GPT-4o-mini generates casual Korean (해요체) responses.
- **Optimization**: Feature flags in `application.properties` control similarity filtering and few-shot prompting.

### Security & Auth
- **Auth**: Supports custom BCrypt-based auth and Google OAuth2.
- **JWT**: Configuration exists (`jwt.secret`), but currently `SecurityConfig.java` is set to `permitAll()` for most API routes to facilitate development.
- **Frontend State**: User info is currently managed via `localStorage` as `diaryUser`.

### Frontend Components
- **Gamification**: "다마고치" (Tamagotchi) style interactions with "Mongle" character.
- **Analytics**: Recharts for mood tracking and emotional statistics.
- **Tracking**: Google Tag Manager (GTM) is integrated; **do not remove `data-gtm` attributes**.

---

## 📋 Key Files
- `CLAUDE.md`: Detailed dev guide and architecture overview.
- `AI_UPGRADE_SUMMARY.md`: History and status of AI/RAG improvements.
- `docker-compose.yml`: Multi-container orchestration (MariaDB, Neo4j, Redis, Backend, Nginx).
- `diary/src/main/resources/application.properties`: Backend configuration and AI feature flags.
- `frontend/CodeStory/codestory-chatbot/package.json`: Frontend dependency manifest.

---

## 🤖 Gemini CLI Guidelines

### 1. Parallel Execution
- Backend (`/diary`) and Frontend (`/frontend/...`) changes should be analyzed and executed in parallel if they are independent.
- Always check `api.js` in the frontend when modifying backend controllers.

### 2. Verification Workflow
- **Backend**: Verify changes with `./gradlew clean bootJar -x test`.
- **Frontend**: Verify changes with `npm run lint`.
- **Integration**: Ensure the frontend `proxy` in `vite.config.js` matches the backend port (default 8080).

### 3. GTM & Analytics
- **CRITICAL**: Maintain `data-gtm` attributes in JSX files. If missing, add them to interactive elements; if present, do not modify them unless explicitly asked.

### 4. Commit Strategy
- Use Korean commit messages with emojis:
  - ✨ `feat`: New feature
  - 🎨 `design`: UI/UX improvement
  - 🐛 `fix`: Bug fix
  - ♻️ `refactor`: Code cleanup
- Format: `[이모지] [타입]: [설명]` (e.g., `✨ feat: AI 감정 분석 기능 추가`)

### 5. Deployment
- Production deployment is handled via GitHub Actions to AWS EC2.
- Building the frontend (`npm run build`) and copying to `diary/src/main/resources/static/` is required for production JAR packaging.

# System Instructions

당신은 나의 수석 프론트엔드 개발자이자 훌륭한 코딩 파트너입니다.
앞으로 나와 대화할 때는 **반드시 모든 답변과 코드에 대한 설명을 한국어(Korean)로 작성**해 주세요.
코드를 수정하거나 작성할 때, 주석(Comment)이 필요하다면 주석 역시 한국어로 달아주세요.

## 🤝 AI Agent Collaboration (Gemini & Claude)

- **Context Sharing**: 이 프로젝트에는 Gemini CLI와 Claude Code가 동시에 참여합니다.
- **Communication Log**: 두 에이전트 간의 상세한 기술적 합의나 상태 공유가 필요할 경우, 프로젝트 루트의 `AI_SYNC.md` 파일을 참조하고 업데이트하세요.
- **Role Assignment**:
  - **Gemini**: 시스템 아키텍처 설계, RAG 로직 최적화, 백엔드 로직 검토 및 UI/UX 컨셉 제안.
  - **Claude**: 세부 코드 구현, 리팩토링, 디자인 시스템(듀오링고 스타일) 적용 및 버그 수정.
- **Conflict Resolution**: 코드 수정 시 다른 에이전트의 최근 변경 사항을 먼저 확인하고, 의문이 생기면 `AI_SYNC.md`에 질문을 남기세요.