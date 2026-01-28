// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { usePet } from '../../context/PetContext';

const EMOTION_EMOJI = {
    happy: '💛',
    sad: '💙',
    angry: '❤️',
    neutral: '🤍'
};

export default function EmotionShard({ shard, userId }) {
    const { handleCollectShard } = usePet();

    return (
        <motion.div
            className="absolute z-50 cursor-pointer select-none"
            style={{
                left: `${shard.x}%`,
                top: `${shard.y}%`,
                transform: 'translate(-50%, -50%)'
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => handleCollectShard(userId, shard.id)}
            data-gtm={`emotion-shard-${shard.emotion}`}
        >
            <span className="text-2xl drop-shadow-lg">
                {EMOTION_EMOJI[shard.emotion] || '🤍'}
            </span>
            {/* 반짝이는 내부 닷 */}
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
        </motion.div>
    );
}
