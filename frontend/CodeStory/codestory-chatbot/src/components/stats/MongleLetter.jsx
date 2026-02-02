import React from 'react';
import { FaEnvelope } from 'react-icons/fa6';

/**
 * MongleLetter - 몽글이의 월간 총평 편지
 *
 * Mongle Pastel Theme
 */
const MongleLetter = ({ diaries }) => {
    const hasDiaries = diaries && diaries.length > 0;

    // 일기 개수에 따른 메시지
    const getMessage = () => {
        if (!hasDiaries || diaries.length === 0) {
            return {
                title: "아직 배우는 중이에요",
                content: "몽글이가 아직 너에 대해 배우고 있어! 대화를 더 많이 들려줘 ( •̀ ω •́ )✧",
            };
        }

        const count = diaries.length;
        const avgMood = Math.round(
            diaries.reduce((sum, d) => sum + (d.moodScore || 50), 0) / count
        );

        if (avgMood >= 80) {
            return {
                title: "행복이 가득한 한 달",
                content: `${count}개의 기록을 함께했어! 이번 달은 정말 밝고 행복한 순간들이 많았구나. 이 기운을 계속 이어가자!`,
            };
        } else if (avgMood >= 60) {
            return {
                title: "평온한 나날들",
                content: `${count}개의 이야기를 들려줘서 고마워! 잔잔하고 평화로운 하루들이었네. 소소한 행복들을 계속 발견해 나가자.`,
            };
        } else if (avgMood >= 40) {
            return {
                title: "조금씩 나아가는 중",
                content: `${count}번이나 마음을 나눠줘서 고마워. 힘든 날도 있었지만, 기록하며 마음을 다독인 거 자체가 정말 대단해!`,
            };
        } else {
            return {
                title: "함께 있어줄게",
                content: `${count}개의 솔직한 마음을 들려줘서 고마워. 많이 힘들었구나... 몽글이는 언제나 네 곁에 있을게. 조금씩 괜찮아질 거야.`,
            };
        }
    };

    const message = getMessage();

    return (
        <div
            className="bg-gradient-to-br from-[#FFFAF5] to-[#FFF8F3] rounded-3xl shadow-sm p-6 border-2 border-[#FFD4DC]/40"
            data-gtm="mongle-letter"
        >
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <FaEnvelope className="text-2xl text-[#FFB5C2]" />
                    <h3 className="text-lg font-cute text-gray-700">몽글이의 편지</h3>
                </div>
                <span className="text-3xl">{message.emoji}</span>
            </div>

            {/* 편지 내용 */}
            <div className="bg-white/60 rounded-2xl p-5 border border-[#FFD4DC]/30">
                <h4 className="text-base font-cute text-[#FFB5C2] mb-3">
                    {message.title}
                </h4>
                <p className="text-sm font-cute text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {message.content}
                </p>
            </div>

            {/* 서명 */}
            <div className="mt-4 text-right">
                <p className="text-xs font-cute text-gray-400">
                    사랑을 담아, 몽글이 ♡
                </p>
            </div>
        </div>
    );
};

export default MongleLetter;
