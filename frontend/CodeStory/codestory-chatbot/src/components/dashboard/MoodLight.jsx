import React from 'react';
import { usePet } from '../../context/PetContext';

/**
 * MoodLight — 무드등 컴포넌트 (좌측 하단 배치)
 *
 * 무드등을 켜면 몽글이가 깨어나고, 끄면 잠듭니다.
 * - ON: 몽글이 깨어남, 따뜻한 빛 발산
 * - OFF: 몽글이 수면 (화면 어두워짐)
 */
const MoodLight = () => {
    const { moodLightOn, toggleMoodLight } = usePet();

    return (
        <div
            className="absolute bottom-[26%] left-[8%] z-25 flex flex-col items-center gap-1 pointer-events-auto"
            data-gtm="mood-light-container"
        >
            {/* 무드등 디자인 */}
            <button
                onClick={toggleMoodLight}
                className="relative w-14 h-20 cursor-pointer transition-all duration-500 active:scale-95 group"
                data-gtm="mood-light-button"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
            >
                {/* 무드등 받침대 (하단) */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-gradient-to-b from-[#8B6F47] to-[#6B5537] rounded-b-lg"
                    style={{
                        boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2)'
                    }}
                ></div>

                {/* 무드등 몸통 (중앙) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-12 bg-gradient-to-b from-[#D7B896] to-[#C5A880] rounded-md"
                    style={{
                        boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)'
                    }}
                >
                    {/* 무드등 빛 영역 (상단) */}
                    <div className={`absolute top-0 left-0 right-0 h-8 rounded-t-md transition-all duration-500 ${
                        moodLightOn
                            ? 'bg-gradient-to-b from-[#FFD700] to-[#FFA500] opacity-100'
                            : 'bg-gradient-to-b from-gray-400 to-gray-500 opacity-30'
                    }`}
                        style={{
                            boxShadow: moodLightOn
                                ? 'inset 0 2px 8px rgba(255,255,255,0.6), 0 0 20px rgba(255,215,0,0.6)'
                                : 'inset 0 2px 4px rgba(255,255,255,0.2)'
                        }}
                    ></div>

                    {/* 전원 버튼 표시 */}
                    <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full transition-all duration-300 ${
                        moodLightOn
                            ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]'
                            : 'bg-gray-600'
                    }`}></div>
                </div>

                {/* 빛 효과 (ON일 때만) */}
                {moodLightOn && (
                    <>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-yellow-300 rounded-full blur-2xl opacity-40 -z-10 animate-pulse"
                            style={{ animationDuration: '2s' }}
                        ></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-yellow-200 rounded-full blur-xl opacity-50 -z-10 animate-pulse"
                            style={{ animationDuration: '1.5s' }}
                        ></div>
                    </>
                )}

                {/* 호버 효과 */}
                <div className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
                    }}
                ></div>
            </button>
        </div>
    );
};

export default MoodLight;
