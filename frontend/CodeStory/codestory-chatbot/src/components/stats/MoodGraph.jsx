import React from 'react';
import { format, getDaysInMonth } from 'date-fns';

const MoodGraph = ({ diaries, currentMonth }) => {
    // 1. 이번 달의 총 일수 계산 (예: 28, 30, 31)
    const totalDays = getDaysInMonth(currentMonth);

    // 2. 데이터 가공: 1일부터 말일까지의 mood 데이터 배열 생성
    const graphData = Array.from({ length: totalDays }, (_, i) => {
        const dayNum = i + 1;
        const dateStr = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum), 'yyyy-MM-dd');
        const diary = diaries.find(d => d.date === dateStr);
        return {
            day: dayNum,
            mood: diary ? diary.mood : null // 기록 없으면 null
        };
    });

    // 3. SVG 좌표 계산 상수
    const width = 100;  // SVG 내부 좌표계 너비 (%)
    const height = 50;  // SVG 내부 좌표계 높이
    const padding = 5;  // 여백

    // 좌표 변환 함수 (날짜 -> X, 기분 -> Y)
    const getX = (day) => ((day - 1) / (totalDays - 1)) * (width - padding * 2) + padding;
    const getY = (mood) => height - ((mood - 1) / 4) * (height - padding * 2) - padding;

    // 선 그리기 (Polyline points)
    const points = graphData
        .filter(d => d.mood !== null)
        .map(d => `${getX(d.day)},${getY(d.mood)}`)
        .join(' ');

    // 영역 채우기 (Area Path) - 선 아래를 색칠하기 위함
    const areaPoints = points
        ? `${getX(graphData.find(d => d.mood)?.day || 1)},${height} ${points} ${getX(graphData.findLast(d => d.mood)?.day || totalDays)},${height}`
        : '';

    return (
        <div className="mood-graph-container">
            <h4 className="graph-title">이번 달 감정 리듬</h4>

            {points ? (
                <div className="svg-wrapper">
                    <svg viewBox={`0 0 ${width} ${height}`} className="mood-svg">
                        {/* 1. 배경 가이드라인 (점선) */}
                        <line x1="0" y1={getY(3)} x2="100" y2={getY(3)} stroke="#eee" strokeWidth="0.5" strokeDasharray="2" />

                        {/* 2. 그라데이션 정의 */}
                        <defs>
                            <linearGradient id="gradient-mood" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#6C5CE7" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#6C5CE7" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* 3. 영역 채우기 (그래프 아래 색칠) */}
                        <polygon points={areaPoints} fill="url(#gradient-mood)" />

                        {/* 4. 선 그리기 */}
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
                                />
                            )
                        ))}
                    </svg>

                    {/* X축 라벨 (1일, 15일, 말일) */}
                    <div className="graph-labels">
                        <span>1일</span>
                        <span>15일</span>
                        <span>{totalDays}일</span>
                    </div>
                </div>
            ) : (
                <div className="no-graph-data">
                    아직 그래프를 그릴 데이터가 없어요
                </div>
            )}
        </div>
    );
};

export default MoodGraph;