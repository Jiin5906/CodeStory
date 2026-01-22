import React, { useRef, useEffect, useMemo } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

// MindRecord: 채팅 형식으로 과거 기록을 보는 컴포넌트 (읽기 전용)
const MindRecord = ({ isOpen, onClose, diaries = [] }) => {
    const messagesEndRef = useRef(null);

    // diaries를 메시지 형식으로 변환 (실시간 반영)
    const messages = useMemo(() => {
        console.log('[MindRecord] diaries 변환 시작, 개수:', diaries?.length || 0);

        if (!diaries || diaries.length === 0) {
            console.log('[MindRecord] 일기 기록이 없습니다.');
            return [
                {
                    id: 1,
                    type: 'ai',
                    text: '아직 기록이 없어요.\n오늘 하루를 기록해 보는 건 어떨까요? 😊',
                    time: format(new Date(), 'a h:mm', { locale: ko })
                }
            ];
        }

        const messageList = [];
        let lastDate = null;
        let messageId = 1;

        // 날짜순으로 정렬 (오래된 것부터)
        const sortedDiaries = [...diaries].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedDiaries.forEach((diary, index) => {
            // createdAt이 있으면 사용, 없으면 date 사용 (하위 호환성)
            const timestamp = diary.createdAt || diary.date;
            const diaryDateTime = parseISO(timestamp);
            const dateStr = format(diaryDateTime, 'yyyy년 M월 d일 EEEE', { locale: ko });
            const timeStr = format(diaryDateTime, 'a h:mm', { locale: ko });

            console.log(`[MindRecord] diary[${index}] - time: ${timeStr}, content: ${diary.content?.substring(0, 30)}...`);

            // 날짜가 바뀌면 날짜 구분선 추가
            if (lastDate !== dateStr) {
                messageList.push({ id: messageId++, type: 'date', text: dateStr });
                lastDate = dateStr;
            }

            // 사용자 메시지 (일기 내용)
            messageList.push({
                id: messageId++,
                type: 'user',
                text: diary.content,
                time: timeStr
            });

            // AI 응답
            if (diary.aiResponse) {
                messageList.push({
                    id: messageId++,
                    type: 'ai',
                    text: diary.aiResponse,
                    time: timeStr
                });
            }
        });

        console.log(`[MindRecord] 총 ${messageList.length}개 메시지 생성됨`);
        return messageList;
    }, [diaries]);

    // 스크롤 하단 고정 (instant로 즉시 이동)
    const scrollToBottom = (instant = false) => {
        messagesEndRef.current?.scrollIntoView({ behavior: instant ? "instant" : "smooth" });
    };

    // messages 또는 diaries 변경 시 스크롤 (카카오톡 스타일)
    useEffect(() => {
        if (isOpen && messages.length > 0) {
            // 약간의 딜레이를 주어 렌더링 완료 후 스크롤
            const timer = setTimeout(() => scrollToBottom(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen, messages]);

    // 닫힘 상태일 때 렌더링 최적화 (hooks 호출 후 체크)
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-fade-in-up"
            style={{ height: '100dvh' }}
            data-gtm="mind-record-container"
        >
            {/* 배경 그라디언트 (MainDashboard와 통일감) */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#fff1f2] via-[#ffe4e6] to-[#fecdd3] opacity-50 pointer-events-none"></div>

            {/* 헤더 (Safe Area 적용) */}
            <div
                className="relative z-10 flex items-center px-6 py-4 bg-white/30 backdrop-blur-md border-b border-white/20 shadow-sm flex-none"
                style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
                data-gtm="mind-record-header"
            >
                <button onClick={onClose} className="text-2xl text-slate-600 hover:scale-110 transition-transform p-2 mr-4" data-gtm="mind-record-back-button">
                    <FaArrowLeft />
                </button>
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-slate-800">마음 기록</span>
                    <span className="text-xs text-slate-500 tracking-wider">과거 대화 기록</span>
                </div>
            </div>

            {/* 채팅 영역 (읽기 전용, Flex 1로 중간 영역만 스크롤) */}
            <div
                className="relative z-10 flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar"
                style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
                data-gtm="mind-record-chat-area"
            >
                {messages.map((msg) => {
                    if (msg.type === 'date') {
                        return (
                            <div key={msg.id} className="flex justify-center my-2" data-gtm="mind-record-date-separator">
                                <span className="bg-black/5 text-slate-500 text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                                    {msg.text}
                                </span>
                            </div>
                        );
                    }
                    const isAi = msg.type === 'ai';
                    return (
                        <div key={msg.id} className={`flex gap-3 ${isAi ? '' : 'flex-row-reverse'}`} data-gtm={`mind-record-message-${isAi ? 'ai' : 'user'}`}>
                            {isAi && (
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/80 shadow-sm border border-white flex items-center justify-center overflow-hidden">
                                    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Hugging%20Face.png" alt="AI" className="w-8 h-8 object-cover" />
                                </div>
                            )}
                            <div className={`flex flex-col gap-1 max-w-[75%] ${isAi ? '' : 'items-end'}`}>
                                {isAi && <span className="text-xs text-slate-500 ml-1">AI 친구</span>}
                                <div className={`flex items-end gap-2 ${isAi ? '' : 'flex-row-reverse'}`}>
                                    <div className={`p-3 rounded-2xl text-sm shadow-sm leading-relaxed whitespace-pre-wrap ${
                                        isAi 
                                        ? 'bg-white/70 backdrop-blur-md text-slate-700 border border-white/40 rounded-tl-none' 
                                        : 'bg-gradient-to-tr from-rose-400 to-orange-300 text-white rounded-tr-none shadow-rose-200/50'
                                    }`}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] text-slate-400 min-w-fit mb-1">
                                        {msg.time}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default MindRecord;