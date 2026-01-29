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
    const [isWindowOpen, setIsWindowOpen] = useState(false);

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

                    {/* 🪟 창문 (우측 상단) - 아치형, 파란 하늘 배경 */}
                    <div
                        className="absolute top-[8%] right-[10%] cursor-pointer z-20"
                        onClick={handleWindowClick}
                        data-gtm="window-decoration-click"
                        style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}
                    >
                        <div className="relative w-24 h-28">
                            {/* 창문 틀 (아치형) */}
                            <div className={`absolute inset-0 bg-white rounded-t-[50%] rounded-b-lg border-4 border-white transition-all duration-300 overflow-hidden ${
                                isWindowOpen ? 'border-[#87CEEB]' : ''
                            }`}>
                                {/* 하늘 배경 */}
                                <div className={`absolute inset-0 transition-all duration-500 ${
                                    isWindowOpen ? 'bg-gradient-to-b from-[#87CEEB] to-[#B0E0E6]' : 'bg-[#E8E8E8]'
                                }`}></div>

                                {/* 창살 (세로) */}
                                <div className={`absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-white transition-opacity duration-300 ${
                                    isWindowOpen ? 'opacity-50' : 'opacity-100'
                                }`}></div>

                                {/* 창살 (가로) */}
                                <div className={`absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-white transition-opacity duration-300 ${
                                    isWindowOpen ? 'opacity-50' : 'opacity-100'
                                }`}></div>
                            </div>
                        </div>
                    </div>

                    {/* 📚 좌측 선반 2단 (다마고치 스타일) */}
                    <div className="absolute top-[15%] left-[8%] z-20 pointer-events-none" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
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

                    {/* 🎁 좌측 하단 선물 상자 */}
                    <div className="absolute bottom-[18%] left-[10%] z-20 pointer-events-none" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>
                        <div className="relative w-12 h-14">
                            {/* 상자 본체 */}
                            <div className="absolute bottom-0 w-12 h-10 bg-gradient-to-br from-[#D4A5F5] to-[#B87FE0] rounded-lg" style={{
                                boxShadow: '0 4px 6px rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.2)'
                            }}></div>
                            {/* 리본 (가로) */}
                            <div className="absolute bottom-0 left-0 right-0 top-3 flex items-center justify-center">
                                <div className="w-full h-2 bg-gradient-to-br from-[#FFB5C2] to-[#FF8FA3]"></div>
                            </div>
                            {/* 리본 (세로) */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-10 bg-gradient-to-br from-[#FFB5C2] to-[#FF8FA3]"></div>
                            {/* 리본 매듭 */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-4 bg-gradient-to-br from-[#FFB5C2] to-[#FF8FA3] rounded-full"></div>
                            {/* 리본 끝 (좌) */}
                            <div className="absolute -top-1 left-2 w-3 h-3 bg-gradient-to-br from-[#FFB5C2] to-[#FF8FA3] rounded-bl-full" style={{
                                clipPath: 'polygon(0 0, 100% 0, 0 100%)'
                            }}></div>
                            {/* 리본 끝 (우) */}
                            <div className="absolute -top-1 right-2 w-3 h-3 bg-gradient-to-br from-[#FFB5C2] to-[#FF8FA3] rounded-br-full" style={{
                                clipPath: 'polygon(100% 0, 100% 100%, 0 0)'
                            }}></div>
                        </div>
                    </div>

                    {/* 🪴 우측 하단 대형 화분 */}
                    <div className="absolute bottom-[16%] right-[8%] z-20 pointer-events-none" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))' }}>
                        <div className="relative w-16 h-28">
                            {/* 화분 */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-12 bg-gradient-to-b from-[#FF9980] to-[#FF7A5A] rounded-b-2xl" style={{
                                clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.3)'
                            }}></div>

                            {/* 중앙 큰 잎 */}
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-4 h-16 bg-gradient-to-t from-[#66BB6A] to-[#81C784] rounded-full"></div>

                            {/* 좌측 잎들 */}
                            <div className="absolute bottom-12 left-1 w-7 h-12 bg-gradient-to-br from-[#81C784] to-[#66BB6A] rounded-full rotate-[-35deg]" style={{
                                boxShadow: 'inset -2px 2px 4px rgba(0,0,0,0.1)'
                            }}></div>
                            <div className="absolute bottom-16 left-0 w-6 h-10 bg-gradient-to-br from-[#A5D6A7] to-[#81C784] rounded-full rotate-[-25deg]"></div>

                            {/* 우측 잎들 */}
                            <div className="absolute bottom-12 right-1 w-7 h-12 bg-gradient-to-bl from-[#81C784] to-[#66BB6A] rounded-full rotate-[35deg]" style={{
                                boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)'
                            }}></div>
                            <div className="absolute bottom-16 right-0 w-6 h-10 bg-gradient-to-bl from-[#A5D6A7] to-[#81C784] rounded-full rotate-[25deg]"></div>

                            {/* 상단 작은 잎들 */}
                            <div className="absolute bottom-20 left-2 w-5 h-8 bg-gradient-to-br from-[#C8E6C9] to-[#A5D6A7] rounded-full rotate-[-15deg]"></div>
                            <div className="absolute bottom-20 right-2 w-5 h-8 bg-gradient-to-bl from-[#C8E6C9] to-[#A5D6A7] rounded-full rotate-[15deg]"></div>
                        </div>
                    </div>

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
