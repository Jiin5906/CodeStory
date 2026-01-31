import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import mongleEATING from '../../assets/mongleEATING.json';
import mongleIDLE from '../../assets/mongleIDLE.json';
import { usePet } from '../../context/PetContext';

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
            {/* 벽 배경 (코랄/주황색 그라데이션) */}
            <div className="absolute inset-0 bg-gradient-to-b from-orange-300 via-orange-200 to-orange-100"></div>

            {/* 바닥 (노란색 타일 패턴) */}
            <div
                className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-b from-yellow-200 to-yellow-300"
                style={{
                    backgroundImage: `
                        linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
                        linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.1) 75%),
                        linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.1) 75%)
                    `,
                    backgroundSize: '40px 40px',
                    backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px'
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
                <div className="bg-white/60 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">
                    <h1 className="text-sm font-bold text-gray-600 flex items-center gap-2">
                        🍽️ 감정 냠냠 시간
                    </h1>
                </div>
                <div className="w-10 h-10"></div>
            </header>

            {/* 메인 영역 */}
            <main className="flex-1 flex flex-col items-center justify-center pb-20 relative overflow-hidden">
                {/* 벽 장식 - 왼쪽 위 액자 */}
                <div className="absolute top-20 left-8 z-5 bg-white/80 p-3 rounded-lg shadow-md border-4 border-amber-700">
                    <div className="text-3xl">🌸</div>
                </div>

                {/* 벽 장식 - 오른쪽 위 시계 */}
                <div className="absolute top-20 right-8 z-5 bg-white/80 p-2 rounded-full shadow-md border-3 border-amber-800">
                    <div className="text-2xl">🕐</div>
                </div>

                {/* 배경 가구 - 왼쪽 선반 + 화분 */}
                <div className="absolute top-32 left-6 z-5">
                    <div className="bg-amber-700 w-20 h-3 rounded-sm shadow-md mb-1"></div>
                    <div className="flex justify-center">
                        <div className="text-3xl">🪴</div>
                    </div>
                </div>

                {/* 배경 가구 - 오른쪽 냉장고 */}
                <div className="absolute top-40 right-8 z-5">
                    <div className="bg-gradient-to-b from-blue-200 to-blue-300 w-16 h-24 rounded-lg shadow-lg border-2 border-blue-400 flex flex-col items-center justify-center gap-1">
                        <div className="w-8 h-1 bg-gray-400 rounded"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    </div>
                </div>

                {/* 추가 장식 - 벽 스티커들 */}
                <div className="absolute top-36 left-1/2 -translate-x-1/2 z-5 text-2xl opacity-80">⭐</div>
                <div className="absolute top-28 left-1/3 z-5 text-xl opacity-70">🌟</div>
                <div className="absolute top-32 right-1/3 z-5 text-xl opacity-70">✨</div>

                {/* 바닥 러그 */}
                <div className="absolute bottom-40 z-10 w-48 h-32 bg-gradient-to-b from-pink-200 to-pink-300 rounded-3xl opacity-40 shadow-inner"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 10%, transparent 10%)',
                        backgroundSize: '20px 20px'
                    }}
                ></div>

                {/* 몽글이 말풍선 */}
                <div className="relative mb-6 z-10">
                    <div className="relative px-6 py-4 text-center max-w-[280px]">
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-md rounded-3xl shadow-lg border-2 border-white"></div>
                        <p className="relative text-base font-bold leading-relaxed text-slate-800">
                            {mongleBubble}
                        </p>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white/70 backdrop-blur-md rotate-45 border-r-2 border-b-2 border-white"></div>
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

                {/* 전경 - 식탁 */}
                <div className="absolute bottom-24 z-40 flex flex-col items-center">
                    {/* 식탁 상판 */}
                    <div className="bg-gradient-to-b from-amber-600 to-amber-700 w-64 h-4 rounded-full shadow-2xl border-t-2 border-amber-500"></div>
                    {/* 식탁 다리 */}
                    <div className="flex gap-40">
                        <div className="bg-amber-700 w-3 h-8 rounded-b-sm"></div>
                        <div className="bg-amber-700 w-3 h-8 rounded-b-sm"></div>
                    </div>
                </div>

                {/* 식탁 위 접시들 */}
                <div className="absolute bottom-28 left-1/4 z-41">
                    <div className="relative">
                        <div className="w-8 h-8 bg-white rounded-full shadow-md border-2 border-gray-200"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-blue-100 rounded-full"></div>
                    </div>
                </div>
                <div className="absolute bottom-28 right-1/4 z-41">
                    <div className="relative">
                        <div className="w-8 h-8 bg-white rounded-full shadow-md border-2 border-gray-200"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-pink-100 rounded-full"></div>
                    </div>
                </div>

                {/* 배고픔 게이지 */}
                <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-md border-2 border-white">
                    <div className="flex items-center gap-3">
                        <span className="text-lg">🍽️</span>
                        <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    hungerGauge >= 90 ? 'bg-green-400' :
                                    hungerGauge >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                                }`}
                                style={{ width: `${Math.min(100, hungerGauge)}%` }}
                            />
                        </div>
                        <span className="text-xs font-bold text-gray-600">
                            {Math.round(hungerGauge)}%
                        </span>
                    </div>
                </div>
            </main>

            {/* 하단 감정 조각 리스트 */}
            <div className="relative z-50 bg-white/90 backdrop-blur-md border-t-4 border-white/60 rounded-t-[35px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-8">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full"></div>

                <div className="px-8 pt-6 mb-2 text-center">
                    <span className="text-xs text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-full">
                        ✨ 감정 조각을 선택하세요
                    </span>
                </div>

                {/* 감정 조각 스크롤 영역 */}
                <div className="w-full overflow-x-auto no-scrollbar px-6 py-2">
                    {emotionShards.length > 0 ? (
                        <div className="flex gap-4 w-max pb-2">
                            {emotionShards.map(shard => {
                                const color = EMOTION_COLORS[shard.emotion] || '#E0E0E0';
                                const emoji = EMOTION_EMOJIS[shard.emotion] || '⚪';
                                const name = EMOTION_NAMES[shard.emotion] || '중립';

                                return (
                                    <button
                                        key={shard.id}
                                        onClick={() => handleFeedEmotion(shard)}
                                        className="group flex flex-col items-center gap-2 active:scale-90 transition-transform"
                                        data-gtm={`digestion-shard-${shard.emotion}`}
                                    >
                                        <div
                                            className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-3 border-white relative group-hover:scale-110 group-hover:shadow-xl transition-all animate-bounce-soft"
                                            style={{
                                                backgroundColor: color,
                                                boxShadow: `0 4px 12px ${color}80, inset 0 -2px 8px rgba(0,0,0,0.1)`
                                            }}
                                        >
                                            <div className="text-3xl drop-shadow-md">{emoji}</div>
                                            {/* 반짝이는 효과 */}
                                            <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse" style={{ animationDuration: '2s' }}></div>
                                        </div>
                                        <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
                                            <span className="text-[11px] font-bold text-gray-600">
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
