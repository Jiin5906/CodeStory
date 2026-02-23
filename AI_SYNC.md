## 🚩 Current Mission: TWA 기반 Play Store 출시 — Day 1 PWA 전환 ✅

**완료 일시**: 2026-02-23

---

## 📋 Claude-Gemini 최종 합의안 및 완료 내역

### Day 1 완료 ✅
- `vite-plugin-pwa` 설치 완료
- `vite.config.js` PWA 설정 완료
  - manifest: 공감일기, 핑크 테마(#FF8FA3), standalone 모드
  - workbox: 5MB 한도, API는 NetworkFirst 캐싱
  - 아이콘 3종 정의 (192/512/maskable-512)
- `public/.well-known/assetlinks.json` 템플릿 생성 (SHA256은 PWABuilder에서 교체 필요)
- `nginx/default.conf` sw.js / manifest 캐시 비활성화 추가
- 빌드 검증: `dist/sw.js`, `dist/workbox-*.js` 생성 확인

### ❗ 사용자가 해야 할 일

**지금 당장:**
1. `public/pwa-192x192.png` 준비 (192×192)
2. `public/pwa-512x512.png` 준비 (512×512)
3. `public/pwa-maskable-512x512.png` 준비 (https://maskable.app/ 활용)

**Day 2 (PWABuilder):**
4. https://pwaBUilder.com → logam.click 입력 → Android 패키지 다운로드
5. SHA256 fingerprint를 `public/.well-known/assetlinks.json`에 교체 후 Claude에게 전달
6. keystore 파일 백업 (분실 시 앱 업데이트 불가)

**Day 3 (Play Store):**
7. Google Play Console 가입 ($25)
8. 스크린샷 2~3장 준비
9. 개인정보처리방침 URL 준비 (Notion 등으로 작성)
10. 1024×500 그래픽 이미지 준비

### 🔜 다음 Claude 작업
- 아이콘 파일 배치 후 재빌드 및 PWA 점수 확인
- assetlinks.json SHA256 교체 후 배포
- (별도) ToDo 1번 테스트 버튼 제거 + 린트 전체 해결
