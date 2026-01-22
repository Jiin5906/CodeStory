import React, { useState } from 'react';
import { FaPen, FaCalendarAlt, FaHeart, FaChartPie, FaCog, FaFire, FaChevronRight } from 'react-icons/fa';

// 날짜 포맷팅 함수 (date-fns 없이 간단 구현)
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const BottomSheet = ({ onWrite, diaries, streakDays, onCalendarClick, onMindRecordClick, onStatsClick, onSettingsClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [touchStart, setTouchStart] = useState(0);

    // 드래그 제스처
    const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientY);
    const handleTouchEnd = (e) => {
        const touchEnd = e.changedTouches[0].clientY;
        const diff = touchStart - touchEnd;
        if (diff > 50) setIsOpen(true);
        else if (diff < -50) setIsOpen(false);
    };

    const handleSubmit = (text) => {
        const message = text || input;
        if (!message.trim()) return;
        
        onWrite(message); // 부모에게 입력값 전달
        setInput('');
        setIsOpen(false); // 서랍 닫기
    };

    return (
        <div
            className={`absolute bottom-0 w-full bg-white/80 backdrop-blur-xl border-t border-white/50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40 transition-transform duration-500 flex flex-col ${isOpen ? 'h-[85%] translate-y-0' : 'h-[85%] translate-y-[calc(100%-190px)]'}`}
            data-gtm="bottomsheet-container"
        >
            {/* 핸들바 & 입력 영역 */}
            <div
                className="px-6 pt-4 pb-6 flex flex-col gap-4 rounded-t-[2.5rem] bg-gradient-to-b from-white/40 to-transparent relative z-50"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => setIsOpen(!isOpen)}
                data-gtm="bottomsheet-handle-area"
            >
                <div className="w-12 h-1.5 bg-slate-300/50 rounded-full mx-auto mb-2"></div>

                {/* 퀵 태그 */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1" onTouchStart={(e) => e.stopPropagation()} data-gtm="bottomsheet-quick-tags">
                    {['☁️ 텅 빈 것 같아', '🫠 너무 지쳤어'].map((tag) => (
                        <button
                            key={tag}
                            onClick={(e) => { e.stopPropagation(); handleSubmit(tag.split(' ').slice(1).join(' ')); }}
                            className="flex-shrink-0 px-4 py-2 bg-white/60 hover:bg-white backdrop-blur-sm rounded-2xl text-sm font-medium text-slate-600 shadow-sm border border-white/50 transition-all hover:-translate-y-1 active:scale-95"
                            data-gtm={`bottomsheet-tag-${tag.split(' ')[0]}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* 입력창 (Glassmorphism) */}
                <div className="relative group" onClick={(e) => e.stopPropagation()} data-gtm="bottomsheet-input-area">
                    <div className="absolute -inset-1 bg-gradient-to-r from-rose-200 to-purple-200 rounded-3xl blur opacity-20 group-focus-within:opacity-70 transition duration-500"></div>
                    <div className="relative flex items-center bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-sm transition-all group-focus-within:bg-white group-focus-within:shadow-xl group-focus-within:-translate-y-1">
                        <div className="pl-4 pr-2 py-4 text-2xl grayscale opacity-50">✏️</div>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="오늘의 마음 한 줄..."
                            className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 text-base font-medium h-14 px-2"
                            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                            data-gtm="bottomsheet-input-field"
                        />
                        <button
                            onClick={() => handleSubmit()}
                            className="m-1.5 w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-400 to-orange-300 text-white shadow-lg shadow-rose-200/50 active:scale-95 transition-transform"
                            data-gtm="bottomsheet-submit-button"
                        >
                            ↑
                        </button>
                    </div>
                </div>
            </div>

            {/* 내부 콘텐츠 (리스트, Safe Area 적용) */}
            <div
                className="flex-1 overflow-y-auto no-scrollbar px-6"
                style={{ paddingBottom: 'max(2.5rem, calc(1rem + env(safe-area-inset-bottom)))' }}
            >

                {/* 퀵 메뉴 */}
                <div className="grid grid-cols-4 gap-4 mb-8 mt-2" data-gtm="bottomsheet-quick-menu">
                    <button
                        onClick={onCalendarClick}
                        className="flex flex-col items-center gap-2 group opacity-70 hover:opacity-100"
                        data-gtm="bottomsheet-menu-calendar"
                    >
                        <div className="w-14 h-14 rounded-[20px] bg-white/80 text-rose-500 flex items-center justify-center text-xl shadow-sm border border-white/60 group-hover:scale-105 transition-transform"><FaCalendarAlt /></div>
                        <span className="text-[11px] text-slate-500 font-bold">달력</span>
                    </button>
                    <button
                        onClick={onMindRecordClick}
                        className="flex flex-col items-center gap-2 group opacity-70 hover:opacity-100"
                        data-gtm="bottomsheet-menu-mind-record"
                    >
                        <div className="w-14 h-14 rounded-[20px] bg-white/80 text-rose-500 flex items-center justify-center text-xl shadow-sm border border-white/60 group-hover:scale-105 transition-transform"><FaHeart /></div>
                        <span className="text-[11px] text-slate-500 font-bold">마음 기록</span>
                    </button>
                    <button
                        onClick={onStatsClick}
                        className="flex flex-col items-center gap-2 group opacity-70 hover:opacity-100"
                        data-gtm="bottomsheet-menu-stats"
                    >
                        <div className="w-14 h-14 rounded-[20px] bg-white/80 text-rose-500 flex items-center justify-center text-xl shadow-sm border border-white/60 group-hover:scale-105 transition-transform"><FaChartPie /></div>
                        <span className="text-[11px] text-slate-500 font-bold">통계</span>
                    </button>
                    <button
                        onClick={onSettingsClick}
                        className="flex flex-col items-center gap-2 group opacity-70 hover:opacity-100"
                        data-gtm="bottomsheet-menu-settings"
                    >
                        <div className="w-14 h-14 rounded-[20px] bg-white/80 text-rose-500 flex items-center justify-center text-xl shadow-sm border border-white/60 group-hover:scale-105 transition-transform"><FaCog /></div>
                        <span className="text-[11px] text-slate-500 font-bold">설정</span>
                    </button>
                </div>

                {/* 스트릭 */}
                <div
                    onClick={onCalendarClick}
                    className="bg-white/60 backdrop-blur-sm p-5 rounded-[24px] shadow-sm border border-white/60 mb-6 flex items-center justify-between cursor-pointer hover:bg-white/90 transition-colors"
                    data-gtm="bottomsheet-streak-card"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center text-2xl">🔥</div>
                        <div>
                            <div className="text-xs text-rose-500 font-bold mb-1">꾸준하시네요!</div>
                            <div className="text-xl text-slate-700 font-bold font-nunito">{streakDays}일 연속 작성</div>
                        </div>
                    </div>
                    <FaChevronRight className="text-slate-300" />
                </div>

                {/* 기록 리스트 (최근 3개만 표시) */}
                <div className="space-y-4" data-gtm="bottomsheet-diary-list">
                    {diaries.length > 0 ? (
                        diaries.slice(0, 3).map((diary, idx) => (
                            <div key={idx} className="bg-white/70 backdrop-blur-md p-6 rounded-[24px] shadow-sm border border-white/50 hover:bg-white/90 transition-colors" data-gtm="bottomsheet-diary-item">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[12px] font-bold text-slate-500 bg-slate-100/50 px-2 py-1 rounded-md font-nunito">
                                        {formatDate(diary.date)}
                                    </span>
                                    <span className="text-xl">{diary.emoji || '🫠'}</span>
                                </div>
                                <p className="text-slate-700 text-[16px] mb-4 leading-relaxed font-normal">
                                    {diary.content}
                                </p>
                                {/* AI 응답이 있을 때만 표시 */}
                                {diary.aiResponse && (
                                    <div className="pl-3 border-l-2 border-rose-300 text-slate-600 text-sm">
                                        <span className="font-bold text-rose-500 mr-1">몽글:</span>
                                        {diary.aiResponse}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-slate-400" data-gtm="bottomsheet-empty-state">
                            아직 기록이 없어요. 오늘의 첫 기록을 남겨보세요!
                        </div>
                    )}
                    {diaries.length > 3 && (
                        <button
                            onClick={onCalendarClick}
                            className="w-full py-3 text-center text-slate-600 font-bold text-sm hover:bg-white/50 rounded-[20px] transition-colors"
                            data-gtm="bottomsheet-view-all-diaries"
                        >
                            전체 일기 보기 →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BottomSheet;