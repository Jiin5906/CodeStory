import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // ★ Portal을 위해 추가됨
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaTimes, FaFire, FaTint } from 'react-icons/fa';

const CalendarModal = ({ isOpen, onClose, selectedDate, onDateSelect, diaries = [], streakDays = 0, dewdropCount = 0 }) => {
    // 내부 상태
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
    const today = new Date();

    // 모달이 열릴 때 스크롤 막기 (배경 스크롤 방지)
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // 모달이 닫혀있으면 렌더링 하지 않음
    if (!isOpen) return null;

    // --- 렌더링 헬퍼 함수들 ---
    const renderHeader = () => (
        <div className="flex justify-between items-center mb-4 px-2">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 text-gray-400 hover:text-[#7C71F5]">
                <FaChevronLeft />
            </button>
            <div className="flex flex-col items-center">
                <span className="text-xs text-gray-400 font-medium mb-1">{format(currentMonth, 'yyyy')}</span>
                <span className="text-2xl font-bold text-gray-800">{format(currentMonth, 'M')}</span>
            </div>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 text-gray-400 hover:text-[#7C71F5]">
                <FaChevronRight />
            </button>
        </div>
    );

    const renderStats = () => (
        <div className="flex gap-3 mb-4">
            <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center shadow-sm">
                <span className="text-xs text-gray-400 mb-1">연속 기록</span>
                <div className="flex items-center gap-1.5">
                    <FaFire className="text-orange-400 text-lg" />
                    <span className="text-xl font-bold text-gray-800">{streakDays}</span>
                </div>
            </div>
            <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center shadow-sm">
                <span className="text-xs text-gray-400 mb-1">이슬비 보유</span>
                <div className="flex items-center gap-1.5">
                    <FaTint className="text-blue-400 text-lg" />
                    <span className="text-xl font-bold text-gray-800">{dewdropCount}</span>
                </div>
            </div>
        </div>
    );

    const renderDays = () => {
        const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
        return (
            <div className="grid grid-cols-7 mb-1">
                {weekDays.map((day, i) => (
                    <div key={i} className="text-center text-xs font-medium text-gray-400 py-2">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const formattedDate = format(day, 'd');
                const cloneDay = day;
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, today);
                const dateStr = format(day, 'yyyy-MM-dd');
                const hasDiary = diaries.some(d => d.date === dateStr);

                days.push(
                    <div
                        key={day.toString()}
                        className={`relative h-10 w-full flex items-center justify-center text-sm cursor-pointer rounded-lg transition-all
                            ${!isCurrentMonth ? 'text-gray-200' : 'text-gray-700'}
                            ${isSelected ? 'bg-[#7C71F5]/10 text-[#7C71F5] font-bold border border-[#7C71F5]' : ''}
                        `}
                        onClick={() => { if (isCurrentMonth) onDateSelect(cloneDay); }}
                    >
                        <span>{formattedDate}</span>
                        {isToday && !isSelected && (
                             <span className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#7C71F5] rounded-full"></span>
                        )}
                        {hasDiary && isCurrentMonth && (
                            <div className="absolute bottom-1 text-[6px] text-blue-400">●</div>
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(<div className="grid grid-cols-7 gap-y-1" key={day.toString()}>{days}</div>);
            days = [];
        }
        return <div className="mb-2">{rows}</div>;
    };

    // ★ 핵심 수정: ReactDOM.createPortal 사용
    // 모달을 'root' div가 아닌 'document.body'에 직접 렌더링하여 부모 스타일(transform 등)의 영향을 받지 않게 함
    return ReactDOM.createPortal(
        <div 
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 w-screen h-[100dvh]"
            onClick={onClose} // 배경 클릭 시 닫기
        >
            {/* 모달 컨텐츠 */}
            <div 
                className="bg-white w-full max-w-[340px] rounded-[2rem] p-5 shadow-2xl relative animate-scale-up overflow-hidden"
                onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫힘 방지
            >
                {/* 닫기 버튼 */}
                <button 
                    onClick={onClose}
                    className="absolute top-5 right-5 text-gray-300 hover:text-gray-600 transition-colors z-10"
                >
                    <FaTimes size={18} />
                </button>

                {renderHeader()}
                {renderStats()}

                <div className="mt-2">
                    {renderDays()}
                    {renderCells()}
                </div>
            </div>
        </div>,
        document.body // Portal의 목적지
    );
};

export default CalendarModal;