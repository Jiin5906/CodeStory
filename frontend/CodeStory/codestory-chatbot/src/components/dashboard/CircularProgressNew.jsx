import React from 'react';

/**
 * CircularProgress — 따뜻한 감성 레벨 표시
 * 공감일기: 따뜻하고 친근하게
 *
 * Props:
 *   level      {number} 현재 레벨
 *   percent    {number} 경험치 퍼센트 (0~100)
 */
const CircularProgressNew = ({ level = 1, percent = 0 }) => {
    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    const clampedPercent = Math.min(100, Math.max(0, percent));
    const offset = circumference - (clampedPercent / 100) * circumference;

    return (
        <div className="relative w-16 h-16" data-gtm="circular-level-hud">
            {/* 따뜻한 원형 컨테이너 */}
            <div className="relative w-full h-full rounded-full bg-white shadow-lg border-2 border-white">
                {/* 경험치 프로그레스 링 */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    {/* 배경 트랙 */}
                    <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        stroke="#FFD4DC"
                        strokeWidth="4"
                        fill="transparent"
                        opacity="0.3"
                    />
                    {/* 진행 링 - 따뜻한 피치 색상 */}
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
                        className="transition-all duration-600"
                    />
                </svg>

                {/* 중앙 레벨 숫자 */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#FFB5C2]">
                        {level}
                    </span>
                </div>

                {/* 하단 LV 배지 */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FFB5C2] to-[#FF9AAB] text-white text-[9px] px-2 py-0.5 rounded-full font-bold border-2 border-white shadow-md">
                    LV
                </div>
            </div>
        </div>
    );
};

export default CircularProgressNew;
