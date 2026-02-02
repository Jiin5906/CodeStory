import React from 'react';
import { format, getDaysInMonth, isValid } from 'date-fns';

const MoodGraph = ({ diaries, currentMonth }) => {
    // 🛡️ Safe Date Utility: 유효하지 않은 날짜를 오늘 날짜로 대체
    const safeDate = (date) => {
        if (!date) return new Date();
        const d = new Date(date);
        return isValid(d) ? d : new Date();
    };

    const safeMonth = safeDate(currentMonth);
    const totalDays = getDaysInMonth(safeMonth);

    const graphData = Array.from({ length: totalDays }, (_, i) => {
        const dayNum = i + 1;
        const dateStr = format(new Date(safeMonth.getFullYear(), safeMonth.getMonth(), dayNum), 'yyyy-MM-dd');
        const diary = diaries.find(d => d.date === dateStr);
        return {
            day: dayNum,
            dateStr: dateStr, // ✅ 추적을 위한 날짜 문자열 포함
            mood: diary ? diary.mood : null
        };
    });

    const width = 100;
    const height = 50;
    const padding = 5;

    const getX = (day) => ((day - 1) / (totalDays - 1)) * (width - padding * 2) + padding;
    const getY = (mood) => height - ((mood - 1) / 4) * (height - padding * 2) - padding;

    const points = graphData
        .filter(d => d.mood !== null)
        .map(d => `${getX(d.day)},${getY(d.mood)}`)
        .join(' ');

    const areaPoints = points
        ? `${getX(graphData.find(d => d.mood)?.day || 1)},${height} ${points} ${getX(graphData.findLast(d => d.mood)?.day || totalDays)},${height}`
        : '';

    return (
        <div className="mood-graph-container" data-gtm="view-mood-graph-widget">
            <h4 className="graph-title" data-gtm="graph-title-text">이번 달 감정 리듬</h4>

            {points ? (
                <div className="svg-wrapper" data-gtm="graph-svg-wrapper">
                    <svg viewBox={`0 0 ${width} ${height}`} className="mood-svg">
                        <line x1="0" y1={getY(3)} x2="100" y2={getY(3)} stroke="#eee" strokeWidth="0.5" strokeDasharray="2" />

                        <defs>
                            <linearGradient id="gradient-mood" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#6C5CE7" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#6C5CE7" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        <polygon points={areaPoints} fill="url(#gradient-mood)" />

                        <polyline
                            points={points}
                            fill="none"
                            stroke="#6C5CE7"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* 5. 데이터 포인트 (동그라미) */}
                        {graphData.map((d) => (
                            d.mood !== null && (
                                <circle
                                    key={d.day}
                                    cx={getX(d.day)}
                                    cy={getY(d.mood)}
                                    r="2"
                                    fill="white"
                                    stroke="#6C5CE7"
                                    strokeWidth="1"
                                    /* ✅ 특정 날짜의 포인트를 클릭/호버하는지 추적 */
                                    data-gtm={`graph-point-${d.dateStr}`}
                                    title={`${d.day}일: ${d.mood}점`}
                                    style={{ cursor: 'pointer' }}
                                />
                            )
                        ))}
                    </svg>

                    <div className="graph-labels">
                        <span data-gtm="graph-label-start">1일</span>
                        <span data-gtm="graph-label-mid">15일</span>
                        <span data-gtm="graph-label-end">{totalDays}일</span>
                    </div>
                </div>
            ) : (
                <div className="no-graph-data" data-gtm="graph-no-data-state">
                    아직 그래프를 그릴 데이터가 없어요
                </div>
            )}
        </div>
    );
};

export default MoodGraph;