import React, { useState, useMemo, useEffect, useRef } from 'react';
import { startOfDay, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import MainRoom from './MainRoom';
import BottomSheet from './BottomSheet';
import CircularProgressNew from './CircularProgressNew';
import MoodLight from './MoodLight';
import MainMenu from './MainMenu';
import StoreView from './StoreView';
import LevelUpModal from '../common/LevelUpModal';
import { chatApi, mongleApi } from '../../services/api';
import { usePet } from '../../context/PetContext';
import { useStore } from '../../context/StoreContext';
import MongleIcon from '../common/MongleIcons';
import { useTour } from '../../context/TourContext';

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

    // 랜덤 대화 주기 (3~5분)
    const ALIVE_MIN_MS = 180000; // 3분
    const ALIVE_MAX_MS = 300000; // 5분

    const { petStatus, spawnEmotionShard, moodLightOn, affectionGauge, coins, coinToast, isSleeping, sleepToast, showSleepToast, showLevelUpModal, levelUpInfo, triggerLevelUpModal, closeLevelUpModal } = usePet();
    const isSleepingRef = useRef(isSleeping);
    const { equippedItems, getEquippedItem } = useStore();
    const { isTourActive, currentStep, startMainTour, startConditionalTour, advanceTour } = useTour();

    // 장착된 테마 및 가구 (equippedItems 변경 시 자동 재계산)
    const equippedTheme = useMemo(() => getEquippedItem('theme'), [equippedItems, getEquippedItem]);
    const equippedShelf = useMemo(() => getEquippedItem('shelf'), [equippedItems, getEquippedItem]);
    const equippedPot = useMemo(() => getEquippedItem('pot'), [equippedItems, getEquippedItem]);
    const equippedCushion = useMemo(() => getEquippedItem('cushion'), [equippedItems, getEquippedItem]);

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
            if (aliveTimerRef.current) clearTimeout(aliveTimerRef.current);
            if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
        };
    }, []);

    // isSleepingRef 동기화
    useEffect(() => {
        isSleepingRef.current = isSleeping;
    }, [isSleeping]);

    // ━━━ 투어 트리거 로직 ━━━

    // 메인 투어: 온보딩 완료 후 홈 첫 진입 시 시작
    useEffect(() => {
        if (!user?.id) return;
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (hasSeenOnboarding) {
            // 300ms 딜레이: 컴포넌트 렌더 + 레이아웃 안정 후 시작
            const t = setTimeout(startMainTour, 800);
            return () => clearTimeout(t);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    // 조건부 투어: 쓰다듬기 게이지 20% 미만일 때 (1회만)
    const affectionWarnedRef = useRef(false);
    useEffect(() => {
        if (!user?.id || isTourActive) return;
        if (!affectionWarnedRef.current && affectionGauge < 20 && affectionGauge > 0) {
            affectionWarnedRef.current = true;
            startConditionalTour('affection');
        }
    }, [affectionGauge, user?.id, isTourActive, startConditionalTour]);

    // 조건부 투어: 몽글이가 잠들었을 때 (1회만)
    const lampTourTriggeredRef = useRef(false);
    useEffect(() => {
        if (!user?.id || isTourActive) return;
        if (!lampTourTriggeredRef.current && isSleeping) {
            lampTourTriggeredRef.current = true;
            const t = setTimeout(() => startConditionalTour('lamp'), 1000);
            return () => clearTimeout(t);
        }
    }, [isSleeping, user?.id, isTourActive, startConditionalTour]);

    // 조건부 투어: 레벨업 모달 닫힌 후 상점 안내
    const prevShowLevelUpRef = useRef(false);
    useEffect(() => {
        if (prevShowLevelUpRef.current && !showLevelUpModal) {
            // 레벨업 모달이 방금 닫혔으면 상점 투어 시작
            const t = setTimeout(() => startConditionalTour('levelup'), 400);
            return () => clearTimeout(t);
        }
        prevShowLevelUpRef.current = showLevelUpModal;
    }, [showLevelUpModal, startConditionalTour]);

    // 투어: affection-pet 단계 - 쓰다듬기 완료 감지
    useEffect(() => {
        if (isTourActive && currentStep?.id === 'affection-pet' && affectionGauge >= 90) {
            advanceTour();
        }
    }, [affectionGauge, isTourActive, currentStep, advanceTour]);

    // 투어: lamp-wake 단계 - 램프 켜기 감지
    const prevMoodLightRef = useRef(moodLightOn);
    useEffect(() => {
        if (isTourActive && currentStep?.id === 'lamp-wake' && moodLightOn && !prevMoodLightRef.current) {
            setTimeout(advanceTour, 300);
        }
        prevMoodLightRef.current = moodLightOn;
    }, [moodLightOn, isTourActive, currentStep, advanceTour]);

    // ━━━ 몽글이 능동적 대화 시스템 (랜덤 3~5분) ━━━

    // 랜덤 대화 타이머 (setTimeout 재귀)
    const scheduleNextAlive = () => {
        if (aliveTimerRef.current) clearTimeout(aliveTimerRef.current);
        if (!user?.id) return;

        const randomDelay = ALIVE_MIN_MS + Math.random() * (ALIVE_MAX_MS - ALIVE_MIN_MS);

        aliveTimerRef.current = setTimeout(async () => {
            // 수면 중이면 말 걸지 않고 다음 타이머만 재설정 (ref로 최신 값 참조)
            if (isSleepingRef.current) {
                scheduleNextAlive();
                return;
            }

            try {
                const data = await mongleApi.getAliveQuestion(user.id);
                if (data?.message) {
                    setAiResponse(data.message);
                    setEmotion(null);
                }
            } catch (e) {
                console.error('[HomeView] alive-question 실패:', e);
            }

            // 다음 랜덤 타이머 설정
            scheduleNextAlive();
        }, randomDelay);
    };

    // 초기 진입: 인삿말 API 호출 (수면 중이면 차단) + 랜덤 타이머 시작
    useEffect(() => {
        if (!user?.id) return;

        // 수면 중이면 인삿말 차단, "ZZZ..." 표시
        if (isSleeping) {
            setAiResponse('ZZZ...');
        } else {
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
        }

        scheduleNextAlive();

        return () => {
            if (aliveTimerRef.current) clearTimeout(aliveTimerRef.current);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    // 채팅 및 AI 응답 핸들러 (수면 중 차단)
    const handleWrite = async (content) => {
        // 수면 중: API 미호출, 말풍선에 수면 메시지 표시
        if (isSleeping) {
            setAiResponse('ZZZ...');
            showSleepToast();
            return;
        }

        // 사용자 인터랙션 시 능동적 대화 타이머 리셋
        scheduleNextAlive();

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

            // 투어: chat 단계 완료 (채팅 전송 성공 시 다음 단계로)
            if (isTourActive && currentStep?.id === 'chat') {
                setTimeout(advanceTour, 500);
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
                                        <div className="absolute top-[15%] right-[20%] animate-pulse" style={{ animationDuration: '3s' }}>
                                            <MongleIcon name="moon" size={36} />
                                        </div>
                                        {/* 별들 */}
                                        <div className="absolute top-[20%] left-[15%] animate-pulse" style={{ animationDuration: '2s' }}><MongleIcon name="star" size={22} /></div>
                                        <div className="absolute top-[10%] left-[30%] animate-pulse" style={{ animationDuration: '2.5s' }}><MongleIcon name="sparkle" size={14} /></div>
                                        <div className="absolute top-[25%] right-[35%] animate-pulse" style={{ animationDuration: '3s' }}><MongleIcon name="star" size={18} /></div>
                                        <div className="absolute top-[35%] left-[25%] animate-pulse" style={{ animationDuration: '2.2s' }}><MongleIcon name="sparkle" size={12} /></div>
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

                {/* 📚 좌측 선반 2단 - 교체 가능한 장식 (shelfType별 고유 소품) */}
                <div
                    className="absolute top-[28%] left-[8%] z-20 pointer-events-none"
                    data-decoration-type="shelf"
                    data-decoration-id="wall-shelf-2tier-01"
                    data-gtm="decoration-wall-shelf"
                    style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
                >
                    {(() => {
                        const shelfId = equippedShelf?.id;
                        const sc = equippedShelf?.color || '#D7B896';
                        const shelfStyle = {
                            backgroundColor: sc,
                            boxShadow: '0 2px 0 rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)'
                        };

                        // ── 화이트 선반 (모던 & 스터디) ──
                        if (shelfId === 'shelf_white') {
                            return (
                                <>
                                    {/* 상단 선반 */}
                                    <div className="relative w-28 h-2.5 rounded-md mb-8" style={shelfStyle}>
                                        <div className="absolute bottom-full left-2 z-10 flex gap-2 items-end">
                                            {/* 디지털 시계 */}
                                            <div className="relative w-10 h-7 bg-[#1F2937] rounded-md" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-mono text-green-400 font-bold">12:30</div>
                                            </div>
                                            {/* 쌓인 모노톤 책 3권 (눕힘) */}
                                            <div className="relative">
                                                <div className="w-10 h-2 bg-[#374151] rounded-sm"></div>
                                                <div className="w-9 h-2 bg-[#6B7280] rounded-sm -mt-0.5 ml-0.5"></div>
                                                <div className="w-10 h-2 bg-[#4B5563] rounded-sm -mt-0.5"></div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 하단 선반 */}
                                    <div className="relative w-28 h-2.5 rounded-md" style={shelfStyle}>
                                        <div className="absolute bottom-full left-3 z-10 flex gap-3 items-end">
                                            {/* 연필꽂이 */}
                                            <div className="relative w-7 h-8">
                                                <div className="absolute bottom-0 w-7 h-6 bg-[#9CA3AF] rounded-md"></div>
                                                <div className="absolute bottom-5 left-1 w-0.5 h-5 bg-[#F59E0B] rounded-full rotate-[-5deg]"></div>
                                                <div className="absolute bottom-5 left-3 w-0.5 h-6 bg-[#3B82F6] rounded-full"></div>
                                                <div className="absolute bottom-5 left-5 w-0.5 h-5 bg-[#10B981] rounded-full rotate-[5deg]"></div>
                                            </div>
                                            {/* 미니 노트 */}
                                            <div className="w-6 h-8 bg-white rounded-sm border border-gray-200" style={{ boxShadow: '1px 1px 0 rgba(0,0,0,0.05)' }}>
                                                <div className="mt-1.5 mx-1 space-y-0.5">
                                                    <div className="h-px bg-gray-200"></div>
                                                    <div className="h-px bg-gray-200"></div>
                                                    <div className="h-px bg-gray-200"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        }

                        // ── 파스텔 선반 (러블리 & 키치) ──
                        if (shelfId === 'shelf_pastel') {
                            return (
                                <>
                                    {/* 상단 선반 */}
                                    <div className="relative w-28 h-2.5 rounded-md mb-8" style={shelfStyle}>
                                        <div className="absolute bottom-full left-2 z-10 flex gap-2 items-end">
                                            {/* 곰인형 */}
                                            <div className="relative w-10 h-11">
                                                {/* 귀 */}
                                                <div className="absolute top-0 left-1 w-3 h-3 bg-[#D2A06D] rounded-full"></div>
                                                <div className="absolute top-0 right-1 w-3 h-3 bg-[#D2A06D] rounded-full"></div>
                                                <div className="absolute top-0.5 left-1.5 w-2 h-2 bg-[#C4915A] rounded-full"></div>
                                                <div className="absolute top-0.5 right-1.5 w-2 h-2 bg-[#C4915A] rounded-full"></div>
                                                {/* 머리 */}
                                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#D2A06D] rounded-full"></div>
                                                {/* 눈 */}
                                                <div className="absolute top-5 left-2.5 w-1 h-1 bg-[#1F1F1F] rounded-full"></div>
                                                <div className="absolute top-5 right-2.5 w-1 h-1 bg-[#1F1F1F] rounded-full"></div>
                                                {/* 코 */}
                                                <div className="absolute top-6.5 left-1/2 -translate-x-1/2 w-2 h-1.5 bg-[#B07D4F] rounded-full"></div>
                                            </div>
                                            {/* 하트 거울 */}
                                            <svg viewBox="0 0 20 22" width="16" height="18">
                                                <path d="M10,6 Q10,2 13,2 Q16,2 16,6 Q16,2 19,2 Q22,2 22,6 Q22,12 16,16 Q10,12 10,6 Z" fill="#FFB6C1" transform="translate(-6,-1) scale(0.85)" />
                                                <path d="M10,6 Q10,3 12.5,3 Q15,3 15,6 Q15,3 17.5,3 Q20,3 20,6 Q20,11 15,14 Q10,11 10,6 Z" fill="#E0F0FF" opacity="0.5" transform="translate(-5,-0.5) scale(0.8)" />
                                            </svg>
                                        </div>
                                    </div>
                                    {/* 하단 선반 */}
                                    <div className="relative w-28 h-2.5 rounded-md" style={shelfStyle}>
                                        <div className="absolute bottom-full left-3 z-10 flex gap-3 items-end">
                                            {/* 향수병 */}
                                            <div className="relative w-8 h-10">
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-7 bg-gradient-to-b from-[#E9D5FF]/60 to-[#E9D5FF]/40 rounded-full border border-[#C084FC]/50"></div>
                                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-2 h-2.5 bg-[#C084FC] rounded-sm"></div>
                                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-5 h-px bg-[#F472B6]"></div>
                                            </div>
                                            {/* 리본 */}
                                            <div className="relative w-6 h-5">
                                                <div className="absolute top-1 left-0 w-3 h-2 bg-[#F9A8D4] rounded-full rotate-[-20deg]"></div>
                                                <div className="absolute top-1 right-0 w-3 h-2 bg-[#F9A8D4] rounded-full rotate-[20deg]"></div>
                                                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#EC4899] rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        }

                        // ── 민트 선반 (가드닝 & 네이처) ──
                        if (shelfId === 'shelf_mint') {
                            return (
                                <>
                                    {/* 상단 선반 */}
                                    <div className="relative w-28 h-2.5 rounded-md mb-8" style={shelfStyle}>
                                        <div className="absolute bottom-full left-2 z-10 flex gap-2 items-end">
                                            {/* 물뿌리개 */}
                                            <div className="relative w-11 h-8">
                                                <div className="absolute bottom-0 w-8 h-6 bg-[#67E8F9] rounded-lg"></div>
                                                <div className="absolute bottom-4 right-0 w-5 h-1.5 bg-[#67E8F9] rounded-full rotate-[-30deg]"></div>
                                                <div className="absolute bottom-5 left-0 w-2 h-3 bg-[#22D3EE] rounded-md"></div>
                                            </div>
                                            {/* 토기 화분 2개 */}
                                            <div className="relative w-5 h-7">
                                                <div className="absolute bottom-0 w-5 h-4 bg-[#C2956B] rounded-b-md" style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)' }}></div>
                                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-3 h-4 bg-[#4ADE80] rounded-full"></div>
                                            </div>
                                            <div className="relative w-4 h-6">
                                                <div className="absolute bottom-0 w-4 h-3.5 bg-[#B8865A] rounded-b-md" style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)' }}></div>
                                                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-2.5 h-3.5 bg-[#22C55E] rounded-full"></div>
                                            </div>
                                        </div>
                                        {/* 덩굴 잎 (선반 아래로 늘어짐) */}
                                        <div className="absolute top-2 -left-1">
                                            <svg viewBox="0 0 20 30" width="16" height="24">
                                                <path d="M10,0 Q4,8 8,14 Q4,18 8,24" fill="none" stroke="#4ADE80" strokeWidth="1.5" />
                                                <circle cx="6" cy="8" r="2.5" fill="#4ADE80" opacity="0.7" />
                                                <circle cx="10" cy="14" r="2" fill="#22C55E" opacity="0.7" />
                                                <circle cx="6" cy="20" r="2.5" fill="#4ADE80" opacity="0.6" />
                                            </svg>
                                        </div>
                                    </div>
                                    {/* 하단 선반 */}
                                    <div className="relative w-28 h-2.5 rounded-md" style={shelfStyle}>
                                        <div className="absolute bottom-full left-2 z-10 flex gap-2 items-end">
                                            {/* 미니 가드닝 삽 */}
                                            <div className="relative w-3 h-9">
                                                <div className="absolute bottom-0 w-1 h-6 bg-[#A16207] rounded-full mx-auto left-1/2 -translate-x-1/2"></div>
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#9CA3AF] rounded-b-full"></div>
                                            </div>
                                            {/* 큰 잎 달린 화분 */}
                                            <div className="relative w-8 h-10">
                                                <div className="absolute bottom-0 w-7 h-4 bg-[#C2956B] rounded-b-lg mx-auto left-0.5" style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)' }}></div>
                                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-2 h-5 bg-[#16A34A] rounded-full"></div>
                                                <div className="absolute bottom-5 left-0 w-4 h-3 bg-[#4ADE80] rounded-full rotate-[-30deg]"></div>
                                                <div className="absolute bottom-5 right-0 w-4 h-3 bg-[#4ADE80] rounded-full rotate-[30deg]"></div>
                                            </div>
                                            {/* 씨앗 봉투 */}
                                            <div className="w-5 h-7 bg-[#FDE68A] rounded-sm" style={{ boxShadow: '1px 1px 0 rgba(0,0,0,0.05)' }}>
                                                <div className="mt-1 mx-0.5 w-4 h-2 bg-[#F59E0B]/30 rounded-sm"></div>
                                            </div>
                                        </div>
                                        {/* 덩굴 잎 (하단 선반 아래로) */}
                                        <div className="absolute top-2 right-0">
                                            <svg viewBox="0 0 16 20" width="12" height="16">
                                                <path d="M6,0 Q12,6 8,12 Q12,16 8,20" fill="none" stroke="#4ADE80" strokeWidth="1.2" />
                                                <circle cx="10" cy="6" r="2" fill="#22C55E" opacity="0.6" />
                                                <circle cx="7" cy="13" r="2" fill="#4ADE80" opacity="0.5" />
                                            </svg>
                                        </div>
                                    </div>
                                </>
                            );
                        }

                        // ── 라벤더 선반 (미스틱 & 힐링) ──
                        if (shelfId === 'shelf_lavender') {
                            return (
                                <>
                                    {/* 상단 선반 */}
                                    <div className="relative w-28 h-2.5 rounded-md mb-8" style={shelfStyle}>
                                        <div className="absolute bottom-full left-2 z-10 flex gap-2 items-end">
                                            {/* 수정구슬 */}
                                            <div className="relative w-10 h-11">
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2 bg-[#7C3AED]/70 rounded-md"></div>
                                                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full" style={{
                                                    background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6), rgba(196,181,253,0.4), rgba(139,92,246,0.3))',
                                                    boxShadow: '0 0 8px rgba(139,92,246,0.3)'
                                                }}></div>
                                                <div className="absolute bottom-5 left-3 w-2 h-2 bg-white/50 rounded-full"></div>
                                            </div>
                                            {/* 캔들 */}
                                            <div className="relative w-5 h-11">
                                                <div className="absolute bottom-0 w-5 h-7 bg-[#FDE68A] rounded-md"></div>
                                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-1 h-2 bg-[#FFFBEB] rounded-sm"></div>
                                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-2.5 h-3 bg-[#FB923C] rounded-full animate-pulse" style={{ filter: 'blur(0.5px)' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 하단 선반 */}
                                    <div className="relative w-28 h-2.5 rounded-md" style={shelfStyle}>
                                        <div className="absolute bottom-full left-3 z-10 flex gap-3 items-end">
                                            {/* 타로 카드 */}
                                            <div className="relative w-6 h-9 bg-[#581C87] rounded-sm" style={{ transform: 'rotate(5deg)', boxShadow: '2px 2px 4px rgba(0,0,0,0.15)' }}>
                                                <div className="absolute inset-0.5 rounded-sm border border-[#A855F7]/40"></div>
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-[#E9D5FF]/40"></div>
                                                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#E9D5FF]/50" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
                                            </div>
                                            {/* 미니 보라 병 */}
                                            <div className="relative w-4 h-8">
                                                <div className="absolute bottom-0 w-4 h-6 bg-[#C084FC]/40 rounded-md border border-[#A855F7]/30"></div>
                                                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#7C3AED]/60 rounded-sm"></div>
                                            </div>
                                            {/* 작은 별 장식 */}
                                            <div className="opacity-70"><MongleIcon name="sparkle" size={18} /></div>
                                        </div>
                                    </div>
                                </>
                            );
                        }

                        // ── 기본 선반 (원목 - 책 + 카메라 + 선인장 + 박스) ──
                        return (
                            <>
                                {/* 상단 선반 */}
                                <div className="relative w-28 h-2.5 rounded-md mb-8" style={shelfStyle}>
                                    <div className="absolute bottom-full left-2 z-10 flex gap-2 items-end">
                                        <div className="w-4 h-10 bg-gradient-to-br from-[#FF8FA3] to-[#FF6B8A] rounded-sm" style={{ boxShadow: '2px 0 0 rgba(0,0,0,0.1)' }}></div>
                                        <div className="w-3 h-8 bg-gradient-to-br from-[#FFB5C2] to-[#FF9FB1] rounded-sm mt-2" style={{ boxShadow: '2px 0 0 rgba(0,0,0,0.1)' }}></div>
                                        <div className="relative w-7 h-6 bg-gradient-to-br from-[#FF9FB1] to-[#FF8FA3] rounded-md" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/80 rounded-full"></div>
                                            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                                {/* 하단 선반 */}
                                <div className="relative w-28 h-2.5 rounded-md" style={shelfStyle}>
                                    <div className="absolute bottom-full left-2 z-10 flex gap-3 items-end">
                                        <div className="relative w-8 h-12">
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-5 bg-gradient-to-b from-[#FF9980] to-[#FF8060] rounded-b-md" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}></div>
                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4 h-7 bg-gradient-to-br from-[#7CB342] to-[#558B2F] rounded-lg"></div>
                                            <div className="absolute bottom-5 left-0 w-2 h-3 bg-gradient-to-br from-[#7CB342] to-[#558B2F] rounded-full"></div>
                                            <div className="absolute bottom-5 right-0 w-2 h-3 bg-gradient-to-br from-[#7CB342] to-[#558B2F] rounded-full"></div>
                                        </div>
                                        <div className="relative w-6 h-7 bg-gradient-to-br from-[#D4A5F5] to-[#B87FE0] rounded-sm" style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}>
                                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/30"></div>
                                            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/30"></div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
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
                        style={{ bottom: '70%', marginBottom: '20px', width: 'max-content', maxWidth: '85vw' }}
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

                    {/* 펫 (MainRoom) — 방석 위에 정확히 앉도록 translate-y 조정 */}
                    <div className="-mb-2 z-30 pointer-events-auto" style={{ overflow: 'visible' }} data-gtm="mongle-character">
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

                    {/* 방석 (cushionType별 고유 디자인) */}
                    <div
                        data-decoration-type="rug"
                        data-decoration-id="premium-cushion-01"
                        data-gtm="decoration-premium-cushion"
                    >
                        {(() => {
                            const cId = equippedCushion?.id;
                            const cc = equippedCushion?.color || '#E8C5FF';
                            const cd = equippedCushion?.colorDark || '#D4A5F5';

                            // ── 구름 방석: 거대하고 푹신한 뭉게구름 ──
                            if (cId === 'cushion_blue') {
                                return (
                                    <div className="relative w-56 h-32">
                                        {/* 바닥 그림자 */}
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-52 h-5 bg-black/20 rounded-[50%] blur-xl"></div>
                                        {/* 구름 베이스 (가장 넓은 층) */}
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-16 rounded-[50%]" style={{ background: `linear-gradient(180deg, #E8F4FD, ${cd})`, filter: 'drop-shadow(0 8px 20px rgba(100,149,237,0.35))' }}></div>
                                        {/* 구름 중간층 */}
                                        <div className="absolute bottom-5 left-[4%] w-20 h-18 rounded-full" style={{ background: `linear-gradient(180deg, #F0F8FF, ${cc})` }}></div>
                                        <div className="absolute bottom-5 right-[4%] w-20 h-18 rounded-full" style={{ background: `linear-gradient(180deg, #F0F8FF, ${cc})` }}></div>
                                        <div className="absolute bottom-7 left-[16%] w-24 h-20 rounded-full" style={{ background: `linear-gradient(180deg, white, ${cc})` }}></div>
                                        <div className="absolute bottom-7 right-[16%] w-22 h-18 rounded-full" style={{ background: `linear-gradient(180deg, white, ${cc})` }}></div>
                                        {/* 구름 상단 봉우리 */}
                                        <div className="absolute bottom-12 left-[26%] w-28 h-22 rounded-full" style={{ background: `linear-gradient(180deg, white, ${cc}CC)` }}></div>
                                        <div className="absolute bottom-10 left-[10%] w-16 h-14 rounded-full" style={{ background: `linear-gradient(180deg, #F8FCFF, ${cc}DD)` }}></div>
                                        <div className="absolute bottom-10 right-[10%] w-16 h-14 rounded-full" style={{ background: `linear-gradient(180deg, #F8FCFF, ${cc}DD)` }}></div>
                                        {/* 솜사탕 질감 하이라이트 */}
                                        <div className="absolute bottom-16 left-[30%] w-20 h-8 bg-white/50 rounded-[50%] blur-md"></div>
                                        <div className="absolute bottom-14 left-[14%] w-10 h-5 bg-white/35 rounded-[50%] blur-sm"></div>
                                        <div className="absolute bottom-14 right-[14%] w-10 h-5 bg-white/35 rounded-[50%] blur-sm"></div>
                                        {/* 은은한 파란빛 광택 */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-44 h-8 bg-sky-200/20 rounded-[50%] blur-sm"></div>
                                    </div>
                                );
                            }

                            // ── 벨벳 방석: 황실의 고급 방석 ──
                            if (cId === 'cushion_purple') {
                                return (
                                    <div className="relative w-56 h-32">
                                        {/* 바닥 그림자 */}
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-52 h-5 bg-black/30 rounded-[50%] blur-xl"></div>
                                        {/* 두꺼운 금테 (외곽) */}
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-54 h-28 rounded-[50%]" style={{
                                            background: 'linear-gradient(135deg, #FFD700, #DAA520, #B8860B, #DAA520, #FFD700)',
                                            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
                                        }}></div>
                                        {/* 금테 광택 */}
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-52 h-8 bg-yellow-200/30 rounded-[50%] blur-sm"></div>
                                        {/* 벨벳 본체 (넓은 타원) */}
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-50 h-26 rounded-[50%]" style={{
                                            background: 'radial-gradient(ellipse at 40% 35%, #9C27B0, #7B1FA2, #4A148C)',
                                            boxShadow: 'inset 0 -8px 16px rgba(0,0,0,0.35), inset 0 6px 12px rgba(255,255,255,0.2)'
                                        }}></div>
                                        {/* 터프팅 방사형 주름 (8방향) */}
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-50 h-26 rounded-[50%] overflow-hidden">
                                            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/15 -translate-y-1/2"></div>
                                            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/15 -translate-x-1/2"></div>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full" style={{ borderTop: '1px solid rgba(255,255,255,0.12)', transform: 'rotate(45deg)' }}></div>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full" style={{ borderTop: '1px solid rgba(255,255,255,0.12)', transform: 'rotate(-45deg)' }}></div>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', transform: 'rotate(22.5deg)' }}></div>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', transform: 'rotate(-22.5deg)' }}></div>
                                        </div>
                                        {/* 중앙 금색 단추 (크게) */}
                                        <div className="absolute bottom-[42%] left-1/2 -translate-x-1/2 w-7 h-7 rounded-full" style={{
                                            background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                                            boxShadow: '0 3px 6px rgba(0,0,0,0.4), inset 0 2px 2px rgba(255,255,255,0.5), 0 0 8px rgba(218,165,32,0.4)'
                                        }}></div>
                                        <div className="absolute bottom-[44%] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white/35"></div>
                                        {/* 벨벳 광택 하이라이트 */}
                                        <div className="absolute bottom-16 left-[24%] w-20 h-6 bg-purple-300/25 rounded-[50%] blur-md"></div>
                                        <div className="absolute bottom-18 left-[36%] w-14 h-4 bg-white/20 rounded-[50%] blur-sm"></div>
                                    </div>
                                );
                            }

                            // ── 꽃 모양 방석: 둥글고 풍성한 꽃잎 쿠션 ──
                            if (cId === 'cushion_yellow') {
                                return (
                                    <div className="relative w-52 h-28">
                                        {/* 바닥 글로우 그림자 */}
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-48 h-5 rounded-[50%] blur-xl" style={{ background: 'rgba(255,215,0,0.35)' }}></div>
                                        {/* 꽃잎 6장 (넓고 납작한 타원, 바닥에 펼쳐진 형태) */}
                                        {/* 꽃잎 1 - 상단좌 */}
                                        <div className="absolute top-[-2px] left-[8%] w-20 h-16 rounded-full" style={{
                                            background: 'linear-gradient(135deg, #FFE082, #FFD54F, #FFC107)',
                                            boxShadow: 'inset 0 -3px 6px rgba(255,152,0,0.25), inset 0 2px 4px rgba(255,255,255,0.5)',
                                            transform: 'rotate(-25deg)'
                                        }}></div>
                                        {/* 꽃잎 2 - 상단우 */}
                                        <div className="absolute top-[-2px] right-[8%] w-20 h-16 rounded-full" style={{
                                            background: 'linear-gradient(225deg, #FFE082, #FFD54F, #FFC107)',
                                            boxShadow: 'inset 0 -3px 6px rgba(255,152,0,0.25), inset 0 2px 4px rgba(255,255,255,0.5)',
                                            transform: 'rotate(25deg)'
                                        }}></div>
                                        {/* 꽃잎 3 - 좌측 */}
                                        <div className="absolute top-[22%] left-[-4%] w-22 h-14 rounded-full" style={{
                                            background: 'linear-gradient(180deg, #FFECB3, #FFD54F)',
                                            boxShadow: 'inset 0 -3px 6px rgba(255,152,0,0.2), inset 0 2px 4px rgba(255,255,255,0.45)',
                                            transform: 'rotate(-10deg)'
                                        }}></div>
                                        {/* 꽃잎 4 - 우측 */}
                                        <div className="absolute top-[22%] right-[-4%] w-22 h-14 rounded-full" style={{
                                            background: 'linear-gradient(180deg, #FFECB3, #FFD54F)',
                                            boxShadow: 'inset 0 -3px 6px rgba(255,152,0,0.2), inset 0 2px 4px rgba(255,255,255,0.45)',
                                            transform: 'rotate(10deg)'
                                        }}></div>
                                        {/* 꽃잎 5 - 하단좌 */}
                                        <div className="absolute bottom-[-2px] left-[10%] w-20 h-14 rounded-full" style={{
                                            background: 'linear-gradient(45deg, #FFC107, #FFB300)',
                                            boxShadow: 'inset 0 -3px 6px rgba(255,111,0,0.2), inset 0 2px 4px rgba(255,255,255,0.35)',
                                            transform: 'rotate(15deg)'
                                        }}></div>
                                        {/* 꽃잎 6 - 하단우 */}
                                        <div className="absolute bottom-[-2px] right-[10%] w-20 h-14 rounded-full" style={{
                                            background: 'linear-gradient(315deg, #FFC107, #FFB300)',
                                            boxShadow: 'inset 0 -3px 6px rgba(255,111,0,0.2), inset 0 2px 4px rgba(255,255,255,0.35)',
                                            transform: 'rotate(-15deg)'
                                        }}></div>
                                        {/* 중앙 꽃술 (넓은 타원) */}
                                        <div className="absolute inset-0 m-auto w-24 h-16 rounded-[50%]" style={{
                                            background: 'radial-gradient(ellipse at 40% 35%, #FFF8E1, #FFCA28, #FF9800)',
                                            boxShadow: 'inset 0 -6px 12px rgba(230,126,34,0.35), inset 0 4px 10px rgba(255,255,255,0.6), 0 4px 16px rgba(255,193,7,0.3)'
                                        }}></div>
                                        {/* 꽃술 질감 디테일 */}
                                        <div className="absolute inset-0 m-auto w-24 h-16 rounded-[50%] overflow-hidden">
                                            <div className="absolute top-[25%] left-[20%] w-2 h-2 bg-white/50 rounded-full"></div>
                                            <div className="absolute top-[30%] left-[55%] w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                                            <div className="absolute top-[50%] left-[35%] w-1.5 h-1.5 bg-white/35 rounded-full"></div>
                                            <div className="absolute top-[45%] left-[65%] w-1 h-1 bg-white/30 rounded-full"></div>
                                        </div>
                                        {/* 광택 하이라이트 */}
                                        <div className="absolute inset-0 m-auto w-18 h-6 rounded-[50%] bg-white/35 blur-sm" style={{ marginTop: '20px' }}></div>
                                        {/* 스티치 링 */}
                                        <div className="absolute inset-0 m-auto w-16 h-10 rounded-[50%] border-2 border-dashed border-amber-600/25"></div>
                                    </div>
                                );
                            }

                            // ── 나뭇잎 방석: 대형 몬스테라 매트 ──
                            if (cId === 'cushion_mint') {
                                return (
                                    <div className="relative w-56 h-32 flex items-end justify-center">
                                        {/* 바닥 그림자 */}
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-52 h-5 bg-black/15 rounded-[50%] blur-xl"></div>
                                        <svg viewBox="0 0 220 130" width="220" height="130" className="relative">
                                            <defs>
                                                <filter id="leafShadow">
                                                    <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="rgba(0,0,0,0.2)" />
                                                </filter>
                                            </defs>
                                            {/* 잎 본체 (하트형 연잎) */}
                                            <path d="M110,12 Q160,12 190,50 Q210,80 180,105 Q150,125 110,118 Q70,125 40,105 Q10,80 30,50 Q60,12 110,12 Z"
                                                fill={cc} filter="url(#leafShadow)" />
                                            {/* 잎 내부 층 (그라데이션 효과) */}
                                            <path d="M110,18 Q155,18 182,52 Q200,78 174,100 Q148,118 110,112 Q72,118 46,100 Q20,78 38,52 Q65,18 110,18 Z"
                                                fill={cd} opacity="0.4" />
                                            {/* 중앙 잎맥 (두껍고 진한) */}
                                            <path d="M110,16 L110,118" stroke="#2E7D32" strokeWidth="3" opacity="0.35" strokeLinecap="round" />
                                            {/* 1차 잎맥 (좌우 대칭, 곡선) */}
                                            <path d="M110,35 Q80,30 45,50" fill="none" stroke="#2E7D32" strokeWidth="2" opacity="0.25" strokeLinecap="round" />
                                            <path d="M110,35 Q140,30 175,50" fill="none" stroke="#2E7D32" strokeWidth="2" opacity="0.25" strokeLinecap="round" />
                                            <path d="M110,55 Q75,48 38,70" fill="none" stroke="#2E7D32" strokeWidth="1.8" opacity="0.22" strokeLinecap="round" />
                                            <path d="M110,55 Q145,48 182,70" fill="none" stroke="#2E7D32" strokeWidth="1.8" opacity="0.22" strokeLinecap="round" />
                                            <path d="M110,75 Q78,70 48,90" fill="none" stroke="#2E7D32" strokeWidth="1.5" opacity="0.18" strokeLinecap="round" />
                                            <path d="M110,75 Q142,70 172,90" fill="none" stroke="#2E7D32" strokeWidth="1.5" opacity="0.18" strokeLinecap="round" />
                                            <path d="M110,92 Q85,88 58,102" fill="none" stroke="#2E7D32" strokeWidth="1.2" opacity="0.15" strokeLinecap="round" />
                                            <path d="M110,92 Q135,88 162,102" fill="none" stroke="#2E7D32" strokeWidth="1.2" opacity="0.15" strokeLinecap="round" />
                                            {/* 광택 하이라이트 */}
                                            <ellipse cx="90" cy="45" rx="35" ry="16" fill="white" opacity="0.2" transform="rotate(-8 90 45)" />
                                            <ellipse cx="80" cy="38" rx="18" ry="8" fill="white" opacity="0.15" transform="rotate(-10 80 38)" />
                                            {/* 잎 끝 물방울 디테일 */}
                                            <ellipse cx="110" cy="14" rx="3" ry="4" fill="#4ADE80" opacity="0.5" />
                                            {/* 줄기 */}
                                            <path d="M110,118 Q108,125 112,130" fill="none" stroke="#4ADE80" strokeWidth="4" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                );
                            }

                            // ── 기본 방석 (둥근 사각형) + 기본값 ──
                            return (
                                <div className="relative w-52 h-28">
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-48 h-4 bg-black/25 rounded-[50%] blur-lg"></div>
                                    {/* 본체 */}
                                    <div className="absolute inset-0 rounded-[50%]" style={{
                                        background: `linear-gradient(to bottom right, ${cc}, ${cd})`,
                                        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
                                        boxShadow: 'inset 0 -8px 16px rgba(139,92,246,0.4), inset 0 6px 12px rgba(255,255,255,0.5)'
                                    }}></div>
                                    {/* 스티치 */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-16">
                                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40 rounded-full -translate-y-1/2"></div>
                                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/40 rounded-full -translate-x-1/2"></div>
                                    </div>
                                    <div className="absolute inset-3 rounded-[50%] border-2 border-dashed border-white/35"></div>
                                    {/* 모서리 장식 */}
                                    <div className="absolute top-3 left-5 w-2.5 h-2.5 bg-white/50 rounded-full"></div>
                                    <div className="absolute top-3 right-5 w-2.5 h-2.5 bg-white/50 rounded-full"></div>
                                    <div className="absolute bottom-3 left-5 w-2.5 h-2.5 bg-white/50 rounded-full"></div>
                                    <div className="absolute bottom-3 right-5 w-2.5 h-2.5 bg-white/50 rounded-full"></div>
                                    {/* 질감 */}
                                    <div className="absolute inset-0 overflow-hidden rounded-[50%]">
                                        <div className="absolute left-[15%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/25 to-transparent"></div>
                                        <div className="absolute left-[30%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                                        <div className="absolute left-[45%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/25 to-transparent"></div>
                                        <div className="absolute left-[60%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                                        <div className="absolute left-[75%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/25 to-transparent"></div>
                                    </div>
                                    {/* 하이라이트 */}
                                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-36 h-8 bg-white/45 rounded-[50%] blur-md"></div>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* 🪴 우측 하단 대형 화분 - 교체 가능한 장식 (plantType별 고유 디자인) */}
                <div
                    className="absolute bottom-[26%] right-[6%] z-20 pointer-events-none"
                    data-decoration-type="plant"
                    data-decoration-id="large-potted-plant-01"
                    data-gtm="decoration-large-plant"
                    style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))' }}
                >
                    {(() => {
                        const potId = equippedPot?.id;
                        const pc = equippedPot?.potColor || '#FF9980';
                        const pl = equippedPot?.plantColor || '#66BB6A';

                        // ── 선인장 화분: 오동통한 군락 ──
                        if (potId === 'pot_cactus') {
                            return (
                                <svg viewBox="0 0 96 176" width="96" height="176">
                                    {/* 화분 본체 (사다리꼴) */}
                                    <polygon points="22,122 74,122 80,164 16,164" fill={pc} />
                                    <polygon points="22,122 74,122 80,164 16,164" fill="rgba(255,255,255,0.15)" />
                                    {/* 화분 테두리 */}
                                    <rect x="18" y="118" width="60" height="7" rx="2" fill={pc} />
                                    <rect x="18" y="118" width="60" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
                                    {/* 흙 (화분 안쪽 상단) */}
                                    <ellipse cx="48" cy="124" rx="27" ry="5" fill="#5D4037" opacity="0.6" />
                                    {/* 왼쪽 작은 선인장 1 */}
                                    <ellipse cx="22" cy="100" rx="9" ry="24" fill="#2E7D32" />
                                    <ellipse cx="22" cy="100" rx="6" ry="20" fill="#43A047" opacity="0.5" />
                                    <circle cx="20" cy="88" r="1" fill="#A5D6A7" />
                                    <circle cx="25" cy="96" r="1" fill="#A5D6A7" />
                                    <circle cx="19" cy="106" r="1" fill="#A5D6A7" />
                                    {/* 왼쪽 작은 선인장 2 (둥글) */}
                                    <ellipse cx="32" cy="108" rx="8" ry="14" fill="#388E3C" />
                                    <ellipse cx="32" cy="108" rx="5.5" ry="11" fill="#43A047" opacity="0.4" />
                                    <circle cx="30" cy="100" r="1" fill="#A5D6A7" />
                                    <circle cx="35" cy="106" r="1" fill="#A5D6A7" />
                                    {/* 메인 뚱뚱한 선인장 (중앙) */}
                                    <ellipse cx="48" cy="76" rx="18" ry="48" fill="#2E7D32" />
                                    <ellipse cx="48" cy="76" rx="13" ry="44" fill="#388E3C" opacity="0.5" />
                                    {/* 메인 세로 줄무늬 */}
                                    <line x1="48" y1="30" x2="48" y2="120" stroke="#1B5E20" strokeWidth="0.7" opacity="0.3" />
                                    <line x1="41" y1="34" x2="41" y2="118" stroke="#1B5E20" strokeWidth="0.5" opacity="0.2" />
                                    <line x1="55" y1="34" x2="55" y2="118" stroke="#1B5E20" strokeWidth="0.5" opacity="0.2" />
                                    {/* 메인 왼쪽 팔 */}
                                    <ellipse cx="26" cy="62" rx="10" ry="26" fill="#2E7D32" transform="rotate(-15 26 62)" />
                                    <ellipse cx="26" cy="62" rx="7" ry="22" fill="#388E3C" opacity="0.4" transform="rotate(-15 26 62)" />
                                    {/* 메인 오른쪽 팔 */}
                                    <ellipse cx="68" cy="70" rx="10" ry="22" fill="#2E7D32" transform="rotate(12 68 70)" />
                                    <ellipse cx="68" cy="70" rx="7" ry="18" fill="#388E3C" opacity="0.4" transform="rotate(12 68 70)" />
                                    {/* 오른쪽 작은 선인장 */}
                                    <ellipse cx="70" cy="104" rx="8" ry="18" fill="#388E3C" />
                                    <ellipse cx="70" cy="104" rx="5.5" ry="14" fill="#43A047" opacity="0.4" />
                                    <circle cx="68" cy="94" r="1" fill="#A5D6A7" />
                                    <circle cx="73" cy="102" r="1" fill="#A5D6A7" />
                                    {/* 가시 점 (메인) */}
                                    <circle cx="42" cy="44" r="1.3" fill="#A5D6A7" />
                                    <circle cx="54" cy="52" r="1.3" fill="#A5D6A7" />
                                    <circle cx="46" cy="66" r="1.3" fill="#A5D6A7" />
                                    <circle cx="52" cy="38" r="1.3" fill="#A5D6A7" />
                                    <circle cx="40" cy="82" r="1.3" fill="#A5D6A7" />
                                    <circle cx="56" cy="90" r="1.3" fill="#A5D6A7" />
                                    <circle cx="44" cy="96" r="1.3" fill="#A5D6A7" />
                                    <circle cx="50" cy="106" r="1.3" fill="#A5D6A7" />
                                    <circle cx="24" cy="52" r="1" fill="#A5D6A7" />
                                    <circle cx="28" cy="70" r="1" fill="#A5D6A7" />
                                    <circle cx="66" cy="60" r="1" fill="#A5D6A7" />
                                    <circle cx="70" cy="78" r="1" fill="#A5D6A7" />
                                    {/* 꼭대기 큰 꽃 */}
                                    {[0, 60, 120, 180, 240, 300].map(a => (
                                        <ellipse key={a} cx="48" cy="28" rx="3.5" ry="7" fill="#F48FB1"
                                            transform={`rotate(${a} 48 28)`} />
                                    ))}
                                    <circle cx="48" cy="28" r="4" fill="#FCE4EC" />
                                    <circle cx="48" cy="28" r="2" fill="#F06292" />
                                    {/* 왼쪽 선인장 작은 꽃 */}
                                    <circle cx="22" cy="74" r="3.5" fill="#FFE082" />
                                    <circle cx="22" cy="74" r="1.8" fill="#FFD54F" />
                                </svg>
                            );
                        }

                        // ── 꽃 화분: 화사한 꽃밭 ──
                        if (potId === 'pot_flower') {
                            return (
                                <svg viewBox="0 0 96 176" width="96" height="176">
                                    {/* 화분 본체 (사다리꼴) */}
                                    <polygon points="22,126 74,126 80,166 16,166" fill={pc} />
                                    <polygon points="22,126 74,126 80,166 16,166" fill="rgba(255,255,255,0.15)" />
                                    {/* 화분 테두리 */}
                                    <rect x="18" y="122" width="60" height="7" rx="2" fill={pc} />
                                    <rect x="18" y="122" width="60" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
                                    {/* 흙 (화분 안쪽 상단) */}
                                    <ellipse cx="48" cy="128" rx="25" ry="4" fill="#5D4037" opacity="0.5" />
                                    {/* 바닥 잎사귀 덮개 (흙 위) */}
                                    <ellipse cx="48" cy="122" rx="34" ry="10" fill="#43A047" />
                                    <ellipse cx="36" cy="118" rx="14" ry="7" fill="#66BB6A" transform="rotate(-10 36 118)" />
                                    <ellipse cx="60" cy="118" rx="14" ry="7" fill="#66BB6A" transform="rotate(10 60 118)" />
                                    <ellipse cx="48" cy="116" rx="12" ry="6" fill="#4CAF50" />
                                    <ellipse cx="28" cy="120" rx="10" ry="5" fill="#388E3C" transform="rotate(-20 28 120)" />
                                    <ellipse cx="68" cy="120" rx="10" ry="5" fill="#388E3C" transform="rotate(20 68 120)" />
                                    {/* 줄기 4개 (부채꼴) */}
                                    <line x1="36" y1="122" x2="22" y2="48" stroke="#4CAF50" strokeWidth="3.5" strokeLinecap="round" />
                                    <line x1="44" y1="120" x2="38" y2="32" stroke="#43A047" strokeWidth="3.5" strokeLinecap="round" />
                                    <line x1="52" y1="120" x2="58" y2="36" stroke="#43A047" strokeWidth="3.5" strokeLinecap="round" />
                                    <line x1="60" y1="122" x2="74" y2="52" stroke="#4CAF50" strokeWidth="3.5" strokeLinecap="round" />
                                    {/* 줄기 잎사귀들 */}
                                    <ellipse cx="30" cy="88" rx="8" ry="4" fill="#66BB6A" transform="rotate(-40 30 88)" />
                                    <ellipse cx="52" cy="80" rx="7" ry="3.5" fill="#66BB6A" transform="rotate(25 52 80)" />
                                    <ellipse cx="66" cy="90" rx="7" ry="3.5" fill="#66BB6A" transform="rotate(35 66 90)" />
                                    <ellipse cx="40" cy="70" rx="7" ry="3.5" fill="#4CAF50" transform="rotate(-30 40 70)" />
                                    {/* 꽃 1 (왼쪽 큰 꽃 - 핑크) */}
                                    {[0, 60, 120, 180, 240, 300].map(a => (
                                        <ellipse key={`f1-${a}`} cx="22" cy="40" rx="5" ry="10" fill="#F8BBD0"
                                            transform={`rotate(${a} 22 40)`} />
                                    ))}
                                    <circle cx="22" cy="40" r="5.5" fill="#FFD54F" />
                                    <circle cx="22" cy="40" r="3" fill="#FFCA28" />
                                    {/* 꽃 2 (중앙 왼쪽 큰 꽃 - 흰) */}
                                    {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
                                        <ellipse key={`f2-${a}`} cx="38" cy="24" rx="5.5" ry="11" fill="white" stroke="#E0E0E0" strokeWidth="0.3"
                                            transform={`rotate(${a} 38 24)`} />
                                    ))}
                                    <circle cx="38" cy="24" r="6" fill="#FFD54F" />
                                    <circle cx="38" cy="24" r="3.5" fill="#FFCA28" />
                                    {/* 꽃 3 (중앙 오른쪽 - 라벤더) */}
                                    {[0, 72, 144, 216, 288].map(a => (
                                        <ellipse key={`f3-${a}`} cx="58" cy="28" rx="5" ry="10" fill="#CE93D8"
                                            transform={`rotate(${a} 58 28)`} />
                                    ))}
                                    <circle cx="58" cy="28" r="5" fill="#FFD54F" />
                                    <circle cx="58" cy="28" r="3" fill="#FFC107" />
                                    {/* 꽃 4 (오른쪽 - 핑크) */}
                                    {[0, 60, 120, 180, 240, 300].map(a => (
                                        <ellipse key={`f4-${a}`} cx="74" cy="44" rx="4.5" ry="9" fill="#F48FB1"
                                            transform={`rotate(${a} 74 44)`} />
                                    ))}
                                    <circle cx="74" cy="44" r="4.5" fill="#FFE082" />
                                    <circle cx="74" cy="44" r="2.5" fill="#FFD54F" />
                                    {/* 꽃봉오리 (줄기 사이) */}
                                    <ellipse cx="30" cy="64" rx="3" ry="4.5" fill="#F8BBD0" />
                                    <ellipse cx="64" cy="68" rx="3" ry="4.5" fill="#CE93D8" />
                                </svg>
                            );
                        }

                        // ── 라벤더 화분: 풍성한 부시 ──
                        if (potId === 'pot_lavender') {
                            return (
                                <svg viewBox="0 0 96 176" width="96" height="176">
                                    {/* 화분 본체 (사다리꼴) */}
                                    <polygon points="22,130 74,130 80,168 16,168" fill={pc} />
                                    <polygon points="22,130 74,130 80,168 16,168" fill="rgba(255,255,255,0.15)" />
                                    {/* 화분 테두리 */}
                                    <rect x="18" y="126" width="60" height="7" rx="2" fill={pc} />
                                    <rect x="18" y="126" width="60" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
                                    {/* 흙 (화분 안쪽 상단) */}
                                    <ellipse cx="48" cy="132" rx="25" ry="4" fill="#5D4037" opacity="0.5" />
                                    {/* 하단 녹색 덤불 (둥글고 풍성) */}
                                    <ellipse cx="48" cy="112" rx="36" ry="22" fill="#558B2F" />
                                    <ellipse cx="36" cy="108" rx="22" ry="16" fill="#689F38" />
                                    <ellipse cx="62" cy="108" rx="22" ry="16" fill="#558B2F" opacity="0.9" />
                                    <ellipse cx="48" cy="100" rx="28" ry="14" fill="#7CB342" opacity="0.7" />
                                    <ellipse cx="26" cy="114" rx="14" ry="10" fill="#689F38" opacity="0.6" />
                                    <ellipse cx="70" cy="114" rx="14" ry="10" fill="#689F38" opacity="0.6" />
                                    <ellipse cx="48" cy="118" rx="30" ry="12" fill="#558B2F" opacity="0.5" />
                                    {/* 줄기 7개 (부채꼴, 빽빽하게) */}
                                    {[
                                        { x1: 38, y1: 108, x2: 14, y2: 34 },
                                        { x1: 42, y1: 106, x2: 24, y2: 20 },
                                        { x1: 44, y1: 104, x2: 34, y2: 10 },
                                        { x1: 48, y1: 102, x2: 48, y2: 4 },
                                        { x1: 52, y1: 104, x2: 62, y2: 10 },
                                        { x1: 54, y1: 106, x2: 72, y2: 20 },
                                        { x1: 58, y1: 108, x2: 82, y2: 34 },
                                    ].map((l, i) => (
                                        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#7CB342" strokeWidth="2.5" strokeLinecap="round" />
                                    ))}
                                    {/* 라벤더 꽃 알갱이 (7줄기) */}
                                    {[
                                        { cx: 14, startY: 34 },
                                        { cx: 24, startY: 20 },
                                        { cx: 34, startY: 10 },
                                        { cx: 48, startY: 4 },
                                        { cx: 62, startY: 10 },
                                        { cx: 72, startY: 20 },
                                        { cx: 82, startY: 34 },
                                    ].map((stem, si) => (
                                        <g key={si}>
                                            {[0, 5, 10, 15, 20, 25].map((dy, di) => (
                                                <ellipse key={di} cx={stem.cx} cy={stem.startY + dy}
                                                    rx={4 - di * 0.35} ry={3.5}
                                                    fill={['#6A1B9A', '#7B1FA2', '#8E24AA', '#AB47BC', '#CE93D8', '#E1BEE7'][di]}
                                                    opacity={1 - di * 0.1} />
                                            ))}
                                        </g>
                                    ))}
                                    {/* 덤불 잎 디테일 */}
                                    <ellipse cx="30" cy="96" rx="8" ry="3.5" fill="#8BC34A" transform="rotate(-30 30 96)" opacity="0.5" />
                                    <ellipse cx="66" cy="96" rx="8" ry="3.5" fill="#8BC34A" transform="rotate(30 66 96)" opacity="0.5" />
                                    <ellipse cx="48" cy="92" rx="6" ry="3" fill="#9CCC65" opacity="0.4" />
                                </svg>
                            );
                        }

                        // ── 장미 화분: 탐스러운 장미 덤불 ──
                        if (potId === 'pot_rose') {
                            return (
                                <svg viewBox="0 0 96 176" width="96" height="176">
                                    {/* 화분 본체 (사다리꼴) */}
                                    <polygon points="22,122 74,122 80,164 16,164" fill={pc} />
                                    <polygon points="22,122 74,122 80,164 16,164" fill="rgba(255,255,255,0.15)" />
                                    {/* 화분 테두리 */}
                                    <rect x="18" y="118" width="60" height="7" rx="2" fill={pc} />
                                    <rect x="18" y="118" width="60" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
                                    {/* 흙 (화분 안쪽 상단) */}
                                    <ellipse cx="48" cy="124" rx="25" ry="4" fill="#5D4037" opacity="0.5" />
                                    {/* 무성한 잎사귀 덤불 (둥근 반구) */}
                                    <ellipse cx="48" cy="96" rx="40" ry="30" fill="#1B5E20" />
                                    <ellipse cx="32" cy="82" rx="26" ry="22" fill="#2E7D32" />
                                    <ellipse cx="66" cy="84" rx="24" ry="20" fill="#1B5E20" opacity="0.9" />
                                    <ellipse cx="48" cy="68" rx="30" ry="20" fill="#388E3C" opacity="0.85" />
                                    <ellipse cx="22" cy="96" rx="18" ry="16" fill="#2E7D32" opacity="0.7" />
                                    <ellipse cx="74" cy="96" rx="16" ry="14" fill="#2E7D32" opacity="0.7" />
                                    <ellipse cx="48" cy="56" rx="22" ry="14" fill="#43A047" opacity="0.7" />
                                    {/* 하단 잎사귀 (화분 연결부) */}
                                    <ellipse cx="48" cy="108" rx="36" ry="18" fill="#1B5E20" opacity="0.6" />
                                    <ellipse cx="30" cy="112" rx="16" ry="10" fill="#2E7D32" opacity="0.5" />
                                    <ellipse cx="66" cy="112" rx="16" ry="10" fill="#2E7D32" opacity="0.5" />
                                    {/* 잎사귀 하이라이트 */}
                                    <ellipse cx="38" cy="72" rx="8" ry="4" fill="#4CAF50" opacity="0.4" transform="rotate(-20 38 72)" />
                                    <ellipse cx="60" cy="76" rx="7" ry="3.5" fill="#4CAF50" opacity="0.4" transform="rotate(15 60 76)" />
                                    <ellipse cx="48" cy="90" rx="6" ry="3" fill="#4CAF50" opacity="0.3" />
                                    {/* 장미 꽃 1 (왼쪽 - 큰) */}
                                    <circle cx="28" cy="68" r="11" fill="#C62828" />
                                    <circle cx="28" cy="68" r="8.5" fill="#E53935" />
                                    <circle cx="28" cy="68" r="6" fill="#EF5350" opacity="0.8" />
                                    <path d="M28,63 Q33,68 28,73 Q23,68 28,63" fill="#B71C1C" opacity="0.7" />
                                    <circle cx="28" cy="68" r="3" fill="#C62828" opacity="0.6" />
                                    <ellipse cx="28" cy="68" rx="1.5" ry="2" fill="#B71C1C" opacity="0.4" />
                                    {/* 장미 꽃 2 (중앙 상단 - 가장 큼) */}
                                    <circle cx="48" cy="48" r="13" fill="#C62828" />
                                    <circle cx="48" cy="48" r="10" fill="#D32F2F" />
                                    <circle cx="48" cy="48" r="7.5" fill="#E53935" opacity="0.85" />
                                    <path d="M48,42 Q54,48 48,54 Q42,48 48,42" fill="#B71C1C" opacity="0.7" />
                                    <circle cx="48" cy="48" r="4" fill="#C62828" opacity="0.6" />
                                    <ellipse cx="48" cy="48" rx="2" ry="2.5" fill="#9C2020" opacity="0.5" />
                                    {/* 장미 꽃 3 (오른쪽 - 중간) */}
                                    <circle cx="68" cy="72" r="10" fill="#D32F2F" />
                                    <circle cx="68" cy="72" r="7.5" fill="#E53935" />
                                    <circle cx="68" cy="72" r="5" fill="#EF5350" opacity="0.8" />
                                    <path d="M68,67 Q73,72 68,77 Q63,72 68,67" fill="#B71C1C" opacity="0.7" />
                                    <circle cx="68" cy="72" r="2.5" fill="#C62828" opacity="0.6" />
                                    {/* 장미 꽃 4 (중앙 하단 - 작은) */}
                                    <circle cx="42" cy="88" r="7.5" fill="#E53935" opacity="0.95" />
                                    <circle cx="42" cy="88" r="5" fill="#EF5350" opacity="0.8" />
                                    <path d="M42,84 Q46,88 42,92 Q38,88 42,84" fill="#C62828" opacity="0.6" />
                                    <circle cx="42" cy="88" r="2" fill="#B71C1C" opacity="0.5" />
                                    {/* 장미 꽃 5 (오른쪽 하단 - 작은) */}
                                    <circle cx="60" cy="92" r="6.5" fill="#D32F2F" opacity="0.9" />
                                    <circle cx="60" cy="92" r="4" fill="#EF5350" opacity="0.7" />
                                    <path d="M60,89 Q63,92 60,95 Q57,92 60,89" fill="#B71C1C" opacity="0.5" />
                                    {/* 꽃봉오리 (작은) */}
                                    <ellipse cx="18" cy="82" rx="3.5" ry="5" fill="#E53935" opacity="0.7" />
                                    <ellipse cx="78" cy="86" rx="3" ry="4.5" fill="#D32F2F" opacity="0.7" />
                                    <ellipse cx="48" cy="38" rx="3" ry="4" fill="#EF5350" opacity="0.6" />
                                </svg>
                            );
                        }

                        // ── 기본 화분 (몬스테라/넓은 잎) ── (기본값 포함)
                        return (
                            <div className="relative w-24 h-44">
                                {/* 화분 */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-16 rounded-b-3xl" style={{
                                    background: `linear-gradient(to bottom, ${pc}, ${pc}CC)`,
                                    clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
                                    boxShadow: '0 6px 12px rgba(0,0,0,0.25), inset 0 3px 0 rgba(255,255,255,0.3)'
                                }}></div>
                                {/* 중앙 큰 잎 */}
                                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-6 h-26 rounded-full" style={{
                                    background: `linear-gradient(to top, ${pl}, ${pl}CC)`
                                }}></div>
                                {/* 좌측 잎들 */}
                                <div className="absolute bottom-16 left-0 w-11 h-18 rounded-full rotate-[-35deg]" style={{
                                    background: `linear-gradient(to bottom right, ${pl}CC, ${pl})`,
                                    boxShadow: 'inset -3px 3px 6px rgba(0,0,0,0.12)'
                                }}></div>
                                <div className="absolute bottom-22 left-[-2px] w-9 h-15 rounded-full rotate-[-25deg]" style={{
                                    background: `linear-gradient(to bottom right, ${pl}99, ${pl}CC)`
                                }}></div>
                                {/* 우측 잎들 */}
                                <div className="absolute bottom-16 right-0 w-11 h-18 rounded-full rotate-[35deg]" style={{
                                    background: `linear-gradient(to bottom left, ${pl}CC, ${pl})`,
                                    boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.12)'
                                }}></div>
                                <div className="absolute bottom-22 right-[-2px] w-9 h-15 rounded-full rotate-[25deg]" style={{
                                    background: `linear-gradient(to bottom left, ${pl}99, ${pl}CC)`
                                }}></div>
                                {/* 상단 작은 잎들 */}
                                <div className="absolute bottom-28 left-3 w-8 h-12 rounded-full rotate-[-15deg]" style={{
                                    background: `linear-gradient(to bottom right, ${pl}77, ${pl}99)`
                                }}></div>
                                <div className="absolute bottom-28 right-3 w-8 h-12 rounded-full rotate-[15deg]" style={{
                                    background: `linear-gradient(to bottom left, ${pl}77, ${pl}99)`
                                }}></div>
                                {/* 추가 잎들 */}
                                <div className="absolute bottom-20 left-1 w-7 h-10 rounded-full rotate-[-40deg]" style={{
                                    background: `linear-gradient(to bottom right, ${pl}99, ${pl}CC)`,
                                    opacity: 0.9
                                }}></div>
                                <div className="absolute bottom-20 right-1 w-7 h-10 rounded-full rotate-[40deg]" style={{
                                    background: `linear-gradient(to bottom left, ${pl}99, ${pl}CC)`,
                                    opacity: 0.9
                                }}></div>
                            </div>
                        );
                    })()}
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
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                        <MongleIcon name="coin" size={16} /> {coins}
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
                    <div className="rounded-full bg-amber-400 text-white px-5 py-2 shadow-lg text-sm font-bold flex items-center gap-1.5">
                        <MongleIcon name="coin" size={18} /> {coinToast}
                    </div>
                </div>
            )}

            {/* 수면 토스트 (2단계) */}
            {sleepToast && (
                <div className="absolute top-36 left-1/2 -translate-x-1/2 z-[200] animate-bounce">
                    <div className="rounded-full bg-indigo-500 text-white px-5 py-2 shadow-lg text-sm font-bold">
                        {sleepToast}
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

            {/* 🎉 레벨업 축하 모달 */}
            <LevelUpModal
                isOpen={showLevelUpModal}
                onClose={closeLevelUpModal}
                prevLevel={levelUpInfo.prevLevel}
                newLevel={levelUpInfo.newLevel}
                rewardCoins={levelUpInfo.rewardCoins}
            />

            {/* 🧪 임시 테스트 버튼 - 배포 전 삭제 (좌측 상단 고정 - 상점/설정 UI 비가림) */}
            <div className="fixed top-2 left-2 z-[500] flex flex-col gap-2">
                <button
                    className="px-3 py-2 rounded-xl text-xs font-bold text-white shadow-lg active:scale-95 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #58CC02, #46a302)' }}
                    onClick={() => navigate('/onboarding')}
                    data-gtm="test-onboarding-btn"
                >
                    <MongleIcon name="testTube" size={14} className="mr-1" /> 온보딩 테스트
                </button>
                <button
                    className="px-3 py-2 rounded-xl text-xs font-bold text-white shadow-lg active:scale-95 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}
                    onClick={() => triggerLevelUpModal(
                        petStatus?.level || 5,
                        (petStatus?.level || 5) + 1,
                        150
                    )}
                    data-gtm="test-levelup-btn"
                >
                    <MongleIcon name="testTube" size={14} className="mr-1" /> 레벨업 테스트
                </button>
            </div>
        </div>
    );
};

export default HomeView;
