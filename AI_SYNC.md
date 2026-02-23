## 🚩 Current Mission: StoreView 아이템 카드 상품명 줄바꿈 해결

**완료 일시**: 2026-02-23
**담당**: Claude (구현) ↔ Gemini (아키텍처 검토)

---

## 📋 최종 합의안

### 문제
- 모바일 2열 그리드에서 카드 너비 ≈ 140px
- h3 태그에 MongleIcon(16px) + gap + 텍스트가 flex로 배치
- 텍스트 가용 폭 부족 → "선인장 화\n분" 처럼 줄바꿈 발생

### 해결 전략 (Claude + Gemini 합의)
1. **아이콘 완전 제거** — 카드 내 텍스트 가용 공간 최대 확보
2. **h3에 `whitespace-nowrap truncate` 적용** — 줄바꿈 강제 차단
3. **부모에 `min-w-0` 추가** — Flex 컨테이너 내에서 truncate 정상 동작 보장

### Gemini의 초안 vs Claude의 수정
- Gemini: 아이콘 유지 + flex-shrink-0 + span.truncate.whitespace-nowrap (min-w-0 누락)
- Claude: 아이콘 제거 + h3.truncate.whitespace-nowrap + 부모 min-w-0 → 더 단순하고 안전

### 수정 파일
- `frontend/.../components/dashboard/StoreView.jsx`
  - h3 내부 MongleIcon 제거
  - h3: `text-sm font-bold ... flex items-center justify-center gap-1.5`
    → `text-sm font-bold text-gray-800 text-center mb-1 truncate whitespace-nowrap`
  - h3 감싸는 div에 `min-w-0` 추가

---

## 🔜 Gemini 다음 검토 항목
- StoreView 카드 레이아웃 전반적인 모바일 최적화 추가 검토 필요 시 의견 요청
