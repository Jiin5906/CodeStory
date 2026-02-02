import React, { useMemo, useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaQuoteLeft, FaImage, FaListUl, FaHashtag, FaRobot, FaArrowLeft } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import './MonthlyReport.css';
import MoodGraph from './MoodGraph';

const MonthlyReport = ({ diaries, currentMonth }) => {
    const navigate = useNavigate();
    const [showTimeline, setShowTimeline] = useState(false);

    // 🛡️ Safe Date Utility: 유효하지 않은 날짜를 오늘 날짜로 대체
    const safeDate = (date) => {
        if (!date) return new Date();
        const d = new Date(date);
        return isValid(d) ? d : new Date();
    };

    const monthlyDiaries = useMemo(() => {
        const targetMonth = format(safeDate(currentMonth), 'yyyy-MM');
        return diaries
            .filter(d => d.date && d.date.startsWith(targetMonth))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [diaries, currentMonth]);

    const coverImage = useMemo(() => {
        const diaryWithImage = monthlyDiaries.find(d => d.imageUrl);
        return diaryWithImage ? `http://localhost:8080${diaryWithImage.imageUrl}` : null;
    }, [monthlyDiaries]);

    const happinessKeywords = useMemo(() => {
        const tags = {};
        monthlyDiaries
            .filter(d => d.mood >= 4)
            .forEach(d => {
                if (Array.isArray(d.tags)) {
                    d.tags.forEach(t => tags[t] = (tags[t] || 0) + 1);
                }
            });
        return Object.entries(tags)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);
    }, [monthlyDiaries]);

    const monthlyComment = useMemo(() => {
        const count = monthlyDiaries.length;
        if (count === 0) return "아직 기록이 없어서 분석할 수 없어요. 첫 일기를 써보세요!";
        const avgMood = monthlyDiaries.reduce((sum, d) => sum + (d.mood || 3), 0) / count;
        if (avgMood >= 4) return "이번 달은 정말 긍정적인 에너지가 가득했네요! 웃음이 끊이지 않았던 한 달, 이 기운을 다음 달까지 쭉 이어가 볼까요? 🥰";
        if (avgMood >= 3) return "무난하고 평온한 일상을 보내셨군요. 소소한 행복들을 놓치지 않고 기록한 당신, 아주 칭찬해요! 🍵";
        return "조금 지치고 힘든 날들이 있었나 봐요. 하지만 기록하며 마음을 다독인 것만으로도 대단해요. 다음 달엔 더 좋은 일이 생길 거예요! 💪";
    }, [monthlyDiaries]);

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#fff1f2] via-[#ffe4e6] to-[#fecdd3] overflow-y-auto" data-gtm="view-monthly-report-wrapper">
            {/* 헤더 */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 px-6 bg-white/30 backdrop-blur-md border-b border-white/20 shadow-sm" data-gtm="stats-header">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-2xl text-slate-600 hover:scale-110 transition-transform p-2"
                    data-gtm="stats-back-button"
                >
                    <FaArrowLeft />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-slate-800">통계</span>
                    <span className="text-xs text-slate-500 tracking-wider">STATISTICS</span>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="report-container animate-fade-in" data-gtm="view-monthly-report" style={{ background: 'transparent' }}>
            {/* --- [1] 상단 앨범 커버 (클릭 시 타임라인 토글) --- */}
            <div
                className={`monthly-cover-card ${showTimeline ? 'minimized' : ''}`}
                onClick={() => setShowTimeline(!showTimeline)}
                style={{
                    backgroundImage: coverImage
                        ? `url(${coverImage})`
                        : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                }}
                /* ✅ 커버 클릭 트리거: 요약/타임라인 전환 추적 */
                data-gtm="report-cover-toggle"
            >
                <div className="cover-overlay">
                    <div className="cover-header">
                        <span className="cover-year">{format(safeDate(currentMonth), 'yyyy')}</span>
                        <span className="cover-month">{format(safeDate(currentMonth), '.MM')}</span>
                    </div>

                    <div className="cover-footer">
                        {!showTimeline && (
                            <div className="click-guide-badge">
                                👆 카드를 눌러 타임라인 보기
                            </div>
                        )}
                        <h3 className="cover-title">
                            {monthlyDiaries.length > 0 ? "당신의 찬란한 순간들" : "기록을 시작해보세요"}
                        </h3>
                    </div>
                </div>
            </div>

            {/* --- [2] 컨텐츠 영역 --- */}
            <div className="report-content-area">
                {!showTimeline ? (
                    /* A. 요약 화면 */
                    <div className="summary-view animate-slide-up" data-gtm="report-summary-section">
                        <div className="summary-card" data-gtm="report-mood-graph-container">
                            <MoodGraph diaries={diaries} currentMonth={currentMonth} />
                        </div>
                        
                        <div className="summary-card" data-gtm="report-happiness-keywords">
                            <h4 className="card-title"><FaHashtag style={{ color: '#FF6B6B' }} /> 이달의 행복 키워드</h4>
                            <div className="keyword-list">
                                {happinessKeywords.length > 0 ? (
                                    happinessKeywords.map(([tag, count], idx) => (
                                        <span 
                                            key={idx} 
                                            className="keyword-chip"
                                            /* ✅ 어떤 키워드가 가장 인기 있는지 개별 식별 */
                                            data-gtm={`report-keyword-${tag}`}
                                        >
                                            #{tag} <span className="count">{count}</span>
                                        </span>
                                    ))
                                ) : (
                                    <p className="no-data-text">행복했던 날의 태그가 아직 없어요 🥲</p>
                                )}
                            </div>
                        </div>

                        {/* AI 총평 카드 */}
                        <div className="summary-card ai-card" data-gtm="report-ai-comment-card">
                            <h4 className="card-title"><FaRobot style={{ color: '#6C5CE7' }} /> CodeStory의 월간 총평</h4>
                            <p className="ai-text">
                                "{monthlyComment}"
                            </p>
                            <div className="ai-decoration">💌</div>
                        </div>
                    </div>
                ) : (
                    /* B. 타임라인 화면 */
                    <div className="timeline-view animate-slide-up" data-gtm="report-timeline-section">
                        <div className="timeline-header-actions">
                            <button 
                                className="back-btn-text" 
                                onClick={() => setShowTimeline(false)}
                                data-gtm="report-btn-back-to-summary"
                            >
                                <FaArrowLeft /> 요약으로 돌아가기
                            </button>
                        </div>

                        <div className="timeline-list">
                            {monthlyDiaries.length > 0 ? (
                                monthlyDiaries.map((diary) => (
                                    <div 
                                        key={diary.id} 
                                        className="timeline-item"
                                        /* ✅ 특정 일기 클릭/노출 추적 */
                                        data-gtm={`report-timeline-item-${diary.id}`}
                                    >
                                        <div className="timeline-left">
                                            <span className="day-num">{diary.date ? format(safeDate(parseISO(diary.date)), 'dd') : '--'}</span>
                                            <span className="day-week">{diary.date ? format(safeDate(parseISO(diary.date)), 'EEEE', { locale: ko }) : '-'}</span>
                                        </div>
                                        <div className="timeline-content-card">
                                            <div className="card-header">
                                                <span className="mood-emoji">{diary.emoji}</span>
                                                <span className="card-tags">
                                                    {diary.tags?.map(t => `#${t} `)}
                                                </span>
                                            </div>
                                            <p className="card-text">
                                                {diary.content.length > 60 ? diary.content.substring(0, 60) + '...' : diary.content}
                                            </p>
                                            {diary.imageUrl && <div className="card-has-image"><FaImage /> 사진 포함됨</div>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">기록이 없습니다.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            </div>
        </div>
    );
};

export default MonthlyReport;