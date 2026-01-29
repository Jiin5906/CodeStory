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

    const getColor = () => {
        if (value < 20) return '#EF4444';
        if (value >= 100) return '#22C55E';
        return '#3B82F6';
    };

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
        <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={handleClick}>
            <button
                className={`w-16 h-16 bg-slate-100 rounded-2xl border-b-[6px] ${
                    isHome ? 'border-[#D97706] bg-[#FBBF24]' : 'border-[#0097AB]'
                } active:border-b-0 active:translate-y-[6px] transition-all relative overflow-hidden shadow-md ring-4 ring-white ${
                    isHome ? '' : 'border-2 border-t-[#00C4DE] border-l-[#00C4DE] border-r-[#00C4DE]'
                }`}
            >
                {!isHome && (
                    <div
                        className="absolute bottom-0 left-0 w-full transition-all duration-300 ease-out"
                        style={{
                            height: `${gaugeHeight}%`,
                            backgroundColor: getColor(),
                            opacity: 1
                        }}
                    />
                )}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <span
                        className={`text-2xl drop-shadow-sm transition-colors ${
                            isHome ? 'text-white' : getIconColor()
                        } ${getIconAnimation()}`}
                    >
                        {icon}
                    </span>
                </div>
            </button>
            <span
                className={`text-[11px] font-bold transition-all ${
                    showPercent ? 'text-[#00C4DE]' : 'text-gray-500'
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
            className={`absolute bottom-0 w-full z-50 bg-white/90 backdrop-blur-xl border-t border-white/60 rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col ${
                isOpen ? 'h-[85%]' : 'h-auto'
            }`}
            data-gtm="bottomsheet-container"
        >
            {/* 고정 영역 (항상 표시) */}
            <div
                className="pt-4 pb-8 px-6 flex flex-col"
                style={{ paddingBottom: isOpen ? '1rem' : 'max(2rem, calc(1rem + env(safe-area-inset-bottom)))' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* 핸들바 */}
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 cursor-pointer"></div>

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

                {/* 채팅 입력창 */}
                <div
                    className="relative flex items-center bg-gray-50 rounded-[24px] border border-gray-200 shadow-inner group focus-within:ring-2 focus-within:ring-[#00C4DE] transition-all focus-within:bg-white"
                    onClick={(e) => e.stopPropagation()}
                    data-gtm="chat-input-area"
                >
                    <div className="pl-4 pr-2 text-xl grayscale opacity-50">✏️</div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="오늘의 마음 한 줄..."
                        className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 h-14 text-sm font-bold"
                        data-gtm="chat-input-field"
                    />
                    <button
                        onClick={handleSubmit}
                        className="m-2 w-10 h-10 bg-[#00C4DE] rounded-full text-white shadow-md active:scale-95 transition-transform flex items-center justify-center hover:bg-[#00B4CE]"
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
                    {/* 퀵 메뉴 */}
                    <div className="grid grid-cols-4 gap-4 mb-8" data-gtm="bottomsheet-quick-menu">
                        <button
                            onClick={onCalendarClick}
                            className="flex flex-col items-center gap-2 group opacity-70 hover:opacity-100"
                            data-gtm="bottomsheet-menu-calendar"
                        >
                            <div className="w-14 h-14 rounded-[20px] bg-white/80 text-rose-500 flex items-center justify-center text-xl shadow-sm border border-white/60 group-hover:scale-105 transition-transform">
                                <FaCalendarAlt />
                            </div>
                            <span className="text-[11px] text-slate-500 font-bold">달력</span>
                        </button>
                        <button
                            onClick={onMindRecordClick}
                            className="flex flex-col items-center gap-2 group opacity-70 hover:opacity-100"
                            data-gtm="bottomsheet-menu-mind-record"
                        >
                            <div className="w-14 h-14 rounded-[20px] bg-white/80 text-rose-500 flex items-center justify-center text-xl shadow-sm border border-white/60 group-hover:scale-105 transition-transform">
                                <FaHeart />
                            </div>
                            <span className="text-[11px] text-slate-500 font-bold">마음 기록</span>
                        </button>
                        <button
                            onClick={onStatsClick}
                            className="flex flex-col items-center gap-2 group opacity-70 hover:opacity-100"
                            data-gtm="bottomsheet-menu-stats"
                        >
                            <div className="w-14 h-14 rounded-[20px] bg-white/80 text-rose-500 flex items-center justify-center text-xl shadow-sm border border-white/60 group-hover:scale-105 transition-transform">
                                <FaChartPie />
                            </div>
                            <span className="text-[11px] text-slate-500 font-bold">통계</span>
                        </button>
                        <button
                            onClick={onSettingsClick}
                            className="flex flex-col items-center gap-2 group opacity-70 hover:opacity-100"
                            data-gtm="bottomsheet-menu-settings"
                        >
                            <div className="w-14 h-14 rounded-[20px] bg-white/80 text-rose-500 flex items-center justify-center text-xl shadow-sm border border-white/60 group-hover:scale-105 transition-transform">
                                <FaCog />
                            </div>
                            <span className="text-[11px] text-slate-500 font-bold">설정</span>
                        </button>
                    </div>

                    {/* 스트릭 카드 */}
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

                    {/* 일기 리스트 */}
                    <div className="space-y-4" data-gtm="bottomsheet-diary-list">
                        {diaries && diaries.length > 0 ? (
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
                        {diaries && diaries.length > 3 && (
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
            )}
        </div>
    );
};

export default BottomSheet;