import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

/**
 * EmotionRadarChart - 대화 감정 분포 방사형 차트
 *
 * Mongle Pastel Theme
 */
const EmotionRadarChart = ({ emotionData }) => {
    // 모의 데이터 (실제로는 props로 받아야 함)
    const mockData = emotionData || [
        { emotion: '행복', value: 85, fullMark: 100 },
        { emotion: '평온', value: 65, fullMark: 100 },
        { emotion: '설렘', value: 70, fullMark: 100 },
        { emotion: '슬픔', value: 25, fullMark: 100 },
        { emotion: '불안', value: 15, fullMark: 100 },
        { emotion: '화남', value: 10, fullMark: 100 }
    ];

    // 가장 높은 감정 찾기
    const topEmotion = mockData.reduce((max, item) =>
        item.value > max.value ? item : max
    , mockData[0]);

    return (
        <div className="bg-white rounded-3xl shadow-sm p-6" data-gtm="emotion-radar-chart">
            <h3 className="text-lg font-cute text-gray-700 mb-1 flex items-center gap-2">
                🎨 감정 팔레트
            </h3>
            <p className="text-xs font-cute text-gray-400 mb-6">
                몽글이와 나눈 대화의 감정 분포
            </p>

            {/* Radar Chart */}
            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={mockData}>
                        <PolarGrid strokeDasharray="3 3" stroke="#FFD4DC" opacity={0.3} />
                        <PolarAngleAxis
                            dataKey="emotion"
                            tick={{ fill: '#9CA3AF', fontSize: 12, fontFamily: 'Jua' }}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fill: '#D1D5DB', fontSize: 10 }}
                        />
                        <Radar
                            name="감정 점수"
                            dataKey="value"
                            stroke="#FFB5C2"
                            fill="#FFB5C2"
                            fillOpacity={0.6}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Insight Text */}
            <div className="mt-4 bg-[#FFF8F3] rounded-2xl p-4 border border-[#FFD4DC]/30">
                <p className="text-sm font-cute text-gray-600 text-center">
                    이번 달은 <span className="text-[#FFB5C2] font-bold">{topEmotion.emotion}</span>한 대화를 많이 했네요! ✨
                </p>
            </div>
        </div>
    );
};

export default EmotionRadarChart;
