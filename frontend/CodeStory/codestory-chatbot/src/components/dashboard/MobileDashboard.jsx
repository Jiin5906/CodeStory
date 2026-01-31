import React, { useState, useMemo, useEffect, useRef } from 'react';
import { startOfDay, parseISO } from 'date-fns';
import MainRoom from './MainRoom';
import BottomSheet from './BottomSheet';
import MindRecord from '../../change/MindRecord';
import CircularProgressNew from './CircularProgressNew';
import DigestionView from './DigestionView';
import MoodLight from './MoodLight';
import MainMenu from './MainMenu';
import StoreView from './StoreView';
import { diaryApi, chatApi } from '../../services/api';
import { usePet } from '../../context/PetContext';

const MobileDashboard = ({ user, diaries, onWriteClick, onCalendarClick, onStatsClick, onSettingsClick }) => {
    const [latestLog, setLatestLog] = useState(null);
    const [aiResponse, setAiResponse] = useState(null);
    const [emotion, setEmotion] = useState(null);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [isMindRecordOpen, setIsMindRecordOpen] = useState(false);
    const [isDigestionViewOpen, setIsDigestionViewOpen] = useState(false);
    const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
    const [isStoreViewOpen, setIsStoreViewOpen] = useState(false);

    // 인터랙티브 효과를 위한 상태
    const [isWindowOpen, setIsWindowOpen] = useState(false);

    // 창문 관련 확장 상태
    const [windowColdAnimation, setWindowColdAnimation] = useState(false);
    const [windowClosedAnimation, setWindowClosedAnimation] = useState(false);

    const ventilateTimerRef = useRef(null);
    const coldTimerRef = useRef(null);

    const { handleVentilateComplete, petStatus, emotionShards, handleCollectShard, spawnEmotionShard, moodLightOn, isSleeping } = usePet();

    const today = startOfDay(new Date());

    // 실시간 낮/밤 판별 (06:00 ~ 17:59: 낮, 18:00 ~ 05:59: 밤)
    const currentHour = new Date().getHours();
    const isNightTime = currentHour >= 18 || currentHour < 6;

    // 스트릭(연속 작성일) 계산 로직
    // 감정별 색상 매핑 (11가지 + 백엔드 호환 별칭)
    const getEmotionColor = (emotion) => {
        const emotionMap = {
            // ━━━ 프론트엔드 표준 감정 (11가지) ━━━
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

            // ━━━ 백엔드 호환 별칭 (안전장치) ━━━
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
            // 열기
            setIsWindowOpen(true);
            setWindowColdAnimation(false);

            // 환기 가능 시 10초 카운트
            const ventilationAvailable = petStatus?.ventilationAvailable !== false;
            if (ventilationAvailable) {
                ventilateTimerRef.current = setTimeout(() => {
                    handleVentilateComplete(user?.id);
                    setAiResponse('환기가 완료 된 것 같아요! 😊');
                    setEmotion(null);
                    ventilateTimerRef.current = null;
                }, 10000);
            }

            // 30초 미폐쇄 감지
            coldTimerRef.current = setTimeout(() => {
                setWindowColdAnimation(true);
            }, 30000);
        } else {
            // 닫기
            setIsWindowOpen(false);
            setWindowClosedAnimation(true);

            // 타이머 정리
            if (ventilateTimerRef.current) {
                clearTimeout(ventilateTimerRef.current);
                ventilateTimerRef.current = null;
            }
            if (coldTimerRef.current) {
                clearTimeout(coldTimerRef.current);
                coldTimerRef.current = null;
            }
            setWindowColdAnimation(false);

            // 3초 후 windowClosedAnimation 리셋
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
            console.log('💬 채팅 입력 → ChatAPI 호출 (감정 분석 포함)');

            // 채팅 API 호출 (감정 태그 포함)
            const response = await chatApi.sendMessage(user.id, content);

            if (response) {
                // response 구조: { response: "AI 응답 내용", emotion: "happiness" }
                setAiResponse(response.response);

                if (response.emotion) {
                    setEmotion(response.emotion);
                    console.log('✨ 감정 감지:', response.emotion);
                    // 감정 조각 생성
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
        <div className="bg-gradient-to-br from-[#FFF8F3] via-[#FFE8F0] to-[#F5E8FF] md:flex md:min-h-screen md:items-center md:justify-center md:p-4 font-body" data-gtm="view-mobile-dashboard-new">

            {/* 폰 프레임 컨테이너 */}
            <div className="relative flex h-[100dvh] md:h-[800px] w-full md:max-w-[375px] flex-col overflow-hidden md:rounded-[3rem] md:border-[10px] md:border-white bg-gradient-to-b from-[#FFF8F3] to-[#FFE8F0] md:shadow-[0_30px_80px_-15px_rgba(255,181,194,0.4)] md:ring-1 md:ring-[#FFD4DC]">

                {/* 메인 화면 영역 (배경 + MainRoom) */}
                <div className="relative w-full flex-1 overflow-hidden">
                    {/* 💡 무드등 OFF 시 어두운 오버레이 */}
                    {!moodLightOn && (
                        <div
                            className="absolute inset-0 bg-black/60 z-[100] pointer-events-none transition-opacity duration-700"
                            style={{ mixBlendMode: 'multiply' }}
                        />
                    )}

                    {/* MoodLight 컴포넌트 (우측 상단) */}
                    <MoodLight />

                    {/* 🎨 벽 배경 (상단 60%) - 핑크색 + 다이아몬드 패턴 */}
                    <div className="absolute inset-0 bg-[#FF9EAA]" style={{
                        backgroundImage: `
                            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.4) 0%, transparent 3%),
                            radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.3) 0%, transparent 2.5%),
                            radial-gradient(circle at 35% 70%, rgba(255, 255, 255, 0.35) 0%, transparent 2.8%),
                            radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 3%),
                            radial-gradient(circle at 15% 85%, rgba(255, 255, 255, 0.3) 0%, transparent 2.5%),
                            radial-gradient(circle at 70% 75%, rgba(255, 255, 255, 0.35) 0%, transparent 2.8%),
                            radial-gradient(circle at 45% 15%, rgba(255, 255, 255, 0.3) 0%, transparent 2.5%),
                            radial-gradient(circle at 90% 65%, rgba(255, 255, 255, 0.4) 0%, transparent 3%)
                        `,
                        backgroundSize: '100% 100%',
                        backgroundPosition: '0 0'
                    }}></div>

                    {/* 🪵 바닥 (하단 40%) - 오렌지 우드톤 + 나무 질감 */}
                    <div className="absolute bottom-0 w-full h-[40%] bg-[#FFCC80]" style={{
                        backgroundImage: `
                            linear-gradient(90deg, transparent 0%, rgba(255, 180, 100, 0.15) 2px, transparent 2px),
                            linear-gradient(90deg, transparent 0%, rgba(255, 180, 100, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '120px 100%, 40px 100%',
                        backgroundPosition: '0 0, 0 0'
                    }}></div>

                    {/* 🪟 대형 창문 (우측) - 다마고치 스타일, 일부 잘림 */}
                    <div
                        className="absolute top-[5%] right-[-12%] z-20 w-[40%] h-[48%]"
                        data-gtm="window-decoration-click"
                        style={{
                            filter: 'drop-shadow(-4px 8px 16px rgba(0,0,0,0.25))'
                        }}
                    >
                        <div className="relative w-full h-full">
                            {/* 창문 틀 (큰 아치형) - 파란색 두꺼운 테두리 */}
                            <div className="absolute inset-0 rounded-tl-[45%] rounded-tr-[45%] rounded-b-2xl border-[10px] border-[#5DADE2] overflow-hidden" style={{
                                boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.15), inset 0 -4px 8px rgba(255,255,255,0.3), 0 0 0 2px rgba(255,255,255,0.4)',
                                background: 'linear-gradient(135deg, #6EC1E4 0%, #5DADE2 100%)'
                            }}>
                                {/* 하늘 배경 (낮/밤 조건부 렌더링) */}
                                <div className={`absolute inset-0 transition-colors duration-1000 ${
                                    isNightTime
                                        ? 'bg-gradient-to-b from-slate-900 via-indigo-950 to-indigo-900'
                                        : 'bg-gradient-to-b from-[#87CEEB] via-[#A8D8F0] to-[#C8EDF9]'
                                }`}>
                                    {/* 밤하늘 장식 (별과 달) */}
                                    {isNightTime && (
                                        <>
                                            {/* 🌙 달 */}
                                            <div className="absolute top-[15%] right-[20%] text-4xl animate-pulse" style={{ animationDuration: '3s' }}>
                                                🌙
                                            </div>
                                            {/* ✨ 별들 */}
                                            <div className="absolute top-[20%] left-[15%] text-xl animate-pulse" style={{ animationDuration: '2s' }}>⭐</div>
                                            <div className="absolute top-[10%] left-[30%] text-sm animate-pulse" style={{ animationDuration: '2.5s' }}>✨</div>
                                            <div className="absolute top-[25%] right-[35%] text-base animate-pulse" style={{ animationDuration: '3s' }}>⭐</div>
                                            <div className="absolute top-[35%] left-[25%] text-xs animate-pulse" style={{ animationDuration: '2.2s' }}>✨</div>
                                        </>
                                    )}
                                </div>

                                {/* 마을 풍경 (항상 표시) - 사실적 레이어링 */}
                                <div className="absolute inset-0 overflow-hidden">
                                    {/* ☁️ 구름 레이어 (뒤쪽) */}
                                    <div className="absolute top-[12%] left-[8%] flex gap-1 opacity-70">
                                        <div className="w-6 h-3.5 bg-white/70 rounded-full"></div>
                                        <div className="w-7 h-4.5 bg-white/80 rounded-full -ml-3"></div>
                                        <div className="w-5 h-3.5 bg-white/70 rounded-full -ml-2"></div>
                                    </div>
                                    <div className="absolute top-[20%] right-[12%] flex gap-1 opacity-60">
                                        <div className="w-5 h-3 bg-white/60 rounded-full"></div>
                                        <div className="w-6 h-3.5 bg-white/70 rounded-full -ml-2"></div>
                                        <div className="w-4 h-3 bg-white/60 rounded-full -ml-1"></div>
                                    </div>

                                    {/* 🌄 땅/잔디 레이어 (하단) */}
                                    <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-b from-[#9CCC65] via-[#8BC34A] to-[#7CB342]" style={{
                                        boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.1)'
                                    }}>
                                        {/* 잔디 질감 */}
                                        <div className="absolute inset-0" style={{
                                            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(124,179,66,0.3) 3px, rgba(124,179,66,0.3) 4px)',
                                            opacity: 0.5
                                        }}></div>
                                    </div>

                                    {/* 🏠 집 (좌측 뒤편 - 작고 높게) */}
                                    <div className="absolute bottom-[32%] left-[8%]" style={{
                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                                    }}>
                                        <div className="w-10 h-8 bg-gradient-to-b from-[#FFE8B3] to-[#FFDAA0] rounded-md"></div>
                                        <div className="absolute -top-4 -left-1 w-12 h-6 bg-gradient-to-b from-[#7CB5E8] to-[#5A9FD4]" style={{
                                            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                                        }}></div>
                                        <div className="absolute top-1 right-2 w-2.5 h-2.5 bg-[#FFE8CC]/90 rounded-sm border border-[#8B6F47]"></div>
                                    </div>

                                    {/* 🌳 나무 (좌측 뒤편) */}
                                    <div className="absolute bottom-[30%] left-[22%]">
                                        <div className="w-2 h-9 bg-gradient-to-b from-[#8B6F47] to-[#6B5537] rounded-full" style={{
                                            boxShadow: 'inset -1px 0 2px rgba(0,0,0,0.3)'
                                        }}></div>
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-7 h-7 bg-gradient-to-br from-[#81C784] to-[#558B2F] rounded-full opacity-90" style={{
                                            boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.15)'
                                        }}></div>
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-gradient-to-br from-[#A5D6A7] to-[#81C784] rounded-full opacity-90"></div>
                                    </div>

                                    {/* 🏠 집 (중앙 앞쪽 - 크고 낮게) */}
                                    <div className="absolute bottom-[28%] left-[38%]" style={{
                                        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))'
                                    }}>
                                        <div className="w-14 h-11 bg-gradient-to-b from-[#FFDA9E] to-[#FFB88C] rounded-lg"></div>
                                        <div className="absolute -top-7 -left-1 w-16 h-9 bg-gradient-to-b from-[#E85D75] to-[#D4476B]" style={{
                                            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                                        }}></div>
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-6 bg-[#8B6F47] rounded-t-lg"></div>
                                        <div className="absolute top-2 left-2 w-3.5 h-3.5 bg-[#FFE8CC] rounded-sm border border-[#8B6F47]"></div>
                                        <div className="absolute top-2 right-2 w-3.5 h-3.5 bg-[#FFE8CC] rounded-sm border border-[#8B6F47]"></div>
                                    </div>

                                    {/* 🌳 나무 (좌측 앞쪽 - 크게) */}
                                    <div className="absolute bottom-[26%] left-[5%]">
                                        <div className="w-3 h-14 bg-gradient-to-b from-[#8B6F47] to-[#6B5537] rounded-full" style={{
                                            boxShadow: 'inset -1px 0 3px rgba(0,0,0,0.3)'
                                        }}></div>
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-11 h-11 bg-gradient-to-br from-[#81C784] to-[#558B2F] rounded-full" style={{
                                            boxShadow: 'inset -2px -2px 5px rgba(0,0,0,0.2), inset 2px 2px 5px rgba(255,255,255,0.25)'
                                        }}></div>
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-[#A5D6A7] to-[#81C784] rounded-full" style={{
                                            boxShadow: 'inset -1px -1px 3px rgba(0,0,0,0.15)'
                                        }}></div>
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-[#C8E6C9] to-[#A5D6A7] rounded-full"></div>
                                    </div>

                                    {/* 🌳 나무 (우측 - 일부만 보임, 크게) */}
                                    <div className="absolute bottom-[24%] right-[-8%]">
                                        <div className="w-3.5 h-16 bg-gradient-to-b from-[#8B6F47] to-[#6B5537] rounded-full" style={{
                                            boxShadow: 'inset -2px 0 3px rgba(0,0,0,0.3)'
                                        }}></div>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-[#66BB6A] to-[#4CAF50] rounded-full" style={{
                                            boxShadow: 'inset -3px -3px 6px rgba(0,0,0,0.2), inset 2px 2px 5px rgba(255,255,255,0.25)'
                                        }}></div>
                                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-9 h-9 bg-gradient-to-br from-[#81C784] to-[#66BB6A] rounded-full"></div>
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-7 h-7 bg-gradient-to-br from-[#A5D6A7] to-[#81C784] rounded-full"></div>
                                    </div>

                                    {/* 🌿 잔디 디테일 (앞쪽) */}
                                    <div className="absolute bottom-[22%] left-[15%] w-4 h-6 bg-gradient-to-t from-[#7CB342] to-[#8BC34A] opacity-80" style={{
                                        clipPath: 'polygon(50% 0%, 30% 40%, 10% 80%, 0% 100%, 25% 100%, 40% 70%, 50% 100%, 60% 70%, 75% 100%, 100% 100%, 90% 80%, 70% 40%)'
                                    }}></div>
                                    <div className="absolute bottom-[23%] left-[62%] w-3.5 h-5 bg-gradient-to-t from-[#7CB342] to-[#8BC34A] opacity-70" style={{
                                        clipPath: 'polygon(50% 0%, 30% 40%, 10% 80%, 0% 100%, 25% 100%, 40% 70%, 50% 100%, 60% 70%, 75% 100%, 100% 100%, 90% 80%, 70% 40%)'
                                    }}></div>
                                </div>

                                {/* 창살 (세로) - 밝은 색상 */}
                                <div className="absolute left-1/2 top-0 bottom-0 w-2 -translate-x-1/2 bg-[#4A9FD4] opacity-60" style={{
                                    boxShadow: 'inset 0 0 4px rgba(0,0,0,0.2)'
                                }}></div>

                                {/* 창살 (가로) - 밝은 색상 */}
                                <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 bg-[#4A9FD4] opacity-60" style={{
                                    boxShadow: 'inset 0 0 4px rgba(0,0,0,0.2)'
                                }}></div>

                                {/* 창문 내부 그림자 (입체감) */}
                                <div className="absolute inset-0 pointer-events-none" style={{
                                    boxShadow: 'inset 0 8px 16px rgba(0,0,0,0.1)'
                                }}></div>
                            </div>
                        </div>
                    </div>

                    {/* 📚 좌측 선반 2단 (다마고치 스타일) */}
                    <div className="absolute top-[28%] left-[8%] z-20 pointer-events-none" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
                        {/* 상단 선반 */}
                        <div className="relative w-28 h-2.5 bg-[#D7B896] rounded-md mb-8" style={{
                            boxShadow: '0 2px 0 rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)'
                        }}>
                            {/* 선반 위 소품들 */}
                            <div className="absolute -top-10 left-2 flex gap-2 items-end">
                                {/* 📚 책 */}
                                <div className="w-4 h-10 bg-gradient-to-br from-[#FF8FA3] to-[#FF6B8A] rounded-sm" style={{
                                    boxShadow: '2px 0 0 rgba(0,0,0,0.1)'
                                }}></div>
                                <div className="w-3 h-8 bg-gradient-to-br from-[#FFB5C2] to-[#FF9FB1] rounded-sm mt-2" style={{
                                    boxShadow: '2px 0 0 rgba(0,0,0,0.1)'
                                }}></div>

                                {/* 📷 카메라 */}
                                <div className="relative w-7 h-6 bg-gradient-to-br from-[#FF9FB1] to-[#FF8FA3] rounded-md" style={{
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                                }}>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/80 rounded-full"></div>
                                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* 하단 선반 */}
                        <div className="relative w-28 h-2.5 bg-[#D7B896] rounded-md" style={{
                            boxShadow: '0 2px 0 rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)'
                        }}>
                            {/* 선반 위 소품들 */}
                            <div className="absolute -top-12 left-2 flex gap-3 items-end">
                                {/* 🌵 선인장 화분 */}
                                <div className="relative w-8 h-12">
                                    {/* 화분 */}
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-5 bg-gradient-to-b from-[#FF9980] to-[#FF8060] rounded-b-md" style={{
                                        clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
                                    }}></div>
                                    {/* 선인장 몸통 */}
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4 h-7 bg-gradient-to-br from-[#7CB342] to-[#558B2F] rounded-lg"></div>
                                    {/* 선인장 팔 */}
                                    <div className="absolute bottom-5 left-0 w-2 h-3 bg-gradient-to-br from-[#7CB342] to-[#558B2F] rounded-full"></div>
                                    <div className="absolute bottom-5 right-0 w-2 h-3 bg-gradient-to-br from-[#7CB342] to-[#558B2F] rounded-full"></div>
                                </div>

                                {/* 📦 박스 */}
                                <div className="relative w-6 h-7 bg-gradient-to-br from-[#D4A5F5] to-[#B87FE0] rounded-sm" style={{
                                    boxShadow: '2px 2px 0 rgba(0,0,0,0.1)'
                                }}>
                                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/30"></div>
                                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/30"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 💜 러그 (바닥 중앙 - 캐릭터 뒤) */}
                    <div className="absolute bottom-[35%] left-1/2 -translate-x-1/2 z-15 pointer-events-none">
                        <div className="w-32 h-16 bg-gradient-to-br from-[#E0B0FF] to-[#D4A5F5] rounded-[50%] opacity-80" style={{
                            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))',
                            boxShadow: 'inset 0 -4px 8px rgba(255,255,255,0.3)'
                        }}></div>
                    </div>

                    {/* MainRoom 컴포넌트 배치 */}
                    <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
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


                    {/* 🪴 우측 하단 대형 화분 (크기 증가) */}
                    <div className="absolute bottom-[26%] right-[6%] z-20 pointer-events-none" style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))' }}>
                        <div className="relative w-24 h-44">
                            {/* 화분 */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-16 bg-gradient-to-b from-[#FF9980] to-[#FF7A5A] rounded-b-3xl" style={{
                                clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
                                boxShadow: '0 6px 12px rgba(0,0,0,0.25), inset 0 3px 0 rgba(255,255,255,0.3)'
                            }}></div>

                            {/* 중앙 큰 잎 */}
                            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-6 h-26 bg-gradient-to-t from-[#66BB6A] to-[#81C784] rounded-full"></div>

                            {/* 좌측 잎들 (크기 2배) */}
                            <div className="absolute bottom-16 left-0 w-11 h-18 bg-gradient-to-br from-[#81C784] to-[#66BB6A] rounded-full rotate-[-35deg]" style={{
                                boxShadow: 'inset -3px 3px 6px rgba(0,0,0,0.12)'
                            }}></div>
                            <div className="absolute bottom-22 left-[-2px] w-9 h-15 bg-gradient-to-br from-[#A5D6A7] to-[#81C784] rounded-full rotate-[-25deg]"></div>

                            {/* 우측 잎들 (크기 2배) */}
                            <div className="absolute bottom-16 right-0 w-11 h-18 bg-gradient-to-bl from-[#81C784] to-[#66BB6A] rounded-full rotate-[35deg]" style={{
                                boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.12)'
                            }}></div>
                            <div className="absolute bottom-22 right-[-2px] w-9 h-15 bg-gradient-to-bl from-[#A5D6A7] to-[#81C784] rounded-full rotate-[25deg]"></div>

                            {/* 상단 작은 잎들 (크기 2배) */}
                            <div className="absolute bottom-28 left-3 w-8 h-12 bg-gradient-to-br from-[#C8E6C9] to-[#A5D6A7] rounded-full rotate-[-15deg]"></div>
                            <div className="absolute bottom-28 right-3 w-8 h-12 bg-gradient-to-bl from-[#C8E6C9] to-[#A5D6A7] rounded-full rotate-[15deg]"></div>

                            {/* 추가 잎들로 더 풍성하게 */}
                            <div className="absolute bottom-20 left-1 w-7 h-10 bg-gradient-to-br from-[#A5D6A7] to-[#81C784] rounded-full rotate-[-40deg]" style={{
                                opacity: 0.9
                            }}></div>
                            <div className="absolute bottom-20 right-1 w-7 h-10 bg-gradient-to-bl from-[#A5D6A7] to-[#81C784] rounded-full rotate-[40deg]" style={{
                                opacity: 0.9
                            }}></div>
                        </div>
                    </div>

                    {/* 🧩 감정 조각 렌더링 (바닥 위에 표시) */}
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
                            {/* 내부 빛나는 효과 */}
                            <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse"></div>
                        </div>
                    ))}

                    {/* ✨ 반짝이는 별 장식 (다이아몬드 모양) */}
                    <div className="absolute top-[12%] left-[15%] z-5 pointer-events-none">
                        <div className="relative w-8 h-8 rotate-45 bg-white/60 animate-pulse" style={{
                            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                            filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))',
                            animationDuration: '2s'
                        }}></div>
                    </div>
                    <div className="absolute top-[25%] right-[20%] z-5 pointer-events-none">
                        <div className="relative w-6 h-6 rotate-45 bg-white/50 animate-pulse" style={{
                            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                            filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.7))',
                            animationDuration: '2.5s'
                        }}></div>
                    </div>
                    <div className="absolute top-[18%] right-[35%] z-5 pointer-events-none">
                        <div className="relative w-5 h-5 rotate-45 bg-white/40 animate-pulse" style={{
                            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                            filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.6))',
                            animationDuration: '3s'
                        }}></div>
                    </div>
                </div>

                {/* 헤더 영역 (스트릭 배지만) */}
                <div
                    className="absolute top-0 z-40 flex w-full items-end justify-end px-6 md:px-8 pointer-events-none"
                    style={{ paddingTop: 'max(3.5rem, calc(1rem + env(safe-area-inset-top)))' }}
                    data-gtm="mobile-dashboard-header"
                >
                    {/* 스트릭 배지 - 따뜻한 스타일 */}
                    <div
                        className="rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 shadow-lg border-2 border-[#FFD4DC]/40 pointer-events-auto cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-200"
                        onClick={onCalendarClick}
                        data-gtm="mobile-dashboard-streak-indicator"
                    >
                        <span className="text-xs font-bold text-[#FFB5C2]">
                            🌸 {streakDays}일차
                        </span>
                    </div>
                </div>

                {/* CircularProgressNew — 좌측 상단 레벨 HUD (safe-area 적용) */}
                <div
                    className="pointer-events-auto"
                    style={{ position: 'absolute', top: 'max(1.5rem, calc(0.5rem + env(safe-area-inset-top)))', left: '1.5rem', zIndex: 50 }}
                >
                    <CircularProgressNew
                        level={petStatus?.level ?? 1}
                        percent={petStatus ? (petStatus.currentExp / petStatus.requiredExp) * 100 : 0}
                    />
                </div>

                {/* 따뜻한 공감일기 BottomSheet */}
                <BottomSheet
                    onWrite={handleWrite}
                    onCalendarClick={onCalendarClick}
                    onVentilateClick={handleWindowClick}
                    onFeedClick={() => setIsDigestionViewOpen(true)}
                    onHomeClick={() => setIsMainMenuOpen(true)}
                    diaries={diaries}
                    streakDays={streakDays}
                    onMindRecordClick={() => setIsMindRecordOpen(true)}
                    onStatsClick={onStatsClick}
                    onSettingsClick={onSettingsClick}
                />

                {/* 마음 기록 오버레이 */}
                <MindRecord
                    isOpen={isMindRecordOpen}
                    onClose={() => setIsMindRecordOpen(false)}
                    userName={user?.nickname}
                    diaries={diaries}
                    data-gtm="mind-record-screen"
                />

                {/* 감정 소화 (식사) 오버레이 */}
                {isDigestionViewOpen && (
                    <DigestionView
                        onClose={() => setIsDigestionViewOpen(false)}
                        userId={user?.id}
                    />
                )}

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
        </div>
    );
};

export default MobileDashboard;
