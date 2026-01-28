import { useRef, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { usePet } from '../../context/PetContext';

export default function RubbingOverlay({ userId }) {
    const { isRubbing, setIsRubbing, affectionGauge, setAffectionGauge, handleAffectionComplete } = usePet();
    const intervalRef = useRef(null);

    const startRubbing = useCallback(() => {
        setIsRubbing(true);
        intervalRef.current = setInterval(() => {
            setAffectionGauge(prev => {
                if (prev >= 100) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    setIsRubbing(false);
                    handleAffectionComplete(userId);
                    return 0;
                }
                return prev + 1;
            });
        }, 70);
    }, [userId, setIsRubbing, setAffectionGauge, handleAffectionComplete]);

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
            {/* 게이지 표시 */}
            {isRubbing && (
                <motion.div
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-2 bg-white/30 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full"
                        style={{ width: `${affectionGauge}%` }}
                        transition={{ duration: 0.1 }}
                    />
                </motion.div>
            )}
        </motion.div>
    );
}
