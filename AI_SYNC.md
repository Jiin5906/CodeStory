# 🔄 AI Synchronization Log (Gemini ↔ Claude)

---

## 🚩 Current Mission: 상점 화분 5종 플랜테리어 일러스트 전면 재작성 (퀄리티업)

> 📅 작성일: 2026-02-22
> 🎯 대상: `StoreView.jsx` — `ItemPreview` pot 블록 (line 282~603)
> ⚠️ 구매/상태 관리 로직, data-gtm 속성 변경 금지

---

## ✅ 최종 합의 (Gemini 2차 + Claude 수정)

### 공통 원칙
- SVG `linearGradient` 로 화분 3D 입체감 (좌우 어두움 + 중앙 하이라이트)
- Z-order: 화분 본체 → 흙 레이어 → 식물(애니메이션) → 잎 칼라 → 화분 림
- 흙: 짙은 갈색 이중 타원 (`#2E1B0E` + `#4A2C12`)
- CSS `animate-pot-breathe` / `animate-pot-sway` 유지

### 5종 최종 설계
| 화분 | 형태 | 식물 특징 | 기법 |
|------|------|---------|------|
| 선인장 | 테라코타 원통+하단테이퍼 | 팔 2개 + 세로 리브 3줄 + 가시선 + 핑크 6장 꽃 | linearGradient + stroke 리브 |
| 몬스테라 | 흰 볼록 세라믹 | 큰 잎 3장 + SVG mask fenestration 구멍 + 잎맥 | `<mask>` 3개 |
| 꽃 | 블러쉬 핑크 넓은 볼 | 잎덤불 + 데이지 3송이 (5~7장 외층+내층+꽃심) | ellipse 방사형 rotate |
| 라벤더 | 크림 도자기 달걀형 | 5줄기 × 6노드 쌍타원 클러스터 + 꼭대기 꽃봉오리 | 쌍 ellipse per node |
| 장미 | 다크 원통 + 골드 림 | 잎덤불 + 소용돌이 arc 장미 3송이 (5겹) | 동심 호 arc 깊이감 |

### 구현 완료
- [x] `StoreView.jsx` — pot 블록 전면 재작성 완료
  - 선인장: 테라코타 원통형, 팔 2개, 세로 리브 3줄, 가시선, 핑크 꽃
  - 몬스테라: 흰 볼록 세라믹, mask 3개로 fenestration 구멍, 잎맥
  - 꽃: 블러쉬 볼, 잎덤불, 데이지 3송이(5·7·5장 외+내층)
  - 라벤더: 크림 도자기, 5줄기 × 6노드 쌍타원 + 꼭대기 봉오리
  - 장미: 다크 원통 + 골드 림, 잎덤불, 5겹 소용돌이 arc 장미 3송이
- npm run lint: StoreView.jsx 에러 없음 ✅

---

## 📋 Gemini 다음 검토 사항
- 화분 5종 SVG 렌더링 실제 확인 (브라우저 시각 검증)
- animate-pot-breathe / animate-pot-sway 애니메이션 타이밍 조정 필요 여부 체크

---
