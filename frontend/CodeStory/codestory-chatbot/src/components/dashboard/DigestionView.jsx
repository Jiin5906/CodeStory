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
    const [mongleBubble, setMongleBubble] = useState('배고파요... ( •̀ ω •́ )');

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
            className="fixed inset-0 z-50 bg-gradient-to-b from-pink-100 via-pink-50 to-yellow-50 flex flex-col"
            data-gtm="digestion-view"
        >
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
                {/* 배경 데코레이션 */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl"></div>

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
                    <div className="flex gap-4 w-max">
                        {emotionShards.length > 0 ? (
                            emotionShards.map(shard => {
                                const color = EMOTION_COLORS[shard.emotion] || '#E0E0E0';
                                const emoji = EMOTION_EMOJIS[shard.emotion] || '⚪';
                                const name = EMOTION_NAMES[shard.emotion] || '중립';

                                return (
                                    <button
                                        key={shard.id}
                                        onClick={() => handleFeedEmotion(shard)}
                                        className="group flex flex-col items-center gap-1 active:scale-90 transition-transform"
                                        data-gtm={`digestion-shard-${shard.emotion}`}
                                    >
                                        <div
                                            className="w-14 h-14 rounded-full flex items-center justify-center shadow-md border-2 border-white relative group-hover:scale-110 transition-transform"
                                            style={{ backgroundColor: color }}
                                        >
                                            <div className="text-2xl drop-shadow-sm">{emoji}</div>
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-500">
                                            {name}
                                        </span>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="w-full text-center py-6 text-gray-400">
                                <p className="text-sm font-medium">아직 감정 조각이 없어요</p>
                                <p className="text-xs mt-1">일기를 작성하면 감정 조각을 얻을 수 있어요!</p>
                            </div>
                        )}
                    </div>
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
