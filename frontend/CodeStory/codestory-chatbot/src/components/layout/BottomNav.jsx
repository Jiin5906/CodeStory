import React from 'react';
import { FaPen, FaHome, FaRegCalendarAlt, FaChartPie, FaCog } from 'react-icons/fa';
import './BottomNav.css';

const BottomNav = ({ currentView, onNavigate, onWriteClick }) => {
    const navItems = [
        { id: 'dashboard', icon: FaHome, label: '홈' },
        { id: 'calendar', icon: FaRegCalendarAlt, label: '캘린더' },
        { id: 'stats', icon: FaChartPie, label: '통계' },
        { id: 'settings', icon: FaCog, label: '설정' }
    ];

    return (
        <div className="bottom-nav-container" data-gtm="view-bottom-nav">
            <div className="bottom-nav">
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    // 중앙에 FAB 공간 만들기 (2번째와 3번째 사이)
                    if (index === 2) {
                        return (
                            <React.Fragment key={`fragment-${item.id}`}>
                                {/* FAB 공간 */}
                                <div className="nav-spacer" key="spacer"></div>

                                {/* 실제 네비게이션 아이템 */}
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
                            </React.Fragment>
                        );
                    }

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

            {/* Floating Action Button (글쓰기) */}
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
