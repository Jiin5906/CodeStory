import React from 'react';
import { usePet } from '../../context/PetContext';

/**
 * MoodLight — 무드등 컴포넌트
 *
 * 무드등을 켜면 몽글이가 깨어나고, 끄면 잠듭니다.
 * - ON: 몽글이 깨어남
 * - OFF: 몽글이 수면 (화면 어두워짐)
 */
const MoodLight = () => {
    const { moodLightOn, toggleMoodLight } = usePet();

    return (
        <div
            className="fixed top-20 right-6 z-30 flex flex-col items-center gap-2"
            data-gtm="mood-light-container"
        >
            {/* 무드등 버튼 */}
            <button
                onClick={toggleMoodLight}
                className={`
                    relative w-16 h-16 rounded-full shadow-lg transition-all duration-500
                    ${moodLightOn
                        ? 'bg-yellow-300 hover:bg-yellow-400 animate-pulse shadow-yellow-400/50'
                        : 'bg-gray-700 hover:bg-gray-600 shadow-gray-900/50'
                    }
                    active:scale-95 border-4 border-white/50
                `}
                data-gtm="mood-light-button"
            >
                {/* 전구 아이콘 */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {moodLightOn ? (
                        <span className="text-3xl drop-shadow-lg">💡</span>
                    ) : (
                        <span className="text-3xl drop-shadow-lg opacity-50">🌙</span>
                    )}
                </div>

                {/* 빛 효과 (ON일 때만) */}
                {moodLightOn && (
                    <div className="absolute inset-0 bg-yellow-200 rounded-full blur-xl opacity-60 -z-10 animate-pulse"></div>
                )}
            </button>

            {/* 상태 라벨 */}
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                moodLightOn
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-200 text-gray-600'
            }`}>
                {moodLightOn ? '켜짐' : '꺼짐'}
            </span>
        </div>
    );
};

export default MoodLight;
