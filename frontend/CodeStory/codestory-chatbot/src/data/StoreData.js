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
        emoji: '',
        description: '시원한 바다 배경',
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
        emoji: '',
        description: '가을 단풍 배경',
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
        emoji: '',
        description: '반짝이는 은하수',
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
        emoji: '',
        description: '기본 따뜻한 배경',
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
        name: '기본 선반',
        type: 'shelf',
        category: 'furniture',
        price: 0,
        emoji: '',
        color: '#D7B896',
        colorLight: '#E8CBA8',
        description: '기본 원목 선반'
    },
    {
        id: 'shelf_white',
        name: '화이트 선반',
        type: 'shelf',
        category: 'furniture',
        price: 100,
        emoji: '',
        color: '#FFFFFF',
        colorLight: '#F8F8F8',
        description: '깔끔한 흰색 선반'
    },
    {
        id: 'shelf_pastel',
        name: '파스텔 선반',
        type: 'shelf',
        category: 'furniture',
        price: 80,
        emoji: '',
        color: '#FFB6C1',
        colorLight: '#FFC8D3',
        description: '파스텔 핑크 선반'
    },
    {
        id: 'shelf_mint',
        name: '민트 선반',
        type: 'shelf',
        category: 'furniture',
        price: 100,
        emoji: '',
        color: '#98FF98',
        colorLight: '#B0FFB0',
        description: '민트 컬러 선반'
    },
    {
        id: 'shelf_lavender',
        name: '라벤더 선반',
        type: 'shelf',
        category: 'furniture',
        price: 120,
        emoji: '',
        color: '#E6E6FA',
        colorLight: '#F0F0FF',
        description: '라벤더 선반'
    }
];

// ─── 가구: 무드등 (Mood Light) ───
export const LIGHTS = [
    {
        id: 'light_warm',
        name: '기본 무드등',
        type: 'light',
        category: 'furniture',
        designType: 'classic',
        price: 0,
        emoji: '',
        shadeColor: '#FFF8DC',
        shadeColorDark: '#FFE4B5',
        standColor: '#2C2C2C',
        description: '기본 무드등'
    },
    {
        id: 'light_pink',
        name: '튤립 램프',
        type: 'light',
        category: 'furniture',
        designType: 'tulip',
        price: 80,
        emoji: '',
        shadeColor: '#FFB6C1',
        shadeColorDark: '#FF69B4',
        standColor: '#5B8C3E',
        description: '꽃봉오리 램프'
    },
    {
        id: 'light_mint',
        name: '버섯 램프',
        type: 'light',
        category: 'furniture',
        designType: 'mushroom',
        price: 80,
        emoji: '',
        shadeColor: '#98FF98',
        shadeColorDark: '#7FFF7F',
        standColor: '#F5F5DC',
        description: '버섯 모양 램프'
    },
    {
        id: 'light_blue',
        name: '달 램프',
        type: 'light',
        category: 'furniture',
        designType: 'moon',
        price: 120,
        emoji: '',
        shadeColor: '#C8D8F0',
        shadeColorDark: '#A0B4D8',
        standColor: '#191970',
        description: '초승달 램프'
    },
    {
        id: 'light_rainbow',
        name: '라바 램프',
        type: 'light',
        category: 'furniture',
        designType: 'lava',
        price: 150,
        emoji: '',
        shadeColor: '#FFD700',
        shadeColorDark: '#FFA500',
        standColor: '#4B0082',
        description: '네온 라바 램프'
    }
];

// ─── 가구: 거대한 화분 (Giant Pot) ───
export const POTS = [
    {
        id: 'pot_monstera',
        name: '기본 화분',
        type: 'pot',
        category: 'furniture',
        price: 0,
        emoji: '',
        potColor: '#D4BCA0',
        plantColor: '#A0D0BC',
        description: '기본 화분'
    },
    {
        id: 'pot_cactus',
        name: '선인장 화분',
        type: 'pot',
        category: 'furniture',
        price: 80,
        emoji: '',
        potColor: '#EDCBA8',
        plantColor: '#B8DCAC',
        description: '사막의 선인장'
    },
    {
        id: 'pot_flower',
        name: '꽃 화분',
        type: 'pot',
        category: 'furniture',
        price: 100,
        emoji: '',
        potColor: '#F8D0E0',
        plantColor: '#F8B4C8',
        description: '화사한 꽃화분'
    },
    {
        id: 'pot_lavender',
        name: '라벤더 화분',
        type: 'pot',
        category: 'furniture',
        price: 100,
        emoji: '',
        potColor: '#DDD8F8',
        plantColor: '#C0B4EC',
        description: '라벤더 화분'
    },
    {
        id: 'pot_rose',
        name: '장미 화분',
        type: 'pot',
        category: 'furniture',
        price: 150,
        emoji: 'rose',
        potColor: '#F4D4D0',
        plantColor: '#C0D0A8',
        description: '고급 장미 화분'
    }
];

// ─── 가구: 바닥 방석 (Floor Cushion) ───
export const CUSHIONS = [
    {
        id: 'cushion_pink',
        name: '기본 방석',
        type: 'cushion',
        category: 'furniture',
        price: 0,
        emoji: '',
        color: '#FFC0CB',
        colorDark: '#FFB6C1',
        description: '기본 핑크 방석'
    },
    {
        id: 'cushion_blue',
        name: '구름 방석',
        type: 'cushion',
        category: 'furniture',
        price: 80,
        emoji: '',
        color: '#87CEEB',
        colorDark: '#6495ED',
        description: '구름 방석'
    },
    {
        id: 'cushion_purple',
        name: '벨벳 방석',
        type: 'cushion',
        category: 'furniture',
        price: 100,
        emoji: '',
        color: '#DA70D6',
        colorDark: '#BA55D3',
        description: '고급 벨벳 방석'
    },
    {
        id: 'cushion_yellow',
        name: '꽃 모양 방석',
        type: 'cushion',
        category: 'furniture',
        price: 120,
        emoji: '',
        color: '#FFD700',
        colorDark: '#FFA500',
        description: '꽃 모양 방석'
    },
    {
        id: 'cushion_mint',
        name: '나뭇잎 방석',
        type: 'cushion',
        category: 'furniture',
        price: 80,
        emoji: '',
        color: '#98FF98',
        colorDark: '#7FFF7F',
        description: '나뭇잎 방석'
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
