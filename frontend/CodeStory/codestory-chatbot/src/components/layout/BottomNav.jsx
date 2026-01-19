import React from 'react';
import { FaPen, FaHome, FaRegCalendarAlt, FaChartPie, FaCog, FaShareAlt } from 'react-icons/fa';
import './BottomNav.css';

const BottomNav = ({ currentView, onNavigate, onWriteClick }) => {
    const navItems = [
        { id: 'dashboard', icon: FaHome, label: '홈' },
        { id: 'calendar', icon: FaRegCalendarAlt, label: '캘린더' },
        { id: 'shared', icon: FaShareAlt, label: '감정 공유' },
        { id: 'stats', icon: FaChartPie, label: '통계' },
        { id: 'settings', icon: FaCog, label: '설정' }
    ];

    return (
        <div className="bottom-nav-container" data-gtm="view-bottom-nav">
            <div className="bottom-nav">
                {/* Render all nav items with equal flex distribution */}
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                        <button
                            key={item.id}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => onNavigate(item.id)}
                            data-gtm={`nav-bottom-${item.id}`}
                            aria-label={item.label}
                        >
                            <Icon className="nav-icon" />
                            <span className="nav-label">{item.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Floating Action Button (글쓰기) - Absolute positioned */}
            <button
                className="fab-btn"
                onClick={onWriteClick}
                data-gtm="nav-bottom-write-fab"
                aria-label="일기 쓰기"
            >
                <FaPen className="fab-icon" />
            </button>
        </div>
    );
};

export default BottomNav;
