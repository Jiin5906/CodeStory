import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
// import mongleAnimation from '../../assets/mongleIDLE.json'; // 실제 Lottie 파일 경로

const MainRoom = ({ latestLog, aiResponse, isAiThinking }) => {
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
                
                {/* (1) 몽글이의 말풍선 (AI 상태에 따라 표시) */}
                <div
                    className={`absolute top-0 flex flex-col items-center z-10 transition-all duration-500 ${showAiThought || isAiThinking ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
                    data-gtm="mainroom-mongle-speech-bubble"
                >
                    <div className="relative mb-8 px-8 py-4 text-center max-w-[85%]">
                        <div className="absolute inset-0 bg-white/40 blur-xl rounded-full"></div>
                        <p className="relative text-lg md:text-xl font-medium leading-relaxed text-slate-800 break-keep drop-shadow-sm">
                            {isAiThinking ? "공감하는 중..." : `"${aiResponse}"`}
                        </p>
                    </div>
                </div>

                {/* (2) 몽글이 캐릭터 */}
                <div className="relative w-72 h-72 md:w-96 md:h-96 transition-transform duration-500 hover:scale-105 cursor-pointer group" data-gtm="mainroom-character">
                    <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/60 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <lottie-player
                        src="https://lottie.host/6e641353-8652-4737-927a-244da2278952/8y51lFz5c.json"
                        background="transparent"
                        speed="0.8"
                        style={{ width: '100%', height: '100%' }}
                        loop
                        autoplay
                        class="drop-shadow-2xl animate-float filter saturate-[1.1]"
                    ></lottie-player>
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