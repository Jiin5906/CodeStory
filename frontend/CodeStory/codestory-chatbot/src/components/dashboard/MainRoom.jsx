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
import mongleSLEEP from '../../assets/mongleSLEEP.json';
import mongleSLEEPING from '../../assets/mongleSLEEPING.json';
import mongleTired from '../../assets/mongleTired.json';
import mongleFull from '../../assets/mongleFull.json';
import { usePet } from '../../context/PetContext';
import RubbingOverlay from './RubbingOverlay';
import EmotionShard from './EmotionShard';

const MainRoom = ({ latestLog, aiResponse, emotion, isAiThinking, user, windowColdAnimation, windowClosedAnimation }) => {
    const [floatingTexts, setFloatingTexts] = useState([]);
    const [showAiThought, setShowAiThought] = useState(false);
    const [currentAnimation, setCurrentAnimation] = useState(mongleIDLE);
    const [justWokeUp, setJustWokeUp] = useState(false);
    const [showFullAnimation, setShowFullAnimation] = useState(false);
    const { isRubbing, emotionShards, spawnEmotionShard, isSleeping, moodLightOn, sleepGauge } = usePet();

    // 포화 애니메이션 트리거 핸들러
    const handleShowFullAnimation = () => {
        setShowFullAnimation(true);
        setTimeout(() => setShowFullAnimation(false), 2000);
    };

    // 기상 시 Tired 애니메이션 관리
    useEffect(() => {
        if (!isSleeping && !moodLightOn && sleepGauge < 70) {
            setJustWokeUp(true);
            const timer = setTimeout(() => setJustWokeUp(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isSleeping, moodLightOn, sleepGauge]);

    // 0. 애니메이션 전환 로직 (확장됨)
    useEffect(() => {
        // 1. 수면 중: SLEEPING 애니메이션
        if (isSleeping) {
            setCurrentAnimation(mongleSLEEPING);
            return;
        }
        // 2. 방금 깬 상태 (수면 게이지 70% 미만): Tired 애니메이션
        if (justWokeUp) {
            setCurrentAnimation(mongleTired);
            return;
        }
        // 3. 포화 상태 (쓰다듬기 게이지 100%): mongleFull
        if (showFullAnimation) {
            setCurrentAnimation(mongleFull);
            const timer = setTimeout(() => setCurrentAnimation(mongleIDLE), 2000);
            return () => clearTimeout(timer);
        }
        // 4. 쓰다듬기 중: mongleRubbing
        if (isRubbing) {
            setCurrentAnimation(mongleRubbing);
            return;
        }
        // 5. 창문 30초 미폐쇄: mongleCold
        if (windowColdAnimation) {
            setCurrentAnimation(mongleCold);
            return;
        }
        // 6. 창문 닫기: mongleWarm (3초 후 IDLE 복귀)
        if (windowClosedAnimation) {
            setCurrentAnimation(mongleWarm);
            const timer = setTimeout(() => setCurrentAnimation(mongleIDLE), 3000);
            return () => clearTimeout(timer);
        }
        // 7. 로딩 중: mongleThinking
        if (isAiThinking) {
            const timer = setTimeout(() => setCurrentAnimation(mongleThinking), 0);
            return () => clearTimeout(timer);
        }
        // 8. 답변 도착: 감정에 맞는 애니메이션
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
        // 9. 수면 게이지 < 15%: Sleepy IDLE (같은 애니메이션이지만 나중에 다른 애니메이션으로 변경 가능)
        if (sleepGauge < 15) {
            const timer = setTimeout(() => setCurrentAnimation(mongleIDLE), 0);
            return () => clearTimeout(timer);
        }
        // 10. 기본 상태: mongleIDLE
        const timer = setTimeout(() => setCurrentAnimation(mongleIDLE), 0);
        return () => clearTimeout(timer);
    }, [isAiThinking, emotion, isRubbing, windowColdAnimation, windowClosedAnimation, isSleeping, justWokeUp, sleepGauge, showFullAnimation]);

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
                        <div className="relative px-6 py-4 text-left min-w-[200px] max-w-[85vw] sm:max-w-md md:max-w-lg">
                            {/* 메신저 스타일 버블 배경 */}
                            <div
                                className="absolute inset-0 rounded-[24px]"
                                style={{
                                    background: 'linear-gradient(135deg, #FFF9E6 0%, #FFE8CC 50%, #FFD4A3 100%)',
                                    boxShadow: '0 4px 16px rgba(255, 200, 120, 0.25), 0 2px 8px rgba(0, 0, 0, 0.08)'
                                }}
                            ></div>

                            {/* 텍스트 콘텐츠 */}
                            <p
                                className="relative text-[15px] sm:text-base font-normal leading-relaxed break-keep"
                                style={{
                                    color: '#5D4037',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", sans-serif',
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word'
                                }}
                            >
                                {isAiThinking ? "공감하는 중..." : aiResponse}
                            </p>

                            {/* 메신저 스타일 꼬리 */}
                            <div
                                className="absolute -bottom-2 left-8"
                                style={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: '12px solid transparent',
                                    borderRight: '12px solid transparent',
                                    borderTop: '12px solid #FFD4A3',
                                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.06))'
                                }}
                            ></div>
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

                        {/* 쓰다듬기 오버레이 */}
                        <RubbingOverlay userId={user?.id} onShowFullAnimation={handleShowFullAnimation} />

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
