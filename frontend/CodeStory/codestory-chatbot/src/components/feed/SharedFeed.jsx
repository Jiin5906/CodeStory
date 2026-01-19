import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaFire, FaComment, FaUser, FaHeart, FaClock } from 'react-icons/fa';
import { diaryApi } from '../../services/api';
import './SharedFeed.css';

const SharedFeed = () => {
    const [feedList, setFeedList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all');

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

    // 감정별 그라디언트 매핑 (라이트 모드용 파스텔 톤)
    const getEmotionGradient = (mood) => {
        const moodScore = mood || 5;
        if (moodScore >= 8) return 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)'; // Violet (Happy)
        if (moodScore >= 6) return 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'; // Blue (Content)
        if (moodScore >= 4) return 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'; // Slate (Neutral)
        if (moodScore >= 2) return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'; // Amber (Sad/Warm)
        return 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)'; // Red (Angry/Very Sad)
    };

    if (loading) {
        return (
            <div className="feed-loading-container">
                <div className="feed-loading-spinner"></div>
                <p className="feed-loading-text">일기들을 불러오고 있어요...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="feed-error-container">
                <p className="feed-error-text">{error}</p>
            </div>
        );
    }

    return (
        <div className="shared-feed-wrapper">
            {/* Header Section */}
            <div className="feed-header-sticky">
                <div className="feed-header-content">
                    {/* Title */}
                    <div className="feed-header-title-section">
                        <div>
                            <h1 className="feed-main-title">감정 갤러리</h1>
                            <p className="feed-subtitle">오늘 다른 사람들의 하루는 어땠을까요?</p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="feed-tab-container">
                        {[
                            { id: 'all', label: '전체', icon: <FaFire /> },
                            { id: 'popular', label: '인기', icon: <FaHeart /> },
                            { id: 'following', label: '팔로잉', icon: <FaUser /> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`feed-tab-button ${activeTab === tab.id ? 'active' : ''}`}
                                data-gtm={`shared-feed-tab-click-${tab.id}`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Feed Grid */}
            <div className="feed-grid-container">
                {feedList.length === 0 ? (
                    <div className="feed-empty-state" data-gtm="shared-feed-empty-state">
                        <div className="feed-empty-icon">
                            <FaComment />
                        </div>
                        <h3 className="feed-empty-title">아직 공유된 일기가 없어요</h3>
                        <p className="feed-empty-subtitle">가장 먼저 일기를 공유해보세요!</p>
                    </div>
                ) : (
                    <div className="feed-grid">
                        {feedList.map((diary, index) => (
                            <FeedCard
                                key={diary.id}
                                diary={diary}
                                index={index}
                                getEmotionGradient={getEmotionGradient}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Feed Card Component
const FeedCard = ({ diary, index, getEmotionGradient }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Masonry-like height variation
    const heightClass = index % 3 === 0 ? 'card-height-tall' : 'card-height-square';

    return (
        <div
            className={`feed-card ${heightClass}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            data-gtm={`shared-feed-card-click-${diary.id}`}
        >
            {/* Background: Image or Gradient */}
            <div className="feed-card-background">
                {diary.imageUrl ? (
                    <>
                        <img
                            src={diary.imageUrl}
                            alt="Diary"
                            className={`feed-card-image ${isHovered ? 'hovered' : ''}`}
                            data-gtm="shared-feed-image-view"
                        />
                        {/* Gradient Overlay for Text Readability */}
                        <div className={`feed-card-overlay ${isHovered ? 'hovered' : ''}`} />
                    </>
                ) : (
                    <div
                        className="feed-card-gradient"
                        style={{ background: getEmotionGradient(diary.mood) }}
                    >
                        {/* Decorative Circle */}
                        <div className="feed-card-gradient-circle" />

                        <p className="feed-card-content-text">
                            "{diary.content}"
                        </p>
                    </div>
                )}
            </div>

            {/* Top Badge: Date */}
            <div className="feed-card-date-badge">
                <FaClock className="feed-card-date-icon" />
                <span className="feed-card-date-text">
                    {diary.date ? format(new Date(diary.date), 'MM.dd', { locale: ko }) : 'Today'}
                </span>
            </div>

            {/* Bottom Info Area */}
            <div className="feed-card-info">
                <div className="feed-card-author">
                    {/* Emoji Bubble */}
                    <div
                        className="feed-card-emoji-bubble"
                        data-gtm="shared-feed-mood-badge"
                    >
                        <span>{diary.emoji || '😊'}</span>
                    </div>

                    <div className="feed-card-author-details">
                        <span className="feed-card-author-name">
                            {diary.anonymous ? '익명' : (diary.nickname || '익명')}
                        </span>
                        <span className="feed-card-mood-temp">
                            기분 온도 {diary.mood ? diary.mood * 10 : 50}°C
                        </span>
                    </div>
                </div>

                {/* Metrics */}
                <div className="feed-card-metrics">
                    <button
                        className="feed-card-metric-button"
                        data-gtm={`shared-feed-like-click-${diary.id}`}
                    >
                        <FaFire className="metric-icon fire" />
                        <span>{Math.floor(Math.random() * 50)}</span>
                    </button>
                    <button
                        className="feed-card-metric-button"
                        data-gtm={`shared-feed-comment-click-${diary.id}`}
                    >
                        <FaComment className="metric-icon comment" />
                        <span>{Math.floor(Math.random() * 10)}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SharedFeed;
