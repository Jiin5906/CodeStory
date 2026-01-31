// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { usePet } from '../../context/PetContext';
import { useState } from 'react';

const EMOTION_EMOJI = {
    happy: '💛',
    sad: '💙',
    angry: '❤️',
    neutral: '🤍'
};

export default function EmotionShard({ shard, userId }) {
    const { handleCollectShard, feedEmotion } = usePet();
    const [isCollecting, setIsCollecting] = useState(false);

    const handleClick = () => {
        if (isCollecting) return; // 중복 클릭 방지

        setIsCollecting(true);

        // 허기 회복 (+25)
        feedEmotion(shard.emotion, 25);

        // 감정 조각 수집
        handleCollectShard(userId, shard.id);
    };

    return (
        <motion.div
            className="absolute z-50 cursor-pointer select-none"
            style={{
                left: `${shard.x}%`,
                top: `${shard.y}%`,
                transform: 'translate(-50%, -50%)'
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={isCollecting
                ? { scale: [1, 1.5, 0], opacity: [1, 1, 0], y: [-20, -40] }
                : { scale: [0, 1.2, 1], opacity: 1 }
            }
            transition={isCollecting
                ? { duration: 0.6, ease: 'easeOut' }
                : { type: 'spring', stiffness: 260, damping: 20 }
            }
            onClick={handleClick}
            data-gtm={`emotion-shard-${shard.emotion}`}
        >
            <span className="text-2xl drop-shadow-lg">
                {EMOTION_EMOJI[shard.emotion] || '🤍'}
            </span>
            {/* 반짝이는 내부 닷 */}
            {!isCollecting && (
                <motion.div
                    className="absolute top-0 right-0 w-2 h-2 bg-yellow-300 rounded-full"
                    animate={{
                        scale: [1, 1.8, 1],
                        opacity: [1, 0.3, 1]
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
            )}
            {/* 수집 시 +허기 텍스트 */}
            {isCollecting && (
                <motion.div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold text-green-500"
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
