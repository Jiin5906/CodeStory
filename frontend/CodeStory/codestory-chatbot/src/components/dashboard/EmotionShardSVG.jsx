/**
 * EmotionShardSVG.jsx
 * 3D 감정 조각 Lottie 컴포넌트
 *
 * 📌 Lottie 파일 교체 방법:
 *    src/assets/ 폴더의 아래 파일을 교체하면 자동 반영됩니다.
 *    - shardHappy.json   → 💖 기쁨 (하트)
 *    - shardNeutral.json → ⭐ 평온 (별)
 *    - shardSad.json     → 💧 슬픔 (물방울)
 *    - shardAngry.json   → 🔥 화남 (불꽃)
 */
import Lottie from 'lottie-react';
import shardHappy from '../../assets/shardHappy.json';
import shardNeutral from '../../assets/shardNeutral.json';
import shardSad from '../../assets/shardSad.json';
import shardAngry from '../../assets/shardAngry.json';

export function HeartShard({ size = 44 }) {
    return <Lottie animationData={shardHappy} loop autoplay style={{ width: size, height: size }} />;
}

export function StarShard({ size = 44 }) {
    return <Lottie animationData={shardNeutral} loop autoplay style={{ width: size, height: size }} />;
}

export function DropShard({ size = 44 }) {
    return <Lottie animationData={shardSad} loop autoplay style={{ width: size, height: size }} />;
}

export function FireShard({ size = 44 }) {
    return <Lottie animationData={shardAngry} loop autoplay style={{ width: size, height: size }} />;
}
