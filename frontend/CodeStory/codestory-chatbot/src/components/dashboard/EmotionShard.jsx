// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { usePet } from '../../context/PetContext';
import { useState, useMemo } from 'react';
import { HeartShard, StarShard, DropShard, FireShard } from './EmotionShardSVG';
import { getShardGlow, getEmotionBase } from './emotionShardUtils';

function ShardIcon({ emotion, size }) {
    const base = getEmotionBase(emotion);
    switch (base) {
        case 'happy': return <HeartShard size={size} />;
        case 'sad': return <DropShard size={size} />;
        case 'angry': return <FireShard size={size} />;
        default: return <StarShard size={size} />;
    }
}

export default function EmotionShard({ shard, userId }) {
    const { handleCollectShard, feedEmotion } = usePet();
    const [isCollecting, setIsCollecting] = useState(false);

    const handleClick = () => {
        if (isCollecting) return;
        setIsCollecting(true);
        feedEmotion(shard.emotion, 25);
        handleCollectShard(userId, shard.id);
    };

    const emotion = shard.emotion || 'neutral';
    const glowColor = useMemo(() => getShardGlow(emotion), [emotion]);

    return (
        <motion.div
            className="absolute z-50 cursor-pointer select-none"
            style={{
                left: `${shard.x}%`,
                top: `${shard.y}%`,
                transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={
                isCollecting
                    ? { scale: [1, 1.5, 0], opacity: [1, 1, 0], y: [-20, -40] }
                    : { scale: [0, 1.2, 1], opacity: 1 }
            }
            transition={
                isCollecting
                    ? { duration: 0.6, ease: 'easeOut' }
                    : { type: 'spring', stiffness: 260, damping: 20 }
            }
            onClick={handleClick}
            data-gtm={`emotion-shard-${emotion}`}
        >
            {/* 후광 Glow */}
            <motion.div
                className="absolute inset-[-10px] rounded-full pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                    filter: 'blur(6px)',
                }}
                animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.1, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Lottie 감정 조각 (1.2배 확대) */}
            <div className="relative z-10 drop-shadow-lg" style={{ transform: 'scale(1.2)' }}>
                <ShardIcon emotion={emotion} size={44} />
            </div>

            {/* 수집 시 +허기 텍스트 */}
            {isCollecting && (
                <motion.div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold text-green-500 whitespace-nowrap"
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 0], y: -10 }}
                    transition={{ duration: 0.6 }}
                >
                    +허기 25
                </motion.div>
            )}
        </motion.div>
    );
}
