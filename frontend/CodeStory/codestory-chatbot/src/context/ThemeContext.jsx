// src/context/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

// 🎨 테마 프리셋 정의
export const THEMES = {
    light: { id: 'light', name: '기본 (화이트)', bgColor: '#F0F2F5', cardBg: '#FFFFFF', textColor: '#2D3436', subTextColor: '#888888', sidebarBg: '#FFFFFF', accentColor: '#6C5CE7', borderColor: '#E9ECEF' },
    dark: { id: 'dark', name: '다크 모드', bgColor: '#1E1E1E', cardBg: '#2C2C2C', textColor: '#FFFFFF', subTextColor: '#B0B0B0', sidebarBg: '#252525', accentColor: '#A29BFE', borderColor: '#444444' },
    ocean: { id: 'ocean', name: '푸른 바다', bgColor: 'linear-gradient(to bottom, #a1c4fd 0%, #c2e9fb 100%)', cardBg: 'rgba(255, 255, 255, 0.85)', textColor: '#005f73', subTextColor: '#588b9c', sidebarBg: 'rgba(255, 255, 255, 0.9)', accentColor: '#0077B6', borderColor: '#FFFFFF' },
    forest: { id: 'forest', name: '싱그러운 숲', bgColor: 'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)', cardBg: 'rgba(255, 255, 255, 0.9)', textColor: '#2d6a4f', subTextColor: '#52b788', sidebarBg: 'rgba(255, 255, 255, 0.95)', accentColor: '#40916c', borderColor: '#d8f3dc' },
    sunset: { id: 'sunset', name: '따뜻한 노을', bgColor: 'linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)', cardBg: '#FFF0F5', textColor: '#6d597a', subTextColor: '#b56576', sidebarBg: '#FFF5F8', accentColor: '#e56b6f', borderColor: '#ffcdb2' }
};

export const ThemeProvider = ({ children }) => {
    const savedThemeId = localStorage.getItem('appTheme') || 'light';
    const [currentTheme, setCurrentTheme] = useState(THEMES[savedThemeId] || THEMES.light);

    const changeTheme = (themeId) => {
        const selectedTheme = THEMES[themeId];
        setCurrentTheme(selectedTheme);
        localStorage.setItem('appTheme', themeId);

        /* ✅ GTM 데이터 레이어 전송: UI 클릭뿐만 아니라 실제 '테마 변경' 로직이 성공했을 때 데이터를 쏩니다. */
        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'app_theme_change',
                theme_id: themeId,
                theme_name: selectedTheme.name
            });
        }
    };

    return (
        <ThemeContext.Provider value={{ currentTheme, changeTheme, themes: THEMES }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);