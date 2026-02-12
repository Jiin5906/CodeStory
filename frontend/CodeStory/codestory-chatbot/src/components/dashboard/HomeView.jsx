import React, { useState, useMemo, useEffect, useRef } from 'react';
import { startOfDay, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import MainRoom from './MainRoom';
import BottomSheet from './BottomSheet';
import CircularProgressNew from './CircularProgressNew';
import MoodLight from './MoodLight';
import MainMenu from './MainMenu';
import StoreView from './StoreView';
import { chatApi, mongleApi } from '../../services/api';
import { usePet } from '../../context/PetContext';
import { useStore } from '../../context/StoreContext';

/**
 * HomeView — 홈/대화 페이지
 *
 * 몽글이와 상호작용하는 메인 화면
 */
const HomeView = ({ user, diaries, onWriteClick }) => {
    const navigate = useNavigate();
    const [latestLog, setLatestLog] = useState(null);
    const [aiResponse, setAiResponse] = useState(null);
    const [emotion, setEmotion] = useState(null);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
    const [isStoreViewOpen, setIsStoreViewOpen] = useState(false);
    const [showBubble, setShowBubble] = useState(false);

    // 인터랙티브 효과를 위한 상태
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [windowColdAnimation, setWindowColdAnimation] = useState(false);
    const [windowClosedAnimation, setWindowClosedAnimation] = useState(false);

    const coldTimerRef = useRef(null);
    const aliveTimerRef = useRef(null);
    const bubbleTimerRef = useRef(null);

    // 능동적 대화 타이머 간격 (개발: 10초, 배포: 10분)
    const ALIVE_INTERVAL_MS = 600000; // 10분 (배포용)

    const { petStatus, spawnEmotionShard, moodLightOn, coins, coinToast } = usePet();
    const { equippedItems, getEquippedItem } = useStore();

    // 장착된 테마 (equippedItems 변경 시 자동 재계산)
    const equippedTheme = useMemo(() => getEquippedItem('theme'), [equippedItems, getEquippedItem]);

    const today = startOfDay(new Date());
    const currentHour = new Date().getHours();
    const isNightTime = currentHour >= 18 || currentHour < 6;

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

            coldTimerRef.current = setTimeout(() => {
                setWindowColdAnimation(true);
            }, 30000);
        } else {
            setIsWindowOpen(false);
            setWindowClosedAnimation(true);

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

    // aiResponse 변경 시 말풍선 8초 표시
    useEffect(() => {
        if (aiResponse || isAiThinking) {
            setShowBubble(true);
            if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
            if (aiResponse && !isAiThinking) {
                bubbleTimerRef.current = setTimeout(() => setShowBubble(false), 8000);
            }
        } else {
            setShowBubble(false);
        }
        return () => {
            if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
        };
    }, [aiResponse, isAiThinking]);

    // 컴포넌트 정리 시 타이머 방지 누수
    useEffect(() => {
        return () => {
            if (coldTimerRef.current) clearTimeout(coldTimerRef.current);
            if (aliveTimerRef.current) clearInterval(aliveTimerRef.current);
            if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
        };
    }, []);

    // ━━━ 몽글이 능동적 대화 시스템 ━━━

    // 능동적 대화 타이머 리셋 함수
    const resetAliveTimer = () => {
        if (aliveTimerRef.current) clearInterval(aliveTimerRef.current);
        if (!user?.id) return;

        aliveTimerRef.current = setInterval(async () => {
            try {
                const data = await mongleApi.getAliveQuestion(user.id);
                if (data?.message) {
                    setAiResponse(data.message);
                    setEmotion(null);
                }
            } catch (e) {
                console.error('[HomeView] alive-question 실패:', e);
            }
        }, ALIVE_INTERVAL_MS);
    };

    // 초기 진입: 인삿말 API 호출 + 타이머 시작
    useEffect(() => {
        if (!user?.id) return;

        const fetchGreeting = async () => {
            try {
                const data = await mongleApi.getGreeting(user.id);
                if (data?.message) {
                    setAiResponse(data.message);
                }
            } catch (e) {
                console.error('[HomeView] greeting 실패:', e);
            }
        };

        fetchGreeting();
        resetAliveTimer();

        return () => {
            if (aliveTimerRef.current) clearInterval(aliveTimerRef.current);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    // 채팅 및 AI 응답 핸들러
    const handleWrite = async (content) => {
        // 사용자 인터랙션 시 능동적 대화 타이머 리셋
        resetAliveTimer();

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
            className="relative flex h-full w-full max-w-[430px] mx-auto flex-col overflow-hidden"
            style={{ background: `linear-gradient(to bottom, ${equippedTheme?.bgFrom || '#FFF8F3'}, ${equippedTheme?.bgTo || '#FFE8F0'})` }}
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

                {/* 🎨 벽 배경 - 테마에 따라 변경 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${equippedTheme?.gradient || 'from-purple-100 via-pink-50 to-yellow-50'}`} style={{
                    backgroundImage: `
                        radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.4) 0%, transparent 3%),
                        radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.3) 0%, transparent 2.5%),
                        radial-gradient(circle at 35% 70%, rgba(255, 255, 255, 0.35) 0%, transparent 2.8%),
                        radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 3%)
                    `,
                    backgroundSize: '100% 100%'
                }}></div>

                {/* 🪵 바닥 - 테마에 따라 변경 */}
                <div className="absolute bottom-0 w-full h-[40%]" style={{
                    backgroundColor: equippedTheme?.floorColor || '#FFCC80',
                    backgroundImage: `
                        linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
                        linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '120px 100%, 40px 100%'
                }}></div>

                {/* 🪟 대형 창문 (우측) - 다마고치 스타일, 일부 잘림 (교체 가능한 장식) */}
                <div
                    className="absolute top-[5%] right-[-12%] z-20 w-[40%] h-[48%]"
                    data-decoration-type="window"
                    data-decoration-id="large-window-01"
                    data-gtm="decoration-window-click"
                    style={{
                        filter: 'drop-shadow(-4px 8px 16px rgba(0,0,0,0.25))'
                    }}
                >
                    <div className="relative w-full h-full">
                        {/* 창문 틀 (큰 아치형) - 테마에 따라 변경 */}
                        <div className="absolute inset-0 rounded-tl-[45%] rounded-tr-[45%] rounded-b-2xl border-[10px] overflow-hidden" style={{
                            borderColor: equippedTheme?.windowBorderColor || '#5DADE2',
                            boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.15), inset 0 -4px 8px rgba(255,255,255,0.3), 0 0 0 2px rgba(255,255,255,0.4)',
                            background: `linear-gradient(135deg, ${equippedTheme?.windowBorderColor || '#6EC1E4'} 0%, ${equippedTheme?.windowBorderColor || '#5DADE2'} 100%)`
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

                {/* 📚 좌측 선반 2단 (다마고치 스타일) - 교체 가능한 장식 */}
                <div
                    className="absolute top-[28%] left-[8%] z-20 pointer-events-none"
                    data-decoration-type="shelf"
                    data-decoration-id="wall-shelf-2tier-01"
                    data-gtm="decoration-wall-shelf"
                    style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
                >
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

                {/* 💜 펫 + 방석 통합 컨테이너 (반응형 동기화) */}
                <div
                    className="absolute bottom-[22%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none"
                    style={{ overflow: 'visible' }}
                    data-gtm="pet-cushion-container"
                >
                    {/* 💬 말풍선 — 펫 컨테이너 내부, 캐릭터 위에 배치 */}
                    <div
                        className={`absolute left-1/2 -translate-x-1/2 z-[100] pointer-events-none transition-all duration-700 ease-out ${
                            showBubble
                                ? 'opacity-100 translate-y-0 scale-100'
                                : 'opacity-0 -translate-y-4 scale-95'
                        }`}
                        style={{ bottom: '100%', marginBottom: '20px', width: 'max-content', maxWidth: '85vw' }}
                        data-gtm="mongle-speech-bubble"
                    >
                        <div className="relative bg-white/95 rounded-[2rem] p-6 max-w-xs sm:max-w-sm h-auto shadow-lg shadow-pink-100/60 backdrop-blur-sm pointer-events-auto">
                            <p
                                className="text-sm sm:text-base leading-relaxed whitespace-normal break-words text-gray-700 text-center"
                                style={{
                                    fontFamily: "'Jua', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word',
                                }}
                            >
                                {isAiThinking ? "공감하는 중..." : aiResponse}
                            </p>
                            {/* 꼬리 */}
                            <div
                                className="absolute -bottom-2 left-1/2 w-4 h-4 bg-white/95 rounded-br-lg"
                                style={{ transform: 'translateX(-50%) rotate(45deg)' }}
                            />
                        </div>
                    </div>

                    {/* 펫 (MainRoom) */}
                    <div className="-mb-6 z-30 pointer-events-auto" style={{ overflow: 'visible' }}>
                        <div className="flex items-center justify-center" style={{ overflow: 'visible' }}>
                            <MainRoom
                                latestLog={latestLog}
                                emotion={emotion}
                                isAiThinking={isAiThinking}
                                user={user}
                                windowColdAnimation={windowColdAnimation}
                                windowClosedAnimation={windowClosedAnimation}
                            />
                        </div>
                    </div>

                    {/* 방석 */}
                    <div
                        data-decoration-type="rug"
                        data-decoration-id="premium-cushion-01"
                        data-gtm="decoration-premium-cushion"
                    >
                        <div className="relative w-52 h-28">
                            {/* 방석 본체 (타원형) */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#E8C5FF] via-[#D4A5F5] to-[#C490E4] rounded-[50%]"
                                style={{
                                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
                                    boxShadow: 'inset 0 -8px 16px rgba(139,92,246,0.4), inset 0 6px 12px rgba(255,255,255,0.5)'
                                }}
                            ></div>

                            {/* 방석 중앙 패턴 (십자형 스티치) */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-16">
                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40 rounded-full -translate-y-1/2"></div>
                                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/40 rounded-full -translate-x-1/2"></div>
                            </div>

                            {/* 방석 테두리 스티치 (점선) */}
                            <div className="absolute inset-3 rounded-[50%] border-2 border-dashed border-white/35"></div>

                            {/* 방석 모서리 장식 */}
                            <div className="absolute top-3 left-5 w-2.5 h-2.5 bg-white/50 rounded-full"></div>
                            <div className="absolute top-3 right-5 w-2.5 h-2.5 bg-white/50 rounded-full"></div>
                            <div className="absolute bottom-3 left-5 w-2.5 h-2.5 bg-white/50 rounded-full"></div>
                            <div className="absolute bottom-3 right-5 w-2.5 h-2.5 bg-white/50 rounded-full"></div>

                            {/* 방석 질감 */}
                            <div className="absolute inset-0 overflow-hidden rounded-[50%]">
                                <div className="absolute left-[15%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/25 to-transparent"></div>
                                <div className="absolute left-[30%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                                <div className="absolute left-[45%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/25 to-transparent"></div>
                                <div className="absolute left-[60%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                                <div className="absolute left-[75%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/25 to-transparent"></div>
                                <div className="absolute left-[85%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                            </div>

                            {/* 방석 하이라이트 */}
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-36 h-8 bg-white/45 rounded-[50%] blur-md"></div>

                            {/* 방석 그림자 */}
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-48 h-4 bg-black/25 rounded-[50%] blur-lg"></div>
                        </div>
                    </div>
                </div>

                {/* 🪴 우측 하단 대형 화분 (크기 증가) - 교체 가능한 장식 */}
                <div
                    className="absolute bottom-[26%] right-[6%] z-20 pointer-events-none"
                    data-decoration-type="plant"
                    data-decoration-id="large-potted-plant-01"
                    data-gtm="decoration-large-plant"
                    style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))' }}
                >
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

                {/* 💡 무드등 */}
                <MoodLight />


                {/* 🧩 감정 조각 - 로티 애니메이션만 사용 (MainRoom의 EmotionShard 컴포넌트에서 렌더링) */}
            </div>

            {/* 헤더 영역 (코인 + 스트릭 배지 + 레벨 HUD) */}
            <div
                className="absolute top-0 z-40 flex w-full items-end justify-end gap-2 px-6 md:px-8 pointer-events-none"
                style={{ paddingTop: 'max(3.5rem, calc(1rem + env(safe-area-inset-top)))' }}
            >
                {/* 코인 표시 */}
                <div
                    className="rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 shadow-lg border-2 pointer-events-auto"
                    data-gtm="coin-display"
                    style={{
                        borderColor: `${equippedTheme?.decorationColors?.primary || '#FFD4DC'}40`
                    }}
                >
                    <span className="text-xs font-bold text-amber-500">
                        💰 {coins}원
                    </span>
                </div>

                {/* 스트릭 배지 - 클릭 시 일기 페이지로 이동 */}
                <div
                    className="rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 shadow-lg border-2 pointer-events-auto cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-200"
                    onClick={() => navigate('/diary')}
                    data-gtm="streak-indicator"
                    style={{
                        borderColor: `${equippedTheme?.decorationColors?.primary || '#FFD4DC'}40`
                    }}
                >
                    <span className="text-xs font-bold" style={{
                        color: equippedTheme?.accentColor || '#FFB5C2'
                    }}>
                        {streakDays}일차
                    </span>
                </div>
            </div>

            {/* 코인 획득 토스트 */}
            {coinToast && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[200] animate-bounce">
                    <div className="rounded-full bg-amber-400 text-white px-5 py-2 shadow-lg text-sm font-bold">
                        {coinToast}
                    </div>
                </div>
            )}

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
                onSleepClick={handleWindowClick}
                onStoreClick={() => setIsStoreViewOpen(true)}
            />

            {/* 메인 메뉴 */}
            <MainMenu
                isOpen={isMainMenuOpen}
                onClose={() => setIsMainMenuOpen(false)}
                onEmotionShardsClick={() => navigate('/diary')}
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
