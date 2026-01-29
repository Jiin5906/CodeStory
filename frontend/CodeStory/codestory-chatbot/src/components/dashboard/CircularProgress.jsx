import React from 'react';

/**
 * CircularProgress — 원형 레벨 HUD (좌측 상단)
 * want.html 디자인 기반: 큰 원형 테두리 + 중앙 레벨 숫자 + 하단 LV 배지
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

    return (
        <div className="relative w-16 h-16" data-gtm="circular-level-hud">
            {/* 외부 원형 테두리 (흰색 배경) */}
            <div className="absolute inset-0 rounded-full border-[6px] border-[#00C4DE] bg-white shadow-lg"></div>

            {/* 경험치 프로그레스 링 */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90 scale-90">
                {/* 배경 트랙 */}
                <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="#eee"
                    strokeWidth="8"
                    fill="transparent"
                />
                {/* 진행 링 */}
                <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="#00C4DE"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
            </svg>

            {/* 중앙 레벨 숫자 */}
            <div className="absolute inset-0 flex items-center justify-center pt-1">
                <span className="text-2xl font-black text-[#00C4DE] drop-shadow-sm" style={{ fontFamily: 'Jua, sans-serif' }}>
                    {level}
                </span>
            </div>

            {/* 하단 LV 배지 */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#00C4DE] text-white text-[10px] px-2 rounded-full font-bold border-2 border-white">
                LV
            </div>
        </div>
    );
};

export default CircularProgress;
