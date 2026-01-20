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
        // 화면에 띄울 텍스트 객체 추가
        setFloatingTexts(prev => [...prev, { id: newId, text: latestLog }]);

        // 3초 뒤에 텍스트 제거 (메모리 정리)
        const timer = setTimeout(() => {
            setFloatingTexts(prev => prev.filter(item => item.id !== newId));
        }, 3000);

        return () => clearTimeout(timer);
    }, [latestLog]);

    // 2. AI 답변이 도착하면 -> 생각 구름 표시
    useEffect(() => {
        if (aiResponse) {
            setShowAiThought(true);
            // 5초 뒤에 구름 다시 숨기기 (여운 남기기)
            const timer = setTimeout(() => setShowAiThought(false), 5000);
            return () => clearTimeout(timer);
        } else {
            setShowAiThought(false);
        }
    }, [aiResponse]);

    return (
        <div className="flex-1 flex flex-col relative w-full transition-colors duration-500 bg-gradient-to-br from-[#FFF1EB] via-[#FFD1A9] to-[#FFE4D0]">
            
            {/* 헤더 (날짜) */}
            <header className="absolute top-0 w-full z-20 flex justify-between items-center px-8 py-8">
                <div className="flex flex-col opacity-70">
                    <span className="text-sm text-[#5D4037] tracking-widest font-bold">TODAY</span>
                    <span className="text-3xl text-[#5D4037] font-serif">
                        {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                    </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center cursor-pointer hover:bg-white/60 transition-colors backdrop-blur-sm">
                    <i className="far fa-bell text-[#5D4037]"></i>
                </div>
            </header>

            {/* 중앙 캐릭터 영역 */}
            <div className="flex-1 flex flex-col items-center justify-center pb-20 relative">
                
                {/* (1) AI의 생각 구름 (AI 상태에 따라 표시) */}
                <div 
                    className={`absolute top-24 flex flex-col items-center z-10 transition-opacity duration-1000 ${showAiThought || isAiThinking ? 'opacity-100' : 'opacity-0'}`}
                >
                    <div className="bg-white/60 backdrop-blur-sm px-6 py-3 rounded-[2rem] shadow-sm border border-white/50">
                        <span className="text-[#5D4037] text-lg font-medium">
                            {isAiThinking ? "공감하는 중..." : aiResponse}
                        </span>
                    </div>
                    <div className="flex gap-1 mt-1">
                        <div className="w-2 h-2 rounded-full bg-white/60"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60 translate-y-2"></div>
                    </div>
                </div>

                {/* (2) 몽글이 캐릭터 */}
                <div className="w-80 h-80 relative cursor-pointer active:scale-95 transition-transform duration-500 animate-[float_6s_ease-in-out_infinite]">
                    {/* Lottie Player 자리 (실제 파일 연결 필요) */}
                    <lottie-player 
                        src="https://lottie.host/6e641353-8652-4737-927a-244da2278952/8y51lFz5c.json" 
                        background="transparent" 
                        speed="0.8" 
                        style={{ width: '100%', height: '100%', filter: 'sepia(20%) saturate(120%)' }} 
                        loop 
                        autoplay
                    ></lottie-player>
                    
                    {/* 바닥 그림자 */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-40 h-6 bg-[#8D6E63] blur-[25px] opacity-20 rounded-full animate-pulse"></div>
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

            <style>{`
                @keyframes float-up-fade {
                    0% { opacity: 0; transform: translateY(20px) scale(0.9); }
                    20% { opacity: 1; transform: translateY(0) scale(1); }
                    80% { opacity: 0.8; transform: translateY(-40px) scale(1.05); }
                    100% { opacity: 0; transform: translateY(-60px) scale(1.1); }
                }
            `}</style>
        </div>
    );
};

export default MainRoom;