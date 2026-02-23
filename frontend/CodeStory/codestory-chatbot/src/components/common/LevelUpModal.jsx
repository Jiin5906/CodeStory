import React, { useState, useEffect, useCallback } from 'react';
import Confetti from 'react-confetti';
import Lottie from 'lottie-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import mongleHappy from '../../assets/mongleHappy.json';
import MongleIcon from './MongleIcons';

/**
 * 레벨업 축하 모달
 * - 폭죽(Confetti) 효과
 * - 몽글이 Happy 애니메이션
 * - 레벨 변화 표시 + 보상 코인
 */
const LevelUpModal = ({ isOpen, onClose, prevLevel, newLevel, rewardCoins }) => {
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = useCallback(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }, []);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    // TODO: Add Level up sound
    // useEffect(() => { if (isOpen) playSound('levelup.mp3'); }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[999] flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    data-gtm="levelup-modal-backdrop"
                >
                    {/* 어두운 배경 */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                    {/* 폭죽 효과 (recycle=false → 한번 뿌리고 자연스럽게 떨어짐) */}
                    <Confetti
                        width={windowSize.width}
                        height={windowSize.height}
                        numberOfPieces={250}
                        recycle={false}
                        gravity={0.15}
                        colors={['#FFD700', '#FF6B8A', '#A78BFA', '#34D399', '#60A5FA', '#F472B6', '#FBBF24']}
                    />

                    {/* 메인 카드 */}
                    <motion.div
                        className="relative z-10 w-[320px] max-w-[90vw] rounded-3xl overflow-hidden"
                        initial={{ scale: 0.5, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                        style={{
                            background: 'linear-gradient(135deg, #FFF8F0 0%, #FFFFFF 50%, #FFF0F5 100%)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 80px rgba(255,182,193,0.3), inset 0 1px 0 rgba(255,255,255,0.8)',
                        }}
                        data-gtm="levelup-modal-card"
                    >
                        {/* 상단 빛나는 효과 */}
                        <div className="absolute top-0 left-0 right-0 h-32 opacity-40"
                            style={{
                                background: 'radial-gradient(ellipse at center top, rgba(255,215,0,0.6) 0%, transparent 70%)'
                            }}
                        />

                        {/* 별 장식 */}
                        <motion.div
                            className="absolute top-4 left-6 text-2xl"
                            animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        ><MongleIcon name="sparkle" size={16} /></motion.div>
                        <motion.div
                            className="absolute top-8 right-8 text-xl"
                            animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
                        ><MongleIcon name="star" size={14} /></motion.div>
                        <motion.div
                            className="absolute top-16 left-12 text-lg"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                        ><MongleIcon name="glowStar" size={18} /></motion.div>

                        <div className="relative px-6 pt-8 pb-6 flex flex-col items-center">
                            {/* 타이틀: LEVEL UP! */}
                            <motion.div
                                className="mb-2"
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2
                                    className="text-4xl font-black tracking-wider text-center"
                                    style={{
                                        background: 'linear-gradient(135deg, #FF6B8A, #FFB347, #FF6B8A)',
                                        backgroundSize: '200% 200%',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        animation: 'shimmer 2s ease-in-out infinite',
                                        textShadow: 'none',
                                    }}
                                >
                                    LEVEL UP!
                                </h2>
                            </motion.div>

                            <motion.p
                                className="text-sm text-gray-400 mb-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                몽글이가 성장했어요!
                            </motion.p>

                            {/* 몽글이 애니메이션 */}
                            <motion.div
                                className="relative my-2"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                            >
                                {/* 원형 배경 광 */}
                                <div
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)',
                                        transform: 'scale(1.5)',
                                    }}
                                />
                                <Lottie
                                    animationData={mongleHappy}
                                    loop={true}
                                    autoplay={true}
                                    style={{ width: 140, height: 140 }}
                                />
                            </motion.div>

                            {/* 레벨 변화 표시 */}
                            <motion.div
                                className="flex items-center gap-3 my-4 px-6 py-3 rounded-2xl"
                                style={{
                                    background: 'linear-gradient(135deg, #FFF5F5, #FFF0F8)',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                                }}
                                initial={{ x: -30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <span className="text-2xl font-bold text-gray-400">
                                    Lv.{prevLevel}
                                </span>
                                <motion.span
                                    className="text-2xl"
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                >
                                    <MongleIcon name="arrow" size={24} color="#9CA3AF" />
                                </motion.span>
                                <span
                                    className="text-3xl font-black"
                                    style={{
                                        background: 'linear-gradient(135deg, #FF6B8A, #FF8E53)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    Lv.{newLevel}
                                </span>
                            </motion.div>

                            {/* 보상 표시 */}
                            {rewardCoins > 0 && (
                                <motion.div
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full mb-5"
                                    style={{
                                        background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
                                        border: '1px solid #FDE68A',
                                        boxShadow: '0 2px 8px rgba(251,191,36,0.2)',
                                    }}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <motion.span
                                        className="text-xl"
                                        animate={{ rotate: [0, 15, -15, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 1 }}
                                    >
                                        <MongleIcon name="coin" size={20} />
                                    </motion.span>
                                    <span className="text-base font-bold text-amber-600">
                                        보너스 코인 +{rewardCoins}원 획득!
                                    </span>
                                </motion.div>
                            )}

                            {/* 확인 버튼 */}
                            <motion.button
                                className="w-full py-3.5 rounded-2xl text-white font-bold text-lg shadow-lg active:scale-95 transition-transform"
                                style={{
                                    background: 'linear-gradient(135deg, #FF6B8A, #FF8E53)',
                                    boxShadow: '0 4px 15px rgba(255,107,138,0.4)',
                                }}
                                onClick={onClose}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.9 }}
                                whileTap={{ scale: 0.95 }}
                                data-gtm="levelup-modal-confirm"
                            >
                                <MongleIcon name="celebration" size={16} /> 멋져!
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* shimmer 애니메이션 */}
                    <style>{`
                        @keyframes shimmer {
                            0%, 100% { background-position: 0% 50%; }
                            50% { background-position: 100% 50%; }
                        }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LevelUpModal;
