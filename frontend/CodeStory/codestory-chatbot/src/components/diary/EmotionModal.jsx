import { useState, useEffect } from 'react';
import { FaTimes, FaCheck } from 'react-icons/fa';

const EmotionModal = ({ onClose, onSave }) => {
    const [selectedEmoji, setSelectedEmoji] = useState('🙂');
    
    // [수정] 감정 수치 상태 (0~5점 척도)
    const [stats, setStats] = useState({
        mood: 3,    // 기분
        tension: 3, // 텐션
        fun: 3      // 활동성/재미
    });

    const emotions = [
        { icon: '🥰', label: '행복', preset: { mood: 5, tension: 4, fun: 4 } },
        { icon: '🙂', label: '평범', preset: { mood: 3, tension: 3, fun: 3 } },
        { icon: '😫', label: '피곤', preset: { mood: 2, tension: 1, fun: 1 } },
        { icon: '😢', label: '우울', preset: { mood: 1, tension: 2, fun: 1 } },
        { icon: '🔥', label: '열정', preset: { mood: 5, tension: 5, fun: 5 } },
    ];

    // [핵심 기능] 이모지 변경 시 기본값 자동 적용
    const handleEmojiClick = (emotion) => {
        setSelectedEmoji(emotion.icon);
        setStats(emotion.preset);
    };

    const handleSliderChange = (key, value) => {
        setStats(prev => ({ ...prev, [key]: parseInt(value) }));
    };

    const handleSave = () => {
        onSave({
            emoji: selectedEmoji,
            ...stats
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[30px] p-8 shadow-2xl relative">
                
                <h2 className="text-xl font-bold text-center mb-6 text-gray-800">오늘의 감정은 어떤가요?</h2>
                
                {/* 1. 이모티콘 선택 */}
                <div className="flex justify-between mb-8 px-2">
                    {emotions.map((em) => (
                        <div 
                            key={em.label}
                            className={`flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-110 ${selectedEmoji === em.icon ? 'scale-110' : 'opacity-60'}`}
                            onClick={() => handleEmojiClick(em)}
                        >
                            <span className="text-4xl drop-shadow-md">{em.icon}</span>
                            <span className={`text-xs font-bold ${selectedEmoji === em.icon ? 'text-[#6C5CE7]' : 'text-gray-400'}`}>
                                {em.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* 2. 세부 수치 조절 (슬라이더) */}
                <div className="space-y-5 mb-8 bg-gray-50 p-5 rounded-2xl">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs font-bold text-gray-500">
                            <span>기분 (Mood)</span>
                            <span className="text-[#6C5CE7]">{stats.mood}</span>
                        </div>
                        <input 
                            type="range" min="1" max="5" 
                            value={stats.mood} 
                            onChange={(e) => handleSliderChange('mood', e.target.value)}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#6C5CE7]"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs font-bold text-gray-500">
                            <span>텐션 (Tension)</span>
                            <span className="text-[#6C5CE7]">{stats.tension}</span>
                        </div>
                        <input 
                            type="range" min="1" max="5" 
                            value={stats.tension} 
                            onChange={(e) => handleSliderChange('tension', e.target.value)}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#6C5CE7]"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs font-bold text-gray-500">
                            <span>재미 (Fun)</span>
                            <span className="text-[#6C5CE7]">{stats.fun}</span>
                        </div>
                        <input 
                            type="range" min="1" max="5" 
                            value={stats.fun} 
                            onChange={(e) => handleSliderChange('fun', e.target.value)}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#6C5CE7]"
                        />
                    </div>
                </div>

                {/* 버튼 */}
                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200"
                    >
                        취소
                    </button>
                    <button 
                        onClick={handleSave}
                        className="flex-[2] py-3 rounded-xl bg-[#6C5CE7] text-white font-bold hover:bg-[#5a4ad1] shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                        <span>저장하기</span> <FaCheck />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default EmotionModal;