import React from 'react';
import { FaHandSparkles, FaUtensils, FaMoon } from 'react-icons/fa';
import { usePet } from '../../context/PetContext';

/**
 * BottomControlBar — 다마고치 스타일 하단 컨트롤 바
 *
 * 3개의 정사각형 아이콘 버튼으로 게이지를 시각화합니다.
 * - 텍스트 제거, 아이콘만 표시
 * - 버튼 내부 배경색이 게이지 역할 (하단에서 위로 채워짐)
 * - 색상 로직:
 *   - Warning (<20%): Red + 흔들림
 *   - Normal (>=20%): Blue (몽글이 테마색)
 *   - Full (100%): Green + 반짝임
 */

const ControlButton = ({ icon, value, locked, onClick, gtmKey }) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    // 색상 로직
    const getColor = () => {
        if (clampedValue >= 100) return 'bg-green-400';
        if (clampedValue < 20) return 'bg-red-400';
        return 'bg-blue-400'; // 몽글이 테마색
    };

    // 애니메이션 로직
    const getAnimation = () => {
        if (clampedValue >= 100) return 'animate-pulse'; // 반짝임
        if (clampedValue < 20) return 'animate-shake'; // 흔들림
        return '';
    };

    return (
        <button
            onClick={onClick}
            className={`relative w-20 h-20 bg-white border-4 border-gray-200 rounded-2xl overflow-hidden shadow-lg active:scale-95 transition-transform ${getAnimation()}`}
            data-gtm={gtmKey}
        >
            {/* 게이지 배경 (하단에서 위로 채워짐) */}
            <div
                className={`absolute bottom-0 left-0 w-full transition-all duration-300 ${getColor()}`}
                style={{ height: `${clampedValue}%` }}
            />

            {/* 아이콘 (중앙 배치) */}
            <div className="absolute inset-0 flex items-center justify-center z-10 text-2xl drop-shadow-sm text-gray-600">
                {icon}
            </div>

            {/* Lock 배지 */}
            {locked && (
                <div className="absolute top-1 right-1 text-[8px] font-bold text-white bg-amber-500 px-1.5 py-0.5 rounded-full z-20">
                    Full
                </div>
            )}
        </button>
    );
};

const BottomControlBar = ({ onSleepClick, onFeedClick }) => {
    const {
        affectionGauge,
        hungerGauge,
        sleepGauge,
        isAffectionLocked,
    } = usePet();

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center items-center gap-4 pb-8 pt-4 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none"
            data-gtm="bottom-control-bar"
            style={{ paddingBottom: 'max(2rem, calc(1rem + env(safe-area-inset-bottom)))' }}
        >
            <div className="flex gap-4 pointer-events-auto">
                {/* 쓰다듬기 버튼 (게이지만 표시, 상호작용은 RubbingOverlay에서) */}
                <ControlButton
                    icon={<FaHandSparkles />}
                    value={affectionGauge}
                    locked={isAffectionLocked}
                    onClick={() => {}} // 비활성 (드래그 인터랙션)
                    gtmKey="control-button-affection"
                />

                {/* 식사 버튼 */}
                <ControlButton
                    icon={<FaUtensils />}
                    value={hungerGauge}
                    locked={hungerGauge >= 100}
                    onClick={onFeedClick}
                    gtmKey="control-button-hunger"
                />

                {/* 수면 버튼 */}
                <ControlButton
                    icon={<FaMoon />}
                    value={sleepGauge}
                    locked={false}
                    onClick={onSleepClick}
                    gtmKey="control-button-sleep"
                />
            </div>
        </div>
    );
};

export default BottomControlBar;
