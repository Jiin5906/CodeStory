/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from 'react';
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
import mongleSLEEPING from '../../assets/mongleSLEEPING.json';
// mongleTired는 mongleAwake로 대체됨
// eslint-disable-next-line no-unused-vars
import mongleTired from '../../assets/mongleTired.json';
import mongleFull from '../../assets/mongleFull.json';
import mongleAwake from '../../assets/mongleAwake.json';
import { usePet } from '../../context/PetContext';
import RubbingOverlay from './RubbingOverlay';
import EmotionShard from './EmotionShard';

const MainRoom = ({ latestLog, emotion, isAiThinking, user, windowColdAnimation, windowClosedAnimation }) => {
    const [floatingTexts, setFloatingTexts] = useState([]);
    const [currentAnimation, setCurrentAnimation] = useState(mongleIDLE);
    const [justWokeUp, setJustWokeUp] = useState(false);
    const [showFullAnimation, setShowFullAnimation] = useState(false);
    const prevSleepingRef = useRef(true);
    // eslint-disable-next-line no-unused-vars
    const { isRubbing, emotionShards, spawnEmotionShard, isSleeping, moodLightOn, sleepGauge } = usePet();

    // 포화 애니메이션 트리거 핸들러
    const handleShowFullAnimation = () => {
        setShowFullAnimation(true);
        setTimeout(() => setShowFullAnimation(false), 2000);
    };

    // 기상 감지: isSleeping이 true→false로 전환될 때
    useEffect(() => {
        if (prevSleepingRef.current && !isSleeping) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setJustWokeUp(true);
            const timer = setTimeout(() => setJustWokeUp(false), 3000);
            return () => clearTimeout(timer);
        }
        prevSleepingRef.current = isSleeping;
    }, [isSleeping]);

    // 0. 애니메이션 전환 로직 (확장됨)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        // 1. 수면 중: SLEEPING 애니메이션
        if (isSleeping) {
            setCurrentAnimation(mongleSLEEPING);
            return;
        }
        // 2. 방금 깬 상태: Awake 애니메이션 (3초 후 IDLE)
        if (justWokeUp) {
            setCurrentAnimation(mongleAwake);
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

    return (
        <div className="relative flex items-center justify-center" style={{ overflow: 'visible' }} data-gtm="mainroom-container">
            {/* 몽글이 캐릭터 + 쓰다듬기 오버레이 + 감정조각 */}
            <div
                className="relative w-40 h-40 transition-transform duration-500 group"
                style={{ overflow: 'visible' }}
                data-gtm="mainroom-character"
            >
                {/* 호버 글로우 */}
                <div className="absolute inset-[-50%] bg-gradient-to-t from-white/0 to-white/60 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                {/* Lottie 캐릭터 — 컨테이너보다 크게 렌더링, 중앙 정렬 (translate-y-[55%]로 방석 위 착석) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[25%] w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96" style={{ overflow: 'visible' }}>
                    <Lottie
                        animationData={currentAnimation}
                        loop={true}
                        autoplay={true}
                        className="w-full h-full drop-shadow-2xl"
                        style={{ filter: 'saturate(1.1)' }}
                    />
                </div>

                {/* 쓰다듬기 오버레이 — 캐릭터 전체 영역 커버 */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96" style={{ overflow: 'visible' }}>
                    <RubbingOverlay userId={user?.id} onShowFullAnimation={handleShowFullAnimation} />
                </div>

                {/* 감정 조각 */}
                {emotionShards.map(shard => (
                    <EmotionShard key={shard.id} shard={shard} userId={user?.id} />
                ))}
            </div>

            {/* 플로팅 텍스트 */}
            <div className="absolute bottom-full w-60 text-center pointer-events-none z-20" style={{ marginBottom: '-20px' }}>
                {floatingTexts.map(item => (
                    <div key={item.id} className="text-[#5D4037] text-xl font-medium absolute w-full left-0 animate-[float-up-fade_3s_ease-out_forwards]">
                        "{item.text}"
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MainRoom;
