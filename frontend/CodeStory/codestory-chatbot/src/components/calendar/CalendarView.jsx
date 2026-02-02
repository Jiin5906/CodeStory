import React, { useState } from 'react';
import { format, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import './CalendarView.css';

const CalendarView = ({ diaries }) => {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);
    
    const allDates = eachDayOfInterval({ start: startDate, end: endDate });
    const [selectedDate, setSelectedDate] = useState(new Date());

    const getDiaryByDate = (date) => {
        return diaries.find(d => isSameDay(new Date(d.date), date));
    };

    // 감정 기반 색상 결정 함수
    const getEmotionClass = (diary) => {
        if (!diary) return 'emotion-none';

        const mood = diary.mood || 5;

        if (mood >= 7) return 'emotion-happy';  // 긍정/최고 - 초록색
        if (mood <= 3) return 'emotion-angry';  // 분노 - 빨간색
        return 'emotion-sad';  // 우울/슬픔 - 파란색 (4-6)
    };

    const weeks = [];
    let currentWeek = [];
    
    const startDayIndex = getDay(startDate);
    for (let i = 0; i < startDayIndex; i++) {
        currentWeek.push(null);
    }

    allDates.forEach(date => {
        currentWeek.push(date);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });
    
    if (currentWeek.length > 0) {
        while(currentWeek.length < 7) currentWeek.push(null);
        weeks.push(currentWeek);
    }

    const selectedDiary = getDiaryByDate(selectedDate);
    const thisYearDiaries = diaries.filter(d => d.date.startsWith(String(currentYear)));
    const totalDiaries = thisYearDiaries.length;
    const filledRate = Math.round((totalDiaries / allDates.length) * 100);

    return (
        <div className="calendar-view-container animate-fade-in" data-gtm="view-calendar-main">
            <div className="calendar-header">
                <div>
                    <h2 className="calendar-title">{currentYear}년의 감정 지도</h2>
                    <p className="calendar-subtitle">1월부터 12월까지, 당신의 1년을 한눈에 확인하세요.</p>
                </div>
                <div className="stats-row">
                    <div className="stat-box" data-gtm="stat-total-diaries">
                        <span className="stat-label">올해 기록</span>
                        <strong className="stat-value">{totalDiaries}개</strong>
                    </div>
                    <div className="stat-box" data-gtm="stat-filled-rate">
                        <span className="stat-label">진행률</span>
                        <strong className="stat-value">{filledRate}%</strong>
                    </div>
                </div>
            </div>

            <div className="grass-wrapper-card">
                <div className="grass-weekdays-fixed">
                    <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
                </div>

                <div className="grass-scroll-area">
                    <div className="grass-columns">
                        {weeks.map((week, wIdx) => {
                            const showMonthLabel = week.some(d => d && d.getDate() === 1);
                            
                            return (
                                <div key={wIdx} className="week-column">
                                    <div className="month-label-area">
                                        {showMonthLabel && (
                                            <span className="month-marker">
                                                {format(week.find(d => d && d.getDate() === 1), 'M월')}
                                            </span>
                                        )}
                                    </div>

                                    <div className="days-stack">
                                        {week.map((date, dIdx) => {
                                            if (!date) return <div key={dIdx} className="day-cell empty"></div>;

                                            const diary = getDiaryByDate(date);
                                            const emotionClass = getEmotionClass(diary);
                                            const isSelected = isSameDay(date, selectedDate);
                                            const dateStr = format(date, 'yyyy-MM-dd');

                                            return (
                                                <div
                                                    key={dIdx}
                                                    className={`day-cell ${emotionClass} ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => setSelectedDate(date)}
                                                    title={dateStr}
                                                    /* ✅ 날짜 셀 추적: 어떤 날짜인지, 일기가 있는 날인지 없는 날인지 구분 가능 */
                                                    data-gtm="calendar-day-cell"
                                                    data-gtm-date={dateStr}
                                                    data-gtm-has-diary={diary ? "true" : "false"}
                                                    data-gtm-emotion={diary ? emotionClass : "none"}
                                                ></div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 하단 상세 보기 */}
            <div className="diary-preview-section" data-gtm="calendar-preview-section">
                <h3 className="preview-date">
                    {format(selectedDate, 'yyyy년 M월 d일 EEEE', { locale: ko })}
                </h3>
                
                {selectedDiary ? (
                    <div className="preview-card" data-gtm="calendar-diary-card">
                        <div className="preview-header">
                            <span className="preview-emoji">{selectedDiary.emoji}</span>
                            <div className="preview-meta">
                                <span className="preview-mood">기분 {selectedDiary.mood}점</span>
                                <div className="preview-tags">
                                    {selectedDiary.tags.map((tag, i) => (
                                        <span key={i} data-gtm="calendar-diary-tag">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="preview-content">{selectedDiary.content}</p>
                        {selectedDiary.imageUrl && (
                            <div className="diary-img-wrapper" data-gtm="calendar-diary-image">
                                <img src={`http://localhost:8080${selectedDiary.imageUrl}`} alt="diary" className="preview-image"/>
                            </div>
                        )}
                         {selectedDiary.aiResponse && (
                            <div className="preview-ai" data-gtm="calendar-ai-response">
                                <strong>AI의 공감:</strong> {selectedDiary.aiResponse}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="empty-preview" data-gtm="calendar-empty-preview">
                        <div className="empty-circle">📝</div>
                        <p>이 날 작성된 일기가 없어요.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarView;