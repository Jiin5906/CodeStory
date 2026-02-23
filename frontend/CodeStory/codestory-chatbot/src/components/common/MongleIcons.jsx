/**
 * MongleIcons.jsx
 * 핸드드로잉/파스텔 스타일 커스텀 SVG 아이콘 시스템
 * 시스템 이모지를 전면 대체
 */
import React from 'react';

const defaultStroke = {
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
};

// ─── 아이콘 정의 ───
const icons = {
    // ✨ 반짝임 (Sparkle)
    sparkle: ({ color = '#FFD59E' }) => (
        <>
            <path d="M12,2 L12,6 M12,18 L12,22 M2,12 L6,12 M18,12 L22,12" stroke={color} strokeWidth="2.5" {...defaultStroke} />
            <path d="M5.6,5.6 L8,8 M16,16 L18.4,18.4 M18.4,5.6 L16,8 M8,16 L5.6,18.4" stroke={color} strokeWidth="2" {...defaultStroke} opacity="0.7" />
            <circle cx="12" cy="12" r="2" fill={color} opacity="0.6" />
        </>
    ),

    // ⭐ 별
    star: ({ color = '#FFD59E' }) => (
        <>
            <path d="M12,3 L14.5,9 L21,9.5 L16,14 L17.5,21 L12,17.5 L6.5,21 L8,14 L3,9.5 L9.5,9 Z" fill={color} stroke={color} strokeWidth="1" {...defaultStroke} />
            <path d="M12,6 L13.5,10 L17,10 L14,12.5 L15,16 L12,14 L9,16 L10,12.5 L7,10 L10.5,10 Z" fill="white" opacity="0.3" />
        </>
    ),

    // 🌟 빛나는 별
    glowStar: ({ color = '#FFE082' }) => (
        <>
            <circle cx="12" cy="12" r="8" fill={color} opacity="0.15" />
            <path d="M12,4 L14,9.5 L20,10 L15.5,13.5 L17,19.5 L12,16 L7,19.5 L8.5,13.5 L4,10 L10,9.5 Z" fill={color} stroke={color} strokeWidth="0.8" {...defaultStroke} />
        </>
    ),

    // 💰 코인
    coin: ({ color = '#FFB74D' }) => (
        <>
            <circle cx="12" cy="12" r="9" fill={color} stroke="#E6A23C" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="6.5" fill="none" stroke="#E6A23C" strokeWidth="1" opacity="0.5" />
            <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#8B6914" fontFamily="sans-serif">M</text>
        </>
    ),

    // 💖 하트
    heart: ({ color = '#FFB5C2' }) => (
        <path d="M12,20 C4,14 2,9 5.5,6 C7.5,4.5 10,5 12,8 C14,5 16.5,4.5 18.5,6 C22,9 20,14 12,20 Z" fill={color} stroke={color} strokeWidth="0.5" />
    ),

    // 💕 플로팅 하트
    floatingHeart: ({ color = '#FFB5C2' }) => (
        <>
            <path d="M10,16 C4,11 3,8 5.5,6 C7,5 9,5.5 10,7.5 C11,5.5 13,5 14.5,6 C17,8 16,11 10,16 Z" fill={color} />
            <path d="M17,11 C13,8 12,6 13.5,4.5 C14.5,3.8 16,4 17,5.5 C18,4 19.5,3.8 20.5,4.5 C22,6 21,8 17,11 Z" fill={color} opacity="0.5" />
        </>
    ),

    // 🌙 달
    moon: ({ color = '#FFE4A0' }) => (
        <path d="M18,16 C10,16 5,11 5,5 C5,4 5.5,3 6,2.5 C3,5 2,9 4,13 C6,17 11,19 15,18.5 C17,18 19,17 20,15 C19.5,15.5 18.5,16 18,16 Z" fill={color} stroke={color} strokeWidth="0.5" />
    ),

    // ☀️ 해
    sun: ({ color = '#FFD59E' }) => (
        <>
            <circle cx="12" cy="12" r="5" fill={color} />
            {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
                const rad = (a * Math.PI) / 180;
                return <line key={a} x1={12 + Math.cos(rad) * 7} y1={12 + Math.sin(rad) * 7} x2={12 + Math.cos(rad) * 9.5} y2={12 + Math.sin(rad) * 9.5} stroke={color} strokeWidth="2" {...defaultStroke} />;
            })}
        </>
    ),

    // ☁️ 구름
    cloud: ({ color = '#B8D4E3' }) => (
        <>
            <ellipse cx="12" cy="14" rx="8" ry="5" fill={color} />
            <circle cx="8" cy="12" r="4.5" fill={color} />
            <circle cx="15" cy="11" r="5" fill={color} />
            <circle cx="11" cy="9" r="4" fill={color} />
        </>
    ),

    // 🔥 불꽃
    fire: ({ color = '#FF8A65' }) => (
        <>
            <path d="M12,3 C12,3 16,8 16,13 C16,17 14,20 12,20 C10,20 8,17 8,13 C8,8 12,3 12,3 Z" fill={color} />
            <path d="M12,8 C12,8 14,11 14,14 C14,16 13,18 12,18 C11,18 10,16 10,14 C10,11 12,8 12,8 Z" fill="#FFE082" opacity="0.7" />
        </>
    ),

    // 💧 물방울
    water: ({ color = '#90CAF9' }) => (
        <path d="M12,3 C12,3 6,11 6,15 C6,18.5 8.5,21 12,21 C15.5,21 18,18.5 18,15 C18,11 12,3 12,3 Z" fill={color} stroke={color} strokeWidth="0.5" />
    ),

    // ⚡ 번개
    lightning: ({ color = '#FFD54F' }) => (
        <path d="M13,2 L8,12 L11,12 L9,22 L17,10 L13,10 L16,2 Z" fill={color} />
    ),

    // 🎀 리본
    ribbon: ({ color = '#F8BBD0' }) => (
        <>
            <path d="M12,10 C8,6 4,7 4,10 C4,13 8,14 12,10 Z" fill={color} />
            <path d="M12,10 C16,6 20,7 20,10 C20,13 16,14 12,10 Z" fill={color} />
            <circle cx="12" cy="10" r="2" fill="#E91E63" opacity="0.4" />
            <path d="M10,12 L9,19 M14,12 L15,19" stroke={color} strokeWidth="2" {...defaultStroke} />
        </>
    ),

    // 🌿 나뭇잎
    leaf: ({ color = '#A5D6A7' }) => (
        <>
            <path d="M6,18 C6,18 4,8 12,4 C20,8 18,18 18,18" fill={color} stroke={color} strokeWidth="0.5" />
            <path d="M12,4 L12,18" stroke="#66BB6A" strokeWidth="1.2" {...defaultStroke} opacity="0.5" />
            <path d="M12,8 L8,11 M12,12 L9,14.5" stroke="#66BB6A" strokeWidth="0.8" {...defaultStroke} opacity="0.3" />
        </>
    ),

    // 🌱 새싹
    sprout: ({ color = '#A5D6A7' }) => (
        <>
            <path d="M12,20 L12,12" stroke="#8BC34A" strokeWidth="2" {...defaultStroke} />
            <path d="M12,12 C12,12 6,10 6,6 C10,6 12,8 12,12 Z" fill={color} />
            <path d="M12,10 C12,10 18,8 18,4 C14,4 12,6 12,10 Z" fill={color} opacity="0.8" />
        </>
    ),

    // 🌸 꽃
    flower: ({ color = '#F8BBD0' }) => (
        <>
            {[0, 72, 144, 216, 288].map(a => (
                <ellipse key={a} cx="12" cy="7" rx="3.5" ry="5" fill={color} transform={`rotate(${a} 12 12)`} />
            ))}
            <circle cx="12" cy="12" r="3" fill="#FFE082" />
        </>
    ),

    // 🎉 축하/파티
    celebration: ({ color = '#FFB74D' }) => (
        <>
            <path d="M4,20 L10,8 L16,20 Z" fill={color} />
            <path d="M4,20 L10,8 L10,20 Z" fill={color} opacity="0.7" />
            <circle cx="14" cy="5" r="1.2" fill="#EF9A9A" />
            <circle cx="18" cy="7" r="1" fill="#90CAF9" />
            <circle cx="16" cy="3" r="1" fill="#A5D6A7" />
            <path d="M17,10 L19,8 M18,12 L21,11" stroke="#CE93D8" strokeWidth="1.5" {...defaultStroke} />
        </>
    ),

    // 💡 전구
    lightbulb: ({ color = '#FFE082' }) => (
        <>
            <path d="M9,16 L9,14 C6,12 5,9 7,6 C9,3 15,3 17,6 C19,9 18,12 15,14 L15,16 Z" fill={color} stroke={color} strokeWidth="0.5" />
            <rect x="9" y="16" width="6" height="3" rx="1" fill="#E0C068" />
            <line x1="9.5" y1="17.5" x2="14.5" y2="17.5" stroke="white" strokeWidth="0.8" opacity="0.5" />
        </>
    ),

    // 🧩 퍼즐 조각
    puzzle: ({ color = '#CE93D8' }) => (
        <path d="M4,8 L8,8 C8,6 10,6 10,8 L14,8 L14,12 C16,12 16,14 14,14 L14,18 L10,18 C10,20 8,20 8,18 L4,18 Z" fill={color} stroke={color} strokeWidth="0.5" />
    ),

    // 📝 메모
    note: ({ color = '#FFE0B2' }) => (
        <>
            <rect x="5" y="3" width="14" height="18" rx="2" fill={color} stroke="#E0C9A6" strokeWidth="1" />
            <line x1="8" y1="8" x2="16" y2="8" stroke="#D4A373" strokeWidth="1.2" {...defaultStroke} opacity="0.5" />
            <line x1="8" y1="12" x2="14" y2="12" stroke="#D4A373" strokeWidth="1.2" {...defaultStroke} opacity="0.5" />
            <line x1="8" y1="16" x2="12" y2="16" stroke="#D4A373" strokeWidth="1.2" {...defaultStroke} opacity="0.4" />
        </>
    ),

    // ✏️ 연필
    pencil: ({ color = '#FFB74D' }) => (
        <>
            <rect x="7" y="3" width="6" height="14" rx="1" fill={color} transform="rotate(15 10 10)" />
            <polygon points="7,17 10,21 13,17" fill="#F8BBD0" transform="rotate(15 10 10)" />
            <rect x="7" y="3" width="6" height="3" rx="1" fill="#E0A040" transform="rotate(15 10 10)" />
        </>
    ),

    // 🎨 팔레트
    palette: ({ color = '#FFCCBC' }) => (
        <>
            <ellipse cx="12" cy="13" rx="9" ry="8" fill={color} stroke="#E0A898" strokeWidth="0.8" />
            <circle cx="8" cy="10" r="1.8" fill="#EF9A9A" />
            <circle cx="12" cy="8" r="1.8" fill="#FFE082" />
            <circle cx="16" cy="10" r="1.8" fill="#A5D6A7" />
            <circle cx="15" cy="15" r="1.8" fill="#90CAF9" />
            <circle cx="10" cy="16" r="2.5" fill={color} stroke="#E0A898" strokeWidth="0.5" />
        </>
    ),

    // 🍽️ 접시
    plate: ({ color = '#E0C9A6' }) => (
        <>
            <ellipse cx="12" cy="14" rx="9" ry="6" fill={color} />
            <ellipse cx="12" cy="13" rx="7" ry="4.5" fill="white" opacity="0.4" />
            <ellipse cx="12" cy="12.5" rx="4" ry="2.5" fill={color} opacity="0.3" />
        </>
    ),

    // 🐣 아기 병아리
    babyChick: ({ color = '#FFE082' }) => (
        <>
            <circle cx="12" cy="13" r="7" fill={color} />
            <circle cx="12" cy="8" r="5" fill={color} />
            <circle cx="10" cy="7" r="1" fill="#5D4037" />
            <circle cx="14" cy="7" r="1" fill="#5D4037" />
            <path d="M11,9 L12,10.5 L13,9" fill="#FF8A65" stroke="#FF8A65" strokeWidth="0.5" />
            <ellipse cx="7" cy="13" rx="2" ry="3" fill={color} transform="rotate(-15 7 13)" />
            <ellipse cx="17" cy="13" rx="2" ry="3" fill={color} transform="rotate(15 17 13)" />
        </>
    ),

    // 🧪 시험관
    testTube: ({ color = '#CE93D8' }) => (
        <>
            <path d="M10,3 L10,15 C10,18 14,18 14,15 L14,3" fill="none" stroke={color} strokeWidth="1.8" {...defaultStroke} />
            <path d="M10,12 L14,12 L14,15 C14,17.5 10,17.5 10,15 Z" fill={color} opacity="0.5" />
            <line x1="8" y1="3" x2="16" y2="3" stroke={color} strokeWidth="1.8" {...defaultStroke} />
            <circle cx="12" cy="14" r="1" fill="white" opacity="0.5" />
        </>
    ),

    // 🏠 홈/집
    home: ({ color = '#B8D4E3' }) => (
        <>
            <path d="M4,12 L12,4 L20,12" fill="none" stroke={color} strokeWidth="2" {...defaultStroke} />
            <path d="M6,12 L6,20 C6,20 6,21 7,21 L10,21 L10,16 C10,15 11,14 12,14 C13,14 14,15 14,16 L14,21 L17,21 C18,21 18,20 18,20 L18,12" fill="none" stroke={color} strokeWidth="1.8" {...defaultStroke} />
            <rect x="10" y="15" width="4" height="6" rx="1" fill={color} opacity="0.3" />
        </>
    ),

    // 🔍 돋보기/검색
    search: ({ color = '#B0BEC5' }) => (
        <>
            <circle cx="11" cy="11" r="6" fill="none" stroke={color} strokeWidth="2" {...defaultStroke} />
            <line x1="15.5" y1="15.5" x2="20" y2="20" stroke={color} strokeWidth="2.5" {...defaultStroke} />
            <circle cx="11" cy="11" r="3" fill={color} opacity="0.15" />
        </>
    ),

    // 💌 편지/봉투
    envelope: ({ color = '#F8BBD0' }) => (
        <>
            <rect x="3" y="6" width="18" height="13" rx="2" fill={color} stroke="#E091A8" strokeWidth="0.8" />
            <path d="M3,6 L12,13 L21,6" fill="none" stroke="#E091A8" strokeWidth="1.2" {...defaultStroke} />
            <circle cx="12" cy="11" r="1.5" fill="#E91E63" opacity="0.3" />
        </>
    ),

    // 👆 탭/손가락
    tapFinger: ({ color = '#FFB74D' }) => (
        <>
            <path d="M12,3 L12,14" stroke={color} strokeWidth="3.5" {...defaultStroke} />
            <circle cx="12" cy="3" r="2.5" fill={color} />
            <path d="M8,16 L16,16 C18,16 19,18 19,19 L19,21 L5,21 L5,19 C5,18 6,16 8,16 Z" fill={color} opacity="0.5" />
        </>
    ),

    // ➔ 화살표
    arrow: ({ color = '#B0BEC5' }) => (
        <>
            <line x1="4" y1="12" x2="18" y2="12" stroke={color} strokeWidth="2.5" {...defaultStroke} />
            <path d="M14,7 L19,12 L14,17" fill="none" stroke={color} strokeWidth="2.5" {...defaultStroke} />
        </>
    ),

    // 📦 상자
    box: ({ color = '#BCAAA4' }) => (
        <>
            <rect x="4" y="8" width="16" height="12" rx="1.5" fill={color} stroke="#8D6E63" strokeWidth="0.8" />
            <rect x="4" y="6" width="16" height="4" rx="1.5" fill="#8D6E63" opacity="0.3" />
            <line x1="12" y1="6" x2="12" y2="20" stroke="#8D6E63" strokeWidth="1" opacity="0.3" />
        </>
    ),

    // 📂 폴더
    folder: ({ color = '#FFE082' }) => (
        <>
            <path d="M3,8 L3,19 C3,20 4,21 5,21 L19,21 C20,21 21,20 21,19 L21,10 C21,9 20,8 19,8 L12,8 L10,5 L5,5 C4,5 3,6 3,7 Z" fill={color} stroke="#E0C068" strokeWidth="0.8" />
        </>
    ),

    // 💪 힘/근육
    muscle: ({ color = '#FFB74D' }) => (
        <>
            <path d="M6,16 L8,10 C8,10 9,6 12,6 C15,6 16,9 16,9 L18,16" fill="none" stroke={color} strokeWidth="2.5" {...defaultStroke} />
            <circle cx="12" cy="8" r="3" fill={color} opacity="0.4" />
            <path d="M14,8 C14,8 16,7 17,8" stroke={color} strokeWidth="2" {...defaultStroke} />
        </>
    ),

    // 💬 말풍선
    speech: ({ color = '#E0E0E0' }) => (
        <>
            <path d="M4,5 L20,5 C20,5 21,5 21,6 L21,15 C21,16 20,16 20,16 L10,16 L7,20 L7,16 L4,16 C3,16 3,15 3,15 L3,6 C3,5 4,5 4,5 Z" fill={color} stroke="#BDBDBD" strokeWidth="0.8" />
        </>
    ),

    // 😴 졸림
    sleepy: ({ color = '#B0BEC5' }) => (
        <>
            <text x="6" y="11" fontSize="7" fontWeight="bold" fill={color} fontFamily="sans-serif">z</text>
            <text x="11" y="8" fontSize="9" fontWeight="bold" fill={color} fontFamily="sans-serif" opacity="0.7">z</text>
            <text x="16" y="5" fontSize="11" fontWeight="bold" fill={color} fontFamily="sans-serif" opacity="0.4">z</text>
        </>
    ),

    // 🌹 장미
    rose: ({ color = '#EF9A9A' }) => (
        <>
            <circle cx="12" cy="10" r="5" fill={color} />
            <circle cx="12" cy="10" r="3" fill="#E57373" opacity="0.6" />
            <path d="M12,10 Q13.5,8.5 12,7 Q10.5,8.5 12,10" fill="#C62828" opacity="0.4" />
            <path d="M12,15 L12,21" stroke="#66BB6A" strokeWidth="1.8" {...defaultStroke} />
            <path d="M12,17 C12,17 9,16 8,14" stroke="#66BB6A" strokeWidth="1.2" {...defaultStroke} fill="none" />
        </>
    ),

    // 감정 얼굴: 행복 (🥰)
    faceHappy: ({ color = '#FFE082' }) => (
        <>
            <circle cx="12" cy="12" r="9" fill={color} />
            <circle cx="9" cy="10" r="1.2" fill="#5D4037" />
            <circle cx="15" cy="10" r="1.2" fill="#5D4037" />
            <path d="M8,14 Q12,18 16,14" fill="none" stroke="#5D4037" strokeWidth="1.5" {...defaultStroke} />
            <ellipse cx="7" cy="13" rx="1.5" ry="1" fill="#FFAB91" opacity="0.5" />
            <ellipse cx="17" cy="13" rx="1.5" ry="1" fill="#FFAB91" opacity="0.5" />
            <path d="M14,7 C14,7 16,5 18,6" stroke="#EF9A9A" strokeWidth="1.2" {...defaultStroke} fill="none" />
        </>
    ),

    // 감정 얼굴: 보통 (🙂)
    faceNeutral: ({ color = '#FFE082' }) => (
        <>
            <circle cx="12" cy="12" r="9" fill={color} />
            <circle cx="9" cy="10" r="1.2" fill="#5D4037" />
            <circle cx="15" cy="10" r="1.2" fill="#5D4037" />
            <path d="M9,15 L15,15" stroke="#5D4037" strokeWidth="1.5" {...defaultStroke} />
        </>
    ),

    // 감정 얼굴: 피곤 (😫)
    faceTired: ({ color = '#FFE082' }) => (
        <>
            <circle cx="12" cy="12" r="9" fill={color} />
            <path d="M7,9 L11,11 M13,11 L17,9" stroke="#5D4037" strokeWidth="1.5" {...defaultStroke} />
            <ellipse cx="12" cy="16" rx="2" ry="2.5" fill="#5D4037" opacity="0.6" />
            <path d="M5,6 L8,4 M19,6 L16,4" stroke="#90CAF9" strokeWidth="1" {...defaultStroke} opacity="0.5" />
        </>
    ),

    // 감정 얼굴: 슬픔 (😢)
    faceSad: ({ color = '#FFE082' }) => (
        <>
            <circle cx="12" cy="12" r="9" fill={color} />
            <circle cx="9" cy="10" r="1.2" fill="#5D4037" />
            <circle cx="15" cy="10" r="1.2" fill="#5D4037" />
            <path d="M8,16 Q12,13 16,16" fill="none" stroke="#5D4037" strokeWidth="1.5" {...defaultStroke} />
            <path d="M16,12 L17,16" stroke="#90CAF9" strokeWidth="1.5" {...defaultStroke} />
        </>
    ),

    // 감정 얼굴: 맛있는 (😋)
    faceYummy: ({ color = '#FFE082' }) => (
        <>
            <circle cx="12" cy="12" r="9" fill={color} />
            <path d="M8,10 Q9,8 10,10" stroke="#5D4037" strokeWidth="1.5" {...defaultStroke} fill="none" />
            <path d="M14,10 Q15,8 16,10" stroke="#5D4037" strokeWidth="1.5" {...defaultStroke} fill="none" />
            <path d="M8,14 Q12,18 16,14" fill="none" stroke="#5D4037" strokeWidth="1.5" {...defaultStroke} />
            <ellipse cx="7" cy="13" rx="1.5" ry="1" fill="#FFAB91" opacity="0.5" />
            <ellipse cx="17" cy="13" rx="1.5" ry="1" fill="#FFAB91" opacity="0.5" />
        </>
    ),

    // 감정 얼굴: 미소 (😊)
    faceSmile: ({ color = '#FFE082' }) => (
        <>
            <circle cx="12" cy="12" r="9" fill={color} />
            <path d="M8,10 Q9,8 10,10" stroke="#5D4037" strokeWidth="1.5" {...defaultStroke} fill="none" />
            <path d="M14,10 Q15,8 16,10" stroke="#5D4037" strokeWidth="1.5" {...defaultStroke} fill="none" />
            <path d="M8,14 Q12,17 16,14" fill="none" stroke="#5D4037" strokeWidth="1.5" {...defaultStroke} />
        </>
    ),
};

// ─── 메인 컴포넌트 ───
const MongleIcon = ({ name, size = 20, color, className = '', style = {} }) => {
    const IconRenderer = icons[name];
    if (!IconRenderer) return null;

    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={`inline-block flex-shrink-0 ${className}`}
            style={style}
            role="img"
            aria-hidden="true"
        >
            <IconRenderer color={color} />
        </svg>
    );
};

export default MongleIcon;

// ─── DB 하위 호환 헬퍼: icon name이면 MongleIcon, 유니코드면 텍스트 ───
export const SmartEmoji = ({ value, size = 20, className = '', style = {} }) => {
    if (!value) return null;
    if (icons[value]) {
        return <MongleIcon name={value} size={size} className={className} style={style} />;
    }
    return <span className={className} style={style}>{value}</span>;
};

// ─── 편의 별칭 내보내기 ───
export { icons as MongleIconSet };
