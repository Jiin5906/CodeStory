import React, { useState } from 'react';
import { FaCalendarAlt, FaHeart, FaChartPie, FaCog, FaChevronRight } from 'react-icons/fa';
import { usePet } from '../../context/PetContext';

/**
 * BottomSheet — want.html 디자인 + 펼침 기능
 *
 * 구성:
 * 1. 고정 영역 (항상 표시):
 *    - 핸들바 (드래그 가능)
 *    - 4개 액션 버튼
 *    - 채팅 입력창
 * 2. 펼침 영역 (isOpen = true):
 *    - 퀵 메뉴 (달력, 마음 기록, 통계, 설정)
 *    - 스트릭 카드
 *    - 일기 리스트
 */

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

// 액션 버튼 컴포넌트
const ActionButton = ({ icon, label, value, onClick, isHome = false }) => {
    const [showPercent, setShowPercent] = useState(false);
    const [labelText, setLabelText] = useState(label);

    const gaugeHeight = Math.min(100, Math.max(0, value));

    const getIconColor = () => {
        if (value < 20) return 'text-red-500';
        if (value >= 50) return 'text-white';
        return 'text-slate-500';
    };

    const getIconAnimation = () => {
        if (value < 20) return 'animate-pulse';
        return '';
    };

    const handleClick = (e) => {
        e.stopPropagation(); // 바텀시트 펼침 방지

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
        <div className="flex flex-col items-center gap-1.5 group cursor-pointer" onClick={handleClick}>
            <button
                className={`w-16 h-16 rounded-[20px] relative overflow-hidden shadow-[0_2px_8px_rgba(255,181,194,0.12)] active:scale-95 transition-all duration-200 ${
                    isHome
                        ? 'bg-[#FFB5C2] hover:shadow-[0_4px_12px_rgba(255,181,194,0.25)]'
                        : 'bg-white hover:shadow-[0_4px_12px_rgba(255,181,194,0.2)]'
                } border-2 border-white`}
            >
                {/* 게이지 배경 (단일 색상) */}
                {!isHome && (
                    <div
                        className="absolute bottom-0 left-0 w-full bg-[#FFB5C2] transition-all duration-500 ease-out rounded-b-[18px]"
                        style={{
                            height: `${gaugeHeight}%`,
                            opacity: value < 20 ? 1 : 0.8
                        }}
                    />
                )}

                {/* 아이콘 */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <span
                        className={`text-2xl transition-all duration-300 ${
                            isHome ? 'text-white' : getIconColor()
                        } ${getIconAnimation()}`}
                    >
                        {icon}
                    </span>
                </div>
            </button>

            {/* 라벨 */}
            <span
                className={`text-[11px] font-medium transition-all duration-300 ${
                    showPercent ? 'text-[#FFB5C2] scale-105' : 'text-[#4A4A4A]/60'
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
            className={`absolute bottom-0 w-full z-50 bg-white/95 backdrop-blur-xl border-t border-[#FFB5C2]/20 rounded-t-[28px] shadow-[0_-8px_32px_rgba(255,181,194,0.1)] transition-all duration-500 flex flex-col ${
                isOpen ? 'h-[85%]' : 'h-auto'
            }`}
            data-gtm="bottomsheet-container"
        >
            {/* 고정 영역 (항상 표시) */}
            <div
                className="pt-5 pb-8 px-6 flex flex-col"
                style={{ paddingBottom: isOpen ? '1rem' : 'max(2rem, calc(1rem + env(safe-area-inset-bottom)))' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* 핸들바 (미니멀) */}
                <div className="w-10 h-1 bg-[#FFB5C2]/40 rounded-full mx-auto mb-6 cursor-pointer"></div>

                {/* 액션 버튼 그룹 */}
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
                        onClick={() => console.log('🌙 잠자기 기능 (구현 예정)')}
                    />
                    <ActionButton
                        icon="🏠"
                        label="홈"
                        value={100}
                        onClick={onCalendarClick}
                        isHome={true}
                    />
                </div>

                {/* 채팅 입력창 (감성적 디자인) */}
                <div
                    className="relative flex items-center bg-gradient-to-r from-[#FFF8F3] to-white rounded-[20px] border-2 border-[#FFD4DC]/30 shadow-[0_4px_16px_rgba(212,165,245,0.12)] group focus-within:border-[#D4A5F5]/60 focus-within:shadow-[0_6px_20px_rgba(212,165,245,0.25)] transition-all duration-300"
                    onClick={(e) => e.stopPropagation()}
                    data-gtm="chat-input-area"
                    style={{
                        borderRadius: '22px 18px 20px 19px' // 손그림 느낌
                    }}
                >
                    <div className="pl-5 pr-2 text-xl opacity-70">✏️</div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="오늘의 마음을 들려주세요..."
                        className="flex-1 bg-transparent border-none outline-none text-[#4A4A4A] placeholder:text-[#4A4A4A]/40 h-14 text-sm font-body"
                        data-gtm="chat-input-field"
                    />
                    <button
                        onClick={handleSubmit}
                        className="m-2 w-11 h-11 bg-gradient-to-br from-[#D4A5F5] to-[#B87FE0] rounded-full text-white shadow-[0_4px_12px_rgba(212,165,245,0.4)] active:scale-95 hover:shadow-[0_6px_16px_rgba(212,165,245,0.5)] transition-all duration-200 flex items-center justify-center font-bold text-lg hover-wiggle"
                        data-gtm="chat-submit-button"
                    >
                        ↑
                    </button>
                </div>
            </div>

            {/* 펼침 영역 (isOpen = true일 때만 표시) */}
            {isOpen && (
                <div
                    className="flex-1 overflow-y-auto no-scrollbar px-6 pb-8"
                    style={{ paddingBottom: 'max(2.5rem, calc(1rem + env(safe-area-inset-bottom)))' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 퀵 메뉴 (미니멀 통일) */}
                    <div className="grid grid-cols-4 gap-4 mb-8" data-gtm="bottomsheet-quick-menu">
                        <button
                            onClick={onCalendarClick}
                            className="flex flex-col items-center gap-2 group"
                            data-gtm="bottomsheet-menu-calendar"
                        >
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-lg shadow-sm border border-[#FFB5C2]/15 group-hover:scale-105 group-hover:border-[#FFB5C2]/40 transition-all duration-200">
                                <FaCalendarAlt className="text-[#FFB5C2]" />
                            </div>
                            <span className="text-[10px] text-[#4A4A4A]/60 font-medium">달력</span>
                        </button>
                        <button
                            onClick={onMindRecordClick}
                            className="flex flex-col items-center gap-2 group"
                            data-gtm="bottomsheet-menu-mind-record"
                        >
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-lg shadow-sm border border-[#FFB5C2]/15 group-hover:scale-105 group-hover:border-[#FFB5C2]/40 transition-all duration-200">
                                <FaHeart className="text-[#FFB5C2]" />
                            </div>
                            <span className="text-[10px] text-[#4A4A4A]/60 font-medium">마음 기록</span>
                        </button>
                        <button
                            onClick={onStatsClick}
                            className="flex flex-col items-center gap-2 group"
                            data-gtm="bottomsheet-menu-stats"
                        >
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-lg shadow-sm border border-[#FFB5C2]/15 group-hover:scale-105 group-hover:border-[#FFB5C2]/40 transition-all duration-200">
                                <FaChartPie className="text-[#FFB5C2]" />
                            </div>
                            <span className="text-[10px] text-[#4A4A4A]/60 font-medium">통계</span>
                        </button>
                        <button
                            onClick={onSettingsClick}
                            className="flex flex-col items-center gap-2 group"
                            data-gtm="bottomsheet-menu-settings"
                        >
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-lg shadow-sm border border-[#FFB5C2]/15 group-hover:scale-105 group-hover:border-[#FFB5C2]/40 transition-all duration-200">
                                <FaCog className="text-[#FFB5C2]" />
                            </div>
                            <span className="text-[10px] text-[#4A4A4A]/60 font-medium">설정</span>
                        </button>
                    </div>

                    {/* 스트릭 카드 (감성 디자인) */}
                    <div
                        onClick={onCalendarClick}
                        className="bg-gradient-to-r from-white/80 to-[#FFF8F3]/80 backdrop-blur-md p-5 shadow-[0_6px_20px_rgba(255,181,194,0.15)] border-2 border-[#FFD4DC]/30 mb-6 flex items-center justify-between cursor-pointer hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(255,181,194,0.25)] transition-all duration-300"
                        data-gtm="bottomsheet-streak-card"
                        style={{ borderRadius: '24px 20px 22px 21px' }}
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 bg-gradient-to-br from-[#FFB5C2]/30 to-[#FF9AAB]/20 flex items-center justify-center text-2xl shadow-[0_4px_12px_rgba(255,181,194,0.2)]"
                                style={{ borderRadius: '50% 47% 50% 48%' }}
                            >
                                🔥
                            </div>
                            <div>
                                <div className="text-xs text-[#FFB5C2] font-handwriting mb-1">꾸준하시네요!</div>
                                <div className="text-xl text-[#4A4A4A] font-handwriting">{streakDays}일 연속 작성</div>
                            </div>
                        </div>
                        <FaChevronRight className="text-[#FFB5C2]" />
                    </div>

                    {/* 일기 리스트 (미니멀) */}
                    <div className="space-y-3" data-gtm="bottomsheet-diary-list">
                        {diaries && diaries.length > 0 ? (
                            diaries.slice(0, 3).map((diary, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white p-5 rounded-2xl shadow-sm border border-[#FFB5C2]/10 hover:border-[#FFB5C2]/25 hover:shadow-md transition-all duration-200"
                                    data-gtm="bottomsheet-diary-item"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[11px] font-medium text-[#FFB5C2] bg-[#FFB5C2]/5 px-2.5 py-1 rounded-lg">
                                            {formatDate(diary.date)}
                                        </span>
                                        <span className="text-xl">{diary.emoji || '🫠'}</span>
                                    </div>
                                    <p className="text-[#4A4A4A] text-[14px] mb-3 leading-relaxed">
                                        {diary.content}
                                    </p>
                                    {diary.aiResponse && (
                                        <div className="pl-3 border-l-2 border-[#FFB5C2]/30 text-[#4A4A4A]/80 text-sm bg-[#FFB5C2]/5 py-2 rounded-r-lg">
                                            <span className="font-semibold text-[#FFB5C2] mr-1">몽글:</span>
                                            {diary.aiResponse}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-[#4A4A4A]/50 bg-white rounded-2xl border border-dashed border-[#FFB5C2]/20" data-gtm="bottomsheet-empty-state">
                                아직 기록이 없어요.<br />
                                <span className="text-[#FFB5C2]">오늘의 첫 기록</span>을 남겨보세요!
                            </div>
                        )}
                        {diaries && diaries.length > 3 && (
                            <button
                                onClick={onCalendarClick}
                                className="w-full py-3 text-center text-[#FFB5C2] font-medium text-sm bg-white rounded-2xl border border-[#FFB5C2]/20 hover:bg-[#FFB5C2]/5 hover:border-[#FFB5C2]/40 transition-all duration-200"
                                data-gtm="bottomsheet-view-all-diaries"
                            >
                                전체 일기 보기 →
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BottomSheet;