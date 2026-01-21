import React, { useState } from 'react';
import { FaPen, FaCalendarAlt, FaGlobeAsia, FaChartPie, FaCog, FaFire, FaChevronRight } from 'react-icons/fa';

// 날짜 포맷팅 함수 (date-fns 없이 간단 구현)
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const BottomSheet = ({ onWrite, diaries, streakDays, onCalendarClick, onFeedClick, onStatsClick, onSettingsClick }) => {
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
            className={`absolute bottom-0 w-full bg-[#FFFAF0] rounded-t-[2.5rem] shadow-[0_-10px_60px_rgba(93,64,55,0.15)] z-40 transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'h-[85%] translate-y-0' : 'h-[85%] translate-y-[calc(100%-190px)]'}`}
        >
            {/* 핸들바 & 입력 영역 */}
            <div 
                className="px-5 pt-3 pb-6 bg-[#FFF8E7] rounded-t-[2.5rem] relative z-50 border-b border-[#EFEBE9]"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="w-12 h-1.5 bg-[#D7CCC8] rounded-full mx-auto mb-6"></div>

                {/* 퀵 태그 */}
                <div className="mb-5 overflow-x-auto pb-2 flex gap-3 hide-scrollbar" onTouchStart={(e) => e.stopPropagation()} data-gtm="bottomsheet-quick-tags">
                    {['너무 지쳤어 🫠', '텅 빈 것 같아 ☁️', '위로가 필요해 🩹', '소소하게 행복해 🥰'].map((tag) => (
                        <button
                            key={tag}
                            onClick={(e) => { e.stopPropagation(); handleSubmit(tag); }}
                            className="flex-shrink-0 px-4 py-2 rounded-xl bg-white border border-[#EFEBE9] text-[#5D4037] text-sm hover:bg-[#D7CCC8] transition-colors shadow-sm whitespace-nowrap"
                            data-gtm={`bottomsheet-tag-${tag.split(' ')[0]}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* 입력창 */}
                <div className="relative flex items-center w-full" onClick={(e) => e.stopPropagation()} data-gtm="bottomsheet-input-area">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="오늘의 마음 한 줄..."
                        className="w-full h-14 pl-6 pr-14 bg-white border border-[#EFEBE9] rounded-[20px] text-[#5D4037] text-lg focus:outline-none focus:ring-1 focus:ring-[#8D6E63] placeholder-[#BCAAA4] shadow-inner font-medium"
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        data-gtm="bottomsheet-input-field"
                    />
                    <button
                        onClick={() => handleSubmit()}
                        className="absolute right-2 w-10 h-10 bg-[#8D6E63] text-white rounded-[14px] flex items-center justify-center shadow-sm active:scale-95 transition-transform hover:bg-[#6D4C41]"
                        data-gtm="bottomsheet-submit-button"
                    >
                        <FaPen className="text-sm" />
                    </button>
                </div>
            </div>

            {/* 내부 콘텐츠 (리스트) */}
            <div className="flex-1 bg-[#FFFAF0] px-6 py-6 overflow-y-auto hide-scrollbar">
                
                {/* 퀵 메뉴 */}
                <div className="grid grid-cols-4 gap-4 mb-8" data-gtm="bottomsheet-quick-menu">
                    <button
                        onClick={onCalendarClick}
                        className="flex flex-col items-center gap-2 group opacity-70 hover:opacity-100"
                        data-gtm="bottomsheet-menu-calendar"
                    >
                        <div className="w-14 h-14 rounded-[20px] bg-white text-[#8D6E63] flex items-center justify-center text-xl shadow-sm border border-[#EFEBE9]"><FaCalendarAlt /></div>
                        <span className="text-[10px] text-[#8D6E63] font-bold">달력</span>
                    </button>
                    <button
                        onClick={onFeedClick}
                        className="flex flex-col items-center gap-2 group opacity-70 hover:opacity-100"
                        data-gtm="bottomsheet-menu-feed"
                    >
                        <div className="w-14 h-14 rounded-[20px] bg-white text-[#8D6E63] flex items-center justify-center text-xl shadow-sm border border-[#EFEBE9]"><FaGlobeAsia /></div>
                        <span className="text-[10px] text-[#8D6E63] font-bold">공유</span>
                    </button>
                    <button
                        onClick={onStatsClick}
                        className="flex flex-col items-center gap-2 group opacity-70 hover:opacity-100"
                        data-gtm="bottomsheet-menu-stats"
                    >
                        <div className="w-14 h-14 rounded-[20px] bg-white text-[#8D6E63] flex items-center justify-center text-xl shadow-sm border border-[#EFEBE9]"><FaChartPie /></div>
                        <span className="text-[10px] text-[#8D6E63] font-bold">통계</span>
                    </button>
                    <button
                        onClick={onSettingsClick}
                        className="flex flex-col items-center gap-2 group opacity-70 hover:opacity-100"
                        data-gtm="bottomsheet-menu-settings"
                    >
                        <div className="w-14 h-14 rounded-[20px] bg-white text-[#8D6E63] flex items-center justify-center text-xl shadow-sm border border-[#EFEBE9]"><FaCog /></div>
                        <span className="text-[10px] text-[#8D6E63] font-bold">설정</span>
                    </button>
                </div>

                <div className="w-full h-px bg-[#EFEBE9] mb-8"></div>

                {/* 스트릭 */}
                <div
                    onClick={onCalendarClick}
                    className="bg-white p-5 rounded-[24px] shadow-sm border border-[#EFEBE9] mb-6 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                    data-gtm="bottomsheet-streak-card"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#FFF3E0] flex items-center justify-center text-2xl">🔥</div>
                        <div>
                            <div className="text-xs text-[#FF9800] font-bold mb-1">꾸준하시네요!</div>
                            <div className="text-xl text-[#5D4037] font-bold">{streakDays}일 연속 작성</div>
                        </div>
                    </div>
                    <FaChevronRight className="text-[#D7CCC8]" />
                </div>

                {/* 기록 리스트 (최근 3개만 표시) */}
                <div className="space-y-4 pb-20" data-gtm="bottomsheet-diary-list">
                    {diaries.length > 0 ? (
                        diaries.slice(0, 3).map((diary, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-[24px] shadow-sm border border-[#EFEBE9]" data-gtm="bottomsheet-diary-item">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[12px] font-bold text-[#8D6E63] bg-[#F5F5F5] px-2 py-1 rounded-md">
                                        {formatDate(diary.date)}
                                    </span>
                                    {/* 이모지는 감정 분석 결과에 따라 다르게 표시 가능 */}
                                    <span className="text-xl opacity-80">{diary.emoji || '✨'}</span>
                                </div>
                                <p className="text-[#5D4037] text-[17px] mb-4 leading-relaxed font-normal">
                                    {diary.content}
                                </p>
                                {/* AI 응답이 있을 때만 표시 */}
                                {diary.aiResponse && (
                                    <div className="pl-3 border-l-2 border-[#FFCCBC] text-[#8D6E63] text-sm">
                                        <span className="font-bold text-[#FF8A65] mr-1">몽글:</span>
                                        {diary.aiResponse}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-[#BCAAA4]" data-gtm="bottomsheet-empty-state">
                            아직 기록이 없어요. 오늘의 첫 기록을 남겨보세요!
                        </div>
                    )}
                    {diaries.length > 3 && (
                        <button
                            onClick={onCalendarClick}
                            className="w-full py-3 text-center text-[#8D6E63] font-bold text-sm hover:bg-white/50 rounded-[20px] transition-colors"
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