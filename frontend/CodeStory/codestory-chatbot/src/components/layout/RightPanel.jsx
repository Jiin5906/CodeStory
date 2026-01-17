import React, { useState } from 'react';
import { 
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
    addDays, isSameMonth, isSameDay, addMonths, subMonths,
    isAfter, startOfDay
} from 'date-fns';
import { ko } from 'date-fns/locale'; 
import { FaChevronLeft, FaChevronRight, FaUser } from 'react-icons/fa6';
import './RightPanel.css';

const RightPanel = ({ user, selectedDate, onDateSelect, diaries, onLogout, onLogin }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const today = startOfDay(new Date()); 

    const getWeeklyStats = () => {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const weekData = Array.from({ length: 7 }, (_, i) => {
            const day = addDays(weekStart, i);
            const dateStr = format(day, 'yyyy-MM-dd');
            const diary = diaries.find(d => d.date === dateStr);
            
            let moodScore = diary ? diary.mood : 0;
            if (diary && (!moodScore || moodScore === 0)) {
                const emoji = diary.emoji || '';
                if (emoji.match(/🥰|😊|행복|🔥|열정/)) moodScore = 5;
                else if (emoji.match(/🙂|보통/)) moodScore = 3;
                else if (emoji.match(/😢|😭|우울|😫|피곤/)) moodScore = 1;
                else moodScore = 3;
            }

            return {
                dayName: format(day, 'EEEEE', { locale: ko }), 
                dateStr: dateStr, // ✅ GTM 추적을 위해 날짜 정보 추가
                mood: moodScore, 
                isToday: isSameDay(day, selectedDate), 
                hasData: !!diary
            };
        });
        return weekData;
    };

    const weeklyData = getWeeklyStats();

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
                const formattedDate = format(day, "d");
                const cloneDay = day;
                const dateStr = format(day, 'yyyy-MM-dd');
                const hasDiary = diaries.some(d => d.date === dateStr);
                const isFuture = isAfter(day, today);

                days.push(
                    <div
                        className={`cal-cell 
                            ${!isSameMonth(day, monthStart) ? "faded" : ""}
                            ${isSameDay(day, selectedDate) ? "selected" : ""}
                            ${hasDiary ? "has-diary" : ""}
                            ${isFuture ? "disabled-date" : ""} 
                        `}
                        key={day.toString()}
                        onClick={() => !isFuture && onDateSelect(cloneDay)}
                        style={isFuture ? { opacity: 0.3, cursor: 'default' } : {}}
                        /* ✅ 미니 달력 날짜 클릭 추적: 고유 날짜 포함 */
                        data-gtm={`mini-cal-date-${dateStr}`}
                    >
                        <span className="pointer-events-none">{formattedDate}</span>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(<div className="cal-grid" key={day.toString()}>{days}</div>);
            days = [];
        }
        return rows;
    };

    return (
        <aside className="right-panel" data-gtm="view-right-panel">
            {/* 프로필 위젯 */}
            <div className="widget-box profile-widget" data-gtm="widget-profile">
                <div className="profile-img">
                    <FaUser />
                </div>
                {user && user.id !== 0 ? (
                    <>
                        <h3>{user.nickname}</h3>
                        <p style={{ fontSize: '13px', color: '#888', marginTop: '5px' }}>오늘도 기록해볼까요?</p>
                        <button className="logout-btn" onClick={onLogout} data-gtm="btn-profile-logout">로그아웃</button>
                    </>
                ) : (
                    <>
                        <h3>게스트</h3>
                        <p style={{ fontSize: '13px', color: '#888', marginTop: '5px' }}>로그인이 필요해요</p>
                        <button 
                            className="logout-btn" 
                            onClick={onLogin}
                            style={{ color: '#6C5CE7', borderColor: '#6C5CE7', fontWeight: 'bold' }}
                            data-gtm="btn-profile-login"
                        >
                            로그인 하기
                        </button>
                    </>
                )}
            </div>

            {/* 미니 달력 */}
            <div className="widget-box" data-gtm="widget-mini-calendar">
                <div className="widget-title">
                    <span>{format(currentMonth, 'yyyy. MM')}</span>
                    <div style={{display:'flex', gap:'10px'}}>
                        <FaChevronLeft 
                            style={{cursor:'pointer', color:'#888'}} 
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} 
                            data-gtm="btn-mini-cal-prev-month"
                        />
                        <FaChevronRight 
                            style={{cursor:'pointer', color:'#888'}} 
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} 
                            data-gtm="btn-mini-cal-next-month"
                        />
                    </div>
                </div>
                <div className="mini-calendar">
                    <div className="cal-header">
                        <span style={{color:'#ff6b6b'}}>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                    </div>
                    {renderCalendar()}
                </div>
            </div>

            {/* 주간 감정 흐름 그래프 */}
            <div className="widget-box" data-gtm="widget-weekly-chart">
                <div className="widget-title">
                    <span>주간 감정 흐름</span>
                    <span style={{fontSize:'11px', color:'#ccc'}}>Mood</span>
                </div>
                
                <div className="stats-chart" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '120px', paddingTop: '15px' }}>
                    {weeklyData.map((data, idx) => {
                        let heightPercent = data.mood > 0 ? (data.mood / 5) * 80 : 5;
                        const barColor = data.hasData ? '#6C5CE7' : '#F1F3F5';
                        const opacity = data.isToday ? 1 : 0.5;

                        return (
                            <div key={idx} className="bar-wrap" style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                justifyContent: 'flex-end', 
                                width: '14%', 
                                height: '100%' 
                            }}>
                                <div 
                                    className="bar" 
                                    onClick={() => data.hasData && onDateSelect(new Date(data.dateStr))}
                                    style={{
                                        width: '8px',
                                        height: `${heightPercent}%`, 
                                        backgroundColor: barColor,
                                        borderRadius: '10px',
                                        opacity: opacity,
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        marginBottom: '8px',
                                        boxShadow: data.isToday ? '0 2px 8px rgba(108, 92, 231, 0.3)' : 'none',
                                        cursor: data.hasData ? 'pointer' : 'default'
                                    }}
                                    /* ✅ 주간 그래프 막대 클릭 추적: 요일별 고유 ID */
                                    data-gtm={`chart-bar-${data.dayName}`}
                                    title={`${data.mood}점`} 
                                ></div>
                                
                                <div className="bar-label" style={{ 
                                    fontSize: '11px', 
                                    color: data.isToday ? '#6C5CE7' : '#ADB5BD', 
                                    fontWeight: data.isToday ? '800' : '400' 
                                }}>
                                    {data.dayName}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
};

export default RightPanel;