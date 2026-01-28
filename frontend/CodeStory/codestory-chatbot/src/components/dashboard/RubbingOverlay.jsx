import { useRef, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { usePet } from '../../context/PetContext';

export default function RubbingOverlay({ userId }) {
    const {
        isRubbing,
        setIsRubbing,
        affectionGauge,
        setAffectionGauge,
        isAffectionLocked,
        setIsAffectionLocked,
        handleAffectionComplete,
        checkLock
    } = usePet();
    const intervalRef = useRef(null);

    const startRubbing = useCallback(() => {
        setIsRubbing(true);

        // Lock 중이면 Lottie 애니메이션만 재생 (EXP 증가 없음)
        if (isAffectionLocked) return;

        intervalRef.current = setInterval(() => {
            setAffectionGauge(prev => {
                if (prev >= 100) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    setIsRubbing(false);
                    // Lock 활성화
                    setIsAffectionLocked(true);
                    // API 호출은 유지 (백엔드 동기화)
                    handleAffectionComplete(userId);
                    return 100; // 100에서 유지 (reset 안 함)
                }
                return prev + 1;
            });
        }, 70);
    }, [userId, isAffectionLocked, setIsRubbing, setAffectionGauge, setIsAffectionLocked, handleAffectionComplete]);

    const stopRubbing = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRubbing(false);
    }, [setIsRubbing]);

    return (
        <motion.div
            className="absolute inset-0 z-40 cursor-grab active:cursor-grabbing"
            onPointerDown={startRubbing}
            onPointerUp={stopRubbing}
            onPointerLeave={stopRubbing}
            onTouchStart={(e) => { e.preventDefault(); startRubbing(); }}
            onTouchEnd={stopRubbing}
            data-gtm="rubbing-overlay"
            style={{ touchAction: 'none' }}
        >
            {/* Lock 상태일 때 빈 표시 (터치 피드백을 위해 오버레이 유지) */}
            {isAffectionLocked && isRubbing && (
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500 text-sm font-bold bg-white/80 px-3 py-1 rounded-full shadow-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                >
                    💕 이미 배불어요!
                </motion.div>
            )}
        </motion.div>
    );
}
