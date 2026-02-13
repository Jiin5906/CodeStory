import { useRef, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { usePet } from '../../context/PetContext';

export default function RubbingOverlay({ userId, onShowFullAnimation }) {
    // eslint-disable-next-line no-unused-vars
    const {
        isRubbing,
        setIsRubbing,
        setAffectionGauge,
        isAffectionLocked,
        setIsAffectionLocked,
        handleAffectionComplete,
        isSleeping,
        showSleepToast,
        isTouchOnCooldown
    } = usePet();
    const lastMoveTimeRef = useRef(0);
    const hasReachedMaxRef = useRef(false); // 100% 도달 여부 추적

    // Throttle: 100ms마다 한 번만 게이지 증가
    const THROTTLE_MS = 100;
    const GAUGE_INCREMENT = 2; // 드래그 시 2%씩 증가

    const handleMove = useCallback(() => {
        // 수면 중 차단
        if (isSleeping) {
            showSleepToast();
            return;
        }

        // 쿨타임 중 차단
        if (isTouchOnCooldown()) {
            return;
        }

        // Lock 중이면 포화 애니메이션 트리거
        if (isAffectionLocked) {
            if (onShowFullAnimation) {
                onShowFullAnimation();
            }
            return;
        }

        // 이미 100% 도달했으면 증가 불가
        if (hasReachedMaxRef.current) return;

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
            }

            return next;
        });
    }, [userId, isAffectionLocked, setAffectionGauge, setIsAffectionLocked, handleAffectionComplete, onShowFullAnimation, isSleeping, showSleepToast, isTouchOnCooldown]);

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
        />
    );
}
