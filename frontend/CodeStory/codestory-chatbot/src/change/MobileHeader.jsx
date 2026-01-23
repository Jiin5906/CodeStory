import React, { useState, useMemo } from 'react';
import { startOfDay, parseISO, format } from 'date-fns';
import { enUS } from 'date-fns/locale'; // 요일 영문 표기를 위해 추가
import MainRoom from './MainRoom';
import BottomSheet from './BottomSheet';
import MindRecord from '../../change/MindRecord';
import { diaryApi } from '../../services/api';

const MobileDashboard = ({ user, diaries, onWriteClick, onCalendarClick, onFeedClick, onStatsClick, onSettingsClick }) => {
    const [latestLog, setLatestLog] = useState(null);
    const [aiResponse, setAiResponse] = useState(null);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [isMindRecordOpen, setIsMindRecordOpen] = useState(false);
    const today = startOfDay(new Date());

    // 스트릭(연속 작성일) 계산 로직 (기존 유지)
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

    // 일기 작성 및 AI 응답 핸들러 (기존 유지)
    const handleWrite = async (content) => {
        setLatestLog(content);
        setIsAiThinking(true);
        setAiResponse(null);

        try {
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
        } catch (error) {
            console.error('일기 작성 실패:', error);
            setAiResponse('죄송해요, 지금은 답변을 드릴 수 없어요. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsAiThinking(false);
        }
    };

    return (
        // 전체 배경 컨테이너 (Centering)
        <div className="flex min-h-screen items-center justify-center bg-[#FFF5F6] p-4 font-sans selection:bg-rose-200" data-gtm="view-mobile-dashboard-new">
            
            {/* 폰 프레임 컨테이너 */}
            <div className="relative flex h-[800px] w-full max-w-[375px] flex-col overflow-hidden rounded-[3rem] border-[10px] border-white bg-[#FFFCF8] shadow-[0_20px_60px_-10px_rgba(255,182,193,0.5)] ring-1 ring-rose-100">
                
                {/* 메인 화면 영역 (배경 + MainRoom) */}
                <div className="relative w-full flex-1 overflow-hidden">
                    {/* 하늘 배경 그라디언트 */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#FFF0F5] via-[#FFF5F6] to-[#FFE4E1]"></div>

                    {/* 창문 그래픽 */}
                    <div className="absolute top-12 left-1/2 h-32 w-32 -translate-x-1/2 opacity-80 pointer-events-none">
                        <div className="relative z-10 h-full w-full overflow-hidden rounded-t-full rounded-b-xl border-[6px] border-white bg-[#B3E5FC] shadow-inner">
                            <div className="absolute left-1/2 h-full w-[6px] -translate-x-1/2 bg-white"></div>
                            <div className="absolute top-1/2 h-[6px] w-full -translate-y-1/2 bg-white"></div>
                            <div className="absolute top-4 right-2 h-4 w-8 animate-pulse rounded-full bg-white/80 blur-[2px]"></div>
                        </div>
                    </div>

                    {/* 달력/액자 데코 (좌측) - 클릭 시 캘린더 이동 */}
                    <div 
                        className="group perspective-1000 absolute top-48 left-6 z-20 cursor-pointer"
                        onClick={onCalendarClick}
                    >
                        <div className="relative h-28 w-20 rounded-[1rem] border-2 border-rose-50 bg-white shadow-[0_8px_20px_rgba(255,182,193,0.2)] transition-transform duration-300 group-hover:-rotate-2">
                            <div className="absolute -top-6 left-1/2 h-6 w-8 -translate-x-1/2 rounded-b-lg bg-[#D7CCC8]">
                                <div className="absolute -top-4 left-1/2 h-6 w-10 -translate-x-1/2 rounded-full bg-[#A5D6A7]"></div>
                            </div>
                            <div className="absolute top-2 left-1/2 h-10 w-16 -translate-x-1/2 rounded-lg border border-rose-100 bg-rose-50 transition-all duration-500 ease-out group-hover:translate-x-4 group-active:translate-x-8">
                                <div className="absolute top-1/2 left-2 h-2 w-2 -translate-y-1/2 rounded-full bg-rose-200 shadow-sm"></div>
                            </div>
                            <div className="absolute bottom-2 left-1/2 h-10 w-16 -translate-x-1/2 rounded-lg border border-stone-100 bg-white flex items-center justify-center">
                                {/* 달력 아이콘 느낌 */}
                                <div className="w-8 h-1 bg-stone-100 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* 전등 스위치 데코 (우측) - 설정 이동 */}
                    <label className="group absolute top-56 right-8 z-20 flex cursor-pointer flex-col items-center" onClick={onSettingsClick}>
                        <div className="relative z-10">
                            <div className="absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-200/20 blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                            <div className="relative h-16 w-20 overflow-hidden rounded-t-full rounded-b-xl border-2 border-white bg-[#FFD1DC] shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                                <div className="absolute bottom-0 h-2 w-full bg-white/30"></div>
                                <div className="absolute bottom-4 h-1 w-full bg-white/20"></div>
                            </div>
                        </div>
                        <div className="relative h-24 w-1.5 bg-white shadow-sm">
                            <div className="absolute top-0 right-[-8px] h-8 w-[1px] origin-top bg-stone-300 transition-all duration-300 group-hover:rotate-12 group-active:scale-y-125">
                                <div className="absolute bottom-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-rose-300"></div>
                            </div>
                        </div>
                    </label>

                    {/* 중앙 하단 그림자 (MainRoom 캐릭터가 올라갈 곳) */}
                    <div className="absolute bottom-[28%] left-1/2 h-24 w-64 -translate-x-1/2 rounded-[50%] bg-[#FFB7C5]/20 blur-[1px]"></div>

                    {/* MainRoom 컴포넌트 배치 (z-index 조절로 배경 위에 뜨게 함) */}
                    <div className="absolute inset-0 z-30 flex items-end justify-center pb-32 pointer-events-none">
                         {/* pointer-events-none을 줘서 배경의 클릭 요소들을 방해하지 않도록 함, 
                             만약 MainRoom 내부에 인터랙션이 있다면 pointer-events-auto로 감싸야 함 */}
                        <div className="w-full h-full pointer-events-auto">
                            <MainRoom
                                latestLog={latestLog}
                                aiResponse={aiResponse}
                                isAiThinking={isAiThinking}
                            />
                        </div>
                    </div>

                    {/* 식물 데코 (좌측 하단) */}
                    <div className="absolute bottom-[18%] left-4 z-20 opacity-80 pointer-events-none">
                        <div className="relative h-20 w-16">
                            <div className="absolute bottom-0 left-1/2 h-10 w-10 -translate-x-1/2 rounded-2xl bg-[#D7CCC8]"></div>
                            <div className="absolute bottom-8 left-1/2 h-12 w-4 -translate-x-1/2 rounded-full bg-[#A5D6A7]"></div>
                            <div className="absolute bottom-10 left-0 h-10 w-8 rotate-[-45deg] rounded-full bg-[#81C784]"></div>
                            <div className="absolute right-0 bottom-12 h-10 w-8 rotate-[45deg] rounded-full bg-[#A5D6A7]"></div>
                        </div>
                    </div>
                </div>

                {/* 헤더 영역 (날짜 & 스트릭) - 절대 위치로 상단 고정 */}
                <div className="absolute top-0 z-40 flex w-full items-end justify-between px-8 pt-14 pointer-events-none">
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
                    >
                        <span className="text-xs font-bold text-rose-400">
                            🌸 {streakDays}일차
                        </span>
                    </div>
                </div>

                {/* BottomSheet (기존 컴포넌트 사용) 
                    참고: 새 디자인 HTML에 있던 정적 Input 영역은 제거하고 
                    기존의 기능이 있는 BottomSheet를 연결했습니다. */}
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