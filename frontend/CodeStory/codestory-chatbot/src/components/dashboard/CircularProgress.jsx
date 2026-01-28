import React from 'react';
import { format } from 'date-fns';

/**
 * CircularProgress — 원형 레벨 HUD (좌측 상단)
 *
 * Props:
 *   level      {number} 현재 레벨
 *   percent    {number} 경험치 퍼센트 (0~100)
 */
const CircularProgress = ({ level = 1, percent = 0 }) => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius; // ~175.9
    const clampedPercent = Math.min(100, Math.max(0, percent));
    const offset = circumference - (clampedPercent / 100) * circumference;

    // 날짜 포맷: "28 Wed"
    const today = new Date();
    const dayNum = format(today, 'd');
    const dayName = format(today, 'EEE');

    return (
        <div
            className="absolute top-6 left-6 z-50 flex flex-col items-center"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }}
            data-gtm="circular-level-hud"
        >
            {/* 원형 게이지 SVG */}
            <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
                {/* 배경 원 (TrackRing) */}
                <circle
                    cx="36"
                    cy="36"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="6"
                />
                {/* 진행 원 (ProgressRing) — Yellow→Green 그라디언트 */}
                <defs>
                    <linearGradient id="expGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#F9D71C" />
                        <stop offset="100%" stopColor="#4CAF50" />
                    </linearGradient>
                </defs>
                <circle
                    cx="36"
                    cy="36"
                    r={radius}
                    fill="none"
                    stroke="url(#expGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
            </svg>

            {/* 중앙 레벨 텍스트 (SVG 위에 overlay) */}
            <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ top: 0, left: 0, width: 72, height: 72 }}
            >
                <span className="text-base font-extrabold text-stone-700" style={{ letterSpacing: '-0.5px' }}>
                    Lv.{level}
                </span>
            </div>

            {/* 날짜 텍스트 */}
            <span className="mt-1 text-[10px] font-bold text-stone-400 tracking-wide">
                {dayNum} {dayName}
            </span>
        </div>
    );
};

export default CircularProgress;
