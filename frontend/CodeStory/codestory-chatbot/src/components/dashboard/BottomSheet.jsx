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
        <div className="flex flex-col items-center gap-1.5 group cursor-pointer hover-wiggle" onClick={handleClick}>
            <button
                className={`w-16 h-16 rounded-[20px] relative overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.08)] active:scale-95 transition-all duration-200 ${
                    isHome
                        ? 'bg-gradient-to-br from-[#FFB5C2] to-[#FF9AAB] hover:shadow-[0_6px_16px_rgba(255,181,194,0.4)]'
                        : 'bg-white hover:shadow-[0_6px_16px_rgba(212,165,245,0.25)]'
                } border-[3px] ${
                    isHome ? 'border-[#FFD4DC]' : 'border-[#F8F6F4]'
                }`}
                style={{
                    borderRadius: isHome ? '20px' : '22px 18px 20px 19px' // 손그림 느낌의 불규칙한 라운드
                }}
            >
                {/* 게이지 배경 (부드러운 그라디언트) */}
                {!isHome && (
                    <div
                        className="absolute bottom-0 left-0 w-full transition-all duration-500 ease-out"
                        style={{
                            height: `${gaugeHeight}%`,
                            background: value < 20
                                ? 'linear-gradient(180deg, #FFB5C2 0%, #FF9AAB 100%)'
                                : value >= 100
                                ? 'linear-gradient(180deg, #A8E6CF 0%, #7FD9B8 100%)'
                                : 'linear-gradient(180deg, #D4A5F5 0%, #B87FE0 100%)',
                            borderRadius: '0 0 18px 18px',
                            opacity: 0.9
                        }}
                    />
                )}

                {/* 아이콘 */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <span
                        className={`text-2xl drop-shadow-sm transition-all duration-300 ${
                            isHome ? 'text-white' : getIconColor()
                        } ${getIconAnimation()}`}
                    >
                        {icon}
                    </span>
                </div>

                {/* 반짝임 효과 (100%일 때) */}
                {!isHome && value >= 100 && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent animate-sparkle rounded-[18px]"></div>
                )}
            </button>

            {/* 라벨 (손글씨 폰트) */}
            <span
                className={`text-[11px] font-handwriting transition-all duration-300 ${
                    showPercent ? 'text-[#D4A5F5] scale-110' : 'text-[#4A4A4A]'
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
            className={`absolute bottom-0 w-full z-50 bg-gradient-to-b from-white/95 to-[#FFF8F3]/95 backdrop-blur-2xl border-t-2 border-[#FFD4DC]/40 rounded-t-[32px] shadow-[0_-15px_50px_rgba(212,165,245,0.15)] transition-all duration-500 flex flex-col ${
                isOpen ? 'h-[85%]' : 'h-auto'
            }`}
            data-gtm="bottomsheet-container"
            style={{
                borderRadius: '32px 32px 0 0' // 손그림 느낌
            }}
        >
            {/* 고정 영역 (항상 표시) */}
            <div
                className="pt-4 pb-8 px-6 flex flex-col"
                style={{ paddingBottom: isOpen ? '1rem' : 'max(2rem, calc(1rem + env(safe-area-inset-bottom)))' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* 핸들바 (손그림 느낌) */}
                <div className="w-14 h-1.5 bg-gradient-to-r from-[#FFB5C2]/60 to-[#D4A5F5]/60 rounded-full mx-auto mb-6 cursor-pointer hover:scale-110 transition-transform" style={{ borderRadius: '12px 8px 10px 9px' }}></div>

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
                    {/* 퀵 메뉴 (감성 디자인) */}
                    <div className="grid grid-cols-4 gap-3 mb-8" data-gtm="bottomsheet-quick-menu">
                        <button
                            onClick={onCalendarClick}
                            className="flex flex-col items-center gap-2 group hover-wiggle"
                            data-gtm="bottomsheet-menu-calendar"
                        >
                            <div
                                className="w-14 h-14 bg-gradient-to-br from-[#FFB5C2]/20 to-[#FFD4DC]/10 flex items-center justify-center text-xl shadow-[0_4px_12px_rgba(255,181,194,0.15)] border-2 border-white group-hover:scale-110 group-hover:shadow-[0_6px_16px_rgba(255,181,194,0.3)] transition-all duration-300"
                                style={{ borderRadius: '18px 14px 16px 15px' }}
                            >
                                <FaCalendarAlt className="text-[#FFB5C2]" />
                            </div>
                            <span className="text-[11px] text-[#4A4A4A] font-handwriting">달력</span>
                        </button>
                        <button
                            onClick={onMindRecordClick}
                            className="flex flex-col items-center gap-2 group hover-wiggle"
                            data-gtm="bottomsheet-menu-mind-record"
                        >
                            <div
                                className="w-14 h-14 bg-gradient-to-br from-[#D4A5F5]/20 to-[#E8D4FF]/10 flex items-center justify-center text-xl shadow-[0_4px_12px_rgba(212,165,245,0.15)] border-2 border-white group-hover:scale-110 group-hover:shadow-[0_6px_16px_rgba(212,165,245,0.3)] transition-all duration-300"
                                style={{ borderRadius: '16px 18px 15px 17px' }}
                            >
                                <FaHeart className="text-[#D4A5F5]" />
                            </div>
                            <span className="text-[11px] text-[#4A4A4A] font-handwriting">마음 기록</span>
                        </button>
                        <button
                            onClick={onStatsClick}
                            className="flex flex-col items-center gap-2 group hover-wiggle"
                            data-gtm="bottomsheet-menu-stats"
                        >
                            <div
                                className="w-14 h-14 bg-gradient-to-br from-[#A8E6CF]/20 to-[#C8F5E0]/10 flex items-center justify-center text-xl shadow-[0_4px_12px_rgba(168,230,207,0.15)] border-2 border-white group-hover:scale-110 group-hover:shadow-[0_6px_16px_rgba(168,230,207,0.3)] transition-all duration-300"
                                style={{ borderRadius: '17px 15px 18px 16px' }}
                            >
                                <FaChartPie className="text-[#A8E6CF]" />
                            </div>
                            <span className="text-[11px] text-[#4A4A4A] font-handwriting">통계</span>
                        </button>
                        <button
                            onClick={onSettingsClick}
                            className="flex flex-col items-center gap-2 group hover-wiggle"
                            data-gtm="bottomsheet-menu-settings"
                        >
                            <div
                                className="w-14 h-14 bg-gradient-to-br from-[#FFE8A3]/20 to-[#FFF4D1]/10 flex items-center justify-center text-xl shadow-[0_4px_12px_rgba(255,232,163,0.15)] border-2 border-white group-hover:scale-110 group-hover:shadow-[0_6px_16px_rgba(255,232,163,0.3)] transition-all duration-300"
                                style={{ borderRadius: '15px 17px 14px 18px' }}
                            >
                                <FaCog className="text-[#FFE8A3]" />
                            </div>
                            <span className="text-[11px] text-[#4A4A4A] font-handwriting">설정</span>
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

                    {/* 일기 리스트 (감성 디자인) */}
                    <div className="space-y-4" data-gtm="bottomsheet-diary-list">
                        {diaries && diaries.length > 0 ? (
                            diaries.slice(0, 3).map((diary, idx) => (
                                <div
                                    key={idx}
                                    className="bg-gradient-to-br from-white/90 to-[#FFF8F3]/80 backdrop-blur-md p-6 shadow-[0_6px_20px_rgba(212,165,245,0.12)] border-2 border-[#FFD4DC]/20 hover:scale-[1.01] hover:shadow-[0_8px_24px_rgba(212,165,245,0.2)] transition-all duration-300 animate-soft-fade-in"
                                    data-gtm="bottomsheet-diary-item"
                                    style={{
                                        borderRadius: '24px 20px 22px 21px',
                                        animationDelay: `${idx * 0.1}s`
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span
                                            className="text-[12px] font-handwriting text-[#D4A5F5] bg-gradient-to-r from-[#FFB5C2]/10 to-[#D4A5F5]/10 px-3 py-1 border border-[#FFD4DC]/30"
                                            style={{ borderRadius: '12px 8px 10px 9px' }}
                                        >
                                            {formatDate(diary.date)}
                                        </span>
                                        <span className="text-2xl animate-sparkle">{diary.emoji || '🫠'}</span>
                                    </div>
                                    <p className="text-[#4A4A4A] text-[15px] mb-4 leading-relaxed font-body">
                                        {diary.content}
                                    </p>
                                    {diary.aiResponse && (
                                        <div
                                            className="pl-4 border-l-[3px] border-gradient-to-b from-[#FFB5C2] to-[#D4A5F5] text-[#4A4A4A] text-sm bg-gradient-to-r from-[#FFB5C2]/5 to-transparent py-2"
                                            style={{ borderLeftColor: '#FFB5C2' }}
                                        >
                                            <span className="font-handwriting text-[#FFB5C2] mr-1">몽글:</span>
                                            <span className="font-body">{diary.aiResponse}</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div
                                className="text-center py-12 text-[#4A4A4A]/60 font-handwriting bg-gradient-to-br from-white/50 to-[#FFF8F3]/50 border-2 border-dashed border-[#FFD4DC]/30"
                                data-gtm="bottomsheet-empty-state"
                                style={{ borderRadius: '20px 16px 18px 17px' }}
                            >
                                아직 기록이 없어요.<br />
                                <span className="text-[#D4A5F5]">오늘의 첫 기록</span>을 남겨보세요! ✨
                            </div>
                        )}
                        {diaries && diaries.length > 3 && (
                            <button
                                onClick={onCalendarClick}
                                className="w-full py-3 text-center text-[#D4A5F5] font-handwriting text-sm bg-gradient-to-r from-white/80 to-[#FFF8F3]/80 border-2 border-[#FFD4DC]/30 hover:border-[#D4A5F5]/40 hover:shadow-[0_4px_12px_rgba(212,165,245,0.2)] transition-all duration-300 hover-wiggle"
                                data-gtm="bottomsheet-view-all-diaries"
                                style={{ borderRadius: '18px 14px 16px 15px' }}
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