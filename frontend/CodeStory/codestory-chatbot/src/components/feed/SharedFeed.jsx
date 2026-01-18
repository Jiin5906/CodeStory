import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaFire, FaComment, FaUser, FaHeart, FaClock } from 'react-icons/fa';
import { diaryApi } from '../../services/api';

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

    // 감정별 그라디언트 매핑
    const getEmotionGradient = (mood) => {
        const moodScore = mood || 5;
        if (moodScore >= 8) return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fb923c 100%)';
        if (moodScore >= 6) return 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #14b8a6 100%)';
        if (moodScore >= 4) return 'linear-gradient(135deg, #64748b 0%, #475569 50%, #3b82f6 100%)';
        if (moodScore >= 2) return 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #6366f1 100%)';
        return 'linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #8b5cf6 100%)';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f1729] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#fbbf24] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f1729] flex items-center justify-center text-red-400">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f1729] pb-20 text-sans">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-[#0f1729]/95 backdrop-blur-xl border-b border-[#1e3a5f]/50">
                <div className="max-w-7xl mx-auto px-4 pt-6 pb-4">
                    <h1 className="text-3xl font-bold text-[#fef3c7] mb-1 font-serif">감정 갤러리</h1>
                    <p className="text-[#94a3b8] text-sm mb-6">오늘 다른 사람들의 하루는 어땠을까요?</p>
                    
                    {/* Tabs */}
                    <div className="flex gap-2">
                        {[
                            { id: 'all', label: '전체', icon: <FaFire /> },
                            { id: 'popular', label: '인기', icon: <FaHeart /> },
                            { id: 'following', label: '팔로잉', icon: <FaUser /> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    activeTab === tab.id 
                                    ? 'bg-[#fbbf24] text-[#0f1729] shadow-lg shadow-amber-500/20' 
                                    : 'bg-[#1e293b] text-[#94a3b8] hover:bg-[#334155]'
                                }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid Feed */}
            <div className="max-w-7xl mx-auto px-4 mt-6">
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
                {feedList.length === 0 && (
                    <div className="text-center py-20 text-[#64748b]">
                        아직 공유된 일기가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

// Feed Card Component
const FeedCard = ({ diary, index, getEmotionGradient }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    // Masonry-like height variation based on index
    const heightClass = index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square';

    return (
        <div 
            className={`group relative rounded-2xl overflow-hidden cursor-pointer bg-[#1e293b] shadow-lg transition-transform duration-300 hover:-translate-y-1 ${heightClass}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Background: Image or Gradient */}
            <div className="absolute inset-0 w-full h-full">
                {diary.imageUrl ? (
                    <img 
                        src={diary.imageUrl} 
                        alt="Diary" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div 
                        className="w-full h-full flex items-center justify-center p-6"
                        style={{ background: getEmotionGradient(diary.mood) }}
                    >
                        <p className="text-white/90 text-sm font-medium line-clamp-4 text-center leading-relaxed">
                            {diary.content}
                        </p>
                    </div>
                )}
                {/* Dark Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            </div>

            {/* Top Badge: Date & Mood */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                    <FaClock className="text-white/70 text-[10px]" />
                    <span className="text-white text-[10px] font-medium">
                        {diary.date ? format(new Date(diary.date), 'MM.dd', { locale: ko }) : 'Today'}
                    </span>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl drop-shadow-md filter">{diary.emoji || '😊'}</span>
                    <div className="flex flex-col">
                        <span className="text-white text-sm font-bold truncate pr-2 shadow-black drop-shadow-md">
                            {diary.nickname || '익명'}
                        </span>
                        <span className="text-white/60 text-[10px] font-light">
                            기분 점수 {diary.mood || 5}점
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-white/80 text-xs">
                    <div className="flex items-center gap-1">
                        <FaFire className="text-amber-400" />
                        <span>{Math.floor(Math.random() * 50)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <FaComment className="text-blue-400" />
                        <span>{Math.floor(Math.random() * 10)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SharedFeed;