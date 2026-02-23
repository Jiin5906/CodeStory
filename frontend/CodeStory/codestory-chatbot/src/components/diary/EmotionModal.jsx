import React, { useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import MongleIcon from '../common/MongleIcons';

const EmotionModal = ({ onClose, onSave }) => {
    const [selectedIcon, setSelectedIcon] = useState('faceNeutral');

    const [stats, setStats] = useState({
        mood: 3,    // 기분
        tension: 3, // 텐션
        fun: 3      // 활동성/재미
    });

    const emotions = [
        { icon: 'faceHappy', label: '행복', id: 'happy', preset: { mood: 5, tension: 4, fun: 4 } },
        { icon: 'faceNeutral', label: '평범', id: 'neutral', preset: { mood: 3, tension: 3, fun: 3 } },
        { icon: 'faceTired', label: '피곤', id: 'tired', preset: { mood: 2, tension: 1, fun: 1 } },
        { icon: 'faceSad', label: '우울', id: 'sad', preset: { mood: 1, tension: 2, fun: 1 } },
        { icon: 'fire', label: '열정', id: 'passionate', preset: { mood: 5, tension: 5, fun: 5 } },
    ];

    const handleEmojiClick = (emotion) => {
        setSelectedIcon(emotion.icon);
        setStats(emotion.preset);
    };

    const handleSliderChange = (key, value) => {
        setStats(prev => ({ ...prev, [key]: parseInt(value) }));
    };

    const handleSave = () => {
        onSave({
            emoji: selectedIcon,
            ...stats
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" data-gtm="view-emotion-modal">
            <div className="bg-white w-full max-w-sm rounded-[30px] p-8 shadow-2xl relative">
                
                <h2 className="text-xl font-bold text-center mb-6 text-gray-800">오늘의 감정은 어떤가요?</h2>
                
                {/* 1. 이모티콘 선택 - 각 이모지별로 고유한 값을 부여했습니다 */}
                <div className="flex justify-between mb-8 px-2">
                    {emotions.map((em) => (
                        <div
                            key={em.label}
                            className={`flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-110 ${selectedIcon === em.icon ? 'scale-110' : 'opacity-60'}`}
                            onClick={() => handleEmojiClick(em)}
                            data-gtm={`emotion-select-${em.id}`}
                        >
                            <span className="drop-shadow-md pointer-events-none">
                                <MongleIcon name={em.icon} size={36} />
                            </span>
                            <span className={`text-xs font-bold pointer-events-none ${selectedIcon === em.icon ? 'text-[#6C5CE7]' : 'text-gray-400'}`}>
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
                            data-gtm="slider-mood-adjust"
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
                            data-gtm="slider-tension-adjust"
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
                            data-gtm="slider-fun-adjust"
                        />
                    </div>
                </div>

                {/* 버튼 */}
                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200"
                        data-gtm="btn-emotion-cancel"
                    >
                        취소
                    </button>
                    <button 
                        onClick={handleSave}
                        className="flex-[2] py-3 rounded-xl bg-[#6C5CE7] text-white font-bold hover:bg-[#5a4ad1] shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                        data-gtm="btn-emotion-save"
                    >
                        <span>저장하기</span> <FaCheck />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default EmotionModal;