import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { diaryApi } from '../../services/api';
import './SharedFeed.css';

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

    if (loading) return <div className="feed-loading" data-gtm="view-feed-loading">일기들을 불러오고 있어요... 📡</div>;
    if (error) return <div className="feed-error" data-gtm="view-feed-error">{error}</div>;

    return (
        <div className="shared-feed-container" data-gtm="view-shared-feed">
            <h2 className="feed-title">🌏 모두의 일기장</h2>
            <p className="feed-subtitle">다른 사람들은 오늘 어떤 하루를 보냈을까요?</p>

            <div className="feed-list">
                {feedList.length === 0 ? (
                    <div className="empty-feed" data-gtm="feed-empty-state">
                        <p>아직 공유된 일기가 없어요.</p>
                        <span>내 일기를 '공유하기'로 바꿔보세요!</span>
                    </div>
                ) : (
                    feedList.map((diary) => (
                        /* ✅ 각 피드 카드를 diary.id로 구분하여 친구가 특정 일기 클릭을 추적하기 쉽게 했습니다. */
                        <div key={diary.id} className="feed-card" data-gtm={`feed-card-item-${diary.id}`}>
                            <div className="feed-header">
                                <span className="feed-user" data-gtm="feed-item-nickname">{diary.nickname || '익명'}님의 하루</span>
                                <span className="feed-date">
                                    {format(new Date(diary.date), 'M월 d일', { locale: ko })}
                                </span>
                            </div>
                            
                            {diary.imageUrl && (
                                <div className="feed-image-wrapper" data-gtm="feed-item-image">
                                    <img src={`${diary.imageUrl}`} alt="Shared Diary" />
                                </div>
                            )}

                            <div className="feed-content">
                                <div className="feed-mood" data-gtm="feed-item-mood-badge">
                                    <span className="emoji">{diary.emoji}</span>
                                    <span className="mood-text">기분 {diary.mood}점</span>
                                </div>
                                <p className="feed-text" data-gtm="feed-item-content-text">{diary.content}</p>
                            </div>
                            
                            <div className="feed-tags">
                                {diary.tags?.map((tag, index) => (
                                    /* ✅ 태그 개별 식별 */
                                    <span key={index} className="tag" data-gtm="feed-item-tag-unit">#{tag}</span>
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