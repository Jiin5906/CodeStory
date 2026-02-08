/**
 * StoreData.js
 * 상점 아이템 데이터 정의
 */

// ─── 테마 (Themes) ───
export const THEMES = [
    {
        id: 'theme_sakura',
        name: '벚꽃 테마',
        category: 'theme',
        price: 150,
        emoji: '🌸',
        description: '봄날의 벚꽃이 흩날리는 배경',
        gradient: 'from-pink-100 via-pink-50 to-white'
    },
    {
        id: 'theme_ocean',
        name: '바다 테마',
        category: 'theme',
        price: 150,
        emoji: '🌊',
        description: '시원한 여름 바다 배경',
        gradient: 'from-blue-100 via-cyan-50 to-white'
    },
    {
        id: 'theme_autumn',
        name: '단풍 테마',
        category: 'theme',
        price: 150,
        emoji: '🍂',
        description: '가을 단풍이 아름다운 배경',
        gradient: 'from-orange-100 via-yellow-50 to-white'
    },
    {
        id: 'theme_galaxy',
        name: '은하수 테마',
        category: 'theme',
        price: 200,
        emoji: '🌌',
        description: '반짝이는 별빛 은하수 배경',
        gradient: 'from-purple-900 via-indigo-800 to-blue-900'
    },
    {
        id: 'theme_default',
        name: '기본 테마',
        category: 'theme',
        price: 0,
        emoji: '🏠',
        description: '따뜻한 기본 배경',
        gradient: 'from-purple-100 via-pink-50 to-yellow-50'
    }
];

// ─── 가구: 벽 선반 (Wall Shelf) ───
export const SHELVES = [
    {
        id: 'shelf_wood',
        name: '나무 선반',
        type: 'shelf',
        category: 'furniture',
        price: 80,
        emoji: '📦',
        color: '#8B4513',
        description: '따뜻한 원목 선반'
    },
    {
        id: 'shelf_white',
        name: '화이트 선반',
        type: 'shelf',
        category: 'furniture',
        price: 80,
        emoji: '🗄️',
        color: '#FFFFFF',
        description: '깔끔한 화이트 선반'
    },
    {
        id: 'shelf_pastel',
        name: '파스텔 선반',
        type: 'shelf',
        category: 'furniture',
        price: 100,
        emoji: '💝',
        color: '#FFB6C1',
        description: '부드러운 파스텔 핑크 선반'
    },
    {
        id: 'shelf_mint',
        name: '민트 선반',
        type: 'shelf',
        category: 'furniture',
        price: 100,
        emoji: '🍃',
        color: '#98FF98',
        description: '상쾌한 민트 선반'
    },
    {
        id: 'shelf_rainbow',
        name: '무지개 선반',
        type: 'shelf',
        category: 'furniture',
        price: 150,
        emoji: '🌈',
        color: 'linear-gradient(to right, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
        description: '화려한 무지개 그라데이션 선반'
    }
];

// ─── 가구: 무드등 (Mood Light) ───
export const LIGHTS = [
    {
        id: 'light_moon',
        name: '달 무드등',
        type: 'light',
        category: 'furniture',
        price: 100,
        emoji: '🌙',
        color: '#FFE4B5',
        description: '초승달 모양 무드등'
    },
    {
        id: 'light_star',
        name: '별 무드등',
        type: 'light',
        category: 'furniture',
        price: 100,
        emoji: '⭐',
        color: '#FFD700',
        description: '반짝이는 별 모양'
    },
    {
        id: 'light_heart',
        name: '하트 무드등',
        type: 'light',
        category: 'furniture',
        price: 120,
        emoji: '💖',
        color: '#FF69B4',
        description: '사랑스러운 하트 모양'
    },
    {
        id: 'light_cloud',
        name: '구름 무드등',
        type: 'light',
        category: 'furniture',
        price: 120,
        emoji: '☁️',
        color: '#F0F8FF',
        description: '포근한 구름 모양'
    },
    {
        id: 'light_crystal',
        name: '크리스탈 무드등',
        type: 'light',
        category: 'furniture',
        price: 180,
        emoji: '🔮',
        color: '#E6E6FA',
        description: '신비로운 수정구'
    }
];

// ─── 가구: 거대한 화분 (Giant Pot) ───
export const POTS = [
    {
        id: 'pot_cactus',
        name: '선인장 화분',
        type: 'pot',
        category: 'furniture',
        price: 90,
        emoji: '🌵',
        color: '#228B22',
        description: '귀여운 선인장'
    },
    {
        id: 'pot_monstera',
        name: '몬스테라 화분',
        type: 'pot',
        category: 'furniture',
        price: 110,
        emoji: '🌿',
        color: '#2E8B57',
        description: '싱그러운 몬스테라'
    },
    {
        id: 'pot_flower',
        name: '꽃 화분',
        type: 'pot',
        category: 'furniture',
        price: 100,
        emoji: '🌺',
        color: '#FF1493',
        description: '화사한 꽃 화분'
    },
    {
        id: 'pot_palm',
        name: '야자수 화분',
        type: 'pot',
        category: 'furniture',
        price: 130,
        emoji: '🌴',
        color: '#32CD32',
        description: '열대 야자수'
    },
    {
        id: 'pot_bonsai',
        name: '분재 화분',
        type: 'pot',
        category: 'furniture',
        price: 150,
        emoji: '🎋',
        color: '#556B2F',
        description: '고급스러운 분재'
    }
];

// ─── 가구: 바닥 방석 (Floor Cushion) ───
export const CUSHIONS = [
    {
        id: 'cushion_pink',
        name: '핑크 방석',
        type: 'cushion',
        category: 'furniture',
        price: 70,
        emoji: '💗',
        color: '#FFC0CB',
        description: '보들보들 핑크 방석'
    },
    {
        id: 'cushion_blue',
        name: '블루 방석',
        type: 'cushion',
        category: 'furniture',
        price: 70,
        emoji: '💙',
        color: '#87CEEB',
        description: '시원한 블루 방석'
    },
    {
        id: 'cushion_purple',
        name: '퍼플 방석',
        type: 'cushion',
        category: 'furniture',
        price: 80,
        emoji: '💜',
        color: '#DA70D6',
        description: '우아한 퍼플 방석'
    },
    {
        id: 'cushion_star',
        name: '별 방석',
        type: 'cushion',
        category: 'furniture',
        price: 100,
        emoji: '⭐',
        color: '#FFD700',
        description: '반짝이는 별 모양 방석'
    },
    {
        id: 'cushion_cloud',
        name: '구름 방석',
        type: 'cushion',
        category: 'furniture',
        price: 120,
        emoji: '☁️',
        color: '#F5F5F5',
        description: '폭신폭신 구름 방석'
    }
];

// ─── 전체 아이템 통합 ───
export const ALL_ITEMS = [
    ...THEMES,
    ...SHELVES,
    ...LIGHTS,
    ...POTS,
    ...CUSHIONS
];

// ─── 카테고리별 아이템 조회 ───
export const getItemsByCategory = (category) => {
    return ALL_ITEMS.filter(item => item.category === category);
};

// ─── 타입별 아이템 조회 (가구 필터용) ───
export const getItemsByType = (type) => {
    return ALL_ITEMS.filter(item => item.type === type);
};

// ─── ID로 아이템 조회 ───
export const getItemById = (id) => {
    return ALL_ITEMS.find(item => item.id === id);
};

// ─── 기본 장착 아이템 ───
export const DEFAULT_EQUIPPED = {
    theme: 'theme_default',
    shelf: null,
    light: null,
    pot: null,
    cushion: null
};
