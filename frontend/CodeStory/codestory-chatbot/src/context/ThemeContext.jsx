// src/context/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

// 🎨 테마 프리셋 정의 (여기에 원하는 테마를 계속 추가하면 됩니다!)
export const THEMES = {
    light: {
        id: 'light',
        name: '기본 (화이트)',
        bgColor: '#F0F2F5', // 전체 배경
        cardBg: '#FFFFFF',  // 카드 배경
        textColor: '#2D3436', // 기본 글자색
        subTextColor: '#888888', // 보조 글자색
        sidebarBg: '#FFFFFF', // 사이드바 배경
        accentColor: '#6C5CE7', // 포인트 색상 (보라)
        borderColor: '#E9ECEF', // 테두리 색
    },
    dark: {
        id: 'dark',
        name: '다크 모드',
        bgColor: '#1E1E1E',
        cardBg: '#2C2C2C',
        textColor: '#FFFFFF',
        subTextColor: '#B0B0B0',
        sidebarBg: '#252525',
        accentColor: '#A29BFE', // 다크모드에선 조금 더 밝은 보라
        borderColor: '#444444',
    },
    ocean: {
        id: 'ocean',
        name: '푸른 바다',
        // 그라데이션 배경
        bgColor: 'linear-gradient(to bottom, #a1c4fd 0%, #c2e9fb 100%)', 
        cardBg: 'rgba(255, 255, 255, 0.85)', // 약간 투명한 흰색
        textColor: '#005f73', // 짙은 청록색 텍스트
        subTextColor: '#588b9c',
        sidebarBg: 'rgba(255, 255, 255, 0.9)',
        accentColor: '#0077B6',
        borderColor: '#FFFFFF',
    },
    forest: {
        id: 'forest',
        name: '싱그러운 숲',
        bgColor: 'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)',
        cardBg: 'rgba(255, 255, 255, 0.9)',
        textColor: '#2d6a4f',
        subTextColor: '#52b788',
        sidebarBg: 'rgba(255, 255, 255, 0.95)',
        accentColor: '#40916c',
        borderColor: '#d8f3dc',
    },
    sunset: {
        id: 'sunset',
        name: '따뜻한 노을',
        bgColor: 'linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)',
        cardBg: '#FFF0F5',
        textColor: '#6d597a',
        subTextColor: '#b56576',
        sidebarBg: '#FFF5F8',
        accentColor: '#e56b6f',
        borderColor: '#ffcdb2',
    }
};

export const ThemeProvider = ({ children }) => {
    // 로컬스토리지에서 테마 불러오기 (없으면 'light')
    const savedThemeId = localStorage.getItem('appTheme') || 'light';
    const [currentTheme, setCurrentTheme] = useState(THEMES[savedThemeId] || THEMES.light);

    const changeTheme = (themeId) => {
        const selectedTheme = THEMES[themeId];
        setCurrentTheme(selectedTheme);
        localStorage.setItem('appTheme', themeId); // 저장
    };

    return (
        <ThemeContext.Provider value={{ currentTheme, changeTheme, themes: THEMES }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);