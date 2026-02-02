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

                {/* 🪟 Right Wall - Large Window (교체 가능한 장식) */}
                <div
                    className="absolute right-0 top-[12%] z-10 pointer-events-none"
                    data-decoration-type="window"
                    data-decoration-id="large-window-01"
                    data-gtm="decoration-large-window"
                >
                    <div className="relative w-56 h-72">
                        {/* Window Frame - Blue */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#7DD3FC] to-[#38BDF8] rounded-3xl shadow-2xl border-4 border-[#0EA5E9]"></div>

                        {/* Window Content - Sky */}
                        <div className="absolute inset-3 rounded-2xl overflow-hidden bg-gradient-to-b from-[#87CEEB] via-[#B0E0E6] to-[#7DD3FC]">
                            {/* Clouds */}
                            <div className="absolute top-6 left-4 w-16 h-6 bg-white/80 rounded-full blur-sm"></div>
                            <div className="absolute top-8 left-8 w-12 h-5 bg-white/70 rounded-full blur-sm"></div>
                            <div className="absolute top-10 right-6 w-20 h-7 bg-white/75 rounded-full blur-sm"></div>
                            <div className="absolute top-14 right-10 w-14 h-5 bg-white/65 rounded-full blur-sm"></div>

                            {/* Ground Section */}
                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-[#7EC850] to-[#5FA839]">
                                {/* Grass texture */}
                                <div className="absolute inset-0 opacity-20" style={{
                                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)'
                                }}></div>
                            </div>

                            {/* Trees */}
                            {/* Left Tree */}
                            <div className="absolute bottom-16 left-8 flex flex-col items-center">
                                {/* Tree Crown */}
                                <div className="relative w-12 h-12">
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-[#66BB6A] to-[#4CAF50] rounded-full opacity-90"></div>
                                    <div className="absolute bottom-2 left-0 w-8 h-8 bg-gradient-to-br from-[#66BB6A] to-[#4CAF50] rounded-full opacity-80"></div>
                                    <div className="absolute bottom-2 right-0 w-8 h-8 bg-gradient-to-br from-[#66BB6A] to-[#4CAF50] rounded-full opacity-80"></div>
                                </div>
                                {/* Tree Trunk */}
                                <div className="w-2 h-8 bg-gradient-to-b from-[#8D6E63] to-[#6D4C41] rounded-t-sm"></div>
                            </div>

                            {/* Right Tree */}
                            <div className="absolute bottom-16 right-24 flex flex-col items-center">
                                {/* Tree Crown */}
                                <div className="relative w-10 h-10">
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-[#81C784] to-[#66BB6A] rounded-full opacity-90"></div>
                                    <div className="absolute bottom-2 left-0 w-6 h-6 bg-gradient-to-br from-[#81C784] to-[#66BB6A] rounded-full opacity-80"></div>
                                    <div className="absolute bottom-2 right-0 w-6 h-6 bg-gradient-to-br from-[#81C784] to-[#66BB6A] rounded-full opacity-80"></div>
                                </div>
                                {/* Tree Trunk */}
                                <div className="w-2 h-7 bg-gradient-to-b from-[#8D6E63] to-[#6D4C41] rounded-t-sm"></div>
                            </div>

                            {/* Small House */}
                            <div className="absolute bottom-12 right-6 flex flex-col items-center">
                                {/* Roof */}
                                <div className="relative w-14 h-8">
                                    <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[28px] border-l-transparent border-r-[28px] border-r-transparent border-b-[32px] border-b-[#FF6B6B]"></div>
                                </div>
                                {/* House Body */}
                                <div className="w-12 h-10 bg-gradient-to-b from-[#FFE082] to-[#FFD54F] rounded-b-lg shadow-md">
                                    {/* Windows */}
                                    <div className="flex justify-center gap-2 pt-2">
                                        <div className="w-3 h-3 bg-[#64B5F6] rounded-sm"></div>
                                        <div className="w-3 h-3 bg-[#64B5F6] rounded-sm"></div>
                                    </div>
                                    {/* Door */}
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-5 bg-[#8D6E63] rounded-t-md"></div>
                                </div>
                            </div>
                        </div>

                        {/* Window Cross Dividers */}
                        <div className="absolute top-1/2 left-3 right-3 h-1 bg-[#0EA5E9]"></div>
                        <div className="absolute top-3 bottom-3 left-1/2 w-1 bg-[#0EA5E9] -translate-x-1/2"></div>
                    </div>
                </div>

                {/* 📚 Left Wall - 2-Tier Shelf (교체 가능한 장식) */}
                <div
                    className="absolute left-4 top-[32%] z-10 pointer-events-none"
                    data-decoration-type="shelf"
                    data-decoration-id="wall-shelf-01"
                    data-gtm="decoration-wall-shelf"
                >
                    <div className="relative w-36 h-32">
                        {/* Top Shelf */}
                        <div className="absolute top-0 left-0 right-0">
                            <div className="h-2.5 bg-gradient-to-b from-[#D7CCC8] to-[#BCAAA4] rounded-md shadow-md"></div>
                            <div className="h-1 bg-[#A1887F] rounded-b-sm"></div>
                        </div>

                        {/* Bottom Shelf */}
                        <div className="absolute bottom-0 left-0 right-0">
                            <div className="h-2.5 bg-gradient-to-b from-[#D7CCC8] to-[#BCAAA4] rounded-md shadow-md"></div>
                            <div className="h-1 bg-[#A1887F] rounded-b-sm"></div>
                        </div>

                        {/* Top Shelf Items - Small Potted Plant */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            {/* Leaves */}
                            <div className="relative w-10 h-8">
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-5 bg-gradient-to-t from-[#4CAF50] to-[#66BB6A] rounded-full"></div>
                                <div className="absolute bottom-1 left-1 w-3.5 h-4 bg-gradient-to-t from-[#4CAF50] to-[#66BB6A] rounded-full transform -rotate-20"></div>
                                <div className="absolute bottom-1 right-1 w-3.5 h-4 bg-gradient-to-t from-[#4CAF50] to-[#66BB6A] rounded-full transform rotate-20"></div>
                            </div>
                            {/* Pot */}
                            <div className="w-8 h-4 bg-gradient-to-b from-[#FF8A65] to-[#FF6E40] rounded-b-lg shadow-sm"></div>
                        </div>

                        {/* Bottom Shelf Items */}
                        {/* Apple (left) */}
                        <div className="absolute bottom-4 left-4">
                            <div className="w-7 h-7 bg-gradient-to-br from-[#FF6B6B] to-[#EE5A52] rounded-full shadow-md"></div>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-2 bg-[#8D6E63] rounded-t-full"></div>
                            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                        </div>

                        {/* Purple Book (right) */}
                        <div className="absolute bottom-4 right-4">
                            <div className="w-10 h-12 bg-gradient-to-br from-[#AB47BC] to-[#8E24AA] rounded-sm shadow-md border-l-2 border-[#7B1FA2]">
                                {/* Book spine lines */}
                                <div className="absolute top-2 left-1 right-1 h-px bg-white/20"></div>
                                <div className="absolute bottom-2 left-1 right-1 h-px bg-white/20"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 💡 Left Bottom - Floor Lamp (교체 가능한 장식) */}
                <div
                    className="absolute left-6 bottom-[8%] z-20 pointer-events-none"
                    data-decoration-type="lamp"
                    data-decoration-id="floor-lamp-01"
                    data-gtm="decoration-floor-lamp"
                >
                    <div className="relative w-20 h-40 flex flex-col items-center">
                        {/* Lamp Shade */}
                        <div className="relative w-16 h-20 mb-2">
                            {/* Shade body */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#FFF9E6] via-[#FFF3CC] to-[#FFECB3] rounded-b-full shadow-lg" style={{
                                clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
                            }}></div>
                            {/* Vertical lines texture */}
                            <div className="absolute inset-0 opacity-20" style={{
                                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 3px)'
                            }}></div>
                            {/* Top rim */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-2 bg-[#D4AF37] rounded-full shadow-sm"></div>
                            {/* Light glow effect */}
                            <div className="absolute inset-2 bg-gradient-to-b from-[#FFFACD]/60 to-transparent blur-sm"></div>
                        </div>

                        {/* Lamp Pole */}
                        <div className="w-1.5 h-12 bg-gradient-to-b from-[#424242] to-[#212121] rounded-full shadow-md"></div>

                        {/* Lamp Base */}
                        <div className="relative w-12 h-8">
                            <div className="absolute bottom-0 w-full h-3 bg-gradient-to-b from-[#424242] to-[#212121] rounded-full shadow-lg"></div>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-gradient-to-b from-[#616161] to-[#424242] rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* 🌳 Right Bottom - Large Bush/Tree (교체 가능한 장식) */}
                <div
                    className="absolute right-8 bottom-[8%] z-20 pointer-events-none"
                    data-decoration-type="plant"
                    data-decoration-id="large-bush-01"
                    data-gtm="decoration-large-bush"
                >
                    <div className="relative w-28 h-36 flex flex-col items-center justify-end">
                        {/* Bush Leaves - Fluffy circular bush */}
                        <div className="relative w-full h-24 mb-2">
                            {/* Main bush body */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-20 bg-gradient-to-br from-[#66BB6A] to-[#4CAF50] rounded-full shadow-lg"></div>

                            {/* Additional leaf layers for depth */}
                            <div className="absolute bottom-4 left-2 w-16 h-14 bg-gradient-to-br from-[#81C784] to-[#66BB6A] rounded-full opacity-90"></div>
                            <div className="absolute bottom-4 right-2 w-16 h-14 bg-gradient-to-br from-[#66BB6A] to-[#4CAF50] rounded-full opacity-90"></div>
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-18 h-16 bg-gradient-to-br from-[#A5D6A7] to-[#81C784] rounded-full opacity-85"></div>

                            {/* Highlight spots */}
                            <div className="absolute top-4 left-6 w-8 h-8 bg-gradient-to-br from-[#C8E6C9] to-transparent rounded-full opacity-40"></div>
                            <div className="absolute top-6 right-8 w-6 h-6 bg-gradient-to-br from-[#C8E6C9] to-transparent rounded-full opacity-30"></div>
                        </div>

                        {/* Large Pot - Coral/Orange color */}
                        <div className="relative">
                            <div className="w-24 h-14 bg-gradient-to-b from-[#FF8A65] via-[#FF7043] to-[#FF5722] rounded-b-3xl shadow-2xl border-2 border-[#F4511E]"></div>
                            <div className="absolute top-0 left-0 right-0 h-3 bg-[#F4511E] rounded-t-lg"></div>
                            {/* Pot highlight */}
                            <div className="absolute top-2 left-4 w-12 h-6 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* 🛋️ Center Floor - Purple Circular Cushion under Mongle (교체 가능한 장식) */}
                <div
                    className="absolute left-1/2 top-[63%] -translate-x-1/2 z-10 pointer-events-none"
                    data-decoration-type="rug"
                    data-decoration-id="purple-cushion-01"
                    data-gtm="decoration-purple-cushion"
                >
                    <div className="relative w-52 h-14">
                        {/* Cushion Shadow */}
                        <div className="absolute inset-0 bg-black/15 rounded-[50%] blur-lg"></div>

                        {/* Main Cushion - Purple */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#CE93D8] via-[#BA68C8] to-[#AB47BC] rounded-[50%] shadow-xl overflow-hidden">
                            {/* Dotted border pattern */}
                            <svg className="absolute inset-0 w-full h-full" style={{ transform: 'scaleY(0.27)' }}>
                                <ellipse
                                    cx="50%"
                                    cy="50%"
                                    rx="45%"
                                    ry="45%"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeDasharray="6 6"
                                    opacity="0.4"
                                />
                                <ellipse
                                    cx="50%"
                                    cy="50%"
                                    rx="35%"
                                    ry="35%"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeDasharray="4 4"
                                    opacity="0.3"
                                />
                            </svg>

                            {/* Center highlight */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-4 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full"></div>
                        </div>

                        {/* Cushion edge stitching effect */}
                        <div className="absolute inset-1 rounded-[50%] border border-[#E1BEE7]/30"></div>
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
