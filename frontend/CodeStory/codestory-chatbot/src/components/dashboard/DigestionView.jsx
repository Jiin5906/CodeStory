import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import mongleEATING from '../../assets/mongleEATING.json';
import mongleIDLE from '../../assets/mongleIDLE.json';
import { usePet } from '../../context/PetContext';
import { HeartShard, StarShard, DropShard, FireShard } from './EmotionShardSVG';
import { getEmotionBase, getShardGlow } from './emotionShardUtils';

/**
 * DigestionView — 감정 소화 시스템 (식당 뷰)
 *
 * 사용자가 보유한 감정 조각을 몽글이에게 먹일 수 있습니다.
 * - 감정 조각 클릭 → 몽글이에게 날아가는 애니메이션
 * - 몽글이 색상 변화 (감정 색상으로)
 * - 배고픔 게이지 회복
 */

// 감정별 색상 정의
const EMOTION_COLORS = {
    anger: '#FF8A80',
    happiness: '#F8BBD0',
    sadness: '#81D4FA',
    depression: '#9FA8DA',
    anxiety: '#FFCC80',
    fear: '#CE93D8',
    surprise: '#FFF59D',
    love: '#EF9A9A',
    calm: '#A5D6A7',
    neutral: '#E0E0E0',
    bored: '#B0BEC5',
    happy: '#F8BBD0',  // alias
    sad: '#81D4FA',     // alias
    angry: '#FF8A80',   // alias
};

// 감정별 이모지
const EMOTION_EMOJIS = {
    anger: '🔥',
    happiness: '💖',
    sadness: '💧',
    depression: '☁️',
    anxiety: '⚡',
    fear: '👻',
    surprise: '✨',
    love: '🎀',
    calm: '🌿',
    neutral: '⚪',
    bored: '😴',
    happy: '💖',
    sad: '💧',
    angry: '🔥',
};

// 감정별 한글 이름
const EMOTION_NAMES = {
    anger: '화남',
    happiness: '행복',
    sadness: '슬픔',
    depression: '우울',
    anxiety: '불안',
    fear: '두려움',
    surprise: '놀람',
    love: '사랑',
    calm: '평온',
    neutral: '중립',
    bored: '지루함',
    happy: '행복',
    sad: '슬픔',
    angry: '화남',
};

const DigestionView = ({ onClose, userId }) => {
    const { emotionShards, hungerGauge, feedEmotion, handleCollectShard } = usePet();
    const [isEating, setIsEating] = useState(false);
    const [currentColor, setCurrentColor] = useState('#FFFFFF');
    const [flyingShards, setFlyingShards] = useState([]);
    const [floatingHearts, setFloatingHearts] = useState([]);
    const [mongleBubble, setMongleBubble] = useState('배고파요... ( •̀ ω •́ )');

    // ✅ 디버깅: emotionShards 확인
    useEffect(() => {
        console.log('🍽️ [DigestionView] emotionShards:', emotionShards);
        console.log('🍽️ [DigestionView] hungerGauge:', hungerGauge);
    }, [emotionShards, hungerGauge]);

    // 배고픔 상태에 따른 메시지
    useEffect(() => {
        if (hungerGauge >= 90) {
            setMongleBubble('더 못 먹겠어요! 배불러요 🥰');
        } else if (hungerGauge >= 50) {
            setMongleBubble('맛있어요! 더 주세요~ 😋');
        } else {
            setMongleBubble('배고파요... ( •̀ ω •́ )');
        }
    }, [hungerGauge]);

    // 감정 조각 먹이기
    const handleFeedEmotion = (shard) => {
        if (hungerGauge >= 100) {
            setMongleBubble('더 못 먹겠어요! 🤭');
            return;
        }

        const color = EMOTION_COLORS[shard.emotion] || '#FFFFFF';
        const emoji = EMOTION_EMOJIS[shard.emotion] || '⚪';

        // 날아가는 애니메이션 시작
        // eslint-disable-next-line react-hooks/purity
        const flyId = Date.now() + Math.random();
        setFlyingShards(prev => [...prev, {
            id: flyId,
            emoji,
            color,
            startX: `${shard.x}%`,
            startY: `${shard.y}%`
        }]);

        // 0.7초 후 제거 (애니메이션 완료)
        setTimeout(() => {
            setFlyingShards(prev => prev.filter(f => f.id !== flyId));
        }, 700);

        // 먹는 애니메이션
        setIsEating(true);
        setMongleBubble('냠냠... 😋');

        // 하트 떠오르는 효과 (3개)
        // eslint-disable-next-line react-hooks/purity
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                // eslint-disable-next-line react-hooks/purity
                const heartId = Date.now() + Math.random();
                setFloatingHearts(prev => [...prev, {
                    id: heartId,
                    delay: i * 200
                }]);

                setTimeout(() => {
                    setFloatingHearts(prev => prev.filter(h => h.id !== heartId));
                }, 2000);
            }, i * 300);
        }

        // 색상 변화
        setCurrentColor(color);

        // 배고픔 게이지 회복
        feedEmotion(shard.emotion, 25);

        // 감정 조각 제거
        handleCollectShard(userId, shard.id);

        // 3초 후 원래 색상으로
        setTimeout(() => {
            setIsEating(false);
            if (hungerGauge >= 90) {
                setMongleBubble('배불러요! 🥰');
            } else {
                setMongleBubble('더 주세요~ 😊');
            }
        }, 1500);

        setTimeout(() => {
            if (hungerGauge < 50) {
                setCurrentColor('#FFFFFF');
            }
        }, 5000);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col"
            data-gtm="digestion-view"
        >
            {/* 벽 배경 (파스텔 핑크) */}
            <div className="absolute inset-0 bg-[#FFB3C1]" style={{
                backgroundImage: `
                    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.3) 0%, transparent 2.5%),
                    radial-gradient(circle at 65% 35%, rgba(255, 255, 255, 0.25) 0%, transparent 2%),
                    radial-gradient(circle at 40% 65%, rgba(255, 255, 255, 0.3) 0%, transparent 2.3%),
                    radial-gradient(circle at 75% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 2.5%)
                `,
                backgroundSize: '100% 100%'
            }}></div>

            {/* 바닥 (파스텔 크림/베이지) */}
            <div
                className="absolute bottom-0 left-0 right-0 h-[40%] bg-[#FFD7B5]"
                style={{
                    backgroundImage: `
                        linear-gradient(90deg, transparent 0%, rgba(255, 200, 150, 0.12) 2px, transparent 2px),
                        linear-gradient(90deg, transparent 0%, rgba(255, 200, 150, 0.08) 1px, transparent 1px)
                    `,
                    backgroundSize: '100px 100%, 35px 100%'
                }}
            ></div>

            {/* 헤더 */}
            <header className="relative z-50 pt-14 px-6 flex items-center justify-between">
                <button
                    onClick={onClose}
                    className="w-10 h-10 bg-white/90 rounded-full text-gray-600 shadow-md flex items-center justify-center border-2 border-white active:scale-95 hover:bg-white transition text-lg"
                    data-gtm="digestion-close-button"
                >
                    ←
                </button>
                <div className="w-10 h-10"></div>
                <div className="w-10 h-10"></div>
            </header>

            {/* 메인 영역 */}
            <main className="flex-1 flex flex-col items-center justify-center pb-20 relative overflow-hidden">
                {/* 미니멀한 장식 - 상단 작은 구름 하나 */}
                <div className="absolute top-24 right-12 z-5 flex gap-1 opacity-40">
                    <div className="w-4 h-3 bg-white/60 rounded-full"></div>
                    <div className="w-5 h-3.5 bg-white/70 rounded-full -ml-2"></div>
                    <div className="w-3 h-3 bg-white/60 rounded-full -ml-1"></div>
                </div>

                {/* 몽글이 말풍선 */}
                <div className="relative mb-6 z-10">
                    <div className="relative px-6 py-4 text-center max-w-[280px]">
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-md rounded-3xl shadow-lg border border-white/40"></div>
                        <p className="relative text-base font-medium leading-relaxed text-slate-800">
                            {mongleBubble}
                        </p>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white/60 backdrop-blur-md rotate-45 border-r border-b border-white/40"></div>
                    </div>
                </div>

                {/* 몽글이 캐릭터 */}
                <div className="relative w-60 h-60 transition-all duration-1000" style={{
                    filter: `drop-shadow(0 0 20px ${currentColor}80)`,
                }}>
                    <Lottie
                        animationData={isEating ? mongleEATING : mongleIDLE}
                        loop={true}
                        autoplay={true}
                        className="w-full h-full"
                        style={{
                            filter: currentColor !== '#FFFFFF' ? `sepia(1) saturate(3) hue-rotate(0deg) brightness(1.1)` : 'none',
                            transition: 'filter 1s ease'
                        }}
                    />
                </div>

                {/* 날아가는 감정 조각들 */}
                {flyingShards.map(fly => (
                    <div
                        key={fly.id}
                        className="fixed text-3xl z-[100] pointer-events-none transition-all duration-700 ease-in-out"
                        style={{
                            left: fly.startX,
                            top: fly.startY,
                            animation: 'fly-to-mongle 0.7s ease-in-out forwards'
                        }}
                    >
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: fly.color }}
                        >
                            {fly.emoji}
                        </div>
                    </div>
                ))}

                {/* 떠오르는 하트들 */}
                {floatingHearts.map(heart => (
                    <div
                        key={heart.id}
                        className="absolute z-[100] pointer-events-none"
                        style={{
                            left: '50%',
                            top: '50%',
                            animation: 'float-up-heart 2s ease-out forwards',
                            animationDelay: `${heart.delay}ms`
                        }}
                    >
                        <div className="text-4xl">💕</div>
                    </div>
                ))}

                {/* 전경 - 미니멀한 식탁 */}
                <div className="absolute bottom-24 z-40">
                    <div className="text-6xl opacity-30">🍽️</div>
                </div>

                {/* 배고픔 게이지 */}
                <div className="mt-8 bg-white/60 backdrop-blur-md rounded-full px-6 py-3 shadow-lg border border-white/40">
                    <div className="flex items-center gap-3">
                        <span className="text-lg">🍽️</span>
                        <div className="w-32 h-3 bg-white/40 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    hungerGauge >= 90 ? 'bg-gradient-to-r from-green-300 to-green-400' :
                                    hungerGauge >= 50 ? 'bg-gradient-to-r from-yellow-300 to-yellow-400' :
                                    'bg-gradient-to-r from-red-300 to-red-400'
                                }`}
                                style={{ width: `${Math.min(100, hungerGauge)}%` }}
                            />
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                            {Math.round(hungerGauge)}%
                        </span>
                    </div>
                </div>
            </main>

            {/* 하단 감정 조각 리스트 */}
            <div className="relative z-50 bg-white/90 backdrop-blur-md border-t-4 border-white/60 rounded-t-[35px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] h-[220px] flex flex-col">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full"></div>

                <div className="px-8 pt-6 pb-3 text-center flex-shrink-0">
                    <span className="text-xs text-gray-500 font-medium bg-white/60 px-3 py-1.5 rounded-full border border-white/40">
                        감정 조각을 선택하세요
                    </span>
                </div>

                {/* 감정 조각 스크롤 영역 */}
                <div className="w-full overflow-x-auto no-scrollbar px-6 py-2 flex-1">
                    {emotionShards.length > 0 ? (
                        <div className="flex gap-4 w-max pb-2">
                            {emotionShards.map(shard => {
                                const name = EMOTION_NAMES[shard.emotion] || '중립';
                                const glowColor = getShardGlow(shard.emotion);
                                const base = getEmotionBase(shard.emotion);

                                return (
                                    <button
                                        key={shard.id}
                                        onClick={() => handleFeedEmotion(shard)}
                                        className="group flex flex-col items-center gap-2 active:scale-95 transition-all"
                                        data-gtm={`digestion-shard-${shard.emotion}`}
                                    >
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center relative group-hover:scale-105 transition-all"
                                            style={{
                                                background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                                                boxShadow: `0 4px 12px ${glowColor}`,
                                            }}
                                        >
                                            <div className="drop-shadow-md">
                                                {base === 'happy' && <HeartShard size={36} />}
                                                {base === 'sad' && <DropShard size={36} />}
                                                {base === 'angry' && <FireShard size={36} />}
                                                {base === 'neutral' && <StarShard size={36} />}
                                            </div>
                                        </div>
                                        <div className="bg-white/70 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
                                            <span className="text-[10px] font-medium text-gray-600">
                                                {name}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="w-full text-center py-8 px-6">
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-dashed border-gray-300">
                                <div className="text-5xl mb-3 opacity-40">🍽️</div>
                                <p className="text-sm font-bold text-gray-500 mb-2">아직 감정 조각이 없어요</p>
                                <p className="text-xs text-gray-400">일기를 작성하면 감정 조각을 얻을 수 있어요!</p>
                                <p className="text-xs text-gray-400 mt-1">💝 수집한 조각으로 몽글이를 먹여주세요</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fly-to-mongle {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50vw, -30vh) scale(0.5);
                        opacity: 0;
                    }
                }

                @keyframes float-up-heart {
                    0% {
                        transform: translate(-50%, -50%) translateY(0) scale(0.5);
                        opacity: 0;
                    }
                    20% {
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) translateY(-150px) scale(1.2);
                        opacity: 0;
                    }
                }

                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }

                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default DigestionView;
