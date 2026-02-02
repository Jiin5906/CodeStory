import React, { useState, useMemo, useEffect, useRef } from 'react';
import { startOfDay, parseISO } from 'date-fns';
import MainRoom from './MainRoom';
import BottomSheet from './BottomSheet';
import CircularProgressNew from './CircularProgressNew';
import MoodLight from './MoodLight';
import MainMenu from './MainMenu';
import StoreView from './StoreView';
import { chatApi } from '../../services/api';
import { usePet } from '../../context/PetContext';

/**
 * HomeView — 홈/대화 페이지
 *
 * 몽글이와 상호작용하는 메인 화면
 */
const HomeView = ({ user, diaries, onWriteClick, onCalendarClick }) => {
    const [latestLog, setLatestLog] = useState(null);
    const [aiResponse, setAiResponse] = useState(null);
    const [emotion, setEmotion] = useState(null);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
    const [isStoreViewOpen, setIsStoreViewOpen] = useState(false);

    // 인터랙티브 효과를 위한 상태
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [windowColdAnimation, setWindowColdAnimation] = useState(false);
    const [windowClosedAnimation, setWindowClosedAnimation] = useState(false);

    const ventilateTimerRef = useRef(null);
    const coldTimerRef = useRef(null);

    const { handleVentilateComplete, petStatus, emotionShards, handleCollectShard, spawnEmotionShard, moodLightOn } = usePet();

    const today = startOfDay(new Date());
    const currentHour = new Date().getHours();
    const isNightTime = currentHour >= 18 || currentHour < 6;

    // 감정별 색상 매핑
    const getEmotionColor = (emotion) => {
        const emotionMap = {
            'anger': 'bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_15px_rgba(239,68,68,0.6)]',
            'happiness': 'bg-gradient-to-br from-pink-400 to-pink-600 shadow-[0_0_15px_rgba(236,72,153,0.6)]',
            'depression': 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_15px_rgba(59,130,246,0.6)]',
            'sadness': 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_15px_rgba(96,165,250,0.6)]',
            'anxiety': 'bg-gradient-to-br from-orange-500 to-orange-700 shadow-[0_0_15px_rgba(249,115,22,0.6)]',
            'fear': 'bg-gradient-to-br from-purple-600 to-purple-800 shadow-[0_0_15px_rgba(147,51,234,0.6)]',
            'surprise': 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-[0_0_15px_rgba(250,204,21,0.6)]',
            'love': 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-[0_0_15px_rgba(251,113,133,0.6)]',
            'calm': 'bg-gradient-to-br from-teal-400 to-teal-600 shadow-[0_0_15px_rgba(45,212,191,0.6)]',
            'neutral': 'bg-gradient-to-br from-gray-300 to-gray-500 shadow-[0_0_15px_rgba(156,163,175,0.6)]',
            'normal': 'bg-gradient-to-br from-white to-gray-200 shadow-[0_0_15px_rgba(229,231,235,0.6)]',
            'happy': 'bg-gradient-to-br from-pink-400 to-pink-600 shadow-[0_0_15px_rgba(236,72,153,0.6)]',
            'sad': 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_15px_rgba(96,165,250,0.6)]',
            'angry': 'bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_15px_rgba(239,68,68,0.6)]',
            'anxious': 'bg-gradient-to-br from-orange-500 to-orange-700 shadow-[0_0_15px_rgba(249,115,22,0.6)]',
            'scared': 'bg-gradient-to-br from-purple-600 to-purple-800 shadow-[0_0_15px_rgba(147,51,234,0.6)]',
            'surprised': 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-[0_0_15px_rgba(250,204,21,0.6)]',
            'loving': 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-[0_0_15px_rgba(251,113,133,0.6)]',
            'peaceful': 'bg-gradient-to-br from-teal-400 to-teal-600 shadow-[0_0_15px_rgba(45,212,191,0.6)]',
            'depressed': 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_15px_rgba(59,130,246,0.6)]'
        };
        return emotionMap[emotion.toLowerCase()] || emotionMap['normal'];
    };

    // 스트릭(연속 작성일) 계산
    const streakDays = useMemo(() => {
        if (!diaries || diaries.length === 0) return 0;

        const sortedDates = diaries
            .map(d => startOfDay(parseISO(d.date)))
            .sort((a, b) => b - a);

        if (sortedDates.length === 0) return 0;

        const latestDate = sortedDates[0];
        const daysDiff = Math.floor((today - latestDate) / (1000 * 60 * 60 * 24));

        if (daysDiff > 1) return 0;

        let streak = 1;
        let currentDate = latestDate;

        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = sortedDates[i];
            const diff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));

            if (diff === 1) {
                streak++;
                currentDate = prevDate;
            } else if (diff === 0) {
                continue;
            } else {
                break;
            }
        }
        return streak;
    }, [diaries, today]);

    // 창문 열기/닫기 핸들러
    const handleWindowClick = () => {
        if (!isWindowOpen) {
            setIsWindowOpen(true);
            setWindowColdAnimation(false);

            const ventilationAvailable = petStatus?.ventilationAvailable !== false;
            if (ventilationAvailable) {
                ventilateTimerRef.current = setTimeout(() => {
                    handleVentilateComplete(user?.id);
                    setAiResponse('환기가 완료 된 것 같아요! 😊');
                    setEmotion(null);
                    ventilateTimerRef.current = null;
                }, 10000);
            }

            coldTimerRef.current = setTimeout(() => {
                setWindowColdAnimation(true);
            }, 30000);
        } else {
            setIsWindowOpen(false);
            setWindowClosedAnimation(true);

            if (ventilateTimerRef.current) {
                clearTimeout(ventilateTimerRef.current);
                ventilateTimerRef.current = null;
            }
            if (coldTimerRef.current) {
                clearTimeout(coldTimerRef.current);
                coldTimerRef.current = null;
            }
            setWindowColdAnimation(false);

            setTimeout(() => {
                setWindowClosedAnimation(false);
            }, 3000);
        }
    };

    // 컴포넌트 정리 시 타이머 방지 누수
    useEffect(() => {
        return () => {
            if (ventilateTimerRef.current) clearTimeout(ventilateTimerRef.current);
            if (coldTimerRef.current) clearTimeout(coldTimerRef.current);
        };
    }, []);

    // 채팅 및 AI 응답 핸들러
    const handleWrite = async (content) => {
        setLatestLog(content);
        setIsAiThinking(true);
        setAiResponse(null);
        setEmotion(null);

        try {
            const response = await chatApi.sendMessage(user.id, content);

            if (response) {
                setAiResponse(response.response);

                if (response.emotion) {
                    setEmotion(response.emotion);
                    spawnEmotionShard(response.emotion);
                }
            }

            if (onWriteClick) {
                onWriteClick();
            }
        } catch (error) {
            console.error('채팅 처리 실패:', error);
            setAiResponse('죄송해요, 지금은 답변을 드릴 수 없어요. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsAiThinking(false);
        }
    };

    return (
        <div
            className="relative flex h-full w-full max-w-[430px] mx-auto flex-col overflow-hidden bg-gradient-to-b from-[#FFF8F3] to-[#FFE8F0]"
            data-gtm="view-home"
        >
            {/* 메인 화면 영역 (배경 + MainRoom) */}
            <div className="relative w-full flex-1 overflow-hidden">
                {/* 💡 무드등 OFF 시 어두운 오버레이 */}
                {!moodLightOn && (
                    <div
                        className="absolute inset-0 bg-black/60 z-[100] pointer-events-none transition-opacity duration-700"
                        style={{ mixBlendMode: 'multiply' }}
                    />
                )}

                {/* 🎨 벽 배경 */}
                <div className="absolute inset-0 bg-[#FF9EAA]" style={{
                    backgroundImage: `
                        radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.4) 0%, transparent 3%),
                        radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.3) 0%, transparent 2.5%),
                        radial-gradient(circle at 35% 70%, rgba(255, 255, 255, 0.35) 0%, transparent 2.8%),
                        radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 3%)
                    `,
                    backgroundSize: '100% 100%'
                }}></div>

                {/* 🪵 바닥 */}
                <div className="absolute bottom-0 w-full h-[40%] bg-[#FFCC80]" style={{
                    backgroundImage: `
                        linear-gradient(90deg, transparent 0%, rgba(255, 180, 100, 0.15) 2px, transparent 2px),
                        linear-gradient(90deg, transparent 0%, rgba(255, 180, 100, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '120px 100%, 40px 100%'
                }}></div>

                {/* 🪟 Left Wall - Arch Window (교체 가능한 장식) */}
                <div
                    className="absolute left-4 top-[25%] z-10 pointer-events-none"
                    data-decoration-type="window"
                    data-decoration-id="arch-window-01"
                    data-gtm="decoration-arch-window"
                >
                    {/* Window Frame */}
                    <div className="relative w-28 h-36">
                        {/* Arch Shape */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#8B7355] to-[#6B5638] rounded-t-full shadow-lg border-4 border-[#5D4037]"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-br from-[#8B7355] to-[#6B5638] border-4 border-t-0 border-[#5D4037]"></div>

                        {/* Window Panes - Day/Night Sky */}
                        <div className={`absolute inset-4 rounded-t-full overflow-hidden transition-all duration-1000 ${
                            isNightTime
                                ? 'bg-gradient-to-b from-[#1a1a2e] via-[#0f3460] to-[#16213e]'
                                : 'bg-gradient-to-b from-[#87CEEB] via-[#B0E0E6] to-[#E0F6FF]'
                        }`}>
                            {/* Stars at night */}
                            {isNightTime && (
                                <>
                                    <div className="absolute top-2 left-3 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                                    <div className="absolute top-5 right-4 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                                    <div className="absolute top-8 left-5 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                                    <div className="absolute top-3 right-2 w-1.5 h-1.5 bg-yellow-200 rounded-full shadow-lg shadow-yellow-200/50"></div>
                                </>
                            )}
                            {/* Sun/Clouds during day */}
                            {!isNightTime && (
                                <>
                                    <div className="absolute top-2 right-3 w-6 h-6 bg-yellow-300 rounded-full shadow-lg shadow-yellow-200/50"></div>
                                    <div className="absolute top-6 left-2 w-8 h-3 bg-white/60 rounded-full"></div>
                                    <div className="absolute top-10 right-2 w-6 h-2 bg-white/40 rounded-full"></div>
                                </>
                            )}
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 h-16 bg-gradient-to-b from-transparent to-white/10 rounded-b-lg"></div>

                        {/* Window Cross Divider */}
                        <div className="absolute top-1/2 left-4 right-4 h-1 bg-[#5D4037]"></div>
                        <div className="absolute top-4 bottom-4 left-1/2 w-1 bg-[#5D4037] -translate-x-1/2"></div>
                    </div>
                </div>

                {/* 📚 Right Wall - Wall Shelf with Items (교체 가능한 장식) */}
                <div
                    className="absolute right-4 top-[28%] z-10 pointer-events-none"
                    data-decoration-type="shelf"
                    data-decoration-id="wall-shelf-01"
                    data-gtm="decoration-wall-shelf"
                >
                    <div className="relative w-32 h-24">
                        {/* Shelf */}
                        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-b from-[#8B7355] to-[#6B5638] rounded-md shadow-lg"></div>
                        <div className="absolute -bottom-1 left-0 right-0 h-1.5 bg-[#5D4037] rounded-md"></div>

                        {/* Shelf Items */}
                        {/* Book Stack */}
                        <div className="absolute bottom-3 left-2 flex flex-col gap-0.5">
                            <div className="w-10 h-3 bg-gradient-to-r from-[#FF9AAB] to-[#FFB5C2] rounded-sm shadow-sm"></div>
                            <div className="w-9 h-3 bg-gradient-to-r from-[#D4A5F5] to-[#E0B3FF] rounded-sm shadow-sm ml-0.5"></div>
                            <div className="w-11 h-3 bg-gradient-to-r from-[#87CEEB] to-[#B0E0E6] rounded-sm shadow-sm"></div>
                        </div>

                        {/* Small Potted Plant */}
                        <div className="absolute bottom-3 right-3 flex flex-col items-center">
                            {/* Leaves */}
                            <div className="relative w-8 h-6">
                                <div className="absolute top-0 left-1 w-3 h-4 bg-[#90EE90] rounded-full transform -rotate-12"></div>
                                <div className="absolute top-0 right-1 w-3 h-4 bg-[#98FB98] rounded-full transform rotate-12"></div>
                                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-4 bg-[#7CFC00] rounded-full"></div>
                            </div>
                            {/* Pot */}
                            <div className="w-6 h-3 bg-gradient-to-b from-[#D2691E] to-[#A0522D] rounded-b-lg shadow-sm"></div>
                        </div>
                    </div>
                </div>

                {/* 🪴 Bottom Right - Large Potted Plant (교체 가능한 장식) */}
                <div
                    className="absolute right-8 bottom-[8%] z-20 pointer-events-none"
                    data-decoration-type="plant"
                    data-decoration-id="potted-plant-01"
                    data-gtm="decoration-potted-plant"
                >
                    <div className="relative w-24 h-32 flex flex-col items-center justify-end">
                        {/* Plant Leaves */}
                        <div className="relative w-full h-20 mb-2">
                            {/* Center leaves */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-14 bg-gradient-to-t from-[#228B22] to-[#32CD32] rounded-t-full shadow-md"></div>
                            <div className="absolute bottom-2 left-1/4 w-7 h-12 bg-gradient-to-t from-[#228B22] to-[#3CB371] rounded-t-full shadow-md transform -rotate-20"></div>
                            <div className="absolute bottom-2 right-1/4 w-7 h-12 bg-gradient-to-t from-[#228B22] to-[#90EE90] rounded-t-full shadow-md transform rotate-20"></div>
                            {/* Outer leaves */}
                            <div className="absolute bottom-4 left-2 w-6 h-10 bg-gradient-to-t from-[#2E8B57] to-[#66CDAA] rounded-t-full shadow-sm transform -rotate-35"></div>
                            <div className="absolute bottom-4 right-2 w-6 h-10 bg-gradient-to-t from-[#2E8B57] to-[#7CFC00] rounded-t-full shadow-sm transform rotate-35"></div>
                        </div>

                        {/* Large Pot */}
                        <div className="relative">
                            <div className="w-20 h-12 bg-gradient-to-b from-[#D2691E] to-[#8B4513] rounded-b-2xl shadow-xl border-2 border-[#A0522D]"></div>
                            <div className="absolute top-0 left-0 right-0 h-2 bg-[#A0522D] rounded-t-md"></div>
                            {/* Pot decoration */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#CD853F] opacity-30"></div>
                        </div>
                    </div>
                </div>

                {/* 🛋️ Center Floor - Circular Rug/Cushion under Mongle (교체 가능한 장식) */}
                <div
                    className="absolute left-1/2 top-[63%] -translate-x-1/2 z-10 pointer-events-none"
                    data-decoration-type="rug"
                    data-decoration-id="circular-rug-01"
                    data-gtm="decoration-circular-rug"
                >
                    <div className="relative w-48 h-12">
                        {/* Rug Shadow */}
                        <div className="absolute inset-0 bg-black/10 rounded-[50%] blur-md"></div>

                        {/* Main Rug */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#FFB5C2] via-[#FFD4DC] to-[#FF9AAB] rounded-[50%] shadow-lg overflow-hidden">
                            {/* Rug Pattern - Concentric circles */}
                            <div className="absolute inset-2 border-2 border-white/30 rounded-[50%]"></div>
                            <div className="absolute inset-4 border-2 border-[#FFB5C2]/40 rounded-[50%]"></div>

                            {/* Decorative dots */}
                            <div className="absolute top-1/2 left-[20%] w-2 h-2 bg-white/40 rounded-full"></div>
                            <div className="absolute top-1/2 right-[20%] w-2 h-2 bg-white/40 rounded-full"></div>
                            <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-2 h-2 bg-white/40 rounded-full"></div>
                            <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 w-2 h-2 bg-white/40 rounded-full"></div>
                        </div>

                        {/* Rug Fringe/Tassels */}
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                            <div className="w-2 h-0.5 bg-[#FF9AAB] rounded-full"></div>
                            <div className="w-2 h-0.5 bg-[#FFB5C2] rounded-full"></div>
                        </div>
                        <div className="absolute -right-1 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                            <div className="w-2 h-0.5 bg-[#FF9AAB] rounded-full"></div>
                            <div className="w-2 h-0.5 bg-[#FFB5C2] rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* MainRoom 컴포넌트 배치 */}
                <div className="absolute top-[53%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                    <div className="w-40 h-40 rounded-full pointer-events-auto flex items-center justify-center">
                        <MainRoom
                            latestLog={latestLog}
                            aiResponse={aiResponse}
                            emotion={emotion}
                            isAiThinking={isAiThinking}
                            user={user}
                            windowColdAnimation={windowColdAnimation}
                            windowClosedAnimation={windowClosedAnimation}
                        />
                    </div>
                </div>

                {/* 💡 무드등 */}
                <MoodLight />

                {/* 🧩 감정 조각 */}
                {emotionShards && emotionShards.map(shard => (
                    <div
                        key={shard.id}
                        className={`absolute z-25 w-8 h-8 rounded-full cursor-pointer pointer-events-auto animate-bounce active:scale-90 transition-transform duration-200 ${getEmotionColor(shard.emotion)}`}
                        style={{
                            left: `${shard.x}%`,
                            bottom: `${shard.y}%`,
                            animationDuration: '1.5s'
                        }}
                        onClick={() => {
                            handleCollectShard(user?.id, shard.id);
                        }}
                        data-gtm="emotion-shard-collect"
                    >
                        <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse"></div>
                    </div>
                ))}
            </div>

            {/* 헤더 영역 (스트릭 배지 + 레벨 HUD) */}
            <div
                className="absolute top-0 z-40 flex w-full items-end justify-end px-6 md:px-8 pointer-events-none"
                style={{ paddingTop: 'max(3.5rem, calc(1rem + env(safe-area-inset-top)))' }}
            >
                <div
                    className="rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 shadow-lg border-2 border-[#FFD4DC]/40 pointer-events-auto cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-200"
                    onClick={onCalendarClick}
                    data-gtm="streak-indicator"
                >
                    <span className="text-xs font-bold text-[#FFB5C2]">
                        🌸 {streakDays}일차
                    </span>
                </div>
            </div>

            <div
                className="pointer-events-auto"
                style={{ position: 'absolute', top: 'max(1.5rem, calc(0.5rem + env(safe-area-inset-top)))', left: '1.5rem', zIndex: 50 }}
            >
                <CircularProgressNew
                    level={petStatus?.level ?? 1}
                    percent={petStatus ? (petStatus.currentExp / petStatus.requiredExp) * 100 : 0}
                />
            </div>

            {/* BottomSheet */}
            <BottomSheet
                onWrite={handleWrite}
                onVentilateClick={handleWindowClick}
                onStoreClick={() => setIsStoreViewOpen(true)}
            />

            {/* 메인 메뉴 */}
            <MainMenu
                isOpen={isMainMenuOpen}
                onClose={() => setIsMainMenuOpen(false)}
                onEmotionShardsClick={onCalendarClick}
                onStoreClick={() => setIsStoreViewOpen(true)}
            />

            {/* 상점 */}
            <StoreView
                isOpen={isStoreViewOpen}
                onClose={() => setIsStoreViewOpen(false)}
            />
        </div>
    );
};

export default HomeView;
