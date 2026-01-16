import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { diaryApi } from '../../services/api'; // [핵심] api.js import
import './SharedFeed.css'; // CSS 파일이 있다면 유지

const SharedFeed = () => {
    const [feedList, setFeedList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadFeed();
    }, []);

    const loadFeed = async () => {
        try {
            setLoading(true);
            const data = await diaryApi.getFeed(); 
            setFeedList(data);
        } catch (err) {
            console.error("피드 불러오기 실패:", err);
            setError('공유된 일기를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="feed-loading">일기들을 불러오고 있어요... 📡</div>;
    if (error) return <div className="feed-error">{error}</div>;

    return (
        <div className="shared-feed-container">
            <h2 className="feed-title">🌏 모두의 일기장</h2>
            <p className="feed-subtitle">다른 사람들은 오늘 어떤 하루를 보냈을까요?</p>

            <div className="feed-list">
                {feedList.length === 0 ? (
                    <div className="empty-feed">
                        <p>아직 공유된 일기가 없어요.</p>
                        <span>내 일기를 '공유하기'로 바꿔보세요!</span>
                    </div>
                ) : (
                    feedList.map((diary) => (
                        <div key={diary.id} className="feed-card">
                            <div className="feed-header">
                                <span className="feed-user">{diary.nickname || '익명'}님의 하루</span>
                                <span className="feed-date">
                                    {format(new Date(diary.date), 'M월 d일', { locale: ko })}
                                </span>
                            </div>
                            
                            {/* 이미지 경로 수정: http... 제거하고 상대 경로 사용 */}
                            {diary.imageUrl && (
                                <div className="feed-image-wrapper">
                                    <img src={`${diary.imageUrl}`} alt="Shared Diary" />
                                </div>
                            )}

                            <div className="feed-content">
                                <div className="feed-mood">
                                    <span className="emoji">{diary.emoji}</span>
                                    <span className="mood-text">기분 {diary.mood}점</span>
                                </div>
                                <p className="feed-text">{diary.content}</p>
                            </div>
                            
                            {/* 태그 표시 */}
                            <div className="feed-tags">
                                {diary.tags?.map((tag, index) => (
                                    <span key={index} className="tag">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SharedFeed;