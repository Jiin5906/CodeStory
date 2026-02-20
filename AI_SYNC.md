# 🔄 AI Synchronization Log (Gemini ↔ Claude)

---

## 🚩 Current Mission: 상점 화분 5종 플랜테리어 일러스트 퀄리티업

> 📅 작성일: 2026-02-20
> 🎯 대상: `StoreView.jsx` — `ItemPreview` pot 블록
> ⚠️ 구매/장착 로직, data-gtm 속성 변경 금지

---

## ✅ 최종 합의 (Gemini 2차 + Claude)

### 공통 원칙
- SVG `linearGradient` → 화분 3D 입체감 (동일 경로 2번: 기본색 + 그라데이션 오버레이)
- Z-order: 화분 본체 → 흙 레이어 → 식물(애니메이션) → 화분 림/테두리
- 흙: 짙은 갈색 이중 타원(`#2E1B0E` + `#4A2912`)
- CSS `animate-pot-breathe` / `animate-pot-sway` 유지

### 5종 세부 설계
| 화분 | 형태 | 식물 특징 | 기법 |
|------|------|---------|------|
| 선인장 | 표준 테라코타 항아리 | 세로 주름(ribs) + 짧은 가시선 + 핑크 6장 꽃 | path 리브 + white stroke 가시 |
| 몬스테라 | 볼록 세라믹 항아리 | C bezier 큰 잎 + SVG mask 구멍 + 잎맥 | `<mask>` fenestration |
| 꽃 | 넓은 볼 형태 | 이중 레이어 꽃잎(outer 6 + inner 6) × 3꽃 | ellipse 방사형 × 2층 |
| 라벤더 | 키 큰 항아리 | 쌍 타원 floret 클러스터, 5단계 보라 그라데이션 | 좌우 쌍 ellipse per node |
| 장미 | 클래식 가든 포트 | 레이어드 호 path 소용돌이 (호 5겹) + 잎 덤불 | 동심 arc 깊이감 |

### 구현 완료
- [x] `StoreView.jsx` — pot 블록 전면 리디자인
