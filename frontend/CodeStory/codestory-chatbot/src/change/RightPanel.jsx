import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, isAfter, startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale'; 
import { FaChevronLeft, FaChevronRight, FaUserCircle } from 'react-icons/fa';

const RightPanel = ({ user, selectedDate, onDateSelect, diaries, onLogout, onLogin }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const today = startOfDay(new Date()); 

    // 주간 데이터 계산 로직 (기존 유지)
    const getWeeklyStats = () => {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        return Array.from({ length: 7 }, (_, i) => {
            const day = addDays(weekStart, i);
            const dateStr = format(day, 'yyyy-MM-dd');
            const diary = diaries.find(d => d.date === dateStr);
            let moodScore = diary ? diary.mood : 0;
            if (diary && (!moodScore || moodScore === 0)) moodScore = 3; // 기본값 처리

            return {
                dayName: format(day, 'EEEEE', { locale: ko }), 
                dateStr, 
                mood: moodScore, 
                isToday: isSameDay(day, selectedDate), 
                hasData: !!diary
            };
        });
    };
    const weeklyData = getWeeklyStats();

    // 캘린더 렌더링 로직
    const renderCalendar = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const dateStr = format(day, 'yyyy-MM-dd');
                const hasDiary = diaries.some(d => d.date === dateStr);
                const isFuture = isAfter(day, today);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);

                days.push(
                    <div
                        key={day.toString()}
                        onClick={() => !isFuture && onDateSelect(cloneDay)}
                        className={`
                            h-9 w-9 flex items-center justify-center rounded-full text-sm font-medium transition-all cursor-pointer relative
                            ${!isCurrentMonth ? "text-gray-300" : "text-gray-700"}
                            ${isSelected ? "bg-[#7C71F5] text-white shadow-md shadow-purple-200 scale-110 z-10" : "hover:bg-gray-100"}
                            ${isFuture ? "opacity-30 cursor-default hover:bg-transparent" : ""}
                        `}
                    >
                        {format(day, "d")}
                        {/* 일기 있는 날 표시 (선택 안됐을 때만) */}
                        {hasDiary && !isSelected && (
                            <div className="absolute bottom-1 w-1 h-1 bg-[#7C71F5] rounded-full"></div>
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(<div className="flex justify-between mb-2" key={day.toString()}>{days}</div>);
            days = [];
        }
        return rows;
    };

    return (
        <aside className="w-[340px] h-screen sticky top-0 bg-white border-l border-gray-100 p-8 flex flex-col gap-8 overflow-y-auto" data-gtm="view-right-panel">
            
            {/* 1. 프로필 & 연속 기록 카드 */}
            <div className="bg-[#F8F9FE] rounded-[2rem] p-6 text-center">
                <div className="relative inline-block mb-3">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-300 text-4xl overflow-hidden mx-auto">
                        <FaUserCircle />
                    </div>
                    {/* 로그인 상태일 때만 불꽃 아이콘 표시 */}
                    {user && user.id !== 0 && (
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-orange-100">
                             <span className="text-lg">🔥</span>
                        </div>
                    )}
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-1">{user?.nickname || '게스트'}</h3>
                <p className="text-xs text-gray-400 mb-4">{user?.id !== 0 ? '오늘도 힘차게 기록해봐요!' : '로그인하고 기록을 시작하세요'}</p>

                {user && user.id !== 0 ? (
                    <button onClick={onLogout} className="text-xs text-gray-400 hover:text-red-400 underline decoration-1 underline-offset-2 transition-colors">로그아웃</button>
                ) : (
                    <button onClick={onLogin} className="w-full bg-[#7C71F5] text-white py-2 rounded-xl text-sm font-bold shadow-md shadow-purple-200">로그인 하기</button>
                )}
            </div>

            {/* 2. 미니 캘린더 위젯 */}
            <div>
                <div className="flex justify-between items-center mb-6 px-2">
                    <h4 className="text-lg font-bold text-gray-800">{format(currentMonth, 'yyyy년 M월')}</h4>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500"><FaChevronLeft size={12}/></button>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500"><FaChevronRight size={12}/></button>
                    </div>
                </div>
                <div className="mb-4 flex justify-between px-2 text-xs font-bold text-gray-400">
                    <span className="w-9 text-center text-red-400">일</span>
                    <span className="w-9 text-center">월</span>
                    <span className="w-9 text-center">화</span>
                    <span className="w-9 text-center">수</span>
                    <span className="w-9 text-center">목</span>
                    <span className="w-9 text-center">금</span>
                    <span className="w-9 text-center">토</span>
                </div>
                <div>{renderCalendar()}</div>
            </div>

            {/* 3. 주간 감정 흐름 위젯 */}
            <div>
                <h4 className="text-lg font-bold text-gray-800 mb-6 px-2">주간 감정 흐름</h4>
                <div className="flex justify-between items-end h-32 px-2">
                    {weeklyData.map((data, idx) => {
                        const heightPercent = data.mood > 0 ? (data.mood / 5) * 100 : 10;
                        return (
                            <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer w-8" onClick={() => data.hasData && onDateSelect(new Date(data.dateStr))}>
                                <div className="w-full relative h-24 flex items-end justify-center rounded-t-lg bg-gray-50 overflow-hidden group-hover:bg-purple-50 transition-colors">
                                    <div 
                                        className={`w-3 rounded-t-full transition-all duration-500 ${data.isToday ? 'bg-[#7C71F5]' : data.hasData ? 'bg-purple-300' : 'bg-gray-200'}`}
                                        style={{ height: `${heightPercent}%` }}
                                    ></div>
                                </div>
                                <span className={`text-xs font-medium ${data.isToday ? 'text-[#7C71F5] font-bold' : 'text-gray-400'}`}>
                                    {data.dayName}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

        </aside>
    );
};

export default RightPanel;