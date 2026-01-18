import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaFire, FaComment, FaUser, FaHeart, FaClock } from 'react-icons/fa';
import { diaryApi } from '../../services/api';

const SharedFeed = () => {
    const [feedList, setFeedList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'following', 'popular', 'all'

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

    // 감정별 그라디언트 매핑 (텍스트 일기용 배경 - 라이트 모드에 맞는 파스텔 톤)
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            {/* Header Section */}
            <div className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 pt-6 pb-4">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-1">감정 갤러리</h1>
                            <p className="text-slate-500 text-sm">오늘 다른 사람들의 하루는 어땠을까요?</p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                        {[
                            { id: 'all', label: '전체', icon: <FaFire /> },
                            { id: 'popular', label: '인기', icon: <FaHeart /> },
                            { id: 'following', label: '팔로잉', icon: <FaUser /> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                                    ${activeTab === tab.id 
                                        ? 'bg-violet-600 text-white shadow-md shadow-violet-200' 
                                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                                    }
                                `}
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
            <div className="max-w-7xl mx-auto px-4 mt-6">
                {feedList.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm mt-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaComment className="text-3xl text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">아직 공유된 일기가 없어요</h3>
                        <p className="text-slate-500">가장 먼저 일기를 공유해보세요!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
    const heightClass = index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square';

    return (
        <div 
            className={`group relative rounded-2xl overflow-hidden cursor-pointer bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-slate-100 ${heightClass}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            data-gtm={`shared-feed-card-click-${diary.id}`}
        >
            {/* Background: Image or Gradient */}
            <div className="absolute inset-0 w-full h-full">
                {diary.imageUrl ? (
                    <>
                        <img 
                            src={diary.imageUrl} 
                            alt="Diary" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            data-gtm="shared-feed-image-view"
                        />
                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />
                    </>
                ) : (
                    <div 
                        className="w-full h-full flex items-center justify-center p-6 relative overflow-hidden"
                        style={{ background: getEmotionGradient(diary.mood) }}
                    >
                        {/* Decorative Circle */}
                        <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                        
                        <p className="text-white font-medium text-sm text-center leading-relaxed line-clamp-5 drop-shadow-md relative z-10">
                            "{diary.content}"
                        </p>
                    </div>
                )}
            </div>

            {/* Top Badge: Date */}
            <div className="absolute top-3 left-3 z-10">
                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
                    <FaClock className="text-white text-[10px]" />
                    <span className="text-white text-[10px] font-semibold tracking-wide">
                        {diary.date ? format(new Date(diary.date), 'MM.dd', { locale: ko }) : 'Today'}
                    </span>
                </div>
            </div>

            {/* Bottom Info Area */}
            <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300 z-10">
                <div className="flex items-center gap-2 mb-2">
                    {/* Emoji Bubble */}
                    <div 
                        className="bg-white/20 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center border border-white/10 shadow-sm"
                        data-gtm="shared-feed-mood-badge"
                    >
                        <span className="text-lg filter drop-shadow-sm">{diary.emoji || '😊'}</span>
                    </div>
                    
                    <div className="flex flex-col text-white">
                        <span className="text-sm font-bold truncate shadow-black drop-shadow-md leading-tight">
                            {diary.nickname || '익명'}
                        </span>
                        <span className="text-[10px] opacity-90 font-medium">
                            기분 온도 {diary.mood ? diary.mood * 10 : 50}°C
                        </span>
                    </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-3 text-white/90 text-xs font-medium pl-1">
                    <button 
                        className="flex items-center gap-1 group/btn hover:text-white transition-colors"
                        data-gtm={`shared-feed-like-click-${diary.id}`}
                    >
                        <FaFire className="text-orange-400 drop-shadow-sm group-hover/btn:scale-110 transition-transform" />
                        <span>{Math.floor(Math.random() * 50)}</span>
                    </button>
                    <button 
                        className="flex items-center gap-1 group/btn hover:text-white transition-colors"
                        data-gtm={`shared-feed-comment-click-${diary.id}`}
                    >
                        <FaComment className="text-blue-300 drop-shadow-sm group-hover/btn:scale-110 transition-transform" />
                        <span>{Math.floor(Math.random() * 10)}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SharedFeed;