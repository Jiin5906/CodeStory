import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaSun, FaMoon, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const MobileHeader = ({ user, onLogout, notificationCount = 1 }) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { currentTheme, changeTheme, themes } = useTheme();

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isDrawerOpen]);

    const handleLogout = () => {
        setIsDrawerOpen(false);
        if (window.confirm('로그아웃 하시겠습니까?')) {
            onLogout();
        }
    };

    return (
        <>
            <header
                className="sticky top-0 z-50 flex justify-between items-center px-5 py-4 backdrop-blur-sm transition-all duration-300"
                style={{
                    backgroundColor: 'var(--bg-color, #F5F7FA)',
                    opacity: 0.9
                }}
                data-gtm="view-mobile-header"
            >
                {/* 좌측: 햄버거 메뉴 */}
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="p-2 -ml-2 rounded-full transition-colors"
                    style={{ color: 'var(--text-color, #374151)' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    aria-label="메뉴 열기"
                    data-gtm="mobile-header-menu-open"
                >
                    <FaBars className="w-6 h-6" />
                </button>

                {/* 중앙: 앱 타이틀 */}
                <h1
                    className="text-lg font-bold tracking-tight"
                    style={{ color: 'var(--text-color, #1F2937)' }}
                >
                    나의 공감 일기
                </h1>

                {/* 우측: 알림 아이콘 */}
                <div className="relative cursor-pointer active:scale-95 transition-transform">
                    <div
                        className="p-2 rounded-full shadow-sm text-yellow-400"
                        style={{
                            backgroundColor: 'var(--card-bg, white)',
                            border: '1px solid var(--border-color, #F3F4F6)'
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                        </svg>
                    </div>
                    {notificationCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white shadow-sm"></span>
                    )}
                </div>
            </header>

            {/* 오버레이 */}
            {isDrawerOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity"
                    onClick={() => setIsDrawerOpen(false)}
                    data-gtm="mobile-drawer-overlay"
                ></div>
            )}

            {/* 사이드 드로어 */}
            <div
                className={`fixed top-0 left-0 h-full w-80 z-[70] transition-transform duration-300 ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{
                    backgroundColor: 'var(--card-bg, white)'
                }}
                data-gtm="mobile-drawer"
            >
                <div className="flex flex-col h-full">
                    {/* 드로어 헤더 */}
                    <div
                        className="flex justify-between items-center p-5 border-b"
                        style={{ borderColor: 'var(--border-color, #F3F4F6)' }}
                    >
                        <h2
                            className="text-xl font-bold"
                            style={{ color: 'var(--text-color, #1F2937)' }}
                        >
                            메뉴
                        </h2>
                        <button
                            onClick={() => setIsDrawerOpen(false)}
                            className="p-2 rounded-full transition-colors"
                            style={{ color: 'var(--text-color, #374151)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            aria-label="메뉴 닫기"
                            data-gtm="mobile-drawer-close"
                        >
                            <FaTimes className="w-6 h-6" />
                        </button>
                    </div>

                    {/* 사용자 프로필 */}
                    <div
                        className="p-6 flex items-center gap-4"
                        style={{ backgroundColor: 'rgba(124, 113, 245, 0.05)' }}
                    >
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-4xl"
                            style={{
                                backgroundColor: 'var(--card-bg, white)',
                                color: 'var(--sub-text-color, #9CA3AF)'
                            }}
                        >
                            <FaUserCircle />
                        </div>
                        <div>
                            <h3
                                className="text-lg font-bold"
                                style={{ color: 'var(--text-color, #1F2937)' }}
                            >
                                {user?.nickname || '게스트'}
                            </h3>
                            <p
                                className="text-sm"
                                style={{ color: 'var(--sub-text-color, #6B7280)' }}
                            >
                                {user?.email || '로그인되지 않음'}
                            </p>
                        </div>
                    </div>

                    {/* 테마 설정 */}
                    <div className="p-6">
                        <h3
                            className="text-sm font-bold mb-4"
                            style={{ color: 'var(--sub-text-color, #6B7280)' }}
                        >
                            테마 설정
                        </h3>
                        <div className="flex gap-4">
                            {Object.values(themes).map((theme) => {
                                const ThemeIcon = theme.id === 'light' ? FaSun : FaMoon;
                                const iconColor = theme.id === 'light' ? '#F59E0B' : '#A29BFE';
                                const isActive = currentTheme.id === theme.id;

                                return (
                                    <button
                                        key={theme.id}
                                        onClick={() => changeTheme(theme.id)}
                                        className={`flex-1 p-4 rounded-xl transition-all ${isActive ? 'ring-2 ring-[#7C71F5]' : ''}`}
                                        style={{
                                            backgroundColor: 'var(--bg-color, #F5F7FA)',
                                            border: `2px solid ${isActive ? '#7C71F5' : 'var(--border-color, #F3F4F6)'}`
                                        }}
                                        data-gtm={`mobile-drawer-theme-${theme.id}`}
                                    >
                                        <ThemeIcon
                                            style={{
                                                fontSize: '24px',
                                                color: iconColor,
                                                marginBottom: '8px'
                                            }}
                                        />
                                        <div
                                            className="text-xs font-medium"
                                            style={{ color: 'var(--text-color, #1F2937)' }}
                                        >
                                            {theme.name}
                                        </div>
                                        {isActive && (
                                            <div className="text-xs text-[#7C71F5] mt-1">✓</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 하단 로그아웃 버튼 */}
                    <div className="mt-auto p-6">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-3 p-4 rounded-xl transition-all"
                            style={{
                                backgroundColor: 'rgba(250, 82, 82, 0.1)',
                                color: '#FA5252'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(250, 82, 82, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(250, 82, 82, 0.1)';
                            }}
                            data-gtm="mobile-drawer-logout"
                        >
                            <FaSignOutAlt />
                            <span className="font-bold">로그아웃</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MobileHeader;
