import React, { useEffect, useState } from 'react';
import './SharedFeed.css'; // CSS 파일 필요 (아래 제공)

const SharedFeed = () => {
    const [feedList, setFeedList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        try {
            // 백엔드 API 호출 (GET /api/feed)
            const response = await fetch('http://localhost:8080/api/feed');
            if (response.ok) {
                const data = await response.json();
                setFeedList(data);
            }
        } catch (error) {
            console.error("피드 불러오기 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>로딩 중... ⏳</div>;

    return (
        <div className="feed-container animate-fade-in">
            <h2 className="feed-title">🌏 모두의 감정 저장소</h2>
            <p className="feed-subtitle">다른 사람들의 하루를 통해 위로를 얻어보세요.</p>

            <div className="feed-list">
                {feedList.length > 0 ? (
                    feedList.map((diary) => (
                        <div key={diary.id} className="feed-card">
                            {/* 작성자 정보 */}
                            <div className="feed-header">
                                <div className="user-avatar">👤</div>
                                <div className="user-info">
                                    <span className="username">익명의 사용자 {diary.userId}</span>
                                    <span className="date">{diary.date}</span>
                                </div>
                            </div>

                            {/* 이미지 (있으면 표시) */}
                            {diary.imageUrl && (
                                <div className="feed-image-wrapper">
                                    <img 
                                        src={`http://localhost:8080${diary.imageUrl}`} 
                                        alt="diary-img" 
                                        className="feed-image" 
                                        onError={(e) => e.target.style.display = 'none'} // 이미지 깨짐 방지
                                    />
                                </div>
                            )}

                            {/* 내용 */}
                            <div className="feed-content">
                                <div className="mood-badge">기분 {diary.mood}/5 {diary.emoji}</div>
                                <p className="content-text">{diary.content}</p>
                                <div className="tags">
                                    {diary.tags?.map((tag, idx) => (
                                        <span key={idx} className="hashtag">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-feed">
                        <p>아직 공유된 일기가 없어요. 가장 먼저 공유해보세요! 🙌</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SharedFeed;