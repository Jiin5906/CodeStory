import React, { useState } from 'react';
import { FaChevronUp } from 'react-icons/fa';

/**
 * BottomSheet — 세련된 미니멀 디자인 (2030 여성 타겟)
 *
 * 핵심 철학: "일기 쓰기에 집중. 모든 방해 요소 제거."
 *
 * 구성:
 * 1. 고정 영역 (항상 표시):
 *    - 채팅 입력창 (핵심 기능)
 * 2. 펼침 영역 (isOpen = true):
 *    - 간단한 탭 메뉴 (기록, 통계, 설정)
 *    - 최근 일기 2개 미리보기
 *    - 미니멀 스트릭 표시
 */

// 날짜 포맷팅
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${month}월 ${day}일 ${weekday}요일`;
};

const BottomSheetNew = ({
    onWrite,
    onCalendarClick,
    diaries,
    streakDays,
    onStatsClick,
    onSettingsClick
}) => {
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

    const handleSubmit = () => {
        if (!input.trim()) return;
        onWrite(input);
        setInput('');
    };

    return (
        <div
            className={`absolute bottom-0 w-full z-50 bg-white rounded-t-3xl shadow-[0_-2px_20px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col ${
                isOpen ? 'h-[80%]' : 'h-auto'
            }`}
            data-gtm="bottomsheet-container"
        >
            {/* 고정 영역 */}
            <div
                className="pt-4 pb-6 px-5"
                style={{ paddingBottom: isOpen ? '1rem' : 'max(1.5rem, calc(1rem + env(safe-area-inset-bottom)))' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* 핸들바 */}
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5"></div>

                {/* 스트릭 표시 (미니멀) */}
                {!isOpen && streakDays > 0 && (
                    <div className="mb-4 text-center">
                        <p className="text-caption text-gray-400">
                            <span className="text-[#FF8FA3] font-semibold">{streakDays}일</span> 연속 기록 중
                        </p>
                    </div>
                )}

                {/* 채팅 입력창 */}
                <div
                    className="relative flex items-center bg-gray-50 rounded-2xl border border-gray-100 transition-all duration-200 focus-within:border-[#FF8FA3] focus-within:bg-white"
                    onClick={(e) => e.stopPropagation()}
                    data-gtm="chat-input-area"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="오늘 하루는 어땠나요?"
                        className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400 h-14 px-5 text-[16px] leading-relaxed"
                        data-gtm="chat-input-field"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={!input.trim()}
                        className="m-2 w-10 h-10 bg-[#FF8FA3] rounded-full text-white shadow-sm active:scale-95 transition-smooth flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                        data-gtm="chat-submit-button"
                    >
                        <FaChevronUp className="text-lg" />
                    </button>
                </div>
            </div>

            {/* 펼침 영역 */}
            {isOpen && (
                <div
                    className="flex-1 overflow-y-auto px-5 pb-8"
                    style={{ paddingBottom: 'max(2rem, calc(1rem + env(safe-area-inset-bottom)))' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 탭 메뉴 */}
                    <div className="grid grid-cols-3 gap-2 mb-6" data-gtm="bottomsheet-tab-menu">
                        <button
                            onClick={onCalendarClick}
                            className="py-3 px-4 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 hover:border-[#FF8FA3] hover:text-[#FF8FA3] transition-all duration-200"
                            data-gtm="bottomsheet-menu-calendar"
                        >
                            기록 보기
                        </button>
                        <button
                            onClick={onStatsClick}
                            className="py-3 px-4 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 hover:border-[#FF8FA3] hover:text-[#FF8FA3] transition-all duration-200"
                            data-gtm="bottomsheet-menu-stats"
                        >
                            통계
                        </button>
                        <button
                            onClick={onSettingsClick}
                            className="py-3 px-4 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 hover:border-[#FF8FA3] hover:text-[#FF8FA3] transition-all duration-200"
                            data-gtm="bottomsheet-menu-settings"
                        >
                            설정
                        </button>
                    </div>

                    {/* 최근 일기 */}
                    <div className="space-y-3" data-gtm="bottomsheet-diary-list">
                        <h3 className="text-caption font-semibold text-gray-400 mb-3">최근 기록</h3>
                        {diaries && diaries.length > 0 ? (
                            diaries.slice(0, 2).map((diary, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-smooth cursor-pointer"
                                    onClick={onCalendarClick}
                                    data-gtm="bottomsheet-diary-item"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-small text-gray-400">
                                            {formatDate(diary.date)}
                                        </span>
                                        {diary.emoji && (
                                            <span className="text-lg">{diary.emoji}</span>
                                        )}
                                    </div>
                                    <p className="text-body text-gray-800 line-clamp-2 leading-relaxed">
                                        {diary.content}
                                    </p>
                                    {diary.aiResponse && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <p className="text-caption text-gray-500 line-clamp-1">
                                                <span className="text-[#FF8FA3] font-medium">몽글:</span> {diary.aiResponse}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div
                                className="text-center py-12 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 cursor-pointer hover:border-[#FF8FA3] transition-smooth"
                                onClick={() => setIsOpen(false)}
                                data-gtm="bottomsheet-empty-state"
                            >
                                <p className="text-body text-gray-400 mb-1">아직 기록이 없어요</p>
                                <p className="text-caption text-gray-400">오늘의 이야기를 들려주세요</p>
                            </div>
                        )}
                        {diaries && diaries.length > 2 && (
                            <button
                                onClick={onCalendarClick}
                                className="w-full py-3 text-center text-caption font-medium text-[#FF8FA3] hover:bg-gray-50 rounded-xl transition-smooth"
                                data-gtm="bottomsheet-view-all-diaries"
                            >
                                전체 보기
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BottomSheetNew;
