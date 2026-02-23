import React, { useMemo } from 'react';
import { usePet } from '../../context/PetContext';
import { useStore } from '../../context/StoreContext';

/**
 * MoodLight — 무드등 컴포넌트 (좌측 하단 배치)
 *
 * designType별 SVG 기반 완전히 다른 형태:
 * - classic: 클래식 스탠드 램프 (사다리꼴 갓)
 * - tulip: 튤립 꽃봉오리 (꽃잎 3장)
 * - mushroom: 둥근 버섯 (반구형 갓 + 도트)
 * - moon: 초승달 + 별 (둥둥 떠다니는 모션)
 * - lava: 라바 램프 (유리병 + 움직이는 기포)
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
        const props = { on: moodLightOn, shadeColor, shadeColorDark, standColor };
        switch (designType) {
            case 'tulip': return <TulipLamp {...props} />;
            case 'mushroom': return <MushroomLamp {...props} />;
            case 'moon': return <MoonLamp {...props} />;
            case 'lava': return <LavaLamp {...props} />;
            case 'classic':
            default: return <ClassicLamp {...props} />;
        }
    };

    return (
        <div
            className="absolute bottom-[26%] left-[6%] z-25 flex flex-col items-center gap-1 pointer-events-auto"
            data-gtm="mood-light-container"
        >
            <button
                onClick={toggleMoodLight}
                className="relative cursor-pointer transition-all duration-500 active:scale-95 group"
                data-gtm="mood-light-button"
            >
                {renderLamp()}
            </button>
        </div>
    );
};

/* ════════════════════════════════════════════════
   A. 기본 무드등 (Classic) — 사다리꼴 갓 스탠드
   ════════════════════════════════════════════════ */
const ClassicLamp = ({ on, shadeColor, shadeColorDark, standColor }) => (
    <div className="relative w-16 h-40" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
        <svg viewBox="0 0 64 160" width="64" height="160" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="classicShade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={on ? shadeColor : '#E0E0E0'} />
                    <stop offset="100%" stopColor={on ? shadeColorDark : '#B0B0B0'} />
                </linearGradient>
                <linearGradient id="classicStand" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={standColor} />
                    <stop offset="50%" stopColor={standColor} stopOpacity="0.85" />
                    <stop offset="100%" stopColor={standColor} />
                </linearGradient>
                {on && <radialGradient id="classicGlow">
                    <stop offset="0%" stopColor={shadeColor} stopOpacity="0.7" />
                    <stop offset="100%" stopColor={shadeColor} stopOpacity="0" />
                </radialGradient>}
            </defs>
            {/* 빛 확산 */}
            {on && <ellipse cx="32" cy="30" rx="50" ry="50" fill="url(#classicGlow)" opacity="0.4" />}
            {/* 갓 (사다리꼴) */}
            <polygon points="16,4 48,4 56,48 8,48" fill="url(#classicShade)" stroke={on ? shadeColorDark : '#999'} strokeWidth="0.5" opacity={on ? 1 : 0.6} />
            {/* 갓 주름선 */}
            {[20, 26, 32, 38, 44].map(x => (
                <line key={x} x1={x} y1="6" x2={x + (x > 32 ? 2 : -2)} y2="46" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
            ))}
            {/* 전구 */}
            <circle cx="32" cy="28" r="6" fill={on ? '#FFFDE7' : '#CCC'} opacity={on ? 0.9 : 0.4} />
            {on && <circle cx="32" cy="28" r="10" fill="#FFFDE7" opacity="0.3" />}
            {/* 연결부 */}
            <circle cx="32" cy="50" r="3" fill={standColor} />
            {/* 기둥 */}
            <rect x="30" y="52" width="4" height="90" rx="2" fill="url(#classicStand)" />
            {/* 받침대 */}
            <ellipse cx="32" cy="148" rx="20" ry="5" fill={standColor} />
            <ellipse cx="32" cy="146" rx="18" ry="4" fill={standColor} opacity="0.7" />
        </svg>
    </div>
);

/* ════════════════════════════════════════════════
   B. 튤립 램프 (Tulip) — 꽃봉오리 + 줄기
   ════════════════════════════════════════════════ */
const TulipLamp = ({ on, shadeColor, shadeColorDark, standColor }) => (
    <div className="relative w-16 h-40" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
        <svg viewBox="0 0 64 160" width="64" height="160" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="tulipGlow">
                    <stop offset="0%" stopColor={shadeColor} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={shadeColor} stopOpacity="0" />
                </radialGradient>
                <linearGradient id="tulipPetal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={on ? shadeColor : '#E0E0E0'} />
                    <stop offset="100%" stopColor={on ? shadeColorDark : '#B0B0B0'} />
                </linearGradient>
            </defs>
            {/* 빛 확산 */}
            {on && <ellipse cx="32" cy="25" rx="45" ry="45" fill="url(#tulipGlow)" opacity="0.35" />}
            {/* 왼쪽 꽃잎 */}
            <path d="M32,52 Q10,35 14,12 Q20,0 32,8" fill="url(#tulipPetal)" opacity={on ? 1 : 0.5} stroke={on ? shadeColorDark : '#AAA'} strokeWidth="0.5" />
            {/* 오른쪽 꽃잎 */}
            <path d="M32,52 Q54,35 50,12 Q44,0 32,8" fill="url(#tulipPetal)" opacity={on ? 1 : 0.5} stroke={on ? shadeColorDark : '#AAA'} strokeWidth="0.5" />
            {/* 가운데 꽃잎 */}
            <path d="M24,50 Q22,20 32,2 Q42,20 40,50 Z" fill={on ? shadeColor : '#D8D8D8'} opacity={on ? 0.9 : 0.5} stroke={on ? shadeColorDark : '#AAA'} strokeWidth="0.5" />
            {/* 전구 (꽃 안쪽) */}
            {on && <ellipse cx="32" cy="30" rx="5" ry="7" fill="#FFFDE7" opacity="0.6" />}
            {/* 꽃받침 */}
            <path d="M26,52 Q32,58 38,52 L36,56 Q32,60 28,56 Z" fill={standColor} />
            {/* 줄기 */}
            <path d="M32,56 Q30,100 32,142" fill="none" stroke={standColor} strokeWidth="3" strokeLinecap="round" />
            {/* 잎사귀 1 */}
            <path d="M32,90 Q42,80 48,85 Q42,92 32,90" fill={standColor} opacity="0.7" />
            {/* 잎사귀 2 */}
            <path d="M32,110 Q22,102 16,106 Q22,112 32,110" fill={standColor} opacity="0.6" />
            {/* 받침대 (작은 화분) */}
            <path d="M22,142 L24,155 L40,155 L42,142 Z" fill="#8B6914" rx="2" />
            <ellipse cx="32" cy="142" rx="11" ry="3" fill="#A07828" />
        </svg>
    </div>
);

/* ════════════════════════════════════════════════
   C. 버섯 램프 (Mushroom) — 넓은 반구 갓 + 통통한 기둥
   ════════════════════════════════════════════════ */
const MushroomLamp = ({ on, shadeColor, shadeColorDark, standColor }) => (
    <div className="relative w-20 h-36" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
        <svg viewBox="0 0 80 144" width="80" height="144" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="mushGlow">
                    <stop offset="0%" stopColor={shadeColor} stopOpacity="0.5" />
                    <stop offset="100%" stopColor={shadeColor} stopOpacity="0" />
                </radialGradient>
                <linearGradient id="mushCap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={on ? shadeColor : '#E0E0E0'} />
                    <stop offset="70%" stopColor={on ? shadeColorDark : '#B8B8B8'} />
                    <stop offset="100%" stopColor={on ? shadeColorDark : '#A0A0A0'} />
                </linearGradient>
            </defs>
            {/* 빛 확산 */}
            {on && <ellipse cx="40" cy="35" rx="55" ry="50" fill="url(#mushGlow)" opacity="0.35" />}
            {/* 버섯 갓 (넓은 반구) */}
            <path d="M4,55 Q4,8 40,4 Q76,8 76,55 Z" fill="url(#mushCap)" opacity={on ? 1 : 0.55} stroke={on ? shadeColorDark : '#999'} strokeWidth="0.5" />
            {/* 갓 하단 크림색 라인 */}
            <path d="M8,50 Q40,62 72,50 L76,55 Q40,68 4,55 Z" fill={on ? '#FFFEF5' : '#D0D0D0'} opacity="0.5" />
            {/* 흰 도트 (버섯 무늬) */}
            <circle cx="22" cy="22" r="4" fill="white" opacity={on ? 0.45 : 0.2} />
            <circle cx="40" cy="14" r="5" fill="white" opacity={on ? 0.4 : 0.15} />
            <circle cx="56" cy="20" r="3.5" fill="white" opacity={on ? 0.45 : 0.2} />
            <circle cx="30" cy="36" r="3" fill="white" opacity={on ? 0.35 : 0.15} />
            <circle cx="52" cy="38" r="4" fill="white" opacity={on ? 0.3 : 0.12} />
            <circle cx="16" cy="40" r="2.5" fill="white" opacity={on ? 0.3 : 0.12} />
            {/* 갓 안쪽 빛 */}
            {on && <ellipse cx="40" cy="55" rx="18" ry="6" fill="#FFFDE7" opacity="0.4" />}
            {/* 기둥 (통통) */}
            <path d="M30,55 Q28,80 30,115 L50,115 Q52,80 50,55 Z" fill={standColor} opacity={on ? 1 : 0.6} />
            {/* 기둥 하이라이트 */}
            <path d="M34,58 Q33,80 34,112" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            {/* 받침대 */}
            <ellipse cx="40" cy="118" rx="22" ry="6" fill={standColor} opacity="0.8" />
            <ellipse cx="40" cy="116" rx="20" ry="5" fill={standColor} opacity="0.6" />
        </svg>
    </div>
);

/* ════════════════════════════════════════════════
   D. 달/구름 램프 (Moon) — 초승달 + 별 + 구름
   ════════════════════════════════════════════════ */
const MoonLamp = ({ on, shadeColor, shadeColorDark }) => (
    <div className="relative w-28 h-48">
        <svg viewBox="0 0 112 192" width="112" height="192" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="moonGlow">
                    <stop offset="0%" stopColor={shadeColor} stopOpacity="0.7" />
                    <stop offset="100%" stopColor={shadeColor} stopOpacity="0" />
                </radialGradient>
                <linearGradient id="moonFill" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={on ? shadeColor : '#D0D0D0'} />
                    <stop offset="100%" stopColor={on ? shadeColorDark : '#A0A0A0'} />
                </linearGradient>
            </defs>
            {/* 빛 확산 */}
            {on && <circle cx="56" cy="54" r="65" fill="url(#moonGlow)" opacity="0.35" />}
            {/* 초승달 */}
            <g style={on ? { animation: 'moonBob 4s ease-in-out infinite' } : {}}>
                {/* 달 원 — 크고 선명 */}
                <circle cx="52" cy="52" r="34" fill="url(#moonFill)" opacity={on ? 1 : 0.55}
                    stroke={on ? 'rgba(255,255,240,0.35)' : 'none'} strokeWidth="1.5" />
                {/* 그림자 원 (초승달 만들기) */}
                <circle cx="66" cy="44" r="28" fill={on ? '#1A1A3E' : '#888'} opacity={on ? 0.55 : 0.35} />
                {/* 달 크레이터 */}
                {on && <>
                    <circle cx="38" cy="48" r="4" fill={shadeColorDark} opacity="0.2" />
                    <circle cx="46" cy="66" r="2.8" fill={shadeColorDark} opacity="0.15" />
                    <circle cx="32" cy="60" r="2" fill={shadeColorDark} opacity="0.2" />
                </>}
            </g>
            {/* 별 (크로스 형태) */}
            {on && <>
                <g transform="translate(92,18)" opacity="0.9" style={{ animation: 'starTwinkle 2s ease-in-out infinite' }}>
                    <line x1="0" y1="-5" x2="0" y2="5" stroke="#FFFACD" strokeWidth="2" strokeLinecap="round" />
                    <line x1="-5" y1="0" x2="5" y2="0" stroke="#FFFACD" strokeWidth="2" strokeLinecap="round" />
                </g>
                <g transform="translate(12,22)" opacity="0.6" style={{ animation: 'starTwinkle 3s ease-in-out infinite 1s' }}>
                    <line x1="0" y1="-3.5" x2="0" y2="3.5" stroke="#E8E0FF" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="-3.5" y1="0" x2="3.5" y2="0" stroke="#E8E0FF" strokeWidth="1.5" strokeLinecap="round" />
                </g>
                <circle cx="98" cy="68" r="1.5" fill="#FFFACD" opacity="0.7" style={{ animation: 'starTwinkle 2.5s ease-in-out infinite 0.5s' }} />
                <circle cx="8" cy="74" r="1.2" fill="#E8E0FF" opacity="0.6" style={{ animation: 'starTwinkle 3.5s ease-in-out infinite 1.5s' }} />
            </>}
            {/* 구름 */}
            <g style={on ? { animation: 'cloudDrift 6s ease-in-out infinite 1s' } : {}} opacity={on ? 0.7 : 0.3}>
                <ellipse cx="36" cy="106" rx="14" ry="8" fill={on ? 'white' : '#CCC'} />
                <ellipse cx="56" cy="102" rx="20" ry="11" fill={on ? 'white' : '#CCC'} />
                <ellipse cx="74" cy="106" rx="14" ry="8" fill={on ? 'white' : '#CCC'} />
            </g>
            {/* 투명한 실 */}
            <line x1="56" y1="116" x2="56" y2="166" stroke="rgba(180,180,180,0.3)" strokeWidth="1" strokeDasharray="3,3" />
            {/* 작은 받침대 */}
            <ellipse cx="56" cy="170" rx="14" ry="4.5" fill="rgba(180,180,180,0.35)" />
        </svg>
        <style>{`
            @keyframes moonBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
            @keyframes starTwinkle { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
            @keyframes cloudDrift { 0%,100%{transform:translateX(0)} 50%{transform:translateX(4px)} }
        `}</style>
    </div>
);

/* ════════════════════════════════════════════════
   E. 라바 램프 (Lava) — 유리병 + 떠다니는 기포
   ════════════════════════════════════════════════ */
const LavaLamp = ({ on, shadeColor, shadeColorDark, standColor }) => (
    <div className="relative w-14 h-40" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>
        <svg viewBox="0 0 56 160" width="56" height="160" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="lavaGlow">
                    <stop offset="0%" stopColor={shadeColor} stopOpacity="0.5" />
                    <stop offset="100%" stopColor={shadeColor} stopOpacity="0" />
                </radialGradient>
                <linearGradient id="lavaCap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={standColor} />
                    <stop offset="100%" stopColor="#0D0020" />
                </linearGradient>
                <radialGradient id="lavaBlob1" cx="0.4" cy="0.3">
                    <stop offset="0%" stopColor={shadeColor} />
                    <stop offset="100%" stopColor={shadeColorDark} />
                </radialGradient>
                <radialGradient id="lavaBlob2" cx="0.4" cy="0.3">
                    <stop offset="0%" stopColor={shadeColorDark} />
                    <stop offset="100%" stopColor={shadeColor} />
                </radialGradient>
                <clipPath id="bottleClip">
                    <path d="M20,16 Q18,16 16,22 L12,120 Q12,134 28,134 Q44,134 44,120 L40,22 Q38,16 36,16 Z" />
                </clipPath>
            </defs>
            {/* 빛 확산 */}
            {on && <ellipse cx="28" cy="75" rx="40" ry="60" fill="url(#lavaGlow)" opacity="0.3" />}
            {/* 상단 캡 (메탈릭) */}
            <rect x="16" y="4" width="24" height="14" rx="3" fill="url(#lavaCap)" />
            <rect x="18" y="6" width="20" height="2" rx="1" fill="rgba(255,255,255,0.1)" />
            {/* 유리병 외형 */}
            <path d="M20,16 Q18,16 16,22 L12,120 Q12,134 28,134 Q44,134 44,120 L40,22 Q38,16 36,16 Z"
                fill={on ? 'rgba(255,255,255,0.06)' : 'rgba(150,150,150,0.1)'}
                stroke={on ? `${shadeColor}66` : 'rgba(150,150,150,0.3)'}
                strokeWidth="1"
            />
            {/* 유리병 내부 — 기포들 (clipped) */}
            <g clipPath="url(#bottleClip)">
                {on ? <>
                    {/* 기포 1 — 크고 둥근 */}
                    <ellipse cx="24" cy="50" rx="8" ry="12" fill="url(#lavaBlob1)" opacity="0.85" style={{ animation: 'lavaUp 4.5s ease-in-out infinite' }} />
                    {/* 기포 2 — 중간 */}
                    <ellipse cx="34" cy="100" rx="6" ry="9" fill="url(#lavaBlob2)" opacity="0.8" style={{ animation: 'lavaDown 5s ease-in-out infinite 1s' }} />
                    {/* 기포 3 — 작은 */}
                    <ellipse cx="28" cy="75" rx="4" ry="6" fill="url(#lavaBlob1)" opacity="0.7" style={{ animation: 'lavaUp2 3.5s ease-in-out infinite 0.5s' }} />
                    {/* 바닥 웅덩이 */}
                    <ellipse cx="28" cy="128" rx="12" ry="5" fill={shadeColorDark} opacity="0.5" />
                </> : <>
                    {/* OFF 상태: 정적 기포 */}
                    <ellipse cx="24" cy="110" rx="7" ry="8" fill="#999" opacity="0.2" />
                    <ellipse cx="34" cy="95" rx="5" ry="6" fill="#888" opacity="0.15" />
                    <ellipse cx="28" cy="125" rx="10" ry="4" fill="#999" opacity="0.15" />
                </>}
                {/* 유리 반사선 */}
                <line x1="17" y1="24" x2="15" y2="118" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            </g>
            {/* 하단 캡 (메탈릭) */}
            <rect x="10" y="132" width="36" height="14" rx="3" fill="url(#lavaCap)" />
            <rect x="12" y="134" width="32" height="2" rx="1" fill="rgba(255,255,255,0.08)" />
            {/* 하단 네온 발광 라인 */}
            {on && <rect x="12" y="131" width="32" height="1.5" rx="0.75" fill={shadeColor} opacity="0.4" />}
        </svg>
        <style>{`
            @keyframes lavaUp { 0%,100%{transform:translateY(0) scaleY(1)} 50%{transform:translateY(-40px) scaleY(0.85)} }
            @keyframes lavaDown { 0%,100%{transform:translateY(0) scaleY(1)} 50%{transform:translateY(25px) scaleY(1.1)} }
            @keyframes lavaUp2 { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-30px) scale(0.8)} }
        `}</style>
    </div>
);

export default MoodLight;
