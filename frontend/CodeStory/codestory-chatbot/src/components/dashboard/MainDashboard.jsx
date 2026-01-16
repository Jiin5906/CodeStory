import React from 'react';
import { format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaTrash, FaGlobe, FaLock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './MainDashboard.css';

const MainDashboard = ({ user, diaries, selectedDate, onDateChange }) => {

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
                const res = await fetch(`http://localhost:8080/api/diary/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    alert('삭제되었습니다.');
                    window.location.reload();
                }
            } catch (e) { console.error(e); }
        }
    };

    const handleToggleShare = async (id, currentStatus) => {
        try {
            const res = await fetch(`http://localhost:8080/api/diary/${id}/status`, {
                method: 'POST'
            });

            if (res.ok) {
                const willBePublic = !currentStatus;
                alert(willBePublic ? '커뮤니티에 공유되었습니다! 🌏' : '나만 보기로 변경되었습니다. 🔒');
                window.location.reload();
            } else {
                const errorText = await res.text();
                console.error("공유 실패:", errorText);
                alert("상태 변경 실패. 서버 로그를 확인해주세요.");
            }
        } catch (e) {
            console.error(e);
            alert("서버 연결 실패");
        }
    };

    return (
        <div className="dashboard-container">
            <div className="date-navigation-header">
                <h2 className="month-title">{format(selectedDate, 'yyyy.MM')}</h2>
                <div className="user-badge">{user?.nickname || '게스트'}님 ➜</div>
            </div>

            <div className="weekly-calendar-strip">
                <button onClick={() => changeDate(-1)} className="nav-arrow"><FaChevronLeft /></button>
                <div className="date-center">
                    <span className="big-day">{format(selectedDate, 'd')}</span>
                    <span className="day-label">{format(selectedDate, 'EEEE', { locale: ko })}</span>
                </div>
                <button onClick={() => changeDate(1)} className="nav-arrow"><FaChevronRight /></button>
            </div>

            <div className="diary-list-section">
                <h4 className="section-title">{user?.nickname}님의 하루</h4>

                {dailyDiaries.length > 0 ? (
                    <div className="diary-cards">
                        {dailyDiaries.map((diary) => (
                            <div key={diary.id} className="diary-card">
                                <div className="card-header">
                                    <div className="mood-info">
                                        <span className="mood-emoji">{diary.emoji}</span>
                                        <span className="mood-score">기분 {diary.mood}점</span>
                                    </div>

                                    <div className="card-actions">
                                        {/* [최종 확인] diary.shared 사용 */}
                                        <button
                                            className={`action-btn share-btn ${diary.shared ? 'active' : ''}`}
                                            onClick={() => handleToggleShare(diary.id, diary.shared)}
                                            title={diary.shared ? "클릭하면 비공개로 전환됩니다" : "클릭하면 커뮤니티에 공유됩니다"}
                                        >
                                            {diary.shared ? (
                                                <><FaGlobe /> 공유 중</>
                                            ) : (
                                                <><FaLock /> 공유하기</>
                                            )}
                                        </button>

                                        <button
                                            className="action-btn delete-btn"
                                            onClick={() => handleDelete(diary.id)}
                                            title="일기 삭제"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>

                                <div className="card-body">
                                    {diary.imageUrl && (
                                        <div className="diary-img-wrapper">
                                            <img src={`http://localhost:8080${diary.imageUrl}`} alt="diary" />
                                        </div>
                                    )}
                                    <p className="diary-text">{diary.content}</p>

                                    {diary.aiResponse && (
                                        <div className="ai-comment-box">
                                            <span className="ai-label">❝ CodeStory의 공감</span>
                                            <p className="ai-text">{diary.aiResponse}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="card-footer">
                                    {diary.tags?.map((tag, idx) => (
                                        <span key={idx} className="tag">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
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