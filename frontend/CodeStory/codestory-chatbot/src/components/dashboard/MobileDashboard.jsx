import React, { useState, useMemo, useEffect, useRef } from 'react';
import { startOfDay, parseISO } from 'date-fns';
import MainRoom from './MainRoom';
import BottomSheet from './BottomSheet';
import MindRecord from '../../change/MindRecord';
import CircularProgressNew from './CircularProgressNew';
import { diaryApi } from '../../services/api';
import { usePet } from '../../context/PetContext';

const MobileDashboard = ({ user, diaries, onWriteClick, onCalendarClick, onStatsClick, onSettingsClick }) => {
    const [latestLog, setLatestLog] = useState(null);
    const [aiResponse, setAiResponse] = useState(null);
    const [emotion, setEmotion] = useState(null);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [isMindRecordOpen, setIsMindRecordOpen] = useState(false);

    // 인터랙티브 효과를 위한 상태
    const [isLampOn, setIsLampOn] = useState(true);
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // 창문 관련 확장 상태
    const [windowColdAnimation, setWindowColdAnimation] = useState(false);
    const [windowClosedAnimation, setWindowClosedAnimation] = useState(false);

    const ventilateTimerRef = useRef(null);
    const coldTimerRef = useRef(null);

    const { handleVentilateComplete, petStatus } = usePet();

    const today = startOfDay(new Date());

    // 스트릭(연속 작성일) 계산 로직
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

    // 일기 작성 및 AI 응답 핸들러
    const handleWrite = async (content) => {
        setLatestLog(content);
        setIsAiThinking(true);
        setAiResponse(null);
        setEmotion(null);

        try {
            console.log('💬 입력 감지 → 통합 DiaryService 호출 (질문/일기 자동 처리)');
            const diaryData = {
                userId: user.id,
                content: content,
                date: new Date().toISOString().split('T')[0],
                title: '',
                mood: 5,
                tension: 5,
                fun: 5,
                emoji: '✨',
                isPublic: false,
                isAnonymous: false,
                tags: []
            };

            const response = await diaryApi.saveDiary(diaryData, null);

            if (response && response.aiResponse) {
                setAiResponse(response.aiResponse);
                if (response.emotion) {
                    setEmotion(response.emotion);
                }
            }

            if (onWriteClick) {
                onWriteClick();
            }
        } catch (error) {
            console.error('처리 실패:', error);
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
                    {/* 따뜻한 감성 배경 */}
                    <div className={`absolute inset-0 bg-gradient-to-b from-[#FFF8F3] to-[#FFE8F0] transition-all duration-1000 ${
                        isLampOn ? 'opacity-100' : 'opacity-90'
                    }`}></div>

                    {/* 부드러운 블롭 애니메이션 (하나만) */}
                    <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#FFB5C2]/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDuration: '4s' }}></div>

                    {/* 창문 그래픽 - 미니멀 */}
                    <div
                        className="absolute top-[8%] left-1/2 h-28 w-28 -translate-x-1/2 cursor-pointer z-20"
                        onClick={handleWindowClick}
                        data-gtm="window-decoration-click"
                    >
                        <div className={`relative z-10 h-full w-full overflow-hidden rounded-2xl border-4 border-white shadow-sm transition-all duration-300 ${
                            isWindowOpen ? 'bg-pink-100/50' : 'bg-gray-100'
                        }`}>
                            {/* 세로 창살 */}
                            <div className={`absolute left-1/2 h-full w-[3px] -translate-x-1/2 bg-white transition-all duration-300 ${
                                isWindowOpen ? 'opacity-20' : 'opacity-100'
                            }`}></div>
                            {/* 가로 창살 */}
                            <div className={`absolute top-1/2 h-[3px] w-full -translate-y-1/2 bg-white transition-all duration-300 ${
                                isWindowOpen ? 'opacity-20' : 'opacity-100'
                            }`}></div>
                        </div>
                    </div>

                    {/* 달력 데코 (좌측) - 미니멀 */}
                    <div
                        className="group absolute top-[20%] left-6 z-20 cursor-pointer"
                        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                        data-gtm="calendar-decoration-click"
                    >
                        <div className="relative h-24 w-20 rounded-xl border-2 border-gray-100 bg-white shadow-sm transition-all duration-200 group-hover:border-pink-200">
                            {/* 상단 고리 */}
                            <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-pink-200"></div>
                            {/* 날짜 표시 */}
                            <div className="flex flex-col items-center justify-center h-full">
                                <div className="text-2xl font-bold text-pink-300">31</div>
                                <div className="text-xs text-gray-400 mt-1">JAN</div>
                            </div>
                        </div>
                    </div>

                    {/* 전등 데코 (우측) - 미니멀 */}
                    <div
                        className="group absolute top-[20%] right-6 z-20 cursor-pointer"
                        onClick={() => setIsLampOn(!isLampOn)}
                        data-gtm="settings-decoration-click"
                    >
                        <div className={`relative h-10 w-10 rounded-full border-2 shadow-sm transition-all duration-300 ${
                            isLampOn ? 'bg-yellow-100 border-yellow-200' : 'bg-gray-100 border-gray-200'
                        } group-hover:scale-110`}>
                            <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                                isLampOn ? 'bg-yellow-200/30' : 'bg-transparent'
                            }`}></div>
                        </div>
                    </div>

                    {/* MainRoom 컴포넌트 배치 */}
                    <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
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

                    {/* 식물 데코 (좌측 하단) - 미니멀 */}
                    <div className="absolute bottom-[30%] left-6 z-20 pointer-events-none">
                        <div className="relative h-16 w-12">
                            {/* 화분 */}
                            <div className="absolute bottom-0 left-1/2 h-8 w-8 -translate-x-1/2 rounded-lg bg-gray-200"></div>
                            {/* 식물 */}
                            <div className="absolute bottom-6 left-1/2 h-8 w-2 -translate-x-1/2 rounded-full bg-green-200"></div>
                            <div className="absolute bottom-8 left-1 h-6 w-6 rotate-[-30deg] rounded-full bg-green-100"></div>
                            <div className="absolute bottom-8 right-1 h-6 w-6 rotate-[30deg] rounded-full bg-green-100"></div>
                        </div>
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
            </div>
        </div>
    );
};

export default MobileDashboard;
