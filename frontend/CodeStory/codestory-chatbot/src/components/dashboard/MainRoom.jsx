import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import mongleIDLE from '../../assets/mongleIDLE.json';
import mongleThinking from '../../assets/mongleThinking.json';
import mongleHappy from '../../assets/mongleHappy.json';
import mongleSad from '../../assets/mongleSad.json';
import mongleAngry from '../../assets/mongleAngry.json';
import mongleNeutral from '../../assets/mongleNeutral.json';
import mongleRubbing from '../../assets/mongleRubbing.json';
import mongleCold from '../../assets/mongleCold.json';
import mongleWarm from '../../assets/mongleWarm.json';
import { usePet } from '../../context/PetContext';
import RubbingOverlay from './RubbingOverlay';
import EmotionShard from './EmotionShard';

const MainRoom = ({ latestLog, aiResponse, emotion, isAiThinking, user, windowColdAnimation, windowClosedAnimation }) => {
    const [floatingTexts, setFloatingTexts] = useState([]);
    const [showAiThought, setShowAiThought] = useState(false);
    const [currentAnimation, setCurrentAnimation] = useState(mongleIDLE);
    const { isRubbing, emotionShards, spawnEmotionShard } = usePet();

    // 0. 애니메이션 전환 로직 (확장됨)
    useEffect(() => {
        // 1. 쓰다듭기 중: mongleRubbing
        if (isRubbing) {
            setCurrentAnimation(mongleRubbing);
            return;
        }
        // 2. 창문 30초 미폐쇄: mongleCold
        if (windowColdAnimation) {
            setCurrentAnimation(mongleCold);
            return;
        }
        // 3. 창문 닫기: mongleWarm (3초 후 IDLE 복귀)
        if (windowClosedAnimation) {
            setCurrentAnimation(mongleWarm);
            const timer = setTimeout(() => setCurrentAnimation(mongleIDLE), 3000);
            return () => clearTimeout(timer);
        }
        // 4. 로딩 중: mongleThinking
        if (isAiThinking) {
            const timer = setTimeout(() => setCurrentAnimation(mongleThinking), 0);
            return () => clearTimeout(timer);
        }
        // 5. 답변 도착: 감정에 맞는 애니메이션
        if (emotion) {
            const emotionMap = {
                happy: mongleHappy,
                sad: mongleSad,
                angry: mongleAngry,
                neutral: mongleNeutral,
            };
            const showTimer = setTimeout(() => setCurrentAnimation(emotionMap[emotion] || mongleNeutral), 0);
            const hideTimer = setTimeout(() => setCurrentAnimation(mongleIDLE), 3000);
            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        }
        // 6. 기본 상태: mongleIDLE
        const timer = setTimeout(() => setCurrentAnimation(mongleIDLE), 0);
        return () => clearTimeout(timer);
    }, [isAiThinking, emotion, isRubbing, windowColdAnimation, windowClosedAnimation]);

    // 감정 조각 스폰 (emotion 값이 들어오면)
    useEffect(() => {
        if (emotion && emotion !== 'neutral') {
            spawnEmotionShard(emotion);
        }
    }, [emotion, spawnEmotionShard]);

    // 사용자가 글을 쓰면 -> 공기 중으로 흩어지는 애니메이션
    useEffect(() => {
        if (!latestLog) return;

        const newId = Date.now();
        const addTimer = setTimeout(() => {
            setFloatingTexts(prev => [...prev, { id: newId, text: latestLog }]);
        }, 0);
        const removeTimer = setTimeout(() => {
            setFloatingTexts(prev => prev.filter(item => item.id !== newId));
        }, 3000);

        return () => {
            clearTimeout(addTimer);
            clearTimeout(removeTimer);
        };
    }, [latestLog]);

    // AI 답변 도착 시 말풍선 표시
    useEffect(() => {
        if (aiResponse) {
            const showTimer = setTimeout(() => setShowAiThought(true), 0);
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

            {/* 중앙 캐릭터 영역 */}
            <div className="flex-1 flex flex-col items-center justify-center pb-20 pt-32 relative" data-gtm="mainroom-character-area">

                <div className="flex flex-col items-center gap-6 relative">
                    {/* (1) 몽글이의 말풍선 */}
                    <div
                        className={`transition-all duration-500 ${showAiThought || isAiThinking ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
                        data-gtm="mainroom-mongle-speech-bubble"
                    >
                        <div className="relative px-6 py-4 text-center max-w-[280px] sm:max-w-[320px]">
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-md rounded-3xl shadow-lg border border-white/40"></div>
                            <p className="relative text-base sm:text-lg font-medium leading-relaxed text-slate-800 break-keep">
                                {isAiThinking ? "공감하는 중..." : `"${aiResponse}"`}
                            </p>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white/60 backdrop-blur-md rotate-45 border-r border-b border-white/40"></div>
                        </div>
                    </div>

                    {/* (2) 몽글이 캐릭터 + 쓰다듭기 오버레이 + 감정조각 */}
                    <div
                        className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 transition-transform duration-500 group"
                        data-gtm="mainroom-character"
                    >
                        {/* 호버 글로우 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/60 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        {/* Lottie 캐릭터 */}
                        <Lottie
                            animationData={currentAnimation}
                            loop={true}
                            autoplay={true}
                            className="w-full h-full drop-shadow-2xl"
                            style={{ filter: 'saturate(1.1)' }}
                        />

                        {/* 쓰다듭기 오버레이 */}
                        <RubbingOverlay userId={user?.id} />

                        {/* 감정 조각 (캐릭터 영역 같은 level) */}
                        {emotionShards.map(shard => (
                            <EmotionShard key={shard.id} shard={shard} userId={user?.id} />
                        ))}
                    </div>
                </div>

                {/* (3) 플로팅 텍스트 */}
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
