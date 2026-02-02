import React, { useState } from 'react';

/**
 * MoodSlider - 몽글이 표정 변화 슬라이더
 *
 * 0(아주 나쁨) ~ 100(아주 좋음) 구간을 선택하는 슬라이더
 * 슬라이더 위치에 따라 몽글이 표정이 변합니다
 */
const MoodSlider = ({ value = 50, onChange }) => {
    const [isDragging, setIsDragging] = useState(false);

    // 점수에 따른 몽글이 표정 결정
    const getMoodEmoji = (score) => {
        if (score >= 80) return '😄'; // 아주 좋음
        if (score >= 60) return '😊'; // 좋음
        if (score >= 40) return '😐'; // 보통
        if (score >= 20) return '😔'; // 나쁨
        return '😢'; // 아주 나쁨
    };

    // 점수에 따른 색상 그라디언트
    const getSliderColor = (score) => {
        if (score >= 80) return 'from-pink-400 to-pink-500';
        if (score >= 60) return 'from-yellow-300 to-pink-400';
        if (score >= 40) return 'from-gray-300 to-yellow-300';
        if (score >= 20) return 'from-blue-300 to-gray-300';
        return 'from-blue-500 to-blue-400';
    };

    // 점수에 따른 메시지
    const getMoodMessage = (score) => {
        if (score >= 80) return '정말 행복한 하루였나봐요! ✨';
        if (score >= 60) return '좋은 하루를 보내셨네요! 🌸';
        if (score >= 40) return '평범한 하루였군요 🍃';
        if (score >= 20) return '조금 힘든 하루였나요? 💙';
        return '많이 힘들었나봐요... 괜찮아요 🫂';
    };

    return (
        <div className="w-full" data-gtm="mood-slider-container">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-700">오늘 하루는 어땠나요?</h3>
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-[#FFD4DC]/40">
                    <span className="text-2xl">{getMoodEmoji(value)}</span>
                    <span className="text-xl font-bold text-[#FFB5C2]">{value}</span>
                </div>
            </div>

            {/* 슬라이더 */}
            <div className="relative mb-4">
                {/* 슬라이더 배경 트랙 */}
                <div className="relative h-3 bg-white/40 rounded-full overflow-hidden border border-[#FFD4DC]/30">
                    {/* 진행 바 */}
                    <div
                        className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getSliderColor(value)} transition-all duration-300`}
                        style={{ width: `${value}%` }}
                    />
                </div>

                {/* 슬라이더 인풋 (투명) */}
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onTouchStart={() => setIsDragging(true)}
                    onTouchEnd={() => setIsDragging(false)}
                    className="absolute top-0 left-0 w-full h-3 opacity-0 cursor-pointer"
                    data-gtm="mood-slider-input"
                />

                {/* 몽글이 핸들 (Thumb) */}
                <div
                    className={`absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg border-3 border-[#FFB5C2] flex items-center justify-center text-2xl transition-transform duration-200 ${
                        isDragging ? 'scale-125' : 'scale-100'
                    }`}
                    style={{
                        left: `calc(${value}% - 24px)`,
                        pointerEvents: 'none'
                    }}
                >
                    {getMoodEmoji(value)}
                </div>
            </div>

            {/* 레이블 */}
            <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>😢 아주 나쁨</span>
                <span>😐 보통</span>
                <span>😄 아주 좋음</span>
            </div>

            {/* 메시지 */}
            <div className="text-center mt-4">
                <p className="text-sm text-gray-600 font-medium animate-fade-in">
                    {getMoodMessage(value)}
                </p>
            </div>
        </div>
    );
};

export default MoodSlider;
