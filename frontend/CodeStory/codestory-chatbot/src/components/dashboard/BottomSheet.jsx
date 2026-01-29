import React, { useState } from 'react';
import { FaCalendarAlt, FaHeart, FaChartPie, FaCog, FaChevronRight } from 'react-icons/fa';
import { usePet } from '../../context/PetContext';

/**
 * BottomSheet — 따뜻한 공감일기 디자인 (개선판)
 *
 * 구성:
 * 1. 고정 영역 (항상 표시):
 *    - 핸들바
 *    - 4개 액션 버튼 (쓰다듬기, 환기, 잠자기, 홈) - 다마고치 리텐션 시스템
 *    - 채팅 입력창
 * 2. 펼침 영역:
 *    - 퀵 메뉴 (달력, 마음 기록, 통계, 설정)
 *    - 스트릭 카드
 *    - 일기 리스트 (카톡처럼 대화 내역)
 */

// 날짜 포맷팅
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

// 액션 버튼 컴포넌트 (개선된 디자인)
const ActionButton = ({ icon, label, value, onClick, isHome = false }) => {
    const [showPercent, setShowPercent] = useState(false);
    const [labelText, setLabelText] = useState(label);

    const gaugeHeight = Math.min(100, Math.max(0, value));

    const getIconColor = () => {
        if (value < 20) return 'text-red-400';
        if (value >= 50) return 'text-white';
        return 'text-gray-400';
    };

    const getIconAnimation = () => {
        if (value < 20) return 'animate-pulse';
        return '';
    };

    const handleClick = (e) => {
        e.stopPropagation();

        if (!isHome && value < 100) {
            setShowPercent(true);
            setLabelText(`${Math.round(value)}%`);
            setTimeout(() => {
                setShowPercent(false);
                setLabelText(label);
            }, 1500);
        }

        onClick?.();
    };

    return (
        <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={handleClick}>
            <button
                className={`w-16 h-16 rounded-2xl relative overflow-hidden shadow-lg active:scale-95 transition-all duration-200 ${
                    isHome
                        ? 'bg-gradient-to-br from-[#FFB5C2] to-[#FF9AAB] hover:shadow-xl'
                        : 'bg-white hover:shadow-xl'
                } border-2 border-white`}
            >
                {/* 게이지 배경 (따뜻한 그라데이션) */}
                {!isHome && (
                    <div
                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#FFB5C2] to-[#FFD4DC] transition-all duration-500 ease-out rounded-b-[14px]"
                        style={{
                            height: `${gaugeHeight}%`,
                            opacity: value < 20 ? 1 : 0.85
                        }}
                    />
                )}

                {/* 아이콘 */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <span
                        className={`text-2xl transition-all duration-300 ${
                            isHome ? 'text-white drop-shadow-sm' : getIconColor()
                        } ${getIconAnimation()}`}
                    >
                        {icon}
                    </span>
                </div>
            </button>

            {/* 라벨 */}
            <span
                className={`text-[11px] font-semibold transition-all duration-300 ${
                    showPercent ? 'text-[#FFB5C2] scale-110' : 'text-gray-500'
                }`}
            >
                {labelText}
            </span>
        </div>
    );
};

const BottomSheet = ({
    onWrite,
    onCalendarClick,
    onVentilateClick,
    diaries,
    streakDays,
    onMindRecordClick,
    onStatsClick,
    onSettingsClick
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [touchStart, setTouchStart] = useState(0);
    const { affectionGauge, airGauge, energyGauge } = usePet();

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
            className={`absolute bottom-0 w-full z-50 bg-gradient-to-b from-white/95 to-[#FFF8F3]/95 backdrop-blur-xl border-t-2 border-[#FFD4DC]/30 rounded-t-[32px] shadow-[0_-8px_32px_rgba(255,181,194,0.15)] transition-all duration-500 flex flex-col ${
                isOpen ? 'h-[85%]' : 'h-auto'
            }`}
            data-gtm="bottomsheet-container"
        >
            {/* 고정 영역 */}
            <div
                className="pt-5 pb-8 px-6 flex flex-col"
                style={{ paddingBottom: isOpen ? '1rem' : 'max(2rem, calc(1rem + env(safe-area-inset-bottom)))' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* 핸들바 */}
                <div className="w-12 h-1.5 bg-[#FFB5C2]/40 rounded-full mx-auto mb-6 cursor-pointer"></div>

                {/* 액션 버튼 그룹 - 다마고치 리텐션 시스템 */}
                <div className="flex justify-between items-end gap-2 mb-6 px-1" data-gtm="action-buttons">
                    <ActionButton
                        icon="🤚"
                        label="쓰다듬기"
                        value={affectionGauge}
                        onClick={() => {}}
                    />
                    <ActionButton
                        icon="💨"
                        label="환기"
                        value={airGauge}
                        onClick={onVentilateClick}
                    />
                    <ActionButton
                        icon="🌙"
                        label="잠자기"
                        value={energyGauge}
                        onClick={() => console.log('🌙 잠자기 기능')}
                    />
                    <ActionButton
                        icon="🏠"
                        label="홈"
                        value={100}
                        onClick={onCalendarClick}
                        isHome={true}
                    />
                </div>

                {/* 채팅 입력창 (따뜻한 디자인) */}
                <div
                    className="relative flex items-center bg-gradient-to-r from-[#FFF8F3] to-white rounded-[22px] border-2 border-[#FFD4DC]/40 shadow-lg group focus-within:border-[#FFB5C2] focus-within:shadow-xl transition-all duration-300"
                    onClick={(e) => e.stopPropagation()}
                    data-gtm="chat-input-area"
                >
                    <div className="pl-5 pr-2 text-xl opacity-70">✏️</div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="오늘의 마음을 들려주세요..."
                        className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400 h-14 text-[15px] leading-relaxed"
                        data-gtm="chat-input-field"
                    />
                    <button
                        onClick={handleSubmit}
                        className="m-2 w-11 h-11 bg-gradient-to-br from-[#D4A5F5] to-[#B87FE0] rounded-full text-white shadow-lg active:scale-95 hover:shadow-xl transition-all duration-200 flex items-center justify-center font-bold text-lg"
                        data-gtm="chat-submit-button"
                    >
                        ↑
                    </button>
                </div>
            </div>

            {/* 펼침 영역 */}
            {isOpen && (
                <div
                    className="flex-1 overflow-y-auto no-scrollbar px-6 pb-8"
                    style={{ paddingBottom: 'max(2.5rem, calc(1rem + env(safe-area-inset-bottom)))' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 퀵 메뉴 */}
                    <div className="grid grid-cols-4 gap-3 mb-8" data-gtm="bottomsheet-quick-menu">
                        <button
                            onClick={onCalendarClick}
                            className="flex flex-col items-center gap-2 group"
                            data-gtm="bottomsheet-menu-calendar"
                        >
                            <div className="w-14 h-14 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center text-xl shadow-md border-2 border-[#FFB5C2]/20 group-hover:scale-105 group-hover:border-[#FFB5C2]/50 group-hover:shadow-lg transition-all duration-200">
                                <FaCalendarAlt className="text-[#FFB5C2]" />
                            </div>
                            <span className="text-[11px] text-gray-500 font-semibold">달력</span>
                        </button>
                        <button
                            onClick={onMindRecordClick}
                            className="flex flex-col items-center gap-2 group"
                            data-gtm="bottomsheet-menu-mind-record"
                        >
                            <div className="w-14 h-14 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center text-xl shadow-md border-2 border-[#FFB5C2]/20 group-hover:scale-105 group-hover:border-[#FFB5C2]/50 group-hover:shadow-lg transition-all duration-200">
                                <FaHeart className="text-[#FFB5C2]" />
                            </div>
                            <span className="text-[11px] text-gray-500 font-semibold">감정 기록</span>
                        </button>
                        <button
                            onClick={onStatsClick}
                            className="flex flex-col items-center gap-2 group"
                            data-gtm="bottomsheet-menu-stats"
                        >
                            <div className="w-14 h-14 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center text-xl shadow-md border-2 border-[#FFB5C2]/20 group-hover:scale-105 group-hover:border-[#FFB5C2]/50 group-hover:shadow-lg transition-all duration-200">
                                <FaChartPie className="text-[#FFB5C2]" />
                            </div>
                            <span className="text-[11px] text-gray-500 font-semibold">통계</span>
                        </button>
                        <button
                            onClick={onSettingsClick}
                            className="flex flex-col items-center gap-2 group"
                            data-gtm="bottomsheet-menu-settings"
                        >
                            <div className="w-14 h-14 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center text-xl shadow-md border-2 border-[#FFB5C2]/20 group-hover:scale-105 group-hover:border-[#FFB5C2]/50 group-hover:shadow-lg transition-all duration-200">
                                <FaCog className="text-[#FFB5C2]" />
                            </div>
                            <span className="text-[11px] text-gray-500 font-semibold">설정</span>
                        </button>
                    </div>

                    {/* 스트릭 카드 (따뜻한 디자인) */}
                    <div
                        onClick={onCalendarClick}
                        className="bg-gradient-to-r from-white/90 to-[#FFF8F3]/90 backdrop-blur-md p-5 rounded-[24px] shadow-lg border-2 border-[#FFD4DC]/40 mb-6 flex items-center justify-between cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-300"
                        data-gtm="bottomsheet-streak-card"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#FFB5C2]/30 to-[#FF9AAB]/20 rounded-full flex items-center justify-center text-3xl shadow-md">
                                🔥
                            </div>
                            <div>
                                <div className="text-xs text-[#FFB5C2] font-semibold mb-1">꾸준하시네요!</div>
                                <div className="text-xl text-gray-700 font-bold">{streakDays}일 연속 작성</div>
                            </div>
                        </div>
                        <FaChevronRight className="text-[#FFB5C2]" />
                    </div>

                    {/* 일기 리스트 (카톡처럼 대화 내역) */}
                    <div className="space-y-3" data-gtm="bottomsheet-diary-list">
                        <h3 className="text-sm font-bold text-gray-400 mb-3">최근 대화</h3>
                        {diaries && diaries.length > 0 ? (
                            diaries.slice(0, 3).map((diary, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-md border border-[#FFB5C2]/15 hover:border-[#FFB5C2]/40 hover:shadow-lg transition-all duration-200"
                                    data-gtm="bottomsheet-diary-item"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-xs font-semibold text-[#FFB5C2] bg-[#FFB5C2]/10 px-3 py-1 rounded-full">
                                            {formatDate(diary.date)}
                                        </span>
                                        <span className="text-2xl">{diary.emoji || '🫠'}</span>
                                    </div>
                                    <p className="text-gray-700 text-[15px] mb-3 leading-relaxed">
                                        {diary.content}
                                    </p>
                                    {diary.aiResponse && (
                                        <div className="pl-4 border-l-3 border-[#FFB5C2] text-gray-600 text-sm bg-[#FFF8F3] py-3 px-4 rounded-r-xl">
                                            <span className="font-bold text-[#FFB5C2] mr-1">몽글:</span>
                                            {diary.aiResponse}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-400 bg-white/50 rounded-2xl border-2 border-dashed border-[#FFB5C2]/30" data-gtm="bottomsheet-empty-state">
                                아직 기록이 없어요.<br />
                                <span className="text-[#FFB5C2] font-semibold">오늘의 첫 기록</span>을 남겨보세요!
                            </div>
                        )}
                        {diaries && diaries.length > 3 && (
                            <button
                                onClick={onCalendarClick}
                                className="w-full py-3 text-center text-[#FFB5C2] font-semibold text-sm bg-white/80 rounded-2xl border-2 border-[#FFB5C2]/30 hover:bg-[#FFB5C2]/10 hover:border-[#FFB5C2]/50 transition-all duration-200"
                                data-gtm="bottomsheet-view-all-diaries"
                            >
                                전체 대화 보기 →
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BottomSheet;
