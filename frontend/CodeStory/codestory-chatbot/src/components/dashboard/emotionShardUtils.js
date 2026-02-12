/**
 * emotionShardUtils.js
 * 감정 조각 유틸리티 함수
 */

// ─── 감정별 후광 색상 ───
const GLOW_COLORS = {
    happy: 'rgba(255, 105, 180, 0.35)',
    happiness: 'rgba(255, 105, 180, 0.35)',
    love: 'rgba(255, 105, 180, 0.35)',
    neutral: 'rgba(255, 165, 0, 0.35)',
    calm: 'rgba(255, 165, 0, 0.35)',
    surprise: 'rgba(255, 165, 0, 0.35)',
    bored: 'rgba(255, 165, 0, 0.35)',
    sad: 'rgba(135, 206, 235, 0.4)',
    sadness: 'rgba(135, 206, 235, 0.4)',
    depression: 'rgba(135, 206, 235, 0.4)',
    angry: 'rgba(255, 69, 0, 0.3)',
    anger: 'rgba(255, 69, 0, 0.3)',
    anxiety: 'rgba(255, 69, 0, 0.3)',
    fear: 'rgba(255, 69, 0, 0.3)',
};

// ─── 감정 → 기본 4분류 매핑 ───
const EMOTION_TO_BASE = {
    happy: 'happy',
    happiness: 'happy',
    love: 'happy',
    neutral: 'neutral',
    calm: 'neutral',
    surprise: 'neutral',
    bored: 'neutral',
    sad: 'sad',
    sadness: 'sad',
    depression: 'sad',
    angry: 'angry',
    anger: 'angry',
    anxiety: 'angry',
    fear: 'angry',
};

export function getEmotionBase(emotion) {
    return EMOTION_TO_BASE[emotion] || 'neutral';
}

export function getShardGlow(emotion) {
    return GLOW_COLORS[emotion] || GLOW_COLORS.neutral;
}
