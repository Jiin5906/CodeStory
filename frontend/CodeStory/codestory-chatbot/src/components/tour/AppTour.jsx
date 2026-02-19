import React, { useState, useEffect, useCallback } from 'react';
import { useTour } from '../../context/TourContext';

const SPOTLIGHT_PADDING = 10;
const SPOTLIGHT_RADIUS = 14;
const TOOLTIP_WIDTH = 272;
const TOOLTIP_GAP = 14;

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
            // 위에 공간 충분하면 위, 아니면 아래
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
    const { isTourActive, currentStep, advanceTour, endTour } = useTour();
    const [targetRect, setTargetRect] = useState(null);

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

    // 감정 조각 단계: 일정 시간 후에도 조각이 없으면 자동 진행
    useEffect(() => {
        if (!isTourActive || !currentStep?.autoAdvanceMs) return;
        const timer = setTimeout(() => {
            const el = document.querySelector(currentStep.selector);
            if (!el) advanceTour();
        }, currentStep.autoAdvanceMs);
        return () => clearTimeout(timer);
    }, [isTourActive, currentStep, advanceTour]);

    if (!isTourActive || !currentStep) return null;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 스포트라이트 홀 계산
    const hole = targetRect
        ? {
            x: targetRect.left - SPOTLIGHT_PADDING,
            y: targetRect.top - SPOTLIGHT_PADDING,
            w: targetRect.width + SPOTLIGHT_PADDING * 2,
            h: targetRect.height + SPOTLIGHT_PADDING * 2,
        }
        : null;

    const tooltipStyle = computeTooltipStyle(hole, currentStep.tooltipPosition);

    return (
        <>
            {/* 어두운 오버레이 (SVG 마스크 스포트라이트) */}
            <svg
                className="fixed inset-0 pointer-events-none"
                style={{ width: vw, height: vh, zIndex: 990 }}
                xmlns="http://www.w3.org/2000/svg"
            >
                {hole ? (
                    <>
                        <defs>
                            <mask id="tour-spotlight-mask">
                                <rect x="0" y="0" width={vw} height={vh} fill="white" />
                                <rect
                                    x={hole.x}
                                    y={hole.y}
                                    width={hole.w}
                                    height={hole.h}
                                    rx={SPOTLIGHT_RADIUS}
                                    fill="black"
                                />
                            </mask>
                        </defs>
                        <rect
                            x="0" y="0"
                            width={vw} height={vh}
                            fill="rgba(0,0,0,0.68)"
                            mask="url(#tour-spotlight-mask)"
                        />
                    </>
                ) : (
                    <rect x="0" y="0" width={vw} height={vh} fill="rgba(0,0,0,0.68)" />
                )}
            </svg>

            {/* 스포트라이트 테두리 글로우 */}
            {hole && (
                <div
                    className="fixed pointer-events-none"
                    style={{
                        left: hole.x,
                        top: hole.y,
                        width: hole.w,
                        height: hole.h,
                        zIndex: 991,
                        borderRadius: SPOTLIGHT_RADIUS,
                        border: '2px solid rgba(255,255,255,0.55)',
                        boxShadow: '0 0 20px rgba(255,255,255,0.2), inset 0 0 10px rgba(255,255,255,0.08)',
                        animation: 'tour-pulse 2s ease-in-out infinite',
                    }}
                />
            )}

            {/* 말풍선 툴팁 */}
            <div
                className="fixed"
                style={{ ...tooltipStyle, zIndex: 995 }}
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
                        <button
                            onClick={endTour}
                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors active:scale-95"
                        >
                            건너뛰기
                        </button>

                        {!currentStep.controlled && (
                            <button
                                onClick={advanceTour}
                                className="px-4 py-1.5 text-white text-xs font-bold rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all"
                                style={{
                                    background: 'linear-gradient(135deg, #FFB5C2, #FF8FAB)',
                                    fontFamily: "'Jua', sans-serif",
                                }}
                            >
                                {currentStep.isLast ? '완료! 🎉' : '다음 →'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 스포트라이트 펄스 애니메이션 CSS */}
            <style>{`
                @keyframes tour-pulse {
                    0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.2), inset 0 0 10px rgba(255,255,255,0.08); }
                    50% { box-shadow: 0 0 30px rgba(255,255,255,0.35), inset 0 0 15px rgba(255,255,255,0.12); }
                }
            `}</style>
        </>
    );
};

export default AppTour;
