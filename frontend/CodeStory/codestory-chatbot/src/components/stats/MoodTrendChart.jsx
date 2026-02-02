import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * MoodTrendChart - 일기 기분 점수 추이 영역 차트
 *
 * Mongle Pastel Theme
 */
const MoodTrendChart = ({ diaries }) => {
    // 일기 데이터를 차트 데이터로 변환
    const chartData = diaries && diaries.length > 0
        ? diaries
            .filter(d => d.moodScore !== undefined)
            .slice(0, 30) // 최근 30개
            .reverse()
            .map(diary => ({
                date: diary.date,
                score: diary.moodScore,
                displayDate: format(parseISO(diary.date), 'M/d', { locale: ko })
            }))
        : [
            // 모의 데이터
            { date: '2026-01-25', score: 65, displayDate: '1/25' },
            { date: '2026-01-26', score: 70, displayDate: '1/26' },
            { date: '2026-01-27', score: 55, displayDate: '1/27' },
            { date: '2026-01-28', score: 80, displayDate: '1/28' },
            { date: '2026-01-29', score: 75, displayDate: '1/29' },
            { date: '2026-01-30', score: 85, displayDate: '1/30' },
            { date: '2026-01-31', score: 60, displayDate: '1/31' },
            { date: '2026-02-01', score: 90, displayDate: '2/1' },
            { date: '2026-02-02', score: 85, displayDate: '2/2' }
        ];

    // 평균 기분 점수 계산
    const avgScore = chartData.length > 0
        ? Math.round(chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length)
        : 0;

    // 커스텀 툴팁
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white rounded-xl shadow-md p-3 border border-[#FFD4DC]/40">
                    <p className="text-xs font-cute text-gray-500">{data.displayDate}</p>
                    <p className="text-sm font-cute text-[#FFB5C2] font-bold">{data.score}점</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm p-6" data-gtm="mood-trend-chart">
            <h3 className="text-lg font-cute text-gray-700 mb-1 flex items-center gap-2">
                마음 날씨
            </h3>
            <p className="text-xs font-cute text-gray-400 mb-6">
                일기에 기록한 기분 점수의 변화
            </p>

            {/* Area Chart */}
            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FFB5C2" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#FFB5C2" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                        <XAxis
                            dataKey="displayDate"
                            tick={{ fill: '#9CA3AF', fontSize: 11, fontFamily: 'Jua' }}
                            axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <YAxis
                            domain={[0, 100]}
                            tick={{ fill: '#9CA3AF', fontSize: 11 }}
                            axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#FFB5C2"
                            strokeWidth={2}
                            fill="url(#colorScore)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Average Score */}
            <div className="mt-4 bg-[#FFF8F3] rounded-2xl p-4 border border-[#FFD4DC]/30">
                <p className="text-sm font-cute text-gray-600 text-center">
                    평균 기분 점수: <span className="text-[#FFB5C2] font-bold">{avgScore}점</span>
                    {avgScore >= 70 ? ' 정말 좋았네요!' : avgScore >= 50 ? ' 평온한 날들이었어요' : ' 힘든 시간을 견뎌냈어요'}
                </p>
            </div>
        </div>
    );
};

export default MoodTrendChart;
