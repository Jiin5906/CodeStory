import React, { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaQuoteLeft, FaImage, FaListUl, FaHashtag, FaRobot, FaArrowLeft } from 'react-icons/fa6';
import './MonthlyReport.css';
import MoodGraph from './MoodGraph';

const MonthlyReport = ({ diaries, currentMonth }) => {
    // 타임라인 열림 여부 상태 (false: 요약 화면, true: 타임라인 화면)
    const [showTimeline, setShowTimeline] = useState(false);

    // 1. 이번 달 일기 필터링 & 정렬
    const monthlyDiaries = useMemo(() => {
        const targetMonth = format(currentMonth, 'yyyy-MM');
        return diaries
            .filter(d => d.date.startsWith(targetMonth))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [diaries, currentMonth]);

    // 2. 배경 이미지 (첫 번째 사진 or 기본 그라데이션)
    const coverImage = useMemo(() => {
        const diaryWithImage = monthlyDiaries.find(d => d.imageUrl);
        return diaryWithImage ? `http://localhost:8080${diaryWithImage.imageUrl}` : null;
    }, [monthlyDiaries]);

    // 3. 대표 이모지
    const topEmoji = useMemo(() => {
        if (monthlyDiaries.length === 0) return '😶';
        const counts = {};
        monthlyDiaries.forEach(d => { counts[d.emoji] = (counts[d.emoji] || 0) + 1; });
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }, [monthlyDiaries]);

    // 4. [New] 행복 키워드 분석 (Mood 4점 이상 태그)
    const happinessKeywords = useMemo(() => {
        const tags = {};
        monthlyDiaries
            .filter(d => d.mood >= 4) // 기분 좋은 날만
            .forEach(d => {
                if (Array.isArray(d.tags)) {
                    d.tags.forEach(t => tags[t] = (tags[t] || 0) + 1);
                }
            });
        return Object.entries(tags)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3); // Top 3
    }, [monthlyDiaries]);

    // 5. [New] AI 월간 총평 (간단한 로직으로 생성)
    const monthlyComment = useMemo(() => {
        const count = monthlyDiaries.length;
        if (count === 0) return "아직 기록이 없어서 분석할 수 없어요. 첫 일기를 써보세요!";

        const avgMood = monthlyDiaries.reduce((sum, d) => sum + (d.mood || 3), 0) / count;

        if (avgMood >= 4) return "이번 달은 정말 긍정적인 에너지가 가득했네요! 웃음이 끊이지 않았던 한 달, 이 기운을 다음 달까지 쭉 이어가 볼까요? 🥰";
        if (avgMood >= 3) return "무난하고 평온한 일상을 보내셨군요. 소소한 행복들을 놓치지 않고 기록한 당신, 아주 칭찬해요! 🍵";
        return "조금 지치고 힘든 날들이 있었나 봐요. 하지만 기록하며 마음을 다독인 것만으로도 대단해요. 다음 달엔 더 좋은 일이 생길 거예요! 💪";
    }, [monthlyDiaries]);

    return (
        <div className="report-container animate-fade-in">
            {/* --- [1] 상단 앨범 커버 (클릭 시 타임라인 토글) --- */}
            <div
                className={`monthly-cover-card ${showTimeline ? 'minimized' : ''}`}
                onClick={() => setShowTimeline(!showTimeline)}
                style={{
                    backgroundImage: coverImage
                        ? `url(${coverImage})`
                        : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' // 파스텔톤 변경
                }}
            >
                <div className="cover-overlay">
                    <div className="cover-header">
                        <span className="cover-year">{format(currentMonth, 'yyyy')}</span>
                        <span className="cover-month">{format(currentMonth, '.MM')}</span>
                    </div>

                    <div className="cover-footer">
                        {!showTimeline && (
                            <div className="click-guide-badge">
                                👆 카드를 눌러 타임라인 보기
                            </div>
                        )}
                        <h3 className="cover-title">
                            {monthlyDiaries.length > 0 ? "당신의 찬란한 순간들 ✨" : "기록을 시작해보세요"}
                        </h3>
                    </div>
                </div>
            </div>

            {/* --- [2] 컨텐츠 영역 (조건부 렌더링) --- */}
            <div className="report-content-area">
                {!showTimeline ? (
                    /* A. 요약 화면 (키워드 + 총평) */
                    <div className="summary-view animate-slide-up">
                        {/* 행복 키워드 카드 */}
                        <div className="summary-card">
                            <MoodGraph diaries={diaries} currentMonth={currentMonth} />
                        </div>
                        
                        <div className="summary-card">
                            <h4 className="card-title"><FaHashtag style={{ color: '#FF6B6B' }} /> 이달의 행복 키워드</h4>
                            <div className="keyword-list">
                                {happinessKeywords.length > 0 ? (
                                    happinessKeywords.map(([tag, count], idx) => (
                                        <span key={idx} className="keyword-chip">
                                            #{tag} <span className="count">{count}</span>
                                        </span>
                                    ))
                                ) : (
                                    <p className="no-data-text">행복했던 날의 태그가 아직 없어요 🥲</p>
                                )}
                            </div>
                        </div>

                        {/* AI 총평 카드 */}
                        <div className="summary-card ai-card">
                            <h4 className="card-title"><FaRobot style={{ color: '#6C5CE7' }} /> CodeStory의 월간 총평</h4>
                            <p className="ai-text">
                                "{monthlyComment}"
                            </p>
                            <div className="ai-decoration">💌</div>
                        </div>
                    </div>
                ) : (
                    /* B. 타임라인 화면 */
                    <div className="timeline-view animate-slide-up">
                        <div className="timeline-header-actions">
                            <button className="back-btn-text" onClick={() => setShowTimeline(false)}>
                                <FaArrowLeft /> 요약으로 돌아가기
                            </button>
                        </div>

                        <div className="timeline-list">
                            {monthlyDiaries.length > 0 ? (
                                monthlyDiaries.map((diary) => (
                                    <div key={diary.id} className="timeline-item">
                                        <div className="timeline-left">
                                            <span className="day-num">{format(parseISO(diary.date), 'dd')}</span>
                                            <span className="day-week">{format(parseISO(diary.date), 'EEEE', { locale: ko })}</span>
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
    );
};

export default MonthlyReport;