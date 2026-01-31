import React, { useState, useRef, useEffect } from 'react';
import { FaCalendarAlt, FaHeart, FaChartPie, FaCog, FaChevronRight } from 'react-icons/fa';
import { usePet } from '../../context/PetContext';

/**
 * BottomSheet — 3단계 스냅포인트 시스템
 *
 * 스냅포인트 (ToDo.txt 기준):
 * 1. COLLAPSED (최소): 채팅 입력창만 (버튼 숨김)
 * 2. HALF (중간): 채팅 입력창 + 액션 버튼
 * 3. EXPANDED (최대): 전체 내용
 */

// 날짜 포맷팅
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

// 스냅포인트 높이
const SNAP_POINTS = {
    COLLAPSED: 110,  // 채팅만 (버튼 숨김)
    HALF: 220,       // 채팅 + 버튼
    EXPANDED: 85     // 전체 (%)
};

// 액션 버튼 컴포넌트
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
                {/* 게이지 배경 */}
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
    onHomeClick,
    diaries,
    streakDays,
    onMindRecordClick,
    onStatsClick,
    onSettingsClick
}) => {
    const [snapPoint, setSnapPoint] = useState('COLLAPSED'); // COLLAPSED, HALF, EXPANDED
    const [dragStartY, setDragStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [input, setInput] = useState('');

    const sheetRef = useRef(null);
    const { affectionGauge, hungerGauge, sleepGauge } = usePet();

    // 스냅포인트 높이 계산
    const getHeight = () => {
        if (snapPoint === 'EXPANDED') {
            return '85%';
        } else if (snapPoint === 'HALF') {
            return `${SNAP_POINTS.HALF}px`;
        } else {
            return `${SNAP_POINTS.COLLAPSED}px`;
        }
    };

    // 드래그 시작
    const handleDragStart = (clientY) => {
        setIsDragging(true);
        setDragStartY(clientY);
        setCurrentY(0);
    };

    // 드래그 중
    const handleDragMove = (clientY) => {
        if (!isDragging) return;

        const deltaY = clientY - dragStartY;
        setCurrentY(deltaY);
    };

    // 드래그 끝
    const handleDragEnd = () => {
        if (!isDragging) return;

        setIsDragging(false);

        // velocity와 위치 기반으로 다음 스냅포인트 결정
        const threshold = 50; // 최소 이동 거리

        if (snapPoint === 'COLLAPSED') {
            if (currentY < -threshold) {
                setSnapPoint('HALF');
            }
        } else if (snapPoint === 'HALF') {
            if (currentY < -threshold) {
                setSnapPoint('EXPANDED');
            } else if (currentY > threshold) {
                setSnapPoint('COLLAPSED');
            }
        } else if (snapPoint === 'EXPANDED') {
            if (currentY > threshold) {
                setSnapPoint('HALF');
            }
        }

        setCurrentY(0);
    };

    // 터치 이벤트
    const handleTouchStart = (e) => {
        handleDragStart(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
        // 바텀시트 영역에서만 기본 동작 방지
        if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
            handleDragMove(e.touches[0].clientY);
        }
    };

    const handleTouchEnd = () => {
        handleDragEnd();
    };

    // 마우스 이벤트 (데스크톱용)
    const handleMouseDown = (e) => {
        handleDragStart(e.clientY);
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            handleDragMove(e.clientY);
        }
    };

    const handleMouseUp = () => {
        handleDragEnd();
    };

    // 마우스 이벤트 리스너
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragStartY]);

    // 핸들바 클릭으로 순차 이동
    const handleHandleClick = () => {
        if (snapPoint === 'COLLAPSED') {
            setSnapPoint('HALF');
        } else if (snapPoint === 'HALF') {
            setSnapPoint('EXPANDED');
        } else {
            setSnapPoint('COLLAPSED');
        }
    };

    const handleSubmit = () => {
        if (!input.trim()) return;
        onWrite(input);
        setInput('');
    };

    // 드래그 중 transform 계산 (개선된 경계 처리)
    const getTransform = () => {
        if (isDragging && currentY !== 0) {
            // 경계 저항 강화 (0.3으로 낮춤)
            const resistance = 0.3;

            // COLLAPSED 상태에서 아래로 드래그 시 저항
            if (snapPoint === 'COLLAPSED' && currentY > 0) {
                return `translateY(${Math.min(currentY * resistance, 30)}px)`;
            }
            // EXPANDED 상태에서 위로 드래그 시 저항
            else if (snapPoint === 'EXPANDED' && currentY < 0) {
                return `translateY(${Math.max(currentY * resistance, -30)}px)`;
            }
            // 정상 범위 내 드래그
            return `translateY(${Math.max(-200, Math.min(200, currentY))}px)`;
        }
        return 'translateY(0)';
    };

    return (
        <div
            ref={sheetRef}
            className="absolute bottom-0 w-full z-50 bg-gradient-to-b from-white/95 to-[#FFF8F3]/95 backdrop-blur-xl border-t-2 border-[#FFD4DC]/30 rounded-t-[32px] shadow-[0_-8px_32px_rgba(255,181,194,0.15)] flex flex-col"
            style={{
                height: getHeight(),
                transform: getTransform(),
                transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            data-gtm="bottomsheet-container"
        >
            {/* 핸들바 영역 (드래그 가능) */}
            <div
                className="pt-4 pb-3 px-6 cursor-grab active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                style={{ touchAction: 'none' }}
            >
                {/* 핸들바 */}
                <div
                    className="w-12 h-1.5 bg-[#FFB5C2]/40 rounded-full mx-auto mb-4 cursor-pointer hover:bg-[#FFB5C2]/60 transition-colors"
                    onClick={handleHandleClick}
                ></div>
            </div>

            {/* 채팅 입력창 - 항상 표시 */}
            <div className="px-6 pb-5" onClick={(e) => e.stopPropagation()}>
                <div
                    className="relative flex items-center bg-gradient-to-r from-[#FFF8F3] to-white rounded-[22px] border-2 border-[#FFD4DC]/40 shadow-lg group focus-within:border-[#FFB5C2] focus-within:shadow-xl transition-all duration-300"
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

            {/* 액션 버튼 그룹 - HALF 이상에서 표시 */}
            {(snapPoint === 'HALF' || snapPoint === 'EXPANDED') && (
                <div className="px-6 pb-5 animate-fade-in-up">
                    <div className="flex justify-between items-end gap-2 px-1" data-gtm="action-buttons">
                        <ActionButton
                            icon="🤚"
                            label="쓰다듬기"
                            value={affectionGauge}
                            onClick={() => {}}
                        />
                        <ActionButton
                            icon="🍽️"
                            label="식사"
                            value={hungerGauge}
                            onClick={() => {}}
                        />
                        <ActionButton
                            icon="🌙"
                            label="잠자기"
                            value={sleepGauge}
                            onClick={onVentilateClick}
                        />
                        <ActionButton
                            icon="🏠"
                            label="홈"
                            value={100}
                            onClick={onHomeClick}
                            isHome={true}
                        />
                    </div>
                </div>
            )}

            {/* 기존 채팅 입력창 섹션 제거 (위로 이동했으므로) */}
            {false && (snapPoint === 'HALF' || snapPoint === 'EXPANDED') && (
                <div
                    className="px-6 pb-6 animate-fade-in-up"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="relative flex items-center bg-gradient-to-r from-[#FFF8F3] to-white rounded-[22px] border-2 border-[#FFD4DC]/40 shadow-lg group focus-within:border-[#FFB5C2] focus-within:shadow-xl transition-all duration-300"
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
            )}

            {/* 펼침 영역 - EXPANDED에서만 표시 */}
            {snapPoint === 'EXPANDED' && (
                <div
                    className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-8 animate-fade-in-up"
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

                    {/* 스트릭 카드 */}
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

                    {/* 일기 리스트 */}
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
