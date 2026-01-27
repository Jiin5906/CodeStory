import React, { useState, useMemo } from 'react';
import { startOfDay, parseISO, format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import MainRoom from './MainRoom';
import BottomSheet from './BottomSheet';
import MindRecord from '../../change/MindRecord';
import { diaryApi } from '../../services/api';

const MobileDashboard = ({ user, diaries, onWriteClick, onCalendarClick, onStatsClick, onSettingsClick }) => {
    const [latestLog, setLatestLog] = useState(null);
    const [aiResponse, setAiResponse] = useState(null);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [isMindRecordOpen, setIsMindRecordOpen] = useState(false);

    // 인터랙티브 효과를 위한 상태
    const [isLampOn, setIsLampOn] = useState(true);
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

    // 일기 작성 및 AI 응답 핸들러 (옵션 C: 하이브리드 방식)
    const handleWrite = async (content) => {
        setLatestLog(content);
        setIsAiThinking(true);
        setAiResponse(null);

        try {
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 🧠 Step 1: 질문인지 일기인지 자동 감지
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // ✨ 통합 모드: 질문/일기 구분 없이 ChatService가 모두 처리
            // - 대화 히스토리 참고
            // - RAG 기반 과거 기억 검색
            // - LLM 검수 강화
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
                }

                if (onWriteClick) {
                    onWriteClick();
                }
            }
        } catch (error) {
            console.error('처리 실패:', error);
            setAiResponse('죄송해요, 지금은 답변을 드릴 수 없어요. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsAiThinking(false);
        }
    };

    return (
        <div className="bg-[#FFFCF8] md:bg-[#FFF5F6] md:flex md:min-h-screen md:items-center md:justify-center md:p-4 font-sans selection:bg-rose-200" data-gtm="view-mobile-dashboard-new">

            {/* 폰 프레임 컨테이너 */}
            <div className="relative flex h-[100dvh] md:h-[800px] w-full md:max-w-[375px] flex-col overflow-hidden md:rounded-[3rem] md:border-[10px] md:border-white bg-[#FFFCF8] md:shadow-[0_20px_60px_-10px_rgba(255,182,193,0.5)] md:ring-1 md:ring-rose-100">

                {/* 메인 화면 영역 (배경 + MainRoom) */}
                <div className="relative w-full flex-1 overflow-hidden">
                    {/* 하늘 배경 그라디언트 */}
                    <div className={`absolute inset-0 bg-gradient-to-b from-[#FFF0F5] via-[#FFF5F6] to-[#FFE4E1] transition-all duration-700 ${
                        isLampOn ? 'brightness-110' : 'brightness-90'
                    }`}></div>

                    {/* 무드등 조명 효과 오버레이 */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-yellow-100/20 via-transparent to-transparent transition-opacity duration-700 pointer-events-none ${
                        isLampOn ? 'opacity-100' : 'opacity-0'
                    }`}></div>

                    {/* 창문 그래픽 */}
                    <div
                        className="absolute top-[8%] left-1/2 h-32 w-32 -translate-x-1/2 opacity-80 cursor-pointer z-20 scale-90"
                        onClick={() => setIsWindowOpen(!isWindowOpen)}
                        data-gtm="window-decoration-click"
                    >
                        <div className={`relative z-10 h-full w-full overflow-hidden rounded-t-full rounded-b-xl border-[6px] border-white shadow-inner transition-all duration-500 ${
                            isWindowOpen ? 'bg-[#87CEEB]' : 'bg-[#B3E5FC]'
                        }`}>
                            {/* 세로 창살 */}
                            <div className={`absolute left-1/2 h-full w-[6px] -translate-x-1/2 bg-white transition-all duration-500 ${
                                isWindowOpen ? 'opacity-30 scale-y-50' : 'opacity-100 scale-y-100'
                            }`}></div>
                            {/* 가로 창살 */}
                            <div className={`absolute top-1/2 h-[6px] w-full -translate-y-1/2 bg-white transition-all duration-500 ${
                                isWindowOpen ? 'opacity-30 scale-x-50' : 'opacity-100 scale-x-100'
                            }`}></div>
                            {/* 햇빛 */}
                            <div className={`absolute top-4 right-2 h-4 w-8 rounded-full bg-white/80 blur-[2px] transition-all duration-500 ${
                                isWindowOpen ? 'animate-pulse scale-150 opacity-100' : 'opacity-60'
                            }`}></div>
                        </div>
                    </div>

                    {/* 달력/액자 데코 (좌측) - 클릭 시 서랍 애니메이션만 */}
                    <div
                        className="group perspective-1000 absolute top-[20%] left-6 z-20 cursor-pointer scale-90"
                        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                        data-gtm="calendar-decoration-click"
                    >
                        <div className="relative h-28 w-20 rounded-[1rem] border-2 border-rose-50 bg-white shadow-[0_8px_20px_rgba(255,182,193,0.2)] transition-transform duration-300 group-hover:-rotate-2">
                            <div className="absolute -top-6 left-1/2 h-6 w-8 -translate-x-1/2 rounded-b-lg bg-[#D7CCC8]">
                                <div className="absolute -top-4 left-1/2 h-6 w-10 -translate-x-1/2 rounded-full bg-[#A5D6A7]"></div>
                            </div>
                            {/* 서랍 (애니메이션 적용) */}
                            <div className={`absolute top-2 left-1/2 h-10 w-16 -translate-x-1/2 rounded-lg border border-rose-100 bg-rose-50 transition-all duration-500 ease-out ${
                                isDrawerOpen ? 'translate-x-8' : 'translate-x-0'
                            } group-hover:translate-x-4`}>
                                <div className="absolute top-1/2 left-2 h-2 w-2 -translate-y-1/2 rounded-full bg-rose-200 shadow-sm"></div>
                            </div>
                            <div className="absolute bottom-2 left-1/2 h-10 w-16 -translate-x-1/2 rounded-lg border border-stone-100 bg-white flex items-center justify-center">
                                <div className="w-8 h-1 bg-stone-100 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* 전등 스위치 데코 (우측) - 무드등 토글만 */}
                    <label
                        className="group absolute top-[22%] right-8 z-20 flex cursor-pointer flex-col items-center scale-90"
                        onClick={() => setIsLampOn(!isLampOn)}
                        data-gtm="settings-decoration-click"
                    >
                        <div className="relative z-10">
                            {/* Glow 효과 - 전등이 켜져 있을 때만 표시 */}
                            <div className={`absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-200/30 blur-xl transition-all duration-500 ${
                                isLampOn ? 'opacity-100' : 'opacity-0'
                            } group-hover:opacity-100`}></div>
                            {/* 전구 */}
                            <div className={`relative h-16 w-20 overflow-hidden rounded-t-full rounded-b-xl border-2 border-white shadow-lg transition-all duration-300 group-hover:-translate-y-1 ${
                                isLampOn ? 'bg-[#FFEB99]' : 'bg-[#FFD1DC]'
                            }`}>
                                <div className="absolute bottom-0 h-2 w-full bg-white/30"></div>
                                <div className="absolute bottom-4 h-1 w-full bg-white/20"></div>
                            </div>
                        </div>
                        {/* 스위치 줄 */}
                        <div className="relative h-24 w-1.5 bg-white shadow-sm">
                            <div className={`absolute top-0 right-[-8px] h-8 w-[1px] origin-top bg-stone-300 transition-all duration-300 ${
                                isLampOn ? 'rotate-0' : 'rotate-12'
                            } group-hover:rotate-12 group-active:scale-y-125`}>
                                <div className="absolute bottom-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-rose-300"></div>
                            </div>
                        </div>
                    </label>

                    {/* 중앙 하단 그림자 (MainRoom 캐릭터가 올라갈 곳) */}
                    <div className="absolute top-[48%] left-1/2 h-24 w-64 -translate-x-1/2 rounded-[50%] bg-[#FFB7C5]/20 blur-[1px]"></div>

                    {/* MainRoom 컴포넌트 배치 - 화면 중앙에 고정 */}
                    <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                        <div className="w-40 h-40 rounded-full pointer-events-auto flex items-center justify-center">
                            <MainRoom
                                latestLog={latestLog}
                                aiResponse={aiResponse}
                                isAiThinking={isAiThinking}
                            />
                        </div>
                    </div>

                    {/* 식물 데코 (좌측 하단) */}
                    <div className="absolute bottom-[30%] left-4 z-20 opacity-80 pointer-events-none scale-90">
                        <div className="relative h-20 w-16">
                            <div className="absolute bottom-0 left-1/2 h-10 w-10 -translate-x-1/2 rounded-2xl bg-[#D7CCC8]"></div>
                            <div className="absolute bottom-8 left-1/2 h-12 w-4 -translate-x-1/2 rounded-full bg-[#A5D6A7]"></div>
                            <div className="absolute bottom-10 left-0 h-10 w-8 rotate-[-45deg] rounded-full bg-[#81C784]"></div>
                            <div className="absolute right-0 bottom-12 h-10 w-8 rotate-[45deg] rounded-full bg-[#A5D6A7]"></div>
                        </div>
                    </div>
                </div>

                {/* 헤더 영역 (날짜 & 스트릭) - 절대 위치로 상단 고정 */}
                <div
                    className="absolute top-0 z-40 flex w-full items-end justify-between px-6 md:px-8 pointer-events-none"
                    style={{ paddingTop: 'max(3.5rem, calc(1rem + env(safe-area-inset-top)))' }}
                    data-gtm="mobile-dashboard-header"
                >
                    <div className="pointer-events-auto">
                        <div className="flex items-baseline gap-1">
                            <h1 className="text-4xl font-extrabold tracking-tight text-stone-700">
                                {format(today, 'd')}
                            </h1>
                            <span className="text-sm font-bold text-stone-400">
                                {format(today, 'EEE', { locale: enUS })}
                            </span>
                        </div>
                    </div>
                    {/* 스트릭 배지 */}
                    <div
                        className="rounded-full bg-white/80 px-4 py-1.5 shadow-[0_4px_12px_rgba(255,182,193,0.2)] backdrop-blur-sm pointer-events-auto cursor-pointer hover:scale-105 transition-transform"
                        onClick={onCalendarClick}
                        data-gtm="mobile-dashboard-streak-indicator"
                    >
                        <span className="text-xs font-bold text-rose-400">
                            🌸 {streakDays}일차
                        </span>
                    </div>
                </div>

                {/* BottomSheet 컴포넌트 */}
                <BottomSheet
                    onWrite={handleWrite}
                    diaries={diaries}
                    streakDays={streakDays}
                    onCalendarClick={onCalendarClick}
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
