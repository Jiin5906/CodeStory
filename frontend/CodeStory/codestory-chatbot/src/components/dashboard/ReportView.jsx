import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaCalendar, FaHeart } from 'react-icons/fa6';
import { useDiary } from '../../context/DiaryContext';
import EmotionRadarChart from '../stats/EmotionRadarChart';
import MoodTrendChart from '../stats/MoodTrendChart';
import MongleLetter from '../stats/MongleLetter';

/**
 * ReportView — 감정 데이터 시각화 (Mongle Pastel Theme)
 *
 * 따뜻하고 직관적인 차트로 사용자의 감정을 분석
 */
const ReportView = ({ user, diaries: propDiaries }) => {
    const { diaries: contextDiaries } = useDiary();
    const diaries = propDiaries || contextDiaries || [];

    const currentMonth = format(new Date(), 'M월', { locale: ko });

    return (
        <div
            className="w-full h-full overflow-y-auto bg-gradient-to-b from-[#FFF8F3] to-[#FFE8F0]"
            style={{ paddingBottom: '4.5rem' }}
            data-gtm="view-report"
        >
            <div className="px-6 py-6 space-y-6">
                {/* 새로운 헤더 (심플하고 깔끔하게) */}
                <div className="flex items-center justify-between" data-gtm="report-header">
                    <div>
                        <h1 className="text-2xl font-cute text-gray-700 flex items-center gap-2">
                            <FaCalendar className="text-[#FFB5C2]" />
                            {currentMonth}의 마음 기록
                        </h1>
                        <p className="text-xs font-cute text-gray-400 mt-1">
                            {user?.nickname || '게스트'}님의 감정 여정
                        </p>
                    </div>
                    <div className="text-3xl animate-bounce" style={{ animationDuration: '2s' }}>
                        <FaHeart className="text-[#FFB5C2]" />
                    </div>
                </div>

                {/* 통계 카드 */}
                {diaries.length > 0 && (
                    <div className="grid grid-cols-3 gap-3" data-gtm="report-stats-summary">
                        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                            <p className="text-xs font-cute text-gray-400 mb-1">총 기록</p>
                            <p className="text-2xl font-cute text-[#FFB5C2] font-bold">{diaries.length}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                            <p className="text-xs font-cute text-gray-400 mb-1">평균 점수</p>
                            <p className="text-2xl font-cute text-[#FFD4A5] font-bold">
                                {Math.round(diaries.reduce((sum, d) => sum + (d.moodScore || 50), 0) / diaries.length)}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                            <p className="text-xs font-cute text-gray-400 mb-1">연속 기록</p>
                            <p className="text-2xl font-cute text-[#A8E6CF] font-bold">
                                {Math.min(diaries.length, 7)}
                            </p>
                        </div>
                    </div>
                )}

                {/* 감정 팔레트 (Radar Chart) */}
                <EmotionRadarChart emotionData={null} />

                {/* 마음 날씨 (Area Chart) */}
                <MoodTrendChart diaries={diaries} />

                {/* 몽글이의 편지 */}
                <MongleLetter diaries={diaries} />

                {/* 빈 공간 (스크롤 여유) */}
                <div className="h-4" />
            </div>
        </div>
    );
};

export default ReportView;

