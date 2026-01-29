import React from 'react';

/**
 * CircularProgress — 세련된 미니멀 레벨 표시
 * 2030 여성 타겟: 깔끔하고 모던하게
 *
 * Props:
 *   level      {number} 현재 레벨
 *   percent    {number} 경험치 퍼센트 (0~100)
 */
const CircularProgressNew = ({ level = 1, percent = 0 }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const clampedPercent = Math.min(100, Math.max(0, percent));
    const offset = circumference - (clampedPercent / 100) * circumference;

    return (
        <div className="relative w-14 h-14" data-gtm="circular-level-hud">
            {/* 깔끔한 원형 컨테이너 */}
            <div className="relative w-full h-full rounded-full bg-white shadow-sm border border-gray-100">
                {/* 경험치 프로그레스 링 */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    {/* 배경 트랙 */}
                    <circle
                        cx="28"
                        cy="28"
                        r={radius}
                        stroke="#F0F0F0"
                        strokeWidth="3"
                        fill="transparent"
                    />
                    {/* 진행 링 - 세련된 Primary 색상 */}
                    <circle
                        cx="28"
                        cy="28"
                        r={radius}
                        stroke="#FF8FA3"
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-smooth"
                        style={{
                            transitionDuration: '0.6s'
                        }}
                    />
                </svg>

                {/* 중앙 레벨 숫자 */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-[#FF8FA3]">
                        {level}
                    </span>
                </div>

                {/* 하단 LV 배지 */}
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 bg-[#FF8FA3] text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold border border-white shadow-sm">
                    LV
                </div>
            </div>
        </div>
    );
};

export default CircularProgressNew;
