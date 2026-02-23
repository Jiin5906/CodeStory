import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, isAfter, startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaChevronLeft, FaChevronRight, FaUserCircle } from 'react-icons/fa';
import MongleIcon from '../common/MongleIcons';

const RightPanel = ({ user, selectedDate, onDateSelect, diaries, onLogout, onLogin }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const today = startOfDay(new Date());

    // 주간 데이터 계산 로직
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
                            ${!isCurrentMonth ? "opacity-30" : ""}
                            ${isSelected ? "bg-[#7C71F5] text-white shadow-md shadow-purple-200 scale-110 z-10" : ""}
                            ${isFuture ? "opacity-30 cursor-default" : ""}
                        `}
                        style={{
                            color: isSelected ? 'white' : 'var(--text-color)',
                            backgroundColor: isSelected ? '#7C71F5' : 'transparent'
                        }}
                        onMouseEnter={(e) => {
                            if (!isSelected && !isFuture) {
                                e.currentTarget.style.backgroundColor = 'var(--bg-color, rgba(0,0,0,0.05))';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }
                        }}
                        data-gtm={`mini-cal-date-${dateStr}`}
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
        <aside
            className="hidden md:flex w-[340px] h-screen sticky top-0 p-8 flex-col gap-8 overflow-y-auto"
            style={{
                backgroundColor: 'var(--card-bg)',
                borderLeft: '1px solid var(--border-color)'
            }}
            data-gtm="view-right-panel"
        >

            {/* 1. 프로필 & 연속 기록 카드 */}
            <div
                className="rounded-[2rem] p-6 text-center"
                style={{ backgroundColor: 'rgba(124, 113, 245, 0.05)' }}
                data-gtm="widget-profile"
            >
                <div className="relative inline-block mb-3">
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center shadow-sm text-4xl overflow-hidden mx-auto"
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            color: 'var(--sub-text-color)'
                        }}
                    >
                        <FaUserCircle />
                    </div>
                    {/* 로그인 상태일 때만 불꽃 아이콘 표시 */}
                    {user && user.id !== 0 && (
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-orange-100">
                            <MongleIcon name="fire" size={18} />
                        </div>
                    )}
                </div>

                <h3
                    className="text-xl font-bold mb-1"
                    style={{ color: 'var(--text-color)' }}
                >
                    {user?.nickname || '게스트'}
                </h3>
                <p
                    className="text-xs mb-4"
                    style={{ color: 'var(--sub-text-color)' }}
                >
                    {user?.id !== 0 ? '오늘도 힘차게 기록해봐요!' : '로그인하고 기록을 시작하세요'}
                </p>

                {user && user.id !== 0 ? (
                    <button
                        onClick={onLogout}
                        className="text-xs underline decoration-1 underline-offset-2 transition-colors"
                        style={{ color: 'var(--sub-text-color)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#FA5252'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--sub-text-color)'; }}
                        data-gtm="btn-profile-logout"
                    >
                        로그아웃
                    </button>
                ) : (
                    <button
                        onClick={onLogin}
                        className="w-full bg-[#7C71F5] text-white py-2 rounded-xl text-sm font-bold shadow-md shadow-purple-200"
                        data-gtm="btn-profile-login"
                    >
                        로그인 하기
                    </button>
                )}
            </div>

            {/* 2. 미니 캘린더 위젯 */}
            <div data-gtm="widget-mini-calendar">
                <div className="flex justify-between items-center mb-6 px-2">
                    <h4
                        className="text-lg font-bold"
                        style={{ color: 'var(--text-color)' }}
                    >
                        {format(currentMonth, 'yyyy년 M월')}
                    </h4>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="p-1.5 rounded-full transition-colors"
                            style={{ color: 'var(--sub-text-color)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-color, rgba(0,0,0,0.05))'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            data-gtm="btn-mini-cal-prev-month"
                        >
                            <FaChevronLeft size={12} />
                        </button>
                        <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="p-1.5 rounded-full transition-colors"
                            style={{ color: 'var(--sub-text-color)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-color, rgba(0,0,0,0.05))'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            data-gtm="btn-mini-cal-next-month"
                        >
                            <FaChevronRight size={12} />
                        </button>
                    </div>
                </div>
                <div
                    className="mb-4 flex justify-between px-2 text-xs font-bold"
                    style={{ color: 'var(--sub-text-color)' }}
                >
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
            <div data-gtm="widget-weekly-chart">
                <h4
                    className="text-lg font-bold mb-6 px-2"
                    style={{ color: 'var(--text-color)' }}
                >
                    주간 감정 흐름
                </h4>
                <div className="flex justify-between items-end h-32 px-2">
                    {weeklyData.map((data, idx) => {
                        const heightPercent = data.mood > 0 ? (data.mood / 5) * 100 : 10;
                        return (
                            <div
                                key={idx}
                                className="flex flex-col items-center gap-2 group cursor-pointer w-8"
                                onClick={() => data.hasData && onDateSelect(new Date(data.dateStr))}
                                data-gtm={`chart-bar-${data.dayName}`}
                            >
                                <div
                                    className="w-full relative h-24 flex items-end justify-center rounded-t-lg overflow-hidden transition-colors"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(124, 113, 245, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)';
                                    }}
                                >
                                    <div
                                        className={`w-3 rounded-t-full transition-all duration-500 ${data.isToday ? 'bg-[#7C71F5]' : data.hasData ? 'bg-purple-300' : 'bg-gray-200'}`}
                                        style={{ height: `${heightPercent}%` }}
                                    ></div>
                                </div>
                                <span
                                    className={`text-xs font-medium ${data.isToday ? 'font-bold' : ''}`}
                                    style={{ color: data.isToday ? '#7C71F5' : 'var(--sub-text-color)' }}
                                >
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
