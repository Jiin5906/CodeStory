/**
 * StoreData.js
 * 상점 아이템 데이터 정의 (div 기반 디자인 스타일)
 */

// ─── 테마 (Themes) ───
export const THEMES = [
    {
        id: 'theme_ocean',
        name: '바다 테마',
        category: 'theme',
        price: 150,
        emoji: '🌊',
        description: '시원한 여름 바다 배경',
        gradient: 'from-sky-300 via-sky-200 to-cyan-100',
        wallColor: '#87CEEB',
        floorColor: '#C8B88A',
        windowBorderColor: '#4FC3F7',
        accentColor: '#29B6F6',
        buttonColor: '#03A9F4',
        bgFrom: '#F0F8FF',
        bgTo: '#E0F2FF',
        decorationColors: {
            primary: '#81D4FA',
            secondary: '#B3E5FC',
            highlight: '#0288D1'
        }
    },
    {
        id: 'theme_autumn',
        name: '단풍 테마',
        category: 'theme',
        price: 150,
        emoji: '🍂',
        description: '가을 단풍이 아름다운 배경',
        gradient: 'from-orange-100 via-yellow-50 to-white',
        wallColor: '#FFB347',
        floorColor: '#FFE5B4',
        windowBorderColor: '#FF8C42',
        accentColor: '#FF7043',
        buttonColor: '#FF6F00',
        bgFrom: '#FFFAF0',
        bgTo: '#FFF3E0',
        decorationColors: {
            primary: '#FFCC80',
            secondary: '#FFE0B2',
            highlight: '#F57C00'
        }
    },
    {
        id: 'theme_galaxy',
        name: '은하수 테마',
        category: 'theme',
        price: 200,
        emoji: '🌌',
        description: '반짝이는 별빛 은하수 배경',
        gradient: 'from-purple-900 via-indigo-800 to-blue-900',
        wallColor: '#4B0082',
        floorColor: '#5C4D7D',
        windowBorderColor: '#7B68EE',
        accentColor: '#9370DB',
        buttonColor: '#8B7AB8',
        bgFrom: '#F3F0FF',
        bgTo: '#EDE7F6',
        decorationColors: {
            primary: '#B39DDB',
            secondary: '#D1C4E9',
            highlight: '#673AB7'
        }
    },
    {
        id: 'theme_default',
        name: '기본 테마',
        category: 'theme',
        price: 0,
        emoji: '🏠',
        description: '따뜻한 기본 배경',
        gradient: 'from-purple-100 via-pink-50 to-yellow-50',
        wallColor: '#FF9EAA',
        floorColor: '#FFCC80',
        windowBorderColor: '#5DADE2',
        accentColor: '#FFB5C2',
        buttonColor: '#FF8FA3',
        bgFrom: '#FFF8F3',
        bgTo: '#FFE8F0',
        decorationColors: {
            primary: '#FFD4DC',
            secondary: '#FFE4E9',
            highlight: '#FF6B8A'
        }
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
        color: '#D7B896',
        colorLight: '#E8CBA8',
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
        colorLight: '#F8F8F8',
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
        colorLight: '#FFC8D3',
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
        colorLight: '#B0FFB0',
        description: '상쾌한 민트 선반'
    },
    {
        id: 'shelf_lavender',
        name: '라벤더 선반',
        type: 'shelf',
        category: 'furniture',
        price: 150,
        emoji: '💜',
        color: '#E6E6FA',
        colorLight: '#F0F0FF',
        description: '우아한 라벤더 선반'
    }
];

// ─── 가구: 무드등 (Mood Light) ───
export const LIGHTS = [
    {
        id: 'light_warm',
        name: '웜 무드등',
        type: 'light',
        category: 'furniture',
        price: 100,
        emoji: '💡',
        shadeColor: '#FFF8DC',
        shadeColorDark: '#FFE4B5',
        standColor: '#2C2C2C',
        description: '따뜻한 노란빛 무드등'
    },
    {
        id: 'light_pink',
        name: '핑크 무드등',
        type: 'light',
        category: 'furniture',
        price: 100,
        emoji: '💖',
        shadeColor: '#FFB6C1',
        shadeColorDark: '#FF69B4',
        standColor: '#8B4789',
        description: '로맨틱 핑크 무드등'
    },
    {
        id: 'light_mint',
        name: '민트 무드등',
        type: 'light',
        category: 'furniture',
        price: 120,
        emoji: '🌿',
        shadeColor: '#98FF98',
        shadeColorDark: '#7FFF7F',
        standColor: '#2F4F2F',
        description: '상쾌한 민트 무드등'
    },
    {
        id: 'light_blue',
        name: '블루 무드등',
        type: 'light',
        category: 'furniture',
        price: 120,
        emoji: '💙',
        shadeColor: '#ADD8E6',
        shadeColorDark: '#87CEEB',
        standColor: '#191970',
        description: '차분한 블루 무드등'
    },
    {
        id: 'light_rainbow',
        name: '레인보우 무드등',
        type: 'light',
        category: 'furniture',
        price: 180,
        emoji: '🌈',
        shadeColor: '#FFD700',
        shadeColorDark: '#FFA500',
        standColor: '#4B0082',
        description: '화려한 무지개 무드등'
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
        potColor: '#D2691E',
        plantColor: '#228B22',
        description: '귀여운 선인장'
    },
    {
        id: 'pot_monstera',
        name: '몬스테라 화분',
        type: 'pot',
        category: 'furniture',
        price: 110,
        emoji: '🌿',
        potColor: '#8B4513',
        plantColor: '#2E8B57',
        description: '싱그러운 몬스테라'
    },
    {
        id: 'pot_flower',
        name: '꽃 화분',
        type: 'pot',
        category: 'furniture',
        price: 100,
        emoji: '🌺',
        potColor: '#FF69B4',
        plantColor: '#FF1493',
        description: '화사한 꽃 화분'
    },
    {
        id: 'pot_lavender',
        name: '라벤더 화분',
        type: 'pot',
        category: 'furniture',
        price: 130,
        emoji: '💜',
        potColor: '#DDA0DD',
        plantColor: '#9370DB',
        description: '향기로운 라벤더'
    },
    {
        id: 'pot_rose',
        name: '장미 화분',
        type: 'pot',
        category: 'furniture',
        price: 150,
        emoji: '🌹',
        potColor: '#8B0000',
        plantColor: '#DC143C',
        description: '고급스러운 장미'
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
        colorDark: '#FFB6C1',
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
        colorDark: '#6495ED',
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
        colorDark: '#BA55D3',
        description: '우아한 퍼플 방석'
    },
    {
        id: 'cushion_yellow',
        name: '옐로우 방석',
        type: 'cushion',
        category: 'furniture',
        price: 100,
        emoji: '💛',
        color: '#FFD700',
        colorDark: '#FFA500',
        description: '밝은 옐로우 방석'
    },
    {
        id: 'cushion_mint',
        name: '민트 방석',
        type: 'cushion',
        category: 'furniture',
        price: 120,
        emoji: '💚',
        color: '#98FF98',
        colorDark: '#7FFF7F',
        description: '상쾌한 민트 방석'
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
