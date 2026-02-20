# 🔄 AI Synchronization Log (Gemini ↔ Claude)

---

## 🚩 Current Mission: 상점 화분 5종 SVG 전면 리디자인

> 📅 작성일: 2026-02-20
> 🎯 대상: `src/components/dashboard/StoreView.jsx` — `ItemPreview` 컴포넌트 내 `item.type === 'pot'` 블록
> ⚠️ 구매/장착 로직, data-gtm 속성 변경 금지

---

## ✅ 최종 합의 (Gemini + Claude)

### 핵심 방향
- **화분 형태**: `polygon` → `path` (Q bezier 곡선 항아리형)
- **식물 디자인**: 기존 유지 (품질 높음) + 애니메이션 추가
- **Z-order**: 화분 본체 → 식물(애니메이션 그룹) → 화분 림 → 흙

### 5종 개성
| 화분 | 형태 | 애니메이션 |
|------|------|-----------|
| 선인장 | 표준 테라코타 항아리 | breathe (호흡) |
| 기본/몬스테라 | 볼록한 배부른 항아리 | breathe (호흡) |
| 꽃 | 넓고 낮은 볼 형태 | sway (흔들림) |
| 라벤더 | 키 큰 우아한 항아리 | sway (흔들림) |
| 장미 | 클래식 정원 화분 | breathe (호흡) |

### CSS (index.css에 추가)
```css
@keyframes pot-sway { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
@keyframes pot-breathe { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(0.97); } }
.animate-pot-sway { transform-origin: bottom center; transform-box: fill-box; animation: pot-sway 3s ease-in-out infinite; }
.animate-pot-breathe { transform-origin: bottom center; transform-box: fill-box; animation: pot-breathe 4s ease-in-out infinite; }
```

### 구현 완료
- [x] `index.css` — 화분 CSS keyframe 추가
- [x] `StoreView.jsx` — pot 블록 전면 리디자인
