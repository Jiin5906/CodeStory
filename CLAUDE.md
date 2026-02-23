# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GongGam Diary (공감일기)** - AI-powered journaling application with emotional support features.

- **Backend**: Spring Boot 3.5.9 (Java 17) + MariaDB 10.5
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Infrastructure**: Docker Compose with Nginx reverse proxy, SSL via Let's Encrypt
- **AI Integration**: OpenAI GPT-4o-mini for empathetic diary responses
- **Monitoring**: Prometheus + Grafana
- **Deployment**: GitHub Actions → Docker Hub → AWS EC2

## Development Commands

### Backend (Spring Boot)

```bash
cd diary

# Build with Gradle
./gradlew clean build          # Full build with tests
./gradlew clean bootJar -x test  # Build JAR without tests

# Run locally
./gradlew bootRun              # Runs on http://localhost:8080

# Run tests
./gradlew test                 # Test reports: build/reports/tests/test/index.html

# The JAR artifact is generated at:
# diary/build/libs/diary-0.0.1-SNAPSHOT.jar
```

### Frontend (React + Vite)

```bash
cd frontend/CodeStory/codestory-chatbot

# Install dependencies
npm install

# Development server
npm run dev                    # Runs on http://localhost:5173

# Production build
npm run build                  # Output to dist/

# Preview production build
npm run preview

# Lint
npm run lint
```

### Docker (Full Stack)

```bash
# Run entire stack
docker-compose up -d

# View logs
docker-compose logs -f backend

# Rebuild and restart backend
docker-compose up -d --build backend

# Stop all services
docker-compose down
```

## Architecture

### Layered Architecture (Backend)

- **Controller Layer** (`controller/`) - REST endpoints with `@RestController`
  - `ApiController.java` - Main API endpoints (auth, diary CRUD, feed)

- **Service Layer** (`service/`) - Business logic
  - `DiaryService.java` - Diary operations (CRUD, image uploads, public/private toggle)
  - `AiService.java` - OpenAI integration for empathetic responses
  - `AuthService.java` - Authentication (signup, login with BCrypt)

- **Repository Layer** (`repository/`) - Data access
  - `DiaryRepository.java` - Spring Data JPA (custom queries for feed, user diaries)
  - `MemberRepository.java` - User management

- **Entity Layer** (`entity/`) - JPA entities with Lombok
  - `Diary.java` - id, userId, content, date, imageUrl, aiResponse, isPublic, mood metrics, tags
  - `Member.java` - id, email (unique), password (BCrypt), nickname, createdAt

### Frontend Structure

- **`src/components/`** - Feature-based organization
  - `auth/Login.jsx` - Dual-mode login/signup form
  - `dashboard/Dashboard.jsx` - Main entry point after login
  - `diary/DiaryEditor.jsx` - Markdown editor with AI response
  - `calendar/CalendarView.jsx` - Monthly diary overview
  - `feed/SharedFeed.jsx` - Public diaries from all users
  - `stats/Reports.jsx` - Mood analytics and visualizations
  - `layout/` - Sidebar, Header shared components

- **`src/services/api.js`** - Centralized Axios API client
  - All endpoints use relative paths (`/api`)
  - Exports: `authApi`, `diaryApi`, `feedApi`

- **`src/context/ThemeContext.jsx`** - Light/dark theme state

### API Endpoints

**Base URL**: `/api`

**Authentication** (no session tokens - returns user object):
- `POST /api/auth/signup` - `{ email, password, nickname }` → user object
- `POST /api/auth/login` - `{ email, password }` → user object

**Diary Operations**:
- `GET /api/diary?userId={id}&date={YYYY-MM-DD}` - Get diary for specific date
- `GET /api/diaries?userId={id}` - Get all diaries for user
- `POST /api/diary` - Create diary (supports multipart with image)
- `PUT /api/diary/{id}` - Update diary
- `DELETE /api/diary/{id}` - Delete diary
- `PATCH /api/diary/{id}/toggle-public` - Toggle public/private

**Feed**:
- `GET /api/feed` - Get all public diaries (sorted by date desc)

### Database Schema

**`member` table**:
- `id` (PK, auto-increment), `email` (unique), `password` (BCrypt), `nickname`, `created_at`

**`diary` table**:
- `id` (PK), `user_id` (FK), `content` (TEXT), `date`, `image_url`, `ai_response` (TEXT)
- `is_public` (boolean, default false), `tension`, `mood`, `fun` (mood metrics)
- `emoji`, `created_at`

**`diary_tags` table**:
- `diary_id` (FK), `tag` (VARCHAR)

**JPA Configuration**:
- `ddl-auto=update` - Schema auto-updates (no Flyway/Liquibase)
- Dialect: `MariaDBDialect`
- Timezone: `Asia/Seoul`

### File Upload Handling

- **Upload Directory**: `diary/uploads/`
- **URL Pattern**: `/images/{uuid}_{filename}`
- **Spring ResourceHandler**: Maps `/images/**` to file system path
- **Max Size**: 10MB (configured in `application.properties`)
- **Format**: Multipart form data with `image` field

### AI Integration

**OpenAI GPT-4o-mini** via `AiService.java`:
- **Model**: `gpt-4o-mini` (configured in `application.properties`)
- **System Prompt**: Warm, empathetic companion responding in casual Korean (해요체)
- **Response Style**: 3-4 sentences, focus on emotional support
- **Multimodal**: Supports text + image analysis
- **API Key**: Environment variable `OPENAI_API_KEY`

### Security Configuration

**`SecurityConfig.java`**:
- CSRF disabled (for REST API)
- CORS configured for:
  - `http://localhost:5173` (local development)
  - `https://logam.click` (production)
  - `http://logam.click`
- All `/api/**` endpoints are **public** (no authentication required)
- BCrypt password encoding for user passwords

**Note**: Current implementation has no JWT/session tokens. User data stored in browser `localStorage` as `diaryUser`.

### Environment Variables

Required in `.env` file:

```env
DB_ROOT_PASSWORD=<root_password>
DB_USER=<db_user>
DB_PASSWORD=<db_password>
OPENAI_API_KEY=<openai_key>
GOOGLE_CLIENT_SECRET=<google_oauth_secret>
DOCKER_USERNAME=<dockerhub_username>
VITE_GTM_ID=<google_tag_manager_id>  # Frontend only
```

**Backend** reads from:
- `application.properties` references `${DB_USER}`, `${DB_PASSWORD}`, `${OPENAI_API_KEY}`, `${GOOGLE_CLIENT_SECRET}`

**Frontend** reads from:
- `.env` in `frontend/CodeStory/codestory-chatbot/` for `VITE_GTM_ID`

## CI/CD Pipeline

**GitHub Actions** (`.github/workflows/deploy.yml`) on push to `main`:

1. **Build Frontend**: `npm install && npm run build` in `frontend/CodeStory/codestory-chatbot/`
2. **Copy Frontend to Backend**: `dist/*` → `diary/src/main/resources/static/`
3. **Build Backend JAR**: `./gradlew clean bootJar -x test` (includes embedded frontend)
4. **Build Docker Image**: Uses `Dockerfile` in project root
5. **Push to Docker Hub**: Tags as `${DOCKER_USERNAME}/diary-backend:latest`
6. **Deploy to EC2**:
   - SSH to EC2 server
   - `git pull origin main`
   - Create `.env` file with secrets
   - `docker-compose pull backend && docker-compose up -d backend`
   - Prune unused images

**Important**: Frontend must be built and copied to `diary/src/main/resources/static/` before backend build for production deployment.

## Local Development Setup

### Option 1: Full Docker Stack (Recommended for testing deployment)

```bash
# Create .env file in project root with required variables
docker-compose up -d
# Access at http://localhost:80
```

### Option 2: Separate Frontend/Backend (Recommended for development)

**Terminal 1 - Database:**
```bash
docker run -d -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=codestory_db \
  -e MYSQL_USER=user \
  -e MYSQL_PASSWORD=password \
  mariadb:10.5
```

**Terminal 2 - Backend:**
```bash
cd diary
# Update application.properties: change mariadb-container to localhost
./gradlew bootRun
# Runs on http://localhost:8080
```

**Terminal 3 - Frontend:**
```bash
cd frontend/CodeStory/codestory-chatbot
npm run dev
# Runs on http://localhost:5173
```

**Vite Dev Server** proxies API requests from `localhost:5173` to `localhost:8080` automatically.

## Code Conventions

### Java (Backend)
- **Lombok**: Use `@RequiredArgsConstructor`, `@Builder`, `@Data` for boilerplate reduction
- **Constructor Injection**: Prefer constructor injection over field injection
- **Package Structure**: `com.codestory.diary.{config|controller|dto|entity|repository|service|exception}`
- **Naming**: snake_case for database columns, camelCase for Java fields

### JavaScript/React (Frontend)
- **Components**: Functional components with hooks (no class components)
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Styling**: Tailwind CSS utility classes preferred
- **State**: Local state with `useState`, Context API for theme, `localStorage` for user session
- **API Calls**: Use centralized `api.js` service, async/await pattern

### Git Commits
- Korean commit messages are used in this project
- Emoji prefixes occasionally used (🚀, ✨, 🔧, etc.)

## Common Development Patterns

### Adding a New API Endpoint

1. **Create/Update Entity** (if needed) - `entity/Diary.java`
2. **Add Repository Method** (if custom query needed) - `repository/DiaryRepository.java`
3. **Add Service Method** - `service/DiaryService.java`
4. **Add Controller Endpoint** - `controller/ApiController.java`
5. **Update Frontend API Client** - `frontend/.../services/api.js`
6. **Create/Update Component** - `frontend/.../components/`

### File Upload Pattern

Follow the pattern in `DiaryService.createDiaryWithImage()`:
- Accept `MultipartFile` in controller
- Generate UUID for unique filename
- Save to `uploads/` directory
- Store relative URL in database: `/images/{uuid}_{filename}`
- Return URL in response

### AI Response Pattern

Follow the pattern in `AiService.generateDiaryResponse()`:
- Build messages array with system prompt + user content
- Support multimodal (text + base64 image)
- Call OpenAI API via `RestTemplate`
- Extract content from response
- Handle errors gracefully

## Monitoring

**Prometheus**: Metrics exposed at `http://localhost:9090`
**Grafana**: Dashboards at `http://localhost:3000` (admin/admin)

Configure Prometheus to scrape Spring Boot Actuator metrics if needed.

## Known Limitations

- No JWT or session-based authentication (user data in `localStorage` only)
- No formal database migrations (JPA `ddl-auto=update` used)
- Limited test coverage (only smoke test in backend, no frontend tests)
- OAuth2 Google login configured but not integrated in UI
- No API rate limiting or request throttling
- Public endpoints (no authorization checks on diary operations)

## Domain and SSL

- **Production Domain**: `logam.click`
- **SSL**: Let's Encrypt via Certbot (auto-renewal configured)
- **Nginx Config**: `nginx/default.conf` handles SSL termination and reverse proxy to backend:8080

## 🤖 Claude Code Agent Guidelines

### 1. Parallel Execution Strategy (병렬 처리 전략)
- **독립적 작업 식별:** 프론트엔드(`@frontend`)와 백엔드(`@diary`) 수정이 서로 의존적이지 않은 경우, 반드시 병렬로 작업을 계획하고 실행하세요.
- **도구 다중 호출:** 파일 분석(`grep`, `ls`)이나 코드 수정(`edit`) 시, 한 번에 하나씩 하지 말고 여러 파일을 동시에 읽거나 수정하세요.
- **예시:** "로그인 API를 수정하라"는 요청 시, `ApiController.java`와 `Login.jsx`를 동시에 분석하고 수정을 계획하세요.

### 2. Autonomous Verification (자율 검증)
- **수정 후 즉시 검증:** 코드를 수정한 후에는 사용자에게 묻지 말고 관련 검증 명령어를 **스스로** 실행하세요.
  - Backend 수정 시: `./gradlew clean bootJar -x test` (빌드 확인)
  - Frontend 수정 시: `npm run lint` (문법 확인)
  - Frontend, Backend 연동이 잘 되는지 검증을 해주세요. Frontend코드를 무작정 바꾸지 말고 항상 Backend의 코드와 비교해서 잘 연동이 되도록 코드를 작성해주세요
- **오류 자동 복구:** 검증 실패 시 로그를 분석하여 1회까지는 스스로 수정(Self-correction)을 시도하세요.

### 3. Context Optimization (컨텍스트 최적화)
- **핀포인트 분석:** 프로젝트 전체를 읽지 말고, 기능과 관련된 핵심 파일만 `@파일명`으로 지칭하여 읽으세요.
- **정기적 압축:** 대화 턴이 5회를 넘어가면 `/compact` 실행을 고려하세요.

### 4. Safety Constraints (안전장치)
- **삭제 금지:** `rm -rf`, `DROP TABLE`, `docker system prune` 등 파괴적인 명령어는 병렬 모드에서도 **반드시 사용자 승인**을 받으세요.

### 5. Auto Commit & Push Strategy (자동 커밋/푸시 전략)
이 프로젝트는 개발 속도 향상을 위해 **자동 커밋/푸시 워크플로우**를 사용합니다.

#### 커밋 시점
다음 작업이 완료되었을 때 **자동으로 커밋/푸시를 제안**하세요:
1. UI/UX 개선 완료 (디자인 변경, 컴포넌트 추가/수정)
2. 새 기능 구현 완료 (API, 서비스 로직 추가)
3. 버그 수정 완료
4. 리팩토링 완료
5. 설정 파일 변경 완료

#### 커밋 메시지 규칙
**형식**: `[이모지] [타입]: [간결한 설명]`

**타입별 이모지**:
- `✨ feat`: 새 기능 추가
- `🎨 design`: UI/UX 디자인 개선
- `🐛 fix`: 버그 수정
- `♻️ refactor`: 코드 리팩토링
- `📝 docs`: 문서 수정
- `⚡ perf`: 성능 개선
- `🔧 config`: 설정 파일 수정
- `🚀 deploy`: 배포 관련

**예시**:
```bash
✨ feat: 3단계 스냅포인트 BottomSheet 구현
🎨 design: 다마고치 스타일 배경 가구 추가
🐛 fix: 바텀시트 드래그 시 새로고침 문제 해결
♻️ refactor: 색상 시스템 통일 및 불필요한 코드 제거
```

#### 커밋 워크플로우
1. **작업 완료 확인**:
   - Frontend 수정 시: `npm run lint` 성공 확인
   - Backend 수정 시: `./gradlew clean bootJar -x test` 성공 확인

2. **변경사항 분석**:
   ```bash
   git status
   git diff
   ```

3. **커밋 메시지 생성**:
   - 변경된 파일과 내용을 분석하여 적절한 타입과 이모지 선택
   - 한글로 간결하게 작성 (50자 이내)

4. **커밋 실행**:
   ```bash
   git add [변경된 파일들]
   git commit -m "[이모지] [타입]: [설명]

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   ```

5. **푸시**:
   ```bash
   git push origin main
   ```

6. **EC2 배포 확인** (중요!):

   **배포 후 사용자에게 다음 내용을 보고하세요:**

   ```markdown
   ## 🚀 배포 완료 및 EC2 확인 필요

   ### 📦 배포 상태
   - ✅ 커밋: [커밋 해시]
   - ✅ 푸시 완료: origin/main
   - ⏳ GitHub Actions 자동 배포 진행 중 (5-10분 소요)

   ### 🖥️ EC2 터미널에서 확인할 것

   **① 배포 완료 대기:**
   GitHub Actions: https://github.com/Jiin5906/CodeStory/actions

   **② SSH 접속:**
   \`\`\`bash
   ssh -i <키페어> ec2-user@<EC2_HOST>
   cd ~/CodeStory
   \`\`\`

   **③ 컨테이너 상태 확인:**
   \`\`\`bash
   docker-compose ps
   # 모든 컨테이너가 Up 상태인지 확인
   \`\`\`

   **④ 백엔드 로그 확인 (필수):**
   \`\`\`bash
   docker-compose logs backend --tail=100

   # 확인할 것:
   # ✅ "Started GongGamDiaryApplication"
   # ✅ "HikariPool-1 - Start completed" (DB 연결 성공)
   # ❌ 에러 메시지 없는지 확인
   \`\`\`

   **⑤ 헬스 체크:**
   \`\`\`bash
   curl http://localhost:8080/actuator/health
   curl https://logam.click/api/feed
   \`\`\`

   **⑥ 문제 발생 시:**
   \`\`\`bash
   # 수동 재배포
   git pull origin main
   docker-compose pull backend
   docker-compose up -d backend
   docker image prune -f
   \`\`\`
   ```

   **중요:** 코드 변경이 인프라에 영향을 주는 경우 (Java 버전, 컨테이너 이름 변경 등), 추가 조치 사항을 명시하세요.

#### 중요 사항
- **민감 정보 체크**: `.env`, `credentials.json` 등은 절대 커밋하지 않음
- **빌드 성공 확인**: 커밋 전 반드시 린트/빌드 테스트 통과 확인
- **원자적 커밋**: 한 번에 하나의 논리적 변경만 포함
- **사용자 확인**: 커밋/푸시 전 변경사항을 사용자에게 요약 보고
## 🔌 Enabled Plugins Strategy
이 프로젝트는 다음 플러그인을 적극 활용합니다. 작업 성격에 맞춰 우선적으로 호출하세요:
1. **UI/UX Design:** 디자인 변경 요청 시 수동 코딩 대신 **`frontend-design`** 플러그인을 최우선으로 사용할 것.
2. **Complex Features:** 복잡한 기능 구현 시 **`feature-dev`** 플러그인을 사용하여 분석-구현-테스트 파이프라인을 탈 것.
3. **Refactoring:** 코드 정리 시 **`code-simplifier`**를 사용할 것.

## 코드 정리
1. 프론트 엔드에는 현재 data-gtm을 통해 사용자가 어디서 이탈하는지, 어디서 많이 머무는지를 알아보고 있습니다. 따라서 data-gtm이 없으면
우선적으로 이걸 코드에 추가해 주시고 data-gtm이 존재하면 바꾸지 말고 놔두셔야 합니다.

# 🤖 Claude System Instructions & Collaboration Guide

당신은 '공감일기(GongGam Diary)' 프로젝트의 **메인 코드 구현 및 UI/UX 디테일 최적화를 담당하는 수석 개발자**입니다.
이 프로젝트는 **Gemini(아키텍처 설계, RAG 로직, 백엔드 검토 담당)와 함께 협업**하여 진행됩니다.

## 🤝 Gemini와의 협업 (AI Synchronization)
1. **작업 시작 전**: 당신은 어떤 코드를 수정하기 전에, 반드시 프로젝트 루트에 있는 `AI_SYNC.md` 파일과 `GEMINI.md` 파일을 먼저 읽으세요. Gemini가 남긴 아키텍처 방향성이나 지시사항을 완벽히 숙지해야 합니다.
2. **작업 완료 후**: 코드 구현이나 버그 수정이 끝나면, 당신이 어떤 파일을 어떻게 수정했는지, 그리고 Gemini가 다음으로 검토해야 할 사항이 무엇인지 `AI_SYNC.md` 파일에 기록(업데이트)하세요.

## ⚠️ 절대 지켜야 할 코딩 원칙 (Critical Rules)
1. **언어**: 사용자와 대화할 때, 그리고 코드 내 주석을 작성할 때는 **반드시 한국어(Korean)**를 사용하세요.
2. **GTM 보호**: 프론트엔드(React)의 JSX 파일을 수정할 때, 기존에 부여된 `data-gtm` 속성은 절대 삭제하거나 변경하지 마세요.
3. **UI 디테일**: 프론트엔드 작업 시 '듀오링고 스타일'의 디자인 시스템(3D 입체 버튼, 말풍선 등)을 철저히 유지하세요.
4. **검증**: 프론트엔드 작업 후에는 터미널에서 `npm run lint`를 실행하여 문제가 없는지 확인하세요.

## 🚀 Custom Action: #gemini-sync

사용자가 프롬프트에 `#gemini-sync`라는 키워드를 포함해서 지시하면, 당신(Claude)은 추가 질문 없이 즉시 터미널을 제어하여 다음 5단계의 'Auto-Debate & Code' 워크플로우를 자동으로 실행해야 합니다.

* **Trigger**: `#gemini-sync` 키워드 인식 시 발동
* **Action Sequence**:
  1. **[화이트보드 초기화]**: 기존 `AI_SYNC.md` 파일의 내용을 덮어쓰기(Overwrite)하여 새로운 제목(`## 🚩 Current Mission: [요구사항]`)으로 문서를 비웁니다.
  2. **[Gemini 의견 수렴]**: 터미널에서 `gemini "요구사항: [요구사항]. 이 기능을 리액트와 스프링부트 환경에서 구현하기 위한 기획안을 제안해 줘"` 명령어를 실행하여 Gemini의 답변을 읽습니다.
  3. **[Claude의 비판적 리뷰]**: Gemini가 출력한 답변을 분석하고, 수석 개발자 입장에서 비판적으로 검토합니다.
  4. **[최종 합의 도출]**: 터미널에서 `gemini "내 생각은 이래: [리뷰 요약]. 내 피드백을 수용해서 최종 합의안을 문서 형태로 출력해 줘"` 명령어를 실행해 최종안을 얻습니다.
  5. **[문서화 및 코딩]**: 최종 합의안을 `AI_SYNC.md`에 꼼꼼히 기록합니다. (단, 사용자가 지시사항에 "코딩 금지"나 "문서만 작성해"라고 명시한 경우 실제 코딩과 린트/커밋 단계는 건너뜁니다.)