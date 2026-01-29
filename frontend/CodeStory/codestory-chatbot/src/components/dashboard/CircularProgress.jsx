import React from 'react';

/**
 * CircularProgress — 감성 원형 레벨 HUD
 * 2030 여성 타겟 디자인: 부드러운 그라디언트 + 손글씨 폰트
 *
 * Props:
 *   level      {number} 현재 레벨
 *   percent    {number} 경험치 퍼센트 (0~100)
 */
const CircularProgress = ({ level = 1, percent = 0 }) => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const clampedPercent = Math.min(100, Math.max(0, percent));
    const offset = circumference - (clampedPercent / 100) * circumference;

    return (
        <div className="relative w-20 h-20 hover-wiggle cursor-pointer" data-gtm="circular-level-hud">
            {/* 외부 글로우 효과 */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFB5C2]/30 to-[#D4A5F5]/30 blur-xl animate-pulse"></div>

            {/* 메인 원형 컨테이너 */}
            <div
                className="relative w-full h-full rounded-full bg-white shadow-[0_8px_24px_rgba(212,165,245,0.2)] border-[4px] border-white"
                style={{
                    borderRadius: '50% 48% 50% 49%' // 손그림 느낌
                }}
            >
                {/* 경험치 프로그레스 링 */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    {/* 배경 트랙 */}
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke="url(#bgGradient)"
                        strokeWidth="6"
                        fill="transparent"
                        opacity="0.2"
                    />
                    {/* 진행 링 (그라디언트) */}
                    <defs>
                        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFB5C2" />
                            <stop offset="100%" stopColor="#D4A5F5" />
                        </linearGradient>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFB5C2" />
                            <stop offset="50%" stopColor="#D4A5F5" />
                            <stop offset="100%" stopColor="#A8E6CF" />
                        </linearGradient>
                    </defs>
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke="url(#progressGradient)"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{
                            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            filter: 'drop-shadow(0 2px 4px rgba(212,165,245,0.3))'
                        }}
                    />
                </svg>

                {/* 중앙 레벨 숫자 */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-handwriting bg-gradient-to-br from-[#FFB5C2] to-[#D4A5F5] bg-clip-text text-transparent drop-shadow-sm">
                        {level}
                    </span>
                </div>

                {/* 하단 LV 배지 (손그림 느낌) */}
                <div
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FFB5C2] to-[#D4A5F5] text-white text-[9px] px-2.5 py-0.5 font-handwriting shadow-[0_2px_8px_rgba(212,165,245,0.4)] border-2 border-white"
                    style={{
                        borderRadius: '12px 8px 10px 9px' // 손그림 느낌
                    }}
                >
                    LV
                </div>

                {/* 반짝임 효과 */}
                {clampedPercent > 80 && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 to-transparent animate-sparkle pointer-events-none"></div>
                )}
            </div>
        </div>
    );
};

export default CircularProgress;
