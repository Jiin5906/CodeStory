import React from 'react';
import { format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaTrash, FaGlobe, FaLock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './MainDashboard.css';
import { diaryApi } from '../../services/api'; // [핵심] api.js import 확인

const MainDashboard = ({ user, diaries, selectedDate, onDateChange, onRefresh }) => {

    const dailyDiaries = diaries
        .filter(d => isSameDay(new Date(d.date), selectedDate))
        .sort((a, b) => b.id - a.id);

    const changeDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        onDateChange(newDate);
    };

    // [수정] localhost fetch 제거 -> diaryApi.deleteDiary 사용
    const handleDelete = async (id) => {
        if (window.confirm('정말 이 일기를 삭제하시겠습니까?')) {
            try {
                await diaryApi.deleteDiary(id);
                alert('삭제되었습니다.');
                
                // 목록 새로고침 (App.jsx에서 받은 함수가 있으면 쓰고, 없으면 강제 리로드)
                if (onRefresh) onRefresh();
                else window.location.reload();
                
            } catch (e) {
                console.error("삭제 실패:", e);
                alert("삭제 중 오류가 발생했습니다.");
            }
        }
    };

    // [수정] localhost fetch 제거 -> diaryApi.toggleShare 사용
    const handleToggleShare = async (id, currentStatus) => {
        try {
            // api.js를 통해 서버 요청 (주소 문제 해결됨)
            await diaryApi.toggleShare(id);

            const willBePublic = !currentStatus;
            alert(willBePublic ? '커뮤니티에 공유되었습니다! 🌏' : '나만 보기로 변경되었습니다. 🔒');
            
            // 목록 새로고침
            if (onRefresh) onRefresh();
            else window.location.reload();

        } catch (e) {
            console.error("공유 상태 변경 실패:", e);
            alert("서버 연결 실패: 관리자에게 문의하세요.");
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
                                        <button
                                            className={`action-btn share-btn ${diary.isPublic ? 'active' : ''}`}
                                            onClick={() => handleToggleShare(diary.id, diary.isPublic)}
                                            title={diary.isPublic ? "클릭하면 비공개로 전환됩니다" : "클릭하면 커뮤니티에 공유됩니다"}
                                        >
                                            {diary.isPublic ? (
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
                                            {/* [수정] http://localhost:8080 제거! 상대 경로 사용 */}
                                            {/* 백엔드가 imageUrl에 '/images/파일명' 형태로 준다면 그대로 사용 */}
                                            <img src={`${diary.imageUrl}`} alt="diary" />
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