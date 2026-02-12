import React, { useState, useMemo } from 'react';
import { FaFaceSmile, FaFaceMeh, FaFaceFrown, FaFaceSadTear, FaFaceGrinBeam } from 'react-icons/fa6';
import { useStore } from '../../context/StoreContext';

/**
 * MoodSlider - 몽글이 표정 변화 슬라이더 (Mongle Pastel Theme)
 *
 * 0(아주 나쁨) ~ 100(아주 좋음) 구간을 선택하는 슬라이더
 * 슬라이더 위치에 따라 FontAwesome 아이콘 표정이 변합니다
 */
const MoodSlider = ({ value = 50, onChange }) => {
    const [isDragging, setIsDragging] = useState(false);

    const { equippedItems, getEquippedItem } = useStore();
    const theme = useMemo(() => getEquippedItem('theme'), [equippedItems, getEquippedItem]);

    const accentColor = theme?.accentColor || '#FFB5C2';
    const buttonColor = theme?.buttonColor || '#FF9AAB';
    const primaryColor = theme?.decorationColors?.primary || '#FFD4DC';

    // 점수에 따른 FontAwesome 아이콘 결정
    const getMoodIcon = (score) => {
        if (score >= 80) return <FaFaceGrinBeam style={{ color: accentColor }} />; // 아주 좋음
        if (score >= 60) return <FaFaceSmile className="text-[#FFD4A5]" />; // 좋음
        if (score >= 40) return <FaFaceMeh className="text-gray-400" />; // 보통
        if (score >= 20) return <FaFaceFrown className="text-blue-300" />; // 나쁨
        return <FaFaceSadTear className="text-blue-400" />; // 아주 나쁨
    };

    // 점수에 따른 슬라이더 그라디언트 색상
    const getSliderGradient = (score) => {
        if (score >= 80) return `linear-gradient(to right, ${accentColor}, ${buttonColor})`;
        if (score >= 60) return `linear-gradient(to right, #FFD4A5, ${accentColor})`;
        if (score >= 40) return 'linear-gradient(to right, #E5E7EB, #FFD4A5)';
        if (score >= 20) return 'linear-gradient(to right, #BFDBFE, #E5E7EB)';
        return 'linear-gradient(to right, #93C5FD, #BFDBFE)';
    };

    // 점수에 따른 메시지
    const getMoodMessage = (score) => {
        if (score >= 80) return '정말 행복한 하루였나봐요';
        if (score >= 60) return '좋은 하루를 보내셨네요';
        if (score >= 40) return '평범한 하루였군요';
        if (score >= 20) return '조금 힘든 하루였나요';
        return '많이 힘들었나봐요... 괜찮아요';
    };

    return (
        <div className="w-full" data-gtm="mood-slider-container">
            {/* 헤더 (Jua 폰트) */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-cute text-gray-600">오늘 하루는 어땠나요?</h3>
                <div
                    className="flex items-center gap-2 bg-white backdrop-blur-sm px-3 py-1.5 rounded-full border"
                    style={{ borderColor: `${primaryColor}66` }}
                >
                    <div className="text-xl">{getMoodIcon(value)}</div>
                    <span className="text-sm font-cute" style={{ color: accentColor }}>{value}점</span>
                </div>
            </div>

            {/* 슬라이더 */}
            <div className="relative mb-4">
                {/* 슬라이더 배경 트랙 (흰색 배경) */}
                <div
                    className="relative h-2 bg-white rounded-full overflow-hidden border"
                    style={{ borderColor: `${primaryColor}4D` }}
                >
                    {/* 진행 바 */}
                    <div
                        className="absolute top-0 left-0 h-full transition-all duration-300 rounded-full"
                        style={{
                            width: `${value}%`,
                            background: getSliderGradient(value)
                        }}
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
                    className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
                    data-gtm="mood-slider-input"
                />

                {/* 몽글이 핸들 (Thumb) - 심플한 원형 */}
                <div
                    className={`absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-sm border-2 flex items-center justify-center text-xl transition-transform duration-200 ${
                        isDragging ? 'scale-110' : 'scale-100'
                    }`}
                    style={{
                        left: `calc(${value}% - 20px)`,
                        pointerEvents: 'none',
                        borderColor: `${primaryColor}99`
                    }}
                >
                    {getMoodIcon(value)}
                </div>
            </div>

            {/* 레이블 (FontAwesome 아이콘) */}
            <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                <div className="flex items-center gap-1">
                    <FaFaceSadTear />
                    <span className="font-cute">아주 나쁨</span>
                </div>
                <div className="flex items-center gap-1">
                    <FaFaceMeh />
                    <span className="font-cute">보통</span>
                </div>
                <div className="flex items-center gap-1">
                    <FaFaceGrinBeam />
                    <span className="font-cute">아주 좋음</span>
                </div>
            </div>

            {/* 메시지 */}
            <div className="text-center mt-4">
                <p className="text-xs text-gray-500 font-cute animate-fade-in">
                    {getMoodMessage(value)}
                </p>
            </div>
        </div>
    );
};

export default MoodSlider;
