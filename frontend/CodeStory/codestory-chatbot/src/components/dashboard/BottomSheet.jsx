import React, { useState } from 'react';
import { usePet } from '../../context/PetContext';

/**
 * BottomSheet — want.html 디자인 기반 하단 패널
 *
 * 구성:
 * 1. 핸들바 (드래그 인디케이터)
 * 2. 4개 액션 버튼 (쓰다듬기, 환기, 잠자기, 홈)
 * 3. 채팅 입력창
 */

// 액션 버튼 컴포넌트
const ActionButton = ({ icon, label, value, onClick, isHome = false }) => {
    const [showPercent, setShowPercent] = useState(false);
    const [labelText, setLabelText] = useState(label);

    // 게이지 높이 (0~100%)
    const gaugeHeight = Math.min(100, Math.max(0, value));

    // 색상 로직 (want.html 기반)
    const getColor = () => {
        if (value < 20) return '#EF4444'; // Red
        if (value >= 100) return '#22C55E'; // Green
        return '#3B82F6'; // Blue
    };

    // 아이콘 색상 (게이지에 따라 변경)
    const getIconColor = () => {
        if (value < 20) return 'text-red-500';
        if (value >= 50) return 'text-white';
        return 'text-slate-500';
    };

    // 아이콘 애니메이션 (부족 시 깜빡임)
    const getIconAnimation = () => {
        if (value < 20) return 'animate-pulse';
        return '';
    };

    // 버튼 클릭 핸들러
    const handleClick = () => {
        if (!isHome && value < 100) {
            // 퍼센트 표시 (1.5초)
            setShowPercent(true);
            setLabelText(`${Math.round(value)}%`);

            setTimeout(() => {
                setShowPercent(false);
                setLabelText(label);
            }, 1500);
        }

        onClick?.();
    };

    return (
        <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={handleClick}>
            <button
                className={`w-16 h-16 bg-slate-100 rounded-2xl border-b-[6px] ${
                    isHome ? 'border-[#D97706] bg-[#FBBF24]' : 'border-[#0097AB]'
                } active:border-b-0 active:translate-y-[6px] transition-all relative overflow-hidden shadow-md ring-4 ring-white ${
                    isHome ? '' : 'border-2 border-t-[#00C4DE] border-l-[#00C4DE] border-r-[#00C4DE]'
                }`}
            >
                {/* 게이지 배경 (홈 버튼은 게이지 없음) */}
                {!isHome && (
                    <div
                        className="absolute bottom-0 left-0 w-full transition-all duration-300 ease-out"
                        style={{
                            height: `${gaugeHeight}%`,
                            backgroundColor: getColor(),
                            opacity: 1
                        }}
                    />
                )}

                {/* 아이콘 */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <span
                        className={`text-2xl drop-shadow-sm transition-colors ${
                            isHome ? 'text-white' : getIconColor()
                        } ${getIconAnimation()}`}
                    >
                        {icon}
                    </span>
                </div>
            </button>

            {/* 라벨 */}
            <span
                className={`text-[11px] font-bold transition-all ${
                    showPercent ? 'text-[#00C4DE]' : 'text-gray-500'
                }`}
            >
                {labelText}
            </span>
        </div>
    );
};

const BottomSheet = ({ onWrite, onCalendarClick, onVentilateClick }) => {
    const [input, setInput] = useState('');
    const { affectionGauge, airGauge, energyGauge } = usePet();

    const handleSubmit = () => {
        if (!input.trim()) return;
        onWrite(input);
        setInput('');
    };

    return (
        <div
            className="absolute bottom-0 w-full z-50 bg-white/90 backdrop-blur-xl border-t border-white/60 rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pt-4 pb-8 px-6 flex flex-col justify-end"
            data-gtm="bottomsheet-container"
            style={{ paddingBottom: 'max(2rem, calc(1rem + env(safe-area-inset-bottom)))' }}
        >
            {/* 핸들바 */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>

            {/* 액션 버튼 그룹 */}
            <div className="flex justify-between items-end gap-2 mb-6 px-1" data-gtm="action-buttons">
                <ActionButton
                    icon="🤚"
                    label="쓰다듬기"
                    value={affectionGauge}
                    onClick={() => {}} // 드래그 인터랙션은 RubbingOverlay에서
                />
                <ActionButton
                    icon="💨"
                    label="환기"
                    value={airGauge}
                    onClick={onVentilateClick}
                />
                <ActionButton
                    icon="🌙"
                    label="잠자기"
                    value={energyGauge}
                    onClick={() => console.log('🌙 잠자기 기능 (구현 예정)')}
                />
                <ActionButton
                    icon="🏠"
                    label="홈"
                    value={100}
                    onClick={onCalendarClick}
                    isHome={true}
                />
            </div>

            {/* 채팅 입력창 */}
            <div
                className="relative flex items-center bg-gray-50 rounded-[24px] border border-gray-200 shadow-inner group focus-within:ring-2 focus-within:ring-[#00C4DE] transition-all focus-within:bg-white"
                data-gtm="chat-input-area"
            >
                <div className="pl-4 pr-2 text-xl grayscale opacity-50">✏️</div>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="오늘의 마음 한 줄..."
                    className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 h-14 text-sm font-bold"
                    data-gtm="chat-input-field"
                />
                <button
                    onClick={handleSubmit}
                    className="m-2 w-10 h-10 bg-[#00C4DE] rounded-full text-white shadow-md active:scale-95 transition-transform flex items-center justify-center hover:bg-[#00B4CE]"
                    data-gtm="chat-submit-button"
                >
                    ↑
                </button>
            </div>
        </div>
    );
};

export default BottomSheet;