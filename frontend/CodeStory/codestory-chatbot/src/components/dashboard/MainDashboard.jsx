import React from 'react';
import { format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaTrash, FaGlobe, FaLock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './MainDashboard.css';
import { diaryApi } from '../../services/api';

const MainDashboard = ({ user, diaries, selectedDate, onDateChange, onRefresh }) => {

    const dailyDiaries = diaries
        .filter(d => isSameDay(new Date(d.date), selectedDate))
        .sort((a, b) => b.id - a.id);

    const changeDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        onDateChange(newDate);
    };

    const handleDelete = async (id) => {
        if (window.confirm('정말 이 일기를 삭제하시겠습니까?')) {
            try {
                await diaryApi.deleteDiary(id);
                alert('삭제되었습니다.');
                if (onRefresh) onRefresh();
                else window.location.reload();
            } catch (e) {
                console.error("삭제 실패:", e);
                alert("삭제 중 오류가 발생했습니다.");
            }
        }
    };

    const handleToggleShare = async (id, currentStatus) => {
        const confirmMessage = currentStatus
            ? "공유를 해제하시겠습니까?" 
            : "일기를 커뮤니티에 공유하시겠습니까?";

        if (!window.confirm(confirmMessage)) return;

        try {
            await diaryApi.toggleShare(id);
            if (onRefresh) onRefresh();
            else window.location.reload();
        } catch (e) {
            console.error("상태 변경 실패:", e);
            alert("서버 연결에 실패했습니다.");
        }
    };

    return (
        <div className="dashboard-container" data-gtm="view-dashboard">
            {/* 상단 헤더 영역 */}
            <div className="date-navigation-header">
                <h2 className="month-title">{format(selectedDate, 'yyyy.MM')}</h2>
                <div className="user-badge" data-gtm="dashboard-user-profile">
                    {user?.nickname || '게스트'}님 ➜
                </div>
            </div>

            {/* 날짜 이동 컨트롤 */}
            <div className="weekly-calendar-strip">
                <button 
                    onClick={() => changeDate(-1)} 
                    className="nav-arrow"
                    data-gtm="dashboard-prev-date"
                >
                    <FaChevronLeft />
                </button>
                <div className="date-center" data-gtm="dashboard-current-date-display">
                    <span className="big-day">{format(selectedDate, 'd')}</span>
                    <span className="day-label">{format(selectedDate, 'EEEE', { locale: ko })}</span>
                </div>
                <button 
                    onClick={() => changeDate(1)} 
                    className="nav-arrow"
                    data-gtm="dashboard-next-date"
                >
                    <FaChevronRight />
                </button>
            </div>

            {/* 일기 리스트 섹션 */}
            <div className="diary-list-section">
                <h4 className="section-title">{user?.nickname}님의 하루</h4>

                {dailyDiaries.length > 0 ? (
                    <div className="diary-cards">
                        {dailyDiaries.map((diary) => (
                            <div 
                                key={diary.id} 
                                className="diary-card"
                                data-gtm="dashboard-diary-card"
                                data-gtm-diary-id={diary.id}
                            >
                                <div className="card-header">
                                    <div className="mood-info" data-gtm="dashboard-mood-info">
                                        <span className="mood-emoji">{diary.emoji}</span>
                                        <span className="mood-score">기분 {diary.mood}점</span>
                                    </div>

                                    <div className="card-actions">
                                        {/* 공유 버튼 추적 */}
                                        <button
                                            className={`action-btn share-btn ${diary.shared ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleShare(diary.id, diary.shared);
                                            }}
                                            data-gtm="dashboard-share-toggle"
                                            data-gtm-current-status={diary.shared ? "shared" : "private"}
                                            title={diary.shared ? "클릭하여 공유 해제" : "클릭하여 공유하기"}
                                        >
                                            {diary.shared ? (
                                                <><span className="status-dot"></span>공유됨</>
                                            ) : (
                                                <><FaLock /> 공유하기</>
                                            )}
                                        </button>

                                        {/* 삭제 버튼 추적 */}
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={() => handleDelete(diary.id)}
                                            data-gtm="dashboard-delete-diary"
                                            title="일기 삭제"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>

                                <div className="card-body">
                                    {diary.imageUrl && (
                                        <div className="diary-img-wrapper" data-gtm="dashboard-diary-image">
                                            <img src={`${diary.imageUrl}`} alt="diary" />
                                        </div>
                                    )}
                                    <p className="diary-text">{diary.content}</p>

                                    {diary.aiResponse && (
                                        <div className="ai-comment-box" data-gtm="dashboard-ai-comment">
                                            <span className="ai-label">❝ CodeStory의 공감</span>
                                            <p className="ai-text">{diary.aiResponse}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="card-footer">
                                    {diary.tags?.map((tag, idx) => (
                                        <span key={idx} className="tag" data-gtm="dashboard-diary-tag">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* 일기가 없는 상태 추적 */
                    <div className="empty-state" data-gtm="dashboard-empty-state">
                        <div className="empty-icon">📝</div>
                        <p>작성된 일기가 없어요</p>
                        <span className="empty-sub">오늘의 감정을 기록해보세요!</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainDashboard;