import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTour } from '../../context/TourContext';

const SPOTLIGHT_PADDING = 10;
const SPOTLIGHT_RADIUS = 14;
const TOOLTIP_WIDTH = 272;
const TOOLTIP_GAP = 14;
const GEOM_EASE = 'cubic-bezier(0.4,0,0.2,1)';
const GEOM_DUR = '380ms';
// 위치 + 크기 동시 전환 (이전/현재 홀이 모두 보일 때 슬라이드)
const GEOM_TRANSITION      = `x ${GEOM_DUR} ${GEOM_EASE}, y ${GEOM_DUR} ${GEOM_EASE}, width ${GEOM_DUR} ${GEOM_EASE}, height ${GEOM_DUR} ${GEOM_EASE}`;
const POS_TRANSITION       = `left ${GEOM_DUR} ${GEOM_EASE}, top ${GEOM_DUR} ${GEOM_EASE}, width ${GEOM_DUR} ${GEOM_EASE}, height ${GEOM_DUR} ${GEOM_EASE}, opacity 300ms ease`;
// 크기만 전환 (첫 등장/사라짐: 제자리에서 열리고 닫힘)
const SIZE_TRANSITION      = `width ${GEOM_DUR} ${GEOM_EASE}, height ${GEOM_DUR} ${GEOM_EASE}`;
const SIZE_GLOW_TRANSITION = `width ${GEOM_DUR} ${GEOM_EASE}, height ${GEOM_DUR} ${GEOM_EASE}, opacity 300ms ease`;

// ── 툴팁 위치 계산 ──
function computeTooltipStyle(hole, position) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (!hole) {
        return {
            left: Math.max(12, vw / 2 - TOOLTIP_WIDTH / 2),
            top: vh - 220,
            width: TOOLTIP_WIDTH,
        };
    }

    const centerX = hole.x + hole.w / 2;
    const clampedLeft = Math.max(12, Math.min(vw - TOOLTIP_WIDTH - 12, centerX - TOOLTIP_WIDTH / 2));

    switch (position) {
        case 'bottom':
            return {
                left: clampedLeft,
                top: hole.y + hole.h + TOOLTIP_GAP,
                width: TOOLTIP_WIDTH,
            };
        case 'right':
            return {
                left: Math.min(vw - TOOLTIP_WIDTH - 12, hole.x + hole.w + TOOLTIP_GAP),
                top: Math.max(12, hole.y + hole.h / 2 - 60),
                width: TOOLTIP_WIDTH,
            };
        case 'left':
            return {
                left: Math.max(12, hole.x - TOOLTIP_WIDTH - TOOLTIP_GAP),
                top: Math.max(12, hole.y + hole.h / 2 - 60),
                width: TOOLTIP_WIDTH,
            };
        case 'top':
        default: {
            if (hole.y >= 140) {
                return {
                    left: clampedLeft,
                    top: Math.max(12, hole.y - TOOLTIP_GAP - 130),
                    width: TOOLTIP_WIDTH,
                };
            }
            return {
                left: clampedLeft,
                top: hole.y + hole.h + TOOLTIP_GAP,
                width: TOOLTIP_WIDTH,
            };
        }
    }
}

// ── 꼬리 방향 (툴팁 위치에서 타겟 방향) ──
function TailArrow({ tooltipStyle, hole }) {
    if (!hole) return null;

    const holeCenterX = hole.x + hole.w / 2;
    const tipTop = tooltipStyle.top;
    const holeCenterY = hole.y + hole.h / 2;

    // 툴팁이 hole 위에 있으면 꼬리 아래를 향함
    if (tipTop !== undefined && tipTop < hole.y) {
        const offsetX = Math.max(20, Math.min(TOOLTIP_WIDTH - 24, holeCenterX - tooltipStyle.left));
        return (
            <div
                className="absolute w-4 h-4 bg-white border-b-2 border-r-2 border-pink-100 rotate-45"
                style={{ bottom: -9, left: offsetX - 8 }}
            />
        );
    }

    // 툴팁이 hole 아래에 있으면 꼬리 위를 향함
    if (tipTop !== undefined && tipTop > holeCenterY) {
        const offsetX = Math.max(20, Math.min(TOOLTIP_WIDTH - 24, holeCenterX - tooltipStyle.left));
        return (
            <div
                className="absolute w-4 h-4 bg-white border-t-2 border-l-2 border-pink-100 rotate-45"
                style={{ top: -9, left: offsetX - 8 }}
            />
        );
    }

    return null;
}

const AppTour = () => {
    const { isTourActive, currentStep, advanceTour, endTour, canSkip } = useTour();
    const [targetRect, setTargetRect] = useState(null);

    // 투어 전체 페이드 인/아웃 라이프사이클
    const [shouldMount, setShouldMount] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);
    const hideTimerRef = useRef(null);

    // 시각 홀 통합 state:
    //   hole       — 현재 표시할 홀 (null = 숨김)
    //   lastPos    — 마지막으로 알려진 위치 (null일 때 제자리 닫힘용)
    //   slideEnabled — true면 위치+크기 동시 전환(슬라이드), false면 크기만 전환
    const [holeState, setHoleState] = useState({
        hole: null,
        lastPos: { x: 0, y: 0 },
        slideEnabled: false,
    });

    const updateRect = useCallback(() => {
        if (!isTourActive || !currentStep?.selector) {
            setTargetRect(null);
            return;
        }
        const el = document.querySelector(currentStep.selector);
        if (el) {
            const rect = el.getBoundingClientRect();
            setTargetRect({
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
            });
        } else {
            setTargetRect(null);
        }
    }, [isTourActive, currentStep]);

    // 타겟 요소 위치 추적 (초기 + 재시도 + resize)
    useEffect(() => {
        const retries = [0, 100, 300, 600, 1200, 2500];
        const timers = retries.map(ms => setTimeout(updateRect, ms));

        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect, true);

        return () => {
            timers.forEach(t => clearTimeout(t));
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect, true);
        };
    }, [updateRect]);

    // 타겟이 아직 DOM에 없을 때 MutationObserver로 동적 감지 (shard 등)
    useEffect(() => {
        if (!isTourActive || !currentStep?.selector || targetRect !== null) return;

        const observer = new MutationObserver(() => {
            const el = document.querySelector(currentStep.selector);
            if (el) updateRect();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [isTourActive, currentStep?.selector, targetRect, updateRect]);

    // 감정 조각 단계: 일정 시간 후에도 조각이 없으면 자동 진행
    useEffect(() => {
        if (!isTourActive || !currentStep?.autoAdvanceMs) return;
        const timer = setTimeout(() => {
            const el = document.querySelector(currentStep.selector);
            if (!el) advanceTour();
        }, currentStep.autoAdvanceMs);
        return () => clearTimeout(timer);
    }, [isTourActive, currentStep, advanceTour]);

    // targetRect → holeState 동기화
    // - 이전·현재 홀이 모두 보일 때: 슬라이드 (slideEnabled=true)
    // - 첫 등장 / 사라짐 / 재등장:   제자리 크기 전환 (slideEnabled=false)
    // setTimeout(0): React Compiler sync-setState-in-effect 경고 방지
    useEffect(() => {
        const t = setTimeout(() => {
            setHoleState(prev => {
                const newHole = targetRect
                    ? {
                        x: targetRect.left - SPOTLIGHT_PADDING,
                        y: targetRect.top - SPOTLIGHT_PADDING,
                        w: targetRect.width + SPOTLIGHT_PADDING * 2,
                        h: targetRect.height + SPOTLIGHT_PADDING * 2,
                    }
                    : null;
                const wasVisible = !!(prev.hole && prev.hole.w > 0 && prev.hole.h > 0);
                const willBeVisible = !!(newHole && newHole.w > 0 && newHole.h > 0);
                return {
                    hole: newHole,
                    lastPos: newHole ? { x: newHole.x, y: newHole.y } : prev.lastPos,
                    slideEnabled: wasVisible && willBeVisible,
                };
            });
        }, 0);
        return () => clearTimeout(t);
    }, [targetRect]);

    // 투어 시작/종료 시 페이드 인/아웃 + 마운트 관리
    useEffect(() => {
        if (isTourActive) {
            // 빠른 재시작 시 언마운트 타이머 취소 (투어 간 이음새 없이 전환)
            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
                hideTimerRef.current = null;
            }
            // setTimeout(0): React Compiler 경고 방지 (sync setState in effect)
            const timers = [
                setTimeout(() => setShouldMount(true), 0),
                setTimeout(() => setFadeIn(true), 30),
            ];
            return () => timers.forEach(t => clearTimeout(t));
        } else {
            // setTimeout(0): React Compiler 경고 방지 (sync setState in effect)
            const timers = [
                setTimeout(() => setFadeIn(false), 0),
                // 페이드아웃 완료 후 언마운트 (300ms 전환 + 20ms 여유)
                setTimeout(() => {
                    setShouldMount(false);
                    hideTimerRef.current = null;
                }, 320),
            ];
            hideTimerRef.current = timers[1];
            return () => timers.forEach(t => clearTimeout(t));
        }
    }, [isTourActive]);

    if (!shouldMount || !currentStep) return null;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 클릭 차단용 live hole (즉시 정확한 위치)
    const hole = targetRect
        ? {
            x: targetRect.left - SPOTLIGHT_PADDING,
            y: targetRect.top - SPOTLIGHT_PADDING,
            w: targetRect.width + SPOTLIGHT_PADDING * 2,
            h: targetRect.height + SPOTLIGHT_PADDING * 2,
        }
        : null;

    // holeState에서 시각 홀 값 추출
    const { hole: dh, lastPos, slideEnabled } = holeState;
    // null 폴백: lastPos로 제자리 닫힘 (중앙으로 날아가지 않음)
    const holeX = dh ? dh.x : lastPos.x;
    const holeY = dh ? dh.y : lastPos.y;
    const holeW = dh ? dh.w : 0;
    const holeH = dh ? dh.h : 0;
    const useFullTransition = slideEnabled;

    const tooltipStyle = computeTooltipStyle(hole, currentStep.tooltipPosition);

    return (
        <>
            {/* 어두운 오버레이 (SVG 마스크 + 페이드 인/아웃) */}
            <svg
                className="fixed inset-0 pointer-events-none"
                style={{
                    width: vw,
                    height: vh,
                    zIndex: 990,
                    opacity: fadeIn ? 1 : 0,
                    transition: 'opacity 300ms ease',
                }}
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <mask id="tour-spotlight-mask">
                        <rect x="0" y="0" width={vw} height={vh} fill="white" />
                        {/* CSS geometry로 스포트라이트 홀 전환
                            슬라이드: 이전·현재 홀이 모두 보일 때
                            제자리 크기 전환: 첫 등장·소멸 시 */}
                        <rect
                            rx={SPOTLIGHT_RADIUS}
                            fill="black"
                            style={{
                                x: `${holeX}px`,
                                y: `${holeY}px`,
                                width: `${holeW}px`,
                                height: `${holeH}px`,
                                transition: useFullTransition ? GEOM_TRANSITION : SIZE_TRANSITION,
                            }}
                        />
                    </mask>
                </defs>
                <rect
                    x="0" y="0"
                    width={vw} height={vh}
                    fill="rgba(0,0,0,0.68)"
                    mask="url(#tour-spotlight-mask)"
                />
            </svg>

            {/* 클릭 차단 오버레이 (live hole 사용 - 즉시 정확한 위치, z-992) */}
            {hole ? (
                <>
                    {/* 위쪽 */}
                    <div
                        className="fixed"
                        style={{ left: 0, top: 0, right: 0, height: hole.y, zIndex: 992 }}
                        onClick={e => { e.stopPropagation(); e.preventDefault(); }}
                    />
                    {/* 아래쪽 */}
                    <div
                        className="fixed"
                        style={{ left: 0, top: hole.y + hole.h, right: 0, bottom: 0, zIndex: 992 }}
                        onClick={e => { e.stopPropagation(); e.preventDefault(); }}
                    />
                    {/* 왼쪽 */}
                    <div
                        className="fixed"
                        style={{ left: 0, top: hole.y, width: hole.x, height: hole.h, zIndex: 992 }}
                        onClick={e => { e.stopPropagation(); e.preventDefault(); }}
                    />
                    {/* 오른쪽 */}
                    <div
                        className="fixed"
                        style={{ left: hole.x + hole.w, top: hole.y, right: 0, height: hole.h, zIndex: 992 }}
                        onClick={e => { e.stopPropagation(); e.preventDefault(); }}
                    />
                </>
            ) : (
                /* 타겟 없으면 전체 화면 차단 (blockWhenMissing: false 단계는 제외) */
                currentStep?.blockWhenMissing !== false && (
                    <div
                        className="fixed inset-0"
                        style={{ zIndex: 992 }}
                        onClick={e => { e.stopPropagation(); e.preventDefault(); }}
                    />
                )
            )}

            {/* 스포트라이트 테두리 글로우 (부드러운 위치/크기 전환) */}
            <div
                className="fixed pointer-events-none"
                style={{
                    left: holeX,
                    top: holeY,
                    width: holeW,
                    height: holeH,
                    zIndex: 991,
                    borderRadius: SPOTLIGHT_RADIUS,
                    border: '2px solid rgba(255,255,255,0.55)',
                    boxShadow: '0 0 20px rgba(255,255,255,0.2), inset 0 0 10px rgba(255,255,255,0.08)',
                    opacity: fadeIn && dh ? 1 : 0,
                    animation: fadeIn && dh ? 'tour-pulse 2s ease-in-out infinite' : 'none',
                    transition: useFullTransition ? POS_TRANSITION : SIZE_GLOW_TRANSITION,
                }}
            />

            {/* 말풍선 툴팁 (단계 전환마다 재애니메이션) */}
            <div
                key={currentStep.id}
                className="fixed"
                style={{
                    ...tooltipStyle,
                    zIndex: 995,
                    animation: 'tour-tooltip-in 0.3s ease both',
                }}
            >
                <div
                    className="relative bg-white rounded-2xl shadow-2xl p-4"
                    style={{ border: '2px solid rgba(255,181,194,0.5)' }}
                >
                    {/* 꼬리 */}
                    <TailArrow tooltipStyle={tooltipStyle} hole={hole} />

                    {/* 메시지 */}
                    <p
                        className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-3"
                        style={{ fontFamily: "'Jua', sans-serif" }}
                    >
                        {currentStep.message}
                    </p>

                    {/* 버튼 영역 */}
                    <div className="flex justify-between items-center">
                        {/* 좌: 테스트 모드에서 투어 전체 종료 */}
                        {canSkip ? (
                            <button
                                onClick={endTour}
                                className="text-xs text-gray-400 hover:text-gray-600 transition-colors active:scale-95"
                            >
                                투어 종료
                            </button>
                        ) : <span />}

                        {/* 우: 항상 단계 진행 버튼 (controlled = 건너뛰기, 아니면 다음/완료) */}
                        <button
                            onClick={advanceTour}
                            className="px-4 py-1.5 text-white text-xs font-bold rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all"
                            style={{
                                background: currentStep.controlled
                                    ? 'linear-gradient(135deg, #D1D5DB, #9CA3AF)'
                                    : 'linear-gradient(135deg, #FFB5C2, #FF8FAB)',
                                fontFamily: "'Jua', sans-serif",
                            }}
                        >
                            {currentStep.isLast ? '완료! 🎉' : currentStep.controlled ? '건너뛰기 →' : '다음 →'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 애니메이션 CSS */}
            <style>{`
                @keyframes tour-pulse {
                    0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.2), inset 0 0 10px rgba(255,255,255,0.08); }
                    50% { box-shadow: 0 0 30px rgba(255,255,255,0.35), inset 0 0 15px rgba(255,255,255,0.12); }
                }
                @keyframes tour-tooltip-in {
                    from { opacity: 0; transform: translateY(8px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0)   scale(1);    }
                }
            `}</style>
        </>
    );
};

export default AppTour;
