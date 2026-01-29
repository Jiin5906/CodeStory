import { useRef, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { usePet } from '../../context/PetContext';

export default function RubbingOverlay({ userId }) {
    const {
        isRubbing,
        setIsRubbing,
        setAffectionGauge,
        isAffectionLocked,
        setIsAffectionLocked,
        handleAffectionComplete
    } = usePet();
    const lastMoveTimeRef = useRef(0);
    const hasReachedMaxRef = useRef(false); // 100% 도달 여부 추적

    // Throttle: 100ms마다 한 번만 게이지 증가
    const THROTTLE_MS = 100;
    const GAUGE_INCREMENT = 2; // 드래그 시 2%씩 증가

    const handleMove = useCallback(() => {
        // Lock 중이거나 이미 100% 도달했으면 증가 불가
        if (isAffectionLocked || hasReachedMaxRef.current) return;

        const now = Date.now();
        if (now - lastMoveTimeRef.current < THROTTLE_MS) return;
        lastMoveTimeRef.current = now;

        setAffectionGauge(prev => {
            const next = Math.min(100, prev + GAUGE_INCREMENT);

            // 정확히 100% 도달 시 1회만 경험치 지급
            if (next >= 100 && !hasReachedMaxRef.current) {
                hasReachedMaxRef.current = true;
                setIsAffectionLocked(true);
                handleAffectionComplete(userId);
                console.log('💕 [RubbingOverlay] 게이지 100% 도달 → EXP 지급 (1회만)');
            }

            return next;
        });
    }, [userId, isAffectionLocked, setAffectionGauge, setIsAffectionLocked, handleAffectionComplete]);

    const startRubbing = useCallback(() => {
        setIsRubbing(true);
        hasReachedMaxRef.current = false; // 시작 시 리셋
    }, [setIsRubbing]);

    const stopRubbing = useCallback(() => {
        setIsRubbing(false);
    }, [setIsRubbing]);

    return (
        <motion.div
            className="absolute inset-0 z-40 cursor-grab active:cursor-grabbing"
            onPointerDown={startRubbing}
            onPointerMove={handleMove}
            onPointerUp={stopRubbing}
            onPointerLeave={stopRubbing}
            onTouchStart={(e) => { e.preventDefault(); startRubbing(); }}
            onTouchMove={(e) => { e.preventDefault(); handleMove(); }}
            onTouchEnd={stopRubbing}
            data-gtm="rubbing-overlay"
            style={{ touchAction: 'none' }}
        >
            {/* Lock 상태일 때 피드백 표시 */}
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
