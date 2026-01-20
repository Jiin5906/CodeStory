import React from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaChevronLeft, FaChevronRight, FaTimes, FaFire, FaTint } from 'react-icons/fa'; // FaTint를 이슬비 아이콘으로 사용

const CalendarModal = ({ isOpen, onClose, selectedDate, onDateSelect, diaries = [], streakDays = 0, dewdropCount = 0 }) => {
    if (!isOpen) return null;

    const [currentMonth, setCurrentMonth] = React.useState(new Date(selectedDate));
    const today = new Date();

    const renderHeader = () => {
        return (
            <div className="flex justify-between items-center mb-6 px-2">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 text-gray-400 hover:text-[#7C71F5]">
                    <FaChevronLeft />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-sm text-gray-400 font-medium">{format(currentMonth, 'yyyy')}</span>
                    <span className="text-3xl font-bold text-gray-800">{format(currentMonth, 'M')}</span>
                </div>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 text-gray-400 hover:text-[#7C71F5]">
                    <FaChevronRight />
                </button>
            </div>
        );
    };

    const renderStats = () => {
        return (
            <div className="flex gap-3 mb-6">
                <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center shadow-sm">
                    <span className="text-xs text-gray-400 mb-1 flex items-center gap-1">연속 기록 <span className="text-gray-300">?</span></span>
                    <div className="flex items-center gap-2">
                        <FaFire className="text-orange-400" />
                        <span className="text-2xl font-bold text-gray-800">{streakDays}</span>
                    </div>
                </div>
                <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center shadow-sm">
                    <span className="text-xs text-gray-400 mb-1 flex items-center gap-1">이슬비 보유 <span className="text-gray-300">?</span></span>
                    <div className="flex items-center gap-2">
                        <FaTint className="text-blue-400" />
                        <span className="text-2xl font-bold text-gray-800">{dewdropCount}</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
        return (
            <div className="grid grid-cols-7 mb-2">
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

                // 해당 날짜에 일기가 있는지 확인 (데이터 연동)
                const dateStr = format(day, 'yyyy-MM-dd');
                const hasDiary = diaries.some(d => d.date === dateStr);

                days.push(
                    <div
                        key={day}
                        className={`relative h-14 flex items-center justify-center text-sm cursor-pointer rounded-xl transition-all
                            ${!isCurrentMonth ? 'text-gray-200' : 'text-gray-700'}
                            ${isSelected ? 'bg-[#7C71F5]/10 text-[#7C71F5] font-bold border border-[#7C71F5]' : ''}
                        `}
                        onClick={() => {
                            if (isCurrentMonth) onDateSelect(cloneDay);
                        }}
                    >
                        <span>{formattedDate}</span>
                        {/* 오늘 날짜 표시 */}
                        {isToday && !isSelected && (
                             <span className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#7C71F5] rounded-full"></span>
                        )}
                        {/* 일기 작성된 날 표시 (이슬비 아이콘 등) */}
                        {hasDiary && isCurrentMonth && (
                            <div className="absolute bottom-2 text-[8px] text-blue-400">●</div>
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="mb-6">{rows}</div>;
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative animate-slide-up">

                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-300 hover:text-gray-600 transition-colors"
                >
                    <FaTimes size={20} />
                </button>

                {/* 헤더 (월 이동) */}
                {renderHeader()}

                {/* 상태창 (스트릭, 이슬비) */}
                {renderStats()}

                {/* 달력 본문 */}
                <div className="bg-gray-50/50 rounded-2xl p-2">
                    {renderDays()}
                    {renderCells()}
                </div>

                {/* 하단 진행도 (옵션) */}
                <div className="mt-6">
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                        <span>이번 달 기록</span>
                        <span>브론즈까지 7일 남음</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-[#7C71F5] h-2 rounded-full w-[40%]"></div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CalendarModal;
