import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaArrowLeft, FaPaperPlane, FaCog } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

// MindRecord: 채팅 형식으로 과거 기록을 보고 대화하는 컴포넌트
const MindRecord = ({ isOpen, onClose, diaries = [] }) => {
    // diaries를 메시지 형식으로 변환
    const initialMessages = useMemo(() => {
        if (!diaries || diaries.length === 0) {
            return [
                { id: 1, type: 'ai', text: '안녕하세요! 대화를 시작해 보세요! 😊\n오늘 하루는 어떠셨나요?', time: format(new Date(), 'a h:mm', { locale: ko }) }
            ];
        }

        const messages = [];
        let lastDate = null;
        let messageId = 1;

        // 날짜순으로 정렬 (오래된 것부터)
        const sortedDiaries = [...diaries].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedDiaries.forEach((diary) => {
            const diaryDate = parseISO(diary.date);
            const dateStr = format(diaryDate, 'yyyy년 M월 d일 EEEE', { locale: ko });

            // 날짜가 바뀌면 날짜 구분선 추가
            if (lastDate !== dateStr) {
                messages.push({ id: messageId++, type: 'date', text: dateStr });
                lastDate = dateStr;
            }

            // 사용자 메시지 (일기 내용)
            messages.push({
                id: messageId++,
                type: 'user',
                text: diary.content,
                time: format(diaryDate, 'a h:mm', { locale: ko })
            });

            // AI 응답
            if (diary.aiResponse) {
                messages.push({
                    id: messageId++,
                    type: 'ai',
                    text: diary.aiResponse,
                    time: format(diaryDate, 'a h:mm', { locale: ko })
                });
            }
        });

        return messages;
    }, [diaries]);

    const [messages, setMessages] = useState(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    // 스크롤 하단 고정
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 닫힘 상태일 때 렌더링 최적화 (hooks 호출 후 체크)
    if (!isOpen) return null;

    const handleSend = () => {
        if (!inputValue.trim()) return;
        
        // 사용자 메시지 추가
        const newMsg = {
            id: Date.now(),
            type: 'user',
            text: inputValue,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, newMsg]);
        setInputValue('');

        // (임시) AI 응답 시뮬레이션
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'ai',
                text: '그랬구나. 내가 듣고 있어.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-fade-in-up" data-gtm="mind-record-container">
            {/* 배경 그라디언트 (MainDashboard와 통일감) */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#fff1f2] via-[#ffe4e6] to-[#fecdd3] opacity-50 pointer-events-none"></div>

            {/* 헤더 */}
            <div className="relative z-10 flex justify-between items-center p-4 px-6 bg-white/30 backdrop-blur-md border-b border-white/20 shadow-sm" data-gtm="mind-record-header">
                <button onClick={onClose} className="text-2xl text-slate-600 hover:scale-110 transition-transform p-2" data-gtm="mind-record-back-button">
                    <FaArrowLeft />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-slate-800">마음 기록</span>
                    <span className="text-xs text-slate-500 tracking-wider">WITH AI</span>
                </div>
                <button className="text-xl text-slate-600 p-2" data-gtm="mind-record-settings-button">
                    <FaCog />
                </button>
            </div>

            {/* 채팅 영역 */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar" data-gtm="mind-record-chat-area">
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

            {/* 입력창 영역 */}
            <div className="relative z-10 p-4 pb-6 bg-gradient-to-t from-white/90 via-white/80 to-transparent" data-gtm="mind-record-input-area">
                <div className="flex items-center bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg px-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="대화를 입력하세요..."
                        className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 text-base h-14 px-4"
                        data-gtm="mind-record-input-field"
                    />
                    <button
                        onClick={handleSend}
                        className="m-1.5 w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-400 to-orange-300 text-white shadow-lg active:scale-95 transition-all"
                        data-gtm="mind-record-send-button"
                    >
                        <FaPaperPlane className="text-sm ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MindRecord;