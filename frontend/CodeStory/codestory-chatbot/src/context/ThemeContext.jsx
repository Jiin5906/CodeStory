// src/context/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

// 🎨 테마 프리셋 정의 (Light Mode & Dark Mode 전용)
export const THEMES = {
    light: {
        id: 'light',
        name: 'Light Mode',
        bgColor: '#F0F2F5',
        cardBg: '#FFFFFF',
        textColor: '#2D3436',
        subTextColor: '#888888',
        sidebarBg: '#FFFFFF',
        accentColor: '#6C5CE7',
        borderColor: '#E9ECEF'
    },
    dark: {
        id: 'dark',
        name: 'Dark Mode',
        bgColor: '#1E1E1E',
        cardBg: '#2C2C2C',
        textColor: '#FFFFFF',
        subTextColor: '#B0B0B0',
        sidebarBg: '#252525',
        accentColor: '#A29BFE',
        borderColor: '#444444'
    }
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