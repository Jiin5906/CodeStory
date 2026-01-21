import React, { useState, useMemo } from 'react';
import { startOfDay, parseISO, format } from 'date-fns';
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

    // 스트릭(연속 작성일) 계산 로직
    const streakDays = useMemo(() => {
        if (!diaries || diaries.length === 0) return 0;

        // 일기 날짜를 Date 객체로 변환하고 정렬
        const sortedDates = diaries
            .map(d => startOfDay(parseISO(d.date)))
            .sort((a, b) => b - a); // 최신순 정렬

        if (sortedDates.length === 0) return 0;

        // 오늘 또는 어제부터 시작하는지 확인
        const latestDate = sortedDates[0];
        const daysDiff = Math.floor((today - latestDate) / (1000 * 60 * 60 * 24));

        // 오늘이나 어제가 아니면 스트릭 끊김
        if (daysDiff > 1) return 0;

        // 연속 일수 계산
        let streak = 1;
        let currentDate = latestDate;

        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = sortedDates[i];
            const diff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));

            if (diff === 1) {
                streak++;
                currentDate = prevDate;
            } else if (diff === 0) {
                // 같은 날 여러 일기 - 스킵
                continue;
            } else {
                // 연속 끊김
                break;
            }
        }

        return streak;
    }, [diaries, today]);

    // 일기 작성 및 AI 응답 핸들러
    const handleWrite = async (content) => {
        setLatestLog(content);
        setIsAiThinking(true);
        setAiResponse(null);

        try {
            // 기본 감정 데이터 설정
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

            // AI 응답 받기 및 일기 저장
            const response = await diaryApi.saveDiary(diaryData, null);

            if (response && response.aiResponse) {
                setAiResponse(response.aiResponse);
            }

            // 부모 컴포넌트에 알림 (diaries 목록 갱신용)
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
        <div
            className="relative w-full h-[100dvh] overflow-hidden bg-gradient-to-br from-[#fff1f2] via-[#ffe4e6] to-[#fecdd3] text-slate-700 font-gowun selection:bg-rose-200"
            data-gtm="view-mobile-dashboard-new"
        >
            {/* Background Blob Decorations */}
            <div className="absolute top-[-10%] left-[-20%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[100px] animate-blob mix-blend-multiply pointer-events-none" data-gtm="blob-decoration-1"></div>
            <div className="absolute bottom-[-10%] right-[-20%] w-[500px] h-[500px] bg-rose-200/30 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply pointer-events-none" data-gtm="blob-decoration-2"></div>

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-6 pt-12" data-gtm="mobile-dashboard-header">
                <div className="flex flex-col animate-fade-in-up">
                    <span className="text-4xl font-bold text-slate-800 tracking-tight font-nunito">
                        {format(new Date(), 'd')}
                    </span>
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest font-nunito">
                        {format(new Date(), 'EEEE', { locale: { localize: { day: (n) => ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][n] } } })}
                    </span>
                </div>
                <div className="group flex items-center gap-2 px-4 py-2 bg-white/30 backdrop-blur-md rounded-full border border-white/40 shadow-sm hover:bg-white/50 transition-all cursor-pointer animate-fade-in-up" data-gtm="mobile-dashboard-streak-indicator">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                    <span className="text-lg">🔥</span>
                    <span className="text-sm font-bold text-slate-700 font-nunito">{streakDays}일</span>
                </div>
            </div>

            <MainRoom
                latestLog={latestLog}
                aiResponse={aiResponse}
                isAiThinking={isAiThinking}
            />
            <BottomSheet
                onWrite={handleWrite}
                diaries={diaries}
                streakDays={streakDays}
                onCalendarClick={onCalendarClick}
                onMindRecordClick={() => setIsMindRecordOpen(true)}
                onStatsClick={onStatsClick}
                onSettingsClick={onSettingsClick}
            />

            {/* 마음 기록 화면 (전체 화면 오버레이) */}
            <MindRecord
                isOpen={isMindRecordOpen}
                onClose={() => setIsMindRecordOpen(false)}
                userName={user?.nickname}
                data-gtm="mind-record-screen"
            />
        </div>
    );
};

export default MobileDashboard;
