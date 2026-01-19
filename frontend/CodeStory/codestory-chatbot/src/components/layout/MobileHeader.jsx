import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaCog, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import './MobileHeader.css';

const MobileHeader = ({ user, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Get current page title based on route
    const getPageTitle = () => {
        const path = location.pathname.substring(1) || 'dashboard';
        const titles = {
            'dashboard': '홈',
            'calendar': '캘린더',
            'stats': '통계',
            'shared': '감정 공유',
            'settings': '설정',
            'editor': '일기 쓰기'
        };
        return titles[path] || 'CodeStory';
    };

    // Handle scroll for blur effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isMenuOpen]);

    const handleMenuItemClick = (action) => {
        setIsMenuOpen(false);

        if (action === 'settings') {
            navigate('/settings');
        } else if (action === 'logout') {
            if (window.confirm('로그아웃 하시겠습니까?')) {
                onLogout();
            }
        }
    };

    return (
        <header
            className={`mobile-header ${isScrolled ? 'scrolled' : ''}`}
            data-gtm="view-mobile-header"
        >
            <div className="mobile-header-content">
                {/* Left: Page Title / Logo */}
                <div className="mobile-header-left">
                    <h1 className="mobile-header-title">{getPageTitle()}</h1>
                    <span className="mobile-header-date">
                        {new Date().toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit'
                        })}
                    </span>
                </div>

                {/* Right: User Menu */}
                <div className="mobile-header-right" ref={menuRef}>
                    <button
                        className="mobile-header-user-btn"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        data-gtm="mobile-header-user-menu-toggle"
                        aria-label="사용자 메뉴"
                        aria-expanded={isMenuOpen}
                    >
                        <div className="user-avatar">
                            <FaUser />
                        </div>
                        <span className="user-nickname">{user?.nickname || '게스트'}</span>
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="mobile-header-dropdown" data-gtm="mobile-header-dropdown-menu">
                            <div className="dropdown-header">
                                <div className="dropdown-avatar">
                                    <FaUser />
                                </div>
                                <div className="dropdown-user-info">
                                    <span className="dropdown-nickname">
                                        {user?.nickname || '게스트'}
                                    </span>
                                    <span className="dropdown-email">
                                        {user?.email || '로그인되지 않음'}
                                    </span>
                                </div>
                            </div>

                            <div className="dropdown-divider"></div>

                            <button
                                className="dropdown-item"
                                onClick={() => handleMenuItemClick('settings')}
                                data-gtm="dropdown-item-settings"
                            >
                                <FaCog className="dropdown-icon" />
                                <span>설정</span>
                            </button>

                            <div className="dropdown-divider"></div>

                            <button
                                className="dropdown-item logout"
                                onClick={() => handleMenuItemClick('logout')}
                                data-gtm="dropdown-item-logout"
                            >
                                <FaSignOutAlt className="dropdown-icon" />
                                <span>로그아웃</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default MobileHeader;
