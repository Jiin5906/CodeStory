import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaTimes, FaFire, FaTint } from 'react-icons/fa';

const CalendarModal = ({ isOpen, onClose, selectedDate, onDateSelect, diaries = [], streakDays = 0, dewdropCount = 0 }) => {
    if (!isOpen) return null;

    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
    const today = new Date();

    const renderHeader = () => {
        return (
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
    };

    const renderStats = () => {
        return (
            <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center shadow-sm">
                    {/* 물음표 아이콘 삭제됨 */}
                    <span className="text-xs text-gray-400 mb-1">연속 기록</span>
                    <div className="flex items-center gap-1.5">
                        <FaFire className="text-orange-400 text-lg" />
                        <span className="text-xl font-bold text-gray-800">{streakDays}</span>
                    </div>
                </div>
                <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center shadow-sm">
                    {/* 물음표 아이콘 삭제됨 */}
                    <span className="text-xs text-gray-400 mb-1">이슬비 보유</span>
                    <div className="flex items-center gap-1.5">
                        <FaTint className="text-blue-400 text-lg" />
                        <span className="text-xl font-bold text-gray-800">{dewdropCount}</span>
                    </div>
                </div>
            </div>
        );
    };

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
        let formattedDate = '';

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, 'd');
                const cloneDay = day;
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, today);
                
                // 해당 날짜에 일기가 있는지 확인
                const dateStr = format(day, 'yyyy-MM-dd');
                const hasDiary = diaries.some(d => d.date === dateStr);

                days.push(
                    <div
                        key={day}
                        className={`relative h-10 w-full flex items-center justify-center text-sm cursor-pointer rounded-lg transition-all
                            ${!isCurrentMonth ? 'text-gray-200' : 'text-gray-700'}
                            ${isSelected ? 'bg-[#7C71F5]/10 text-[#7C71F5] font-bold border border-[#7C71F5]' : ''}
                        `}
                        onClick={() => {
                            if (isCurrentMonth) onDateSelect(cloneDay);
                        }}
                    >
                        <span>{formattedDate}</span>
                        {/* 오늘 날짜 표시 (점) */}
                        {isToday && !isSelected && (
                             <span className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#7C71F5] rounded-full"></span>
                        )}
                        {/* 일기 작성된 날 표시 (하단 점) */}
                        {hasDiary && isCurrentMonth && (
                            <div className="absolute bottom-1 text-[6px] text-blue-400">●</div>
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 gap-y-1" key={day}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="mb-2">{rows}</div>;
    };

    return (
        // z-[9999]로 최상위 보장, 화면 중앙 정렬
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            {/* max-w-[340px]로 좁게 잡아 한눈에 들어오게 함 */}
            <div className="bg-white w-full max-w-[340px] rounded-[2rem] p-5 shadow-2xl relative animate-scale-up overflow-hidden">
                
                {/* 닫기 버튼 */}
                <button 
                    onClick={onClose}
                    className="absolute top-5 right-5 text-gray-300 hover:text-gray-600 transition-colors z-10"
                >
                    <FaTimes size={18} />
                </button>

                {/* 헤더 */}
                {renderHeader()}

                {/* 상태창 */}
                {renderStats()}

                {/* 달력 본문 */}
                <div className="mt-2">
                    {renderDays()}
                    {renderCells()}
                </div>

                {/* 하단 진행도 바(브론즈 등) 완전 삭제됨 */}
            </div>
        </div>
    );
};

export default CalendarModal;