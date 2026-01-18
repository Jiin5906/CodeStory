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
- **커밋 제한:** `git commit`이나 `git push`는 사용자가 명시적으로 요청했을 때만 수행하세요.
## 🔌 Enabled Plugins Strategy
이 프로젝트는 다음 플러그인을 적극 활용합니다. 작업 성격에 맞춰 우선적으로 호출하세요:
1. **UI/UX Design:** 디자인 변경 요청 시 수동 코딩 대신 **`frontend-design`** 플러그인을 최우선으로 사용할 것.
2. **Complex Features:** 복잡한 기능 구현 시 **`feature-dev`** 플러그인을 사용하여 분석-구현-테스트 파이프라인을 탈 것.
3. **Refactoring:** 코드 정리 시 **`code-simplifier`**를 사용할 것.

## 코드 정리
1. 프론트 엔드에는 현재 data-gtm을 통해 사용자가 어디서 이탈하는지, 어디서 많이 머무는지를 알아보고 있습니다. 따라서 data-gtm이 없으면
우선적으로 이걸 코드에 추가해 주시고 data-gtm이 존재하면 바꾸지 말고 놔두셔야 합니다.
