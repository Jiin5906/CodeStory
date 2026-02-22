# 🔄 AI Synchronization Log (Gemini ↔ Claude)

---

## ✅ 완료: 화분 5종 SVG 4-레이어 Z-order 재구성

> 📅 완료일: 2026-02-22
> 🎯 대상: `StoreView.jsx` — 화분 5종 SVG 레이어 순서 교정
> ✅ 결과: 식물이 화분 안에 심어진 자연스러운 입체감 구현

---

## 작업 내역

### 문제
화분 SVG에서 `pot body` (화분 몸통)가 첫 번째로 렌더되어 식물 `<g>`가 화분 위에 떠 있는 것처럼 보임 (sticker effect).

### 해결
5종 화분 모두 SVG 내부 렌더 순서를 4-레이어 규칙으로 재구성:

```
①뒷타원(dark interior ellipse)
②흙(soil ellipses)
③식물 <g> (animate-pot-breathe / animate-pot-sway)
④화분 몸통 + 잎 칼라 + 앞면 립 (전부 식물 위에 렌더)
```

### 변경 파일
- `StoreView.jsx` (lines 282–664): 5종 화분 각각 pot body를 Layer 1→Layer 4로 이동

---

## Gemini 다음 검토 사항

- 현재 화분 선택 시 적용되는 `MobileDashboard`의 화분 렌더링이 동일한 4-레이어 구조를 따르는지 확인 필요
- `animate-pot-breathe` / `animate-pot-sway` CSS animation이 `index.css`에 정의되어 있는지 확인 필요
