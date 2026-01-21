import React, { useState, useMemo } from 'react';
import { startOfDay, parseISO } from 'date-fns';
import MainRoom from './MainRoom';
import BottomSheet from './BottomSheet';
import { diaryApi } from '../../services/api';

const MobileDashboard = ({ user, diaries, onWriteClick, onCalendarClick, onFeedClick, onStatsClick, onSettingsClick }) => {
    const [latestLog, setLatestLog] = useState(null);
    const [aiResponse, setAiResponse] = useState(null);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [conversations, setConversations] = useState([]);
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

    // 대화 핸들러
    const handleWrite = async (content) => {
        setLatestLog(content);
        setIsAiThinking(true);
        setAiResponse(null);

        // 즉시 사용자 메시지를 대화 히스토리에 추가
        const newConversation = {
            userMessage: content,
            aiResponse: null,
            timestamp: new Date()
        };
        setConversations(prev => [...prev, newConversation]);

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

            // AI 응답 받기
            const response = await diaryApi.saveDiary(diaryData, null);

            if (response && response.aiResponse) {
                setAiResponse(response.aiResponse);

                // 대화 히스토리 업데이트
                setConversations(prev => {
                    const updated = [...prev];
                    const lastIdx = updated.length - 1;
                    if (lastIdx >= 0) {
                        updated[lastIdx] = {
                            ...updated[lastIdx],
                            aiResponse: response.aiResponse
                        };
                    }
                    return updated;
                });
            }

            // 부모 컴포넌트에 알림 (diaries 목록 갱신용)
            if (onWriteClick) {
                onWriteClick();
            }
        } catch (error) {
            console.error('일기 작성 실패:', error);
            const errorMsg = '죄송해요, 지금은 답변을 드릴 수 없어요. 잠시 후 다시 시도해주세요.';
            setAiResponse(errorMsg);

            // 에러 메시지도 대화 히스토리에 추가
            setConversations(prev => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (lastIdx >= 0) {
                    updated[lastIdx] = {
                        ...updated[lastIdx],
                        aiResponse: errorMsg
                    };
                }
                return updated;
            });
        } finally {
            setIsAiThinking(false);
        }
    };

    return (
        <div
            className="relative w-full h-screen overflow-hidden flex flex-col"
            data-gtm="view-mobile-dashboard-new"
        >
            <MainRoom
                latestLog={latestLog}
                aiResponse={aiResponse}
                isAiThinking={isAiThinking}
                conversations={conversations}
            />
            <BottomSheet
                onWrite={handleWrite}
                diaries={diaries}
                streakDays={streakDays}
                onCalendarClick={onCalendarClick}
                onFeedClick={onFeedClick}
                onStatsClick={onStatsClick}
                onSettingsClick={onSettingsClick}
            />
        </div>
    );
};

export default MobileDashboard;
