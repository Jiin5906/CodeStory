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
            className="absolute bottom-[26%] left-[6%] z-25 flex flex-col items-center gap-[0.23%] pointer-events-auto"
            data-gtm="mood-light-container"
        >
            {/* 플로어 램프 디자인 */}
            <button
                onClick={toggleMoodLight}
                className="relative w-[14.88%] h-[37.21%] cursor-pointer transition-all duration-500 active:scale-98 group"
                data-gtm="mood-light-button"
                style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.25))' }}
            >
                {/* 받침대 (하단 - 원형 베이스) */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[13.02%] h-[2.79%] bg-gradient-to-b from-[#2C2C2C] to-[#1A1A1A] rounded-full"
                    style={{
                        boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1)'
                    }}
                ></div>

                {/* 스탠드 (긴 검은색 기둥) */}
                <div className="absolute bottom-[2.79%] left-1/2 -translate-x-1/2 w-[1.40%] h-[29.77%] bg-gradient-to-r from-[#2C2C2C] via-[#3A3A3A] to-[#2C2C2C] rounded-full"
                    style={{
                        boxShadow: 'inset 1px 0 2px rgba(255,255,255,0.15), inset -1px 0 2px rgba(0,0,0,0.3), 2px 0 4px rgba(0,0,0,0.2)'
                    }}
                ></div>

                {/* 상단 연결부 */}
                <div className="absolute top-[2.79%] left-1/2 -translate-x-1/2 w-[2.79%] h-[2.79%] bg-gradient-to-b from-[#3A3A3A] to-[#2C2C2C] rounded-full"
                    style={{
                        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)'
                    }}
                ></div>

                {/* 전구 갓 (상단 - 주름진 램프 쉐이드 형태) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[13.02%] h-[13.02%]"
                    style={{
                        clipPath: 'polygon(20% 0%, 80% 0%, 95% 35%, 100% 100%, 0% 100%, 5% 35%)'
                    }}
                >
                    {/* 메인 갓 바디 */}
                    <div className={`absolute inset-0 transition-all duration-700 ${
                        moodLightOn
                            ? 'bg-gradient-to-b from-[#FFF8DC] via-[#FFEFD5] to-[#FFE4B5]'
                            : 'bg-gradient-to-b from-[#E8E8E8] via-[#D8D8D8] to-[#C8C8C8]'
                    }`}
                        style={{
                            boxShadow: moodLightOn
                                ? 'inset 0 -3px 10px rgba(210,180,140,0.4), inset 0 3px 8px rgba(255,255,255,0.6), 0 0 30px rgba(255,248,220,0.6), 0 0 60px rgba(255,228,181,0.4)'
                                : 'inset 0 -3px 8px rgba(0,0,0,0.2), inset 0 3px 6px rgba(255,255,255,0.3)',
                            opacity: moodLightOn ? 1 : 0.7,
                            clipPath: 'polygon(20% 0%, 80% 0%, 95% 35%, 100% 100%, 0% 100%, 5% 35%)'
                        }}
                    >
                        {/* 주름 효과 (세로 라인들) */}
                        <div className="absolute inset-0 overflow-hidden"
                            style={{
                                clipPath: 'polygon(20% 0%, 80% 0%, 95% 35%, 100% 100%, 0% 100%, 5% 35%)'
                            }}
                        >
                            <div className="absolute left-[15%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-black/10 to-transparent"></div>
                            <div className="absolute left-[25%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-black/8 to-transparent"></div>
                            <div className="absolute left-[35%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-black/10 to-transparent"></div>
                            <div className="absolute left-[45%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-black/12 to-transparent"></div>
                            <div className="absolute left-[55%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-black/10 to-transparent"></div>
                            <div className="absolute left-[65%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-black/8 to-transparent"></div>
                            <div className="absolute left-[75%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-black/10 to-transparent"></div>
                            <div className="absolute left-[85%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-black/8 to-transparent"></div>
                        </div>

                        {/* 갓 내부 빛 반사 */}
                        <div className={`absolute top-[3.72%] left-1/2 -translate-x-1/2 w-[9.30%] h-[5.58%] rounded-full blur-sm transition-opacity duration-700 ${
                            moodLightOn ? 'opacity-60' : 'opacity-15'
                        }`}
                            style={{
                                background: moodLightOn
                                    ? 'radial-gradient(ellipse, rgba(255,255,255,0.9) 0%, rgba(255,248,220,0.5) 50%, transparent 80%)'
                                    : 'radial-gradient(ellipse, rgba(255,255,255,0.4) 0%, transparent 70%)'
                            }}
                        ></div>

                        {/* 상단 테두리 */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/20 to-transparent"></div>

                        {/* 하단 테두리 */}
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/30 to-transparent"></div>
                    </div>
                </div>

                {/* 전구 내부 (갓 속 - 빛나는 코어) */}
                <div className={`absolute top-[1.86%] left-1/2 -translate-x-1/2 w-[6.51%] h-[6.51%] rounded-full transition-all duration-700 ${
                    moodLightOn
                        ? 'bg-gradient-radial from-white via-[#FFFACD] to-transparent opacity-95'
                        : 'bg-gradient-radial from-gray-300 via-gray-400 to-transparent opacity-35'
                }`}
                    style={{
                        boxShadow: moodLightOn
                            ? '0 0 25px rgba(255,250,205,0.9), 0 0 50px rgba(255,248,220,0.5)'
                            : 'none',
                        filter: moodLightOn ? 'blur(3px)' : 'blur(1px)'
                    }}
                ></div>

                {/* 빛 확산 효과 (ON일 때만) */}
                {moodLightOn && (
                    <>
                        {/* 상단 빛 확산 (천장 방향) */}
                        <div className="absolute -top-[18.60%] left-1/2 -translate-x-1/2 w-[37.21%] h-[37.21%] bg-yellow-200 rounded-full blur-3xl opacity-30 -z-10 animate-pulse pointer-events-none"
                            style={{ animationDuration: '3s' }}
                        ></div>
                        <div className="absolute -top-[9.30%] left-1/2 -translate-x-1/2 w-[29.77%] h-[29.77%] bg-yellow-100 rounded-full blur-2xl opacity-40 -z-10 animate-pulse pointer-events-none"
                            style={{ animationDuration: '2.5s' }}
                        ></div>

                        {/* 하단 빛 확산 (바닥 방향) */}
                        <div className="absolute -bottom-[7.44%] left-1/2 -translate-x-1/2 w-[26.05%] h-[11.16%] bg-yellow-200 rounded-full blur-2xl opacity-25 -z-10 pointer-events-none"
                            style={{
                                background: 'radial-gradient(ellipse, rgba(255,248,220,0.4) 0%, transparent 70%)'
                            }}
                        ></div>

                        {/* 주변 앰비언트 글로우 */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[44.65%] h-[44.65%] bg-yellow-50 rounded-full blur-3xl opacity-20 -z-20 pointer-events-none"></div>
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
