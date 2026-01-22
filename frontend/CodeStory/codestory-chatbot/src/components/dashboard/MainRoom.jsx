import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import mongleAnimation from '../../assets/mongleIDLE.json';

const MainRoom = ({ latestLog, aiResponse, isAiThinking }) => {
    const navigate = useNavigate();
    const [floatingTexts, setFloatingTexts] = useState([]);
    const [showAiThought, setShowAiThought] = useState(false);

    // 1. 사용자가 글을 쓰면 -> 공기 중으로 흩어지는 애니메이션 (Visual Effect)
    useEffect(() => {
        if (!latestLog) return;

        const newId = Date.now();

        // 즉시 실행하지 않고 setTimeout을 사용하여 다음 틱에 실행
        const addTimer = setTimeout(() => {
            setFloatingTexts(prev => [...prev, { id: newId, text: latestLog }]);
        }, 0);

        // 3초 뒤에 텍스트 제거 (메모리 정리)
        const removeTimer = setTimeout(() => {
            setFloatingTexts(prev => prev.filter(item => item.id !== newId));
        }, 3000);

        return () => {
            clearTimeout(addTimer);
            clearTimeout(removeTimer);
        };
    }, [latestLog]);

    // 2. AI 답변이 도착하면 -> 생각 구름 표시
    useEffect(() => {
        if (aiResponse) {
            const showTimer = setTimeout(() => setShowAiThought(true), 0);
            // 3초 뒤에 구름 다시 숨기기 (여운 남기기)
            const hideTimer = setTimeout(() => setShowAiThought(false), 3000);
            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        } else {
            const timer = setTimeout(() => setShowAiThought(false), 0);
            return () => clearTimeout(timer);
        }
    }, [aiResponse]);

    return (
        <div className="flex-1 flex flex-col relative w-full transition-colors duration-500 overflow-hidden" data-gtm="mainroom-container">

            {/* 중앙 캐릭터 영역 (헤더는 MobileDashboard로 이동) */}
            <div className="flex-1 flex flex-col items-center justify-center pb-20 pt-32 relative" data-gtm="mainroom-character-area">

                {/* 캐릭터와 말풍선을 하나의 컨테이너로 묶기 */}
                <div className="flex flex-col items-center gap-6 relative">
                    {/* (1) 몽글이의 말풍선 (AI 상태에 따라 표시) */}
                    <div
                        className={`transition-all duration-500 ${showAiThought || isAiThinking ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
                        data-gtm="mainroom-mongle-speech-bubble"
                    >
                        <div className="relative px-6 py-4 text-center max-w-[280px] sm:max-w-[320px]">
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-md rounded-3xl shadow-lg border border-white/40"></div>
                            <p className="relative text-base sm:text-lg font-medium leading-relaxed text-slate-800 break-keep">
                                {isAiThinking ? "공감하는 중..." : `"${aiResponse}"`}
                            </p>
                            {/* 말풍선 꼬리 */}
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white/60 backdrop-blur-md rotate-45 border-r border-b border-white/40"></div>
                        </div>
                    </div>

                    {/* (2) 몽글이 캐릭터 */}
                    <div
                        className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 transition-transform duration-500 hover:scale-105 cursor-pointer group"
                        onClick={() => navigate('/shop')}
                        data-gtm="mainroom-character"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/60 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <Lottie
                            animationData={mongleAnimation}
                            loop={true}
                            autoplay={true}
                            className="w-full h-full drop-shadow-2xl"
                            style={{ filter: 'saturate(1.1)' }}
                        />
                    </div>
                </div>

                {/* (3) 플로팅 텍스트 (사용자 입력) */}
                <div className="absolute bottom-40 w-full px-10 text-center pointer-events-none z-20">
                    {floatingTexts.map(item => (
                        <div key={item.id} className="text-[#5D4037] text-xl font-medium absolute w-full left-0 animate-[float-up-fade_3s_ease-out_forwards]">
                            "{item.text}"
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MainRoom;