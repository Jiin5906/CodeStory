import React, { useMemo } from 'react';
import { usePet } from '../../context/PetContext';
import { useStore } from '../../context/StoreContext';

/**
 * MoodLight — 무드등 컴포넌트 (좌측 하단 배치)
 *
 * designType별 완전히 다른 CSS/SVG 디자인:
 * - classic: 기본 스탠드 램프 (클래식 갓 형태)
 * - tulip: 꽃봉오리 모양 튤립 램프
 * - mushroom: 반구형 버섯 램프
 * - moon: 공중에 떠있는 초승달/구름 램프
 * - lava: 네온/라바 램프 (색상 변화 애니메이션)
 */
const MoodLight = () => {
    const { moodLightOn, toggleMoodLight } = usePet();
    const { equippedItems, getEquippedItem } = useStore();
    const equippedLight = useMemo(() => getEquippedItem('light'), [equippedItems, getEquippedItem]);

    const designType = equippedLight?.designType || 'classic';
    const shadeColor = equippedLight?.shadeColor || '#FFF8DC';
    const shadeColorDark = equippedLight?.shadeColorDark || '#FFE4B5';
    const standColor = equippedLight?.standColor || '#2C2C2C';

    const renderLamp = () => {
        switch (designType) {
            case 'tulip':
                return <TulipLamp on={moodLightOn} shadeColor={shadeColor} shadeColorDark={shadeColorDark} standColor={standColor} />;
            case 'mushroom':
                return <MushroomLamp on={moodLightOn} shadeColor={shadeColor} shadeColorDark={shadeColorDark} standColor={standColor} />;
            case 'moon':
                return <MoonLamp on={moodLightOn} shadeColor={shadeColor} shadeColorDark={shadeColorDark} />;
            case 'lava':
                return <LavaLamp on={moodLightOn} shadeColor={shadeColor} shadeColorDark={shadeColorDark} standColor={standColor} />;
            case 'classic':
            default:
                return <ClassicLamp on={moodLightOn} shadeColor={shadeColor} shadeColorDark={shadeColorDark} standColor={standColor} />;
        }
    };

    return (
        <div
            className="absolute bottom-[26%] left-[6%] z-25 flex flex-col items-center gap-1 pointer-events-auto"
            data-gtm="mood-light-container"
        >
            <button
                onClick={toggleMoodLight}
                className="relative cursor-pointer transition-all duration-500 active:scale-98 group"
                data-gtm="mood-light-button"
                style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.25))' }}
            >
                {renderLamp()}
            </button>
        </div>
    );
};

/* ════════════════════════════════════════════════
   A. 기본 무드등 (Classic Lamp) — 클래식 스탠드 형태
   ════════════════════════════════════════════════ */
const ClassicLamp = ({ on, shadeColor, shadeColorDark, standColor }) => (
    <div className="relative w-16 h-40">
        {/* 받침대 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-3 rounded-full"
            style={{
                background: `linear-gradient(to bottom, ${standColor}, #1A1A1A)`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1)'
            }}
        />
        {/* 스탠드 기둥 */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-32 rounded-full"
            style={{
                background: `linear-gradient(to right, ${standColor}, ${standColor}DD, ${standColor})`,
                boxShadow: 'inset 1px 0 2px rgba(255,255,255,0.15), inset -1px 0 2px rgba(0,0,0,0.3)'
            }}
        />
        {/* 상단 연결부 */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
            style={{ background: `linear-gradient(to bottom, ${standColor}DD, ${standColor})` }}
        />
        {/* 갓 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 transition-all duration-700"
            style={{
                clipPath: 'polygon(20% 0%, 80% 0%, 95% 35%, 100% 100%, 0% 100%, 5% 35%)',
                background: on
                    ? `linear-gradient(to bottom, ${shadeColor}, ${shadeColorDark})`
                    : 'linear-gradient(to bottom, #E8E8E8, #C8C8C8)',
                boxShadow: on
                    ? `inset 0 -3px 10px rgba(210,180,140,0.4), 0 0 30px ${shadeColor}99, 0 0 60px ${shadeColorDark}66`
                    : 'inset 0 -3px 8px rgba(0,0,0,0.2)',
                opacity: on ? 1 : 0.7
            }}
        >
            {/* 주름 효과 */}
            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 95% 35%, 100% 100%, 0% 100%, 5% 35%)' }}>
                {[15, 25, 35, 45, 55, 65, 75, 85].map(p => (
                    <div key={p} className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-black/10 to-transparent" style={{ left: `${p}%` }} />
                ))}
            </div>
            {/* 내부 빛 반사 */}
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 w-10 h-6 rounded-full blur-sm transition-opacity duration-700 ${on ? 'opacity-60' : 'opacity-15'}`}
                style={{
                    background: on
                        ? 'radial-gradient(ellipse, rgba(255,255,255,0.9), rgba(255,248,220,0.5) 50%, transparent 80%)'
                        : 'radial-gradient(ellipse, rgba(255,255,255,0.4), transparent 70%)'
                }}
            />
        </div>
        {/* 전구 코어 */}
        <div className={`absolute top-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full transition-all duration-700 ${on ? 'opacity-95' : 'opacity-35'}`}
            style={{
                background: on
                    ? 'radial-gradient(circle, white, #FFFACD, transparent)'
                    : 'radial-gradient(circle, #C0C0C0, #A0A0A0, transparent)',
                boxShadow: on ? '0 0 25px rgba(255,250,205,0.9), 0 0 50px rgba(255,248,220,0.5)' : 'none',
                filter: on ? 'blur(3px)' : 'blur(1px)'
            }}
        />
        {/* 빛 확산 (ON) */}
        {on && (
            <>
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-yellow-200 rounded-full blur-3xl opacity-30 -z-10 animate-pulse pointer-events-none" style={{ animationDuration: '3s' }} />
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-100 rounded-full blur-2xl opacity-40 -z-10 pointer-events-none" />
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-28 h-12 rounded-full blur-2xl opacity-25 -z-10 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse, ${shadeColor}66, transparent 70%)` }}
                />
            </>
        )}
    </div>
);

/* ════════════════════════════════════════════════
   B. 튤립 램프 (Tulip Lamp) — 꽃봉오리 형태
   ════════════════════════════════════════════════ */
const TulipLamp = ({ on, shadeColor, shadeColorDark, standColor }) => (
    <div className="relative w-16 h-40">
        {/* 받침대 - 작은 잎사귀 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-3 rounded-full"
            style={{
                background: `linear-gradient(to bottom, ${standColor}CC, ${standColor})`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
        />
        {/* 줄기 - 곡선이 있는 녹색 스탠드 */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1.5 rounded-full"
            style={{
                height: '110px',
                background: `linear-gradient(to right, ${standColor}CC, ${standColor}, ${standColor}CC)`,
                boxShadow: 'inset 1px 0 2px rgba(255,255,255,0.2)',
                transform: 'translateX(-50%) rotate(2deg)'
            }}
        />
        {/* 작은 잎 (줄기 중간) */}
        <div className="absolute bottom-14 left-1/2"
            style={{
                width: '10px', height: '6px',
                background: standColor,
                borderRadius: '50% 50% 50% 0',
                transform: 'translateX(2px) rotate(-30deg)',
                opacity: 0.8
            }}
        />
        {/* 꽃봉오리 (상단) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-16 transition-all duration-700"
            style={{
                borderRadius: '45% 45% 35% 35% / 60% 60% 40% 40%',
                background: on
                    ? `linear-gradient(135deg, ${shadeColor}, ${shadeColorDark}CC, ${shadeColor})`
                    : 'linear-gradient(135deg, #E8E8E8, #D0D0D0, #C8C8C8)',
                boxShadow: on
                    ? `0 0 25px ${shadeColor}88, 0 0 50px ${shadeColorDark}44, inset 0 -4px 8px rgba(255,255,255,0.3)`
                    : 'inset 0 -3px 8px rgba(0,0,0,0.15)',
                opacity: on ? 1 : 0.7
            }}
        >
            {/* 꽃잎 라인 */}
            <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 'inherit' }}>
                <div className="absolute left-[30%] top-[10%] bottom-[20%] w-px" style={{ background: on ? `${shadeColorDark}44` : 'rgba(0,0,0,0.08)' }} />
                <div className="absolute left-[50%] top-[5%] bottom-[15%] w-px" style={{ background: on ? `${shadeColorDark}44` : 'rgba(0,0,0,0.08)' }} />
                <div className="absolute left-[70%] top-[10%] bottom-[20%] w-px" style={{ background: on ? `${shadeColorDark}44` : 'rgba(0,0,0,0.08)' }} />
            </div>
            {/* 내부 발광 */}
            {on && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full blur-md opacity-70"
                    style={{ background: `radial-gradient(circle, white, ${shadeColor}88, transparent)` }}
                />
            )}
        </div>
        {/* 꽃받침 */}
        <div className="absolute top-14 left-1/2 -translate-x-1/2 w-6 h-3"
            style={{
                background: standColor,
                borderRadius: '0 0 50% 50%',
                opacity: 0.9
            }}
        />
        {/* 빛 확산 (ON) */}
        {on && (
            <>
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-36 h-36 rounded-full blur-3xl opacity-25 -z-10 animate-pulse pointer-events-none"
                    style={{ background: shadeColor, animationDuration: '3s' }}
                />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 h-10 rounded-full blur-2xl opacity-20 -z-10 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse, ${shadeColor}55, transparent 70%)` }}
                />
            </>
        )}
    </div>
);

/* ════════════════════════════════════════════════
   C. 버섯 램프 (Mushroom Lamp) — 반구형 둥근 갓
   ════════════════════════════════════════════════ */
const MushroomLamp = ({ on, shadeColor, shadeColorDark, standColor }) => (
    <div className="relative w-20 h-36">
        {/* 받침대 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-3 rounded-full"
            style={{
                background: `linear-gradient(to bottom, ${standColor}, ${standColor}CC)`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
        />
        {/* 굵고 짧은 기둥 */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4 rounded-full"
            style={{
                height: '60px',
                background: `linear-gradient(to right, ${standColor}DD, ${standColor}, ${standColor}DD)`,
                boxShadow: 'inset 1px 0 3px rgba(255,255,255,0.2), inset -1px 0 3px rgba(0,0,0,0.15)'
            }}
        />
        {/* 반구형 갓 (버섯 모양) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-16 transition-all duration-700"
            style={{
                borderRadius: '50% 50% 15% 15% / 70% 70% 30% 30%',
                background: on
                    ? `linear-gradient(180deg, ${shadeColor} 0%, ${shadeColor}EE 50%, ${shadeColorDark} 100%)`
                    : 'linear-gradient(180deg, #E8E8E8 0%, #D8D8D8 50%, #C8C8C8 100%)',
                boxShadow: on
                    ? `0 0 30px ${shadeColor}88, 0 0 60px ${shadeColorDark}44, inset 0 4px 10px rgba(255,255,255,0.5)`
                    : 'inset 0 -3px 8px rgba(0,0,0,0.15)',
                opacity: on ? 1 : 0.7
            }}
        >
            {/* 갓 윗부분 하이라이트 */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-6 rounded-full opacity-40"
                style={{
                    background: on
                        ? 'radial-gradient(ellipse, rgba(255,255,255,0.8), transparent 70%)'
                        : 'radial-gradient(ellipse, rgba(255,255,255,0.3), transparent 70%)'
                }}
            />
            {/* 점 무늬 (버섯 스타일) */}
            {on && (
                <>
                    <div className="absolute top-3 left-3 w-2 h-2 rounded-full opacity-30" style={{ background: 'white' }} />
                    <div className="absolute top-5 left-7 w-1.5 h-1.5 rounded-full opacity-25" style={{ background: 'white' }} />
                    <div className="absolute top-2 right-4 w-2.5 h-2.5 rounded-full opacity-20" style={{ background: 'white' }} />
                    <div className="absolute top-6 right-3 w-1.5 h-1.5 rounded-full opacity-25" style={{ background: 'white' }} />
                </>
            )}
            {/* 갓 안쪽 크림색 하단 */}
            <div className="absolute bottom-0 left-0 right-0 h-4 rounded-b-lg"
                style={{
                    background: on
                        ? `linear-gradient(to bottom, transparent, ${standColor}44)`
                        : 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.08))'
                }}
            />
        </div>
        {/* 빛 확산 (ON) */}
        {on && (
            <>
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl opacity-25 -z-10 animate-pulse pointer-events-none"
                    style={{ background: shadeColor, animationDuration: '3.5s' }}
                />
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-20 h-16 rounded-full blur-2xl opacity-30 -z-10 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse, ${shadeColor}55, transparent 70%)` }}
                />
            </>
        )}
    </div>
);

/* ════════════════════════════════════════════════
   D. 달/구름 램프 (Moon Lamp) — 공중 부유 초승달
   ════════════════════════════════════════════════ */
const MoonLamp = ({ on, shadeColor, shadeColorDark }) => (
    <div className="relative w-20 h-36">
        {/* 투명 스탠드 (낚싯줄 느낌) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full"
            style={{ background: 'linear-gradient(to bottom, rgba(200,200,200,0.4), rgba(150,150,150,0.3))' }}
        />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-px h-16"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(180,180,180,0.3))' }}
        />
        {/* 초승달 본체 */}
        <div
            className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-16 transition-all duration-700"
            style={{
                borderRadius: '50%',
                background: on
                    ? `radial-gradient(circle at 35% 35%, ${shadeColor}, ${shadeColorDark})`
                    : 'radial-gradient(circle at 35% 35%, #E0E0E0, #B0B0B0)',
                boxShadow: on
                    ? `0 0 30px ${shadeColor}AA, 0 0 60px ${shadeColorDark}55, 0 0 100px ${shadeColor}33`
                    : '0 2px 8px rgba(0,0,0,0.15)',
                opacity: on ? 1 : 0.6,
                animation: on ? 'moonFloat 4s ease-in-out infinite' : 'none'
            }}
        >
            {/* 초승달 그림자 (원 안에 원을 겹쳐서 초승달 표현) */}
            <div className="absolute top-1 right-1 w-12 h-12 rounded-full"
                style={{
                    background: on
                        ? `radial-gradient(circle, rgba(0,0,20,0.3), rgba(0,0,20,0.15))`
                        : 'radial-gradient(circle, rgba(0,0,0,0.2), rgba(0,0,0,0.1))',
                    filter: 'blur(1px)'
                }}
            />
            {/* 달 표면 텍스처 */}
            {on && (
                <>
                    <div className="absolute top-4 left-2 w-2 h-2 rounded-full opacity-20" style={{ background: shadeColorDark }} />
                    <div className="absolute top-8 left-4 w-1.5 h-1.5 rounded-full opacity-15" style={{ background: shadeColorDark }} />
                    <div className="absolute top-6 left-1 w-1 h-1 rounded-full opacity-20" style={{ background: shadeColorDark }} />
                </>
            )}
        </div>
        {/* 작은 별들 (ON일 때) */}
        {on && (
            <>
                <div className="absolute top-0 right-1 w-1 h-1 rounded-full animate-pulse" style={{ background: '#FFFACD', animationDuration: '2s' }} />
                <div className="absolute top-6 right-0 w-0.5 h-0.5 rounded-full animate-pulse" style={{ background: '#E8E0FF', animationDuration: '2.5s' }} />
                <div className="absolute top-1 left-2 w-0.5 h-0.5 rounded-full animate-pulse" style={{ background: '#FFFACD', animationDuration: '3s' }} />
                <div className="absolute top-12 right-2 w-1 h-1 rounded-full animate-pulse" style={{ background: '#E8E0FF', animationDuration: '1.8s' }} />
            </>
        )}
        {/* 구름 (하단) */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-end"
            style={{
                opacity: on ? 0.5 : 0.25,
                animation: on ? 'moonFloat 5s ease-in-out infinite 1s' : 'none'
            }}
        >
            <div className="w-5 h-3 rounded-full" style={{ background: on ? 'white' : '#D0D0D0' }} />
            <div className="w-8 h-5 rounded-full -ml-2 -mb-0.5" style={{ background: on ? 'white' : '#D0D0D0' }} />
            <div className="w-5 h-3 rounded-full -ml-2" style={{ background: on ? 'white' : '#D0D0D0' }} />
        </div>
        {/* 빛 확산 (ON) */}
        {on && (
            <>
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-44 h-44 rounded-full blur-3xl opacity-20 -z-10 pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${shadeColor}88, ${shadeColorDark}44, transparent)` }}
                />
            </>
        )}
        {/* CSS Animation */}
        <style>{`
            @keyframes moonFloat {
                0%, 100% { transform: translateX(-50%) translateY(0); }
                50% { transform: translateX(-50%) translateY(-6px); }
            }
        `}</style>
    </div>
);

/* ════════════════════════════════════════════════
   E. 라바/네온 램프 (Lava Lamp) — 유선형 물방울 병
   ════════════════════════════════════════════════ */
const LavaLamp = ({ on, shadeColor, shadeColorDark, standColor }) => (
    <div className="relative w-16 h-40">
        {/* 받침대 (메탈릭) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-4 rounded-lg"
            style={{
                background: `linear-gradient(to bottom, ${standColor}CC, ${standColor}, #0D0033)`,
                boxShadow: '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.15)'
            }}
        />
        {/* 하단 캡 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-3 rounded-t-lg"
            style={{
                background: `linear-gradient(to bottom, ${standColor}, ${standColor}CC)`,
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)'
            }}
        />
        {/* 유리병 본체 (유선형) */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 w-10 overflow-hidden transition-all duration-700"
            style={{
                height: '100px',
                borderRadius: '30% 30% 20% 20% / 10% 10% 5% 5%',
                background: on
                    ? `linear-gradient(180deg, ${standColor}44 0%, transparent 20%, transparent 80%, ${standColor}44 100%)`
                    : 'linear-gradient(180deg, rgba(100,100,100,0.3) 0%, rgba(80,80,80,0.1) 50%, rgba(100,100,100,0.3) 100%)',
                border: on ? `1px solid ${shadeColor}44` : '1px solid rgba(150,150,150,0.3)',
                boxShadow: on
                    ? `0 0 20px ${shadeColor}66, 0 0 40px ${shadeColorDark}33, inset 0 0 15px ${shadeColor}22`
                    : 'inset 0 0 8px rgba(0,0,0,0.1)',
                opacity: on ? 1 : 0.6
            }}
        >
            {/* 라바 기포들 (ON 시 움직이는 애니메이션) */}
            {on && (
                <>
                    <div className="absolute w-5 h-7 rounded-full"
                        style={{
                            background: `radial-gradient(circle at 40% 30%, ${shadeColor}, ${shadeColorDark})`,
                            filter: 'blur(1px)',
                            animation: 'lavaBubble1 4s ease-in-out infinite',
                            left: '25%'
                        }}
                    />
                    <div className="absolute w-4 h-5 rounded-full"
                        style={{
                            background: `radial-gradient(circle at 40% 30%, ${shadeColorDark}, ${shadeColor})`,
                            filter: 'blur(1px)',
                            animation: 'lavaBubble2 5s ease-in-out infinite 1s',
                            right: '20%'
                        }}
                    />
                    <div className="absolute w-3 h-4 rounded-full"
                        style={{
                            background: `radial-gradient(circle, ${shadeColor}CC, ${shadeColorDark}AA)`,
                            filter: 'blur(1px)',
                            animation: 'lavaBubble3 3.5s ease-in-out infinite 0.5s',
                            left: '35%'
                        }}
                    />
                </>
            )}
            {/* 유리 반사 */}
            <div className="absolute top-0 left-1 w-1 h-full bg-gradient-to-b from-white/20 via-white/10 to-transparent rounded-full" />
        </div>
        {/* 상단 캡 (병 목) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-4 rounded-t-lg"
            style={{
                background: `linear-gradient(to bottom, ${standColor}, ${standColor}CC)`,
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.15)'
            }}
        />
        {/* 빛 확산 (ON) */}
        {on && (
            <>
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl opacity-30 -z-10 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle, ${shadeColor}88, ${shadeColorDark}44, transparent)`,
                        animation: 'lavaGlow 3s ease-in-out infinite'
                    }}
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-44 rounded-full blur-2xl opacity-15 -z-10 pointer-events-none"
                    style={{ background: `linear-gradient(180deg, ${shadeColor}44, ${shadeColorDark}44)` }}
                />
            </>
        )}
        {/* CSS Animations */}
        <style>{`
            @keyframes lavaBubble1 {
                0%, 100% { top: 60%; transform: scale(1); }
                50% { top: 15%; transform: scale(0.85); }
            }
            @keyframes lavaBubble2 {
                0%, 100% { top: 20%; transform: scale(0.9); }
                50% { top: 65%; transform: scale(1.1); }
            }
            @keyframes lavaBubble3 {
                0%, 100% { top: 45%; transform: scale(1); }
                50% { top: 10%; transform: scale(0.8); }
            }
            @keyframes lavaGlow {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.5; }
            }
        `}</style>
    </div>
);

export default MoodLight;
