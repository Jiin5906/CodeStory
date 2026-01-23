import React, { useState, useMemo } from 'react';
import { startOfDay, parseISO, format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import MainRoom from './MainRoom';
import BottomSheet from './BottomSheet';
import MindRecord from '../../change/MindRecord';
import { diaryApi } from '../../services/api';

const MobileDashboard = ({ user, diaries, onWriteClick, onCalendarClick, onFeedClick, onStatsClick, onSettingsClick }) => {
    const [latestLog, setLatestLog] = useState(null);
    const [aiResponse, setAiResponse] = useState(null);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [isMindRecordOpen, setIsMindRecordOpen] = useState(false);
    
    // --- [수정 1] 인터랙션 상태 추가 (초기값 설정) ---
    const [isDrawerOpen, setIsDrawerOpen] = useState(false); // 서랍: 닫힘(false) 시작
    const [isLampOn, setIsLampOn] = useState(true);      // 무드등: 켜짐(true) 시작
    const [isWindowOpen, setIsWindowOpen] = useState(false); // 창문: 닫힘(false) 시작

    const today = startOfDay(new Date());

    // 스트릭 계산 로직
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
            if (diff === 1) { streak++; currentDate = prevDate; }
            else if (diff === 0) continue;
            else break;
        }
        return streak;
    }, [diaries, today]);

    // 일기 작성 핸들러
    const handleWrite = async (content) => {
        setLatestLog(content);
        setIsAiThinking(true);
        setAiResponse(null);
        try {
            const diaryData = {
                userId: user.id,
                content: content,
                date: new Date().toISOString().split('T')[0],
                title: '', mood: 5, tension: 5, fun: 5, emoji: '✨',
                isPublic: false, isAnonymous: false, tags: []
            };
            const response = await diaryApi.saveDiary(diaryData, null);
            if (response && response.aiResponse) setAiResponse(response.aiResponse);
            if (onWriteClick) onWriteClick();
        } catch (error) {
            console.error('일기 작성 실패:', error);
            setAiResponse('죄송해요, 지금은 답변을 드릴 수 없어요.');
        } finally {
            setIsAiThinking(false);
        }
    };

    // --- [수정 2] 클릭 핸들러 (애니메이션만 작동하도록 수정) ---
    const handleDrawerClick = () => {
        setIsDrawerOpen(!isDrawerOpen); // 클릭 시 열림/닫힘 상태 토글
    };

    const handleLampClick = () => {
        setIsLampOn(!isLampOn); // 클릭 시 켜짐/꺼짐 상태 토글
    };

    return (
        <div className="flex w-full h-[100dvh] md:min-h-screen items-center justify-center bg-[#FFFCF8] md:bg-[#FFF5F6] md:p-4 font-sans selection:bg-rose-200" data-gtm="view-mobile-dashboard-responsive">
            
            <div className="relative flex flex-col w-full h-full md:w-[375px] md:h-[800px] md:max-w-[375px] overflow-hidden bg-[#FFFCF8] md:rounded-[3rem] md:border-[10px] md:border-white md:shadow-[0_20px_60px_-10px_rgba(255,182,193,0.5)] md:ring-1 md:ring-rose-100 transition-all duration-300">
                
                {/* 메인 화면 영역 */}
                <div className="relative w-full flex-1 overflow-hidden">
                    {/* 하늘 배경 그라디언트 (창문 열리면 밝아짐) */}
                    <div className={`absolute inset-0 bg-gradient-to-b transition-colors duration-700 ${isWindowOpen ? 'from-[#E3F2FD] via-[#E1F5FE] to-[#F3E5F5]' : 'from-[#FFF0F5] via-[#FFF5F6] to-[#FFE4E1]'}`}></div>

                    {/* --- 창문 (Top 8%) --- */}
                    <div 
                        className="absolute top-[8%] left-1/2 h-28 w-28 -translate-x-1/2 cursor-pointer z-10 group"
                        onClick={() => setIsWindowOpen(!isWindowOpen)}
                    >
                        <div className={`relative z-10 h-full w-full overflow-hidden rounded-t-full rounded-b-xl border-[6px] border-white bg-[#B3E5FC] shadow-inner transition-all duration-500 ${isWindowOpen ? 'bg-[#E1F5FE]' : ''}`}>
                            <div className="absolute top-4 right-2 h-4 w-8 rounded-full bg-white/40 blur-[2px]"></div>
                            {/* 창살 애니메이션 */}
                            <div className={`absolute left-1/2 h-full w-[6px] -translate-x-1/2 bg-white transition-transform duration-700 origin-top ${isWindowOpen ? 'scale-y-0 opacity-0' : 'scale-y-100 opacity-100'}`}></div>
                            <div className={`absolute top-1/2 h-[6px] w-full -translate-y-1/2 bg-white transition-transform duration-700 origin-left ${isWindowOpen ? 'scale-x-0 opacity-0' : 'scale-x-100 opacity-100'}`}></div>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 w-32 h-3 bg-white -translate-x-1/2 rounded-full shadow-sm"></div>
                    </div>

                    {/* --- [수정 3] 서랍 (Top 20%) --- */}
                    <div 
                        className="group perspective-1000 absolute top-[20%] left-6 z-20 cursor-pointer transform scale-90"
                        onClick={handleDrawerClick} // 페이지 이동 대신 상태 토글 함수 연결
                    >
                        <div className="relative h-28 w-20 rounded-[1rem] border-2 border-rose-50 bg-white shadow-[0_8px_20px_rgba(255,182,193,0.2)] transition-transform duration-300 hover:-rotate-2">
                            <div className="absolute -top-6 left-1/2 h-6 w-8 -translate-x-1/2 rounded-b-lg bg-[#D7CCC8]">
                                <div className="absolute -top-4 left-1/2 h-6 w-10 -translate-x-1/2 rounded-full bg-[#A5D6A7]"></div>
                            </div>
                            
                            {/* 움직이는 서랍 통: isDrawerOpen 상태에 따라 translate 적용 */}
                            <div className={`absolute top-2 left-1/2 h-10 w-16 -translate-x-1/2 rounded-lg border border-rose-100 bg-rose-50 transition-all duration-500 ease-out 
                                ${isDrawerOpen ? 'translate-x-6' : 'translate-x-0 group-hover:translate-x-2'}`}>
                                <div className="absolute top-1/2 left-2 h-2 w-2 -translate-y-1/2 rounded-full bg-rose-200 shadow-sm"></div>
                            </div>
                            
                            <div className="absolute bottom-2 left-1/2 h-10 w-16 -translate-x-1/2 rounded-lg border border-stone-100 bg-white flex items-center justify-center">
                                <div className="w-8 h-1 bg-stone-100 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* --- 무드등 (Top 22%) --- */}
                    <div 
                        className="group absolute top-[22%] right-6 z-20 flex cursor-pointer flex-col items-center transform scale-90" 
                        onClick={handleLampClick} // 페이지 이동 대신 상태 토글 함수 연결
                    >
                        <div className="relative z-10">
                            {/* 전구 빛 Glow 효과 */}
                            <div className={`absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-200/40 blur-xl transition-all duration-500 
                                ${isLampOn ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}></div>
                            <div className="relative h-16 w-20 overflow-hidden rounded-t-full rounded-b-xl border-2 border-white bg-[#FFD1DC] shadow-lg transition-transform duration-300 hover:-translate-y-1">
                                <div className="absolute bottom-0 h-2 w-full bg-white/30"></div>
                                <div className="absolute bottom-4 h-1 w-full bg-white/20"></div>
                            </div>
                        </div>
                        <div className="relative h-20 w-1.5 bg-white shadow-sm">
                            <div className={`absolute top-0 right-[-8px] h-8 w-[1px] origin-top bg-stone-300 transition-all duration-300 
                                ${isLampOn ? 'rotate-0' : 'rotate-12 scale-y-110'}`}>
                                <div className={`absolute bottom-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full transition-colors duration-300 ${isLampOn ? 'bg-rose-300' : 'bg-stone-400'}`}></div>
                            </div>
                        </div>
                        <div className="h-4 w-12 rounded-t-lg bg-white shadow-md flex items-center justify-center">
                            <span className="text-[8px] text-stone-300">SET</span>
                        </div>
                    </div>

                    {/* 캐릭터 바닥 그림자 (Top 48%로 위치 조정) */}
                    <div className="absolute top-[48%] left-1/2 h-24 w-64 -translate-x-1/2 rounded-[50%] bg-[#FFB7C5]/20 blur-[1px]"></div>

                    {/* --- [수정 4] MainRoom 캐릭터 위치 고정 (Top 42%) --- 
                        Bottom 기준이 아닌 Top 기준으로 잡아 바텀시트 뒤로 숨지 않게 함 */}
                    <div className="absolute inset-x-0 top-[42%] z-30 flex items-start justify-center pointer-events-none">
                        <div className="pointer-events-auto">
                            <MainRoom
                                latestLog={latestLog}
                                aiResponse={aiResponse}
                                isAiThinking={isAiThinking}
                            />
                        </div>
                    </div>

                    {/* 식물 데코 (Bottom 30%) */}
                    <div className="absolute bottom-[30%] left-2 z-20 opacity-80 pointer-events-none transform scale-75 origin-bottom-left">
                        <div className="relative h-20 w-16">
                            <div className="absolute bottom-0 left-1/2 h-10 w-10 -translate-x-1/2 rounded-2xl bg-[#D7CCC8]">
                                <div className="absolute bottom-8 left-1/2 h-12 w-4 -translate-x-1/2 rounded-full bg-[#A5D6A7]"></div>
                                <div className="absolute bottom-10 left-0 h-10 w-8 rotate-[-45deg] rounded-full bg-[#81C784]"></div>
                                <div className="absolute right-0 bottom-12 h-10 w-8 rotate-[45deg] rounded-full bg-[#A5D6A7]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 헤더 영역 */}
                <div 
                    className="absolute top-0 z-40 flex w-full items-end justify-between px-8 pb-4 pointer-events-none"
                    style={{ paddingTop: 'max(3.5rem, env(safe-area-inset-top))' }} 
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
                    {/* 스트릭 배지 (이건 클릭 시 캘린더 이동 유지) */}
                    <div 
                        className="rounded-full bg-white/80 px-4 py-1.5 shadow-[0_4px_12px_rgba(255,182,193,0.2)] backdrop-blur-sm pointer-events-auto cursor-pointer hover:scale-105 transition-transform"
                        onClick={onCalendarClick}
                    >
                        <span className="text-xs font-bold text-rose-400">
                            🌸 {streakDays}일차
                        </span>
                    </div>
                </div>

                <BottomSheet
                    onWrite={handleWrite}
                    diaries={diaries}
                    streakDays={streakDays}
                    onCalendarClick={onCalendarClick}
                    onMindRecordClick={() => setIsMindRecordOpen(true)}
                    onStatsClick={onStatsClick}
                    onSettingsClick={onSettingsClick}
                />

                <MindRecord
                    isOpen={isMindRecordOpen}
                    onClose={() => setIsMindRecordOpen(false)}
                    userName={user?.nickname}
                    diaries={diaries}
                />
            </div>
        </div>
    );
};

export default MobileDashboard;