import React from 'react';

/**
 * CircularProgress — 미니멀 레벨 HUD
 * 2030 여성 타겟: 깔끔하고 단순하게
 *
 * Props:
 *   level      {number} 현재 레벨
 *   percent    {number} 경험치 퍼센트 (0~100)
 */
const CircularProgress = ({ level = 1, percent = 0 }) => {
    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    const clampedPercent = Math.min(100, Math.max(0, percent));
    const offset = circumference - (clampedPercent / 100) * circumference;

    return (
        <div className="relative w-16 h-16" data-gtm="circular-level-hud">
            {/* 깔끔한 원형 컨테이너 */}
            <div className="relative w-full h-full rounded-full bg-white shadow-[0_4px_16px_rgba(255,181,194,0.15)] border-[3px] border-white">
                {/* 경험치 프로그레스 링 */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    {/* 배경 트랙 */}
                    <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        stroke="#FFB5C2"
                        strokeWidth="4"
                        fill="transparent"
                        opacity="0.15"
                    />
                    {/* 진행 링 (단일 색상) */}
                    <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        stroke="#FFB5C2"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{
                            transition: 'stroke-dashoffset 0.6s ease-out'
                        }}
                    />
                </svg>

                {/* 중앙 레벨 숫자 (정확한 중앙 정렬) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#FFB5C2]" style={{ fontFamily: 'Pretendard, sans-serif' }}>
                        {level}
                    </span>
                </div>

                {/* 하단 LV 배지 */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#FFB5C2] text-white text-[9px] px-2 py-0.5 rounded-full font-bold border-2 border-white shadow-sm">
                    LV
                </div>
            </div>
        </div>
    );
};

export default CircularProgress;
