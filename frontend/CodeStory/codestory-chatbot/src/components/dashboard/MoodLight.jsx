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
            className="absolute bottom-[26%] left-[6%] z-25 flex flex-col items-center gap-1 pointer-events-auto"
            data-gtm="mood-light-container"
        >
            {/* 플로어 램프 디자인 */}
            <button
                onClick={toggleMoodLight}
                className="relative w-16 h-40 cursor-pointer transition-all duration-500 active:scale-98 group"
                data-gtm="mood-light-button"
                style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.25))' }}
            >
                {/* 받침대 (하단 - 원형 베이스) */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-3 bg-gradient-to-b from-[#2C2C2C] to-[#1A1A1A] rounded-full"
                    style={{
                        boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1)'
                    }}
                ></div>

                {/* 스탠드 (긴 검은색 기둥) */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-32 bg-gradient-to-r from-[#2C2C2C] via-[#3A3A3A] to-[#2C2C2C] rounded-full"
                    style={{
                        boxShadow: 'inset 1px 0 2px rgba(255,255,255,0.15), inset -1px 0 2px rgba(0,0,0,0.3), 2px 0 4px rgba(0,0,0,0.2)'
                    }}
                ></div>

                {/* 상단 연결부 */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-gradient-to-b from-[#3A3A3A] to-[#2C2C2C] rounded-full"
                    style={{
                        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)'
                    }}
                ></div>

                {/* 전구 갓 (상단 - 둥근 형태) */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full transition-all duration-700 ${
                    moodLightOn
                        ? 'bg-gradient-radial from-[#FFF8DC] via-[#FFE4B5] to-[#DEB887]'
                        : 'bg-gradient-radial from-[#E8E8E8] via-[#D0D0D0] to-[#B8B8B8]'
                }`}
                    style={{
                        boxShadow: moodLightOn
                            ? 'inset 0 -2px 8px rgba(255,255,255,0.6), inset 0 2px 6px rgba(210,180,140,0.4), 0 0 30px rgba(255,248,220,0.6), 0 0 60px rgba(255,228,181,0.4)'
                            : 'inset 0 -2px 6px rgba(255,255,255,0.3), inset 0 2px 4px rgba(0,0,0,0.2)',
                        opacity: moodLightOn ? 1 : 0.6
                    }}
                >
                    {/* 갓 내부 빛 반사 */}
                    <div className={`absolute top-2 left-1/2 -translate-x-1/2 w-8 h-4 rounded-full blur-sm transition-opacity duration-700 ${
                        moodLightOn ? 'opacity-70' : 'opacity-20'
                    }`}
                        style={{
                            background: moodLightOn
                                ? 'radial-gradient(ellipse, rgba(255,255,255,0.8) 0%, transparent 70%)'
                                : 'radial-gradient(ellipse, rgba(255,255,255,0.3) 0%, transparent 70%)'
                        }}
                    ></div>

                    {/* 갓 테두리 라인 */}
                    <div className="absolute inset-0 rounded-full"
                        style={{
                            border: '1px solid rgba(0,0,0,0.1)',
                            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)'
                        }}
                    ></div>
                </div>

                {/* 전구 내부 (갓 속) */}
                <div className={`absolute top-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full transition-all duration-700 ${
                    moodLightOn
                        ? 'bg-gradient-radial from-white via-[#FFFACD] to-transparent opacity-90'
                        : 'bg-gradient-radial from-gray-300 via-gray-400 to-transparent opacity-40'
                }`}
                    style={{
                        boxShadow: moodLightOn
                            ? '0 0 20px rgba(255,250,205,0.8), 0 0 40px rgba(255,248,220,0.4)'
                            : 'none',
                        filter: moodLightOn ? 'blur(2px)' : 'blur(1px)'
                    }}
                ></div>

                {/* 빛 확산 효과 (ON일 때만) */}
                {moodLightOn && (
                    <>
                        {/* 상단 빛 확산 (천장 방향) */}
                        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-yellow-200 rounded-full blur-3xl opacity-30 -z-10 animate-pulse pointer-events-none"
                            style={{ animationDuration: '3s' }}
                        ></div>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-100 rounded-full blur-2xl opacity-40 -z-10 animate-pulse pointer-events-none"
                            style={{ animationDuration: '2.5s' }}
                        ></div>

                        {/* 하단 빛 확산 (바닥 방향) */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-28 h-12 bg-yellow-200 rounded-full blur-2xl opacity-25 -z-10 pointer-events-none"
                            style={{
                                background: 'radial-gradient(ellipse, rgba(255,248,220,0.4) 0%, transparent 70%)'
                            }}
                        ></div>

                        {/* 주변 앰비언트 글로우 */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-yellow-50 rounded-full blur-3xl opacity-20 -z-20 pointer-events-none"></div>
                    </>
                )}

                {/* 호버 효과 */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
                        borderRadius: '50%'
                    }}
                ></div>
            </button>
        </div>
    );
};

export default MoodLight;
