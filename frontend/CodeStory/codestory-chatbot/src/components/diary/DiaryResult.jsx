import { format } from 'date-fns';
import { FaHome, FaQuoteLeft } from 'react-icons/fa';

const DiaryResult = ({ data, onHome }) => {
    // 감정에 따른 배경색 (채도 낮춘 버전)
    const getMoodColor = (val) => {
        if (val > 0) return 'text-green-400';
        if (val < 0) return 'text-red-400';
        return 'text-zinc-400';
    };

    return (
        <div 
            className="flex flex-col h-full animate-fade-in-up max-w-2xl mx-auto w-full"
            data-gtm="view-diary-result-page"
        >
            <h2 className="text-2xl font-serif text-center mb-8 text-white">
                {format(new Date(data.date), 'M월 d일')}의 기록
            </h2>

            <div 
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
                data-gtm="result-card-container"
            >
                {/* 상단: 감정 요약 */}
                <div 
                    className="flex justify-between items-start mb-6 border-b border-zinc-800 pb-4"
                    data-gtm="result-sentiment-summary"
                >
                    <div className="text-4xl" data-gtm="result-emoji">{data.emoji}</div>
                    <div className="text-right text-sm space-y-1">
                        <p><span className="text-zinc-500">Tension:</span> <span className={getMoodColor(data.tension)} data-gtm="result-stat-tension">{data.tension}</span></p>
                        <p><span className="text-zinc-500">Mood:</span> <span className={getMoodColor(data.mood)} data-gtm="result-stat-mood">{data.mood}</span></p>
                        <p><span className="text-zinc-500">Fun:</span> <span className={getMoodColor(data.fun)} data-gtm="result-stat-fun">{data.fun}</span></p>
                    </div>
                </div>

                {/* 본문 내용 */}
                <div className="mb-8" data-gtm="result-content-area">
                    <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed font-serif">
                        {data.content}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {data.tags?.map(tag => (
                            <span 
                                key={tag} 
                                className="text-xs text-pink-400"
                                data-gtm="result-tag-item"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* AI 포스트잇 (코멘트) */}
                <div 
                    className="bg-yellow-100/10 border border-yellow-200/20 p-4 rounded-xl relative transform rotate-1"
                    data-gtm="result-ai-comment-box"
                >
                    <FaQuoteLeft className="absolute top-2 left-2 text-yellow-500/30 text-xl" />
                    <p className="text-yellow-100/90 text-sm leading-relaxed pl-6 font-medium">
                        {data.aiResponse || "AI가 아직 생각을 정리하고 있어요..."}
                    </p>
                    <div className="text-right mt-2 text-xs text-yellow-500/50">- CodeStory AI -</div>
                </div>
            </div>

            <div className="mt-8 text-center">
                <button 
                    onClick={onHome}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-full flex items-center gap-2 mx-auto transition-all"
                    /* ✅ 홈으로 돌아가기 버튼 추적 */
                    data-gtm="result-home-button"
                >
                    <FaHome />
                    <span>홈으로 돌아가기</span>
                </button>
            </div>
        </div>
    );
};

export default DiaryResult;