import React from 'react';
import { FaHome, FaRegCalendarAlt, FaChartPie, FaShareAlt } from 'react-icons/fa';

const BottomNav = ({ currentView, onNavigate, onWriteClick }) => {

    // 네비게이션 아이템 정의
    const navItems = [
        { id: 'dashboard', icon: FaHome, label: '홈' },
        { id: 'calendar', icon: FaRegCalendarAlt, label: '캘린더' },
        { id: 'shared', icon: FaShareAlt, label: '커뮤니티' },
        { id: 'stats', icon: FaChartPie, label: '통계' }
    ];

    return (
        <nav
            className="md:hidden fixed bottom-0 left-0 w-full backdrop-blur-xl py-2 px-6 flex justify-between items-center z-50 pb-6 rounded-t-3xl shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]"
            style={{
                backgroundColor: 'var(--card-bg, white)',
                opacity: 0.9,
                borderTop: '1px solid var(--border-color, #F3F4F6)'
            }}
            data-gtm="view-bottom-nav"
        >
            {/* 1. 왼쪽 그룹 (홈, 캘린더) */}
            {navItems.slice(0, 2).map((item) => {
                const isActive = currentView === item.id;
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`flex flex-col items-center gap-1 p-2 transition-colors duration-200 ${isActive ? 'text-[#7C71F5]' : ''}`}
                        style={{
                            color: isActive ? '#7C71F5' : 'var(--sub-text-color, #9CA3AF)'
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.color = 'var(--text-color, #6B7280)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.color = 'var(--sub-text-color, #9CA3AF)';
                            }
                        }}
                        data-gtm={`nav-bottom-${item.id}`}
                    >
                        <Icon className="w-6 h-6" />
                        <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                    </button>
                );
            })}

            {/* 2. 중앙 FAB (글쓰기 버튼) - 위로 솟은 형태 */}
            <div className="relative -top-6">
                <button
                    onClick={onWriteClick}
                    className="w-14 h-14 bg-gray-800 rounded-full shadow-lg shadow-gray-400/40 flex items-center justify-center text-white text-2xl transform transition active:scale-95 hover:scale-110 hover:bg-black"
                    aria-label="일기 쓰기"
                    data-gtm="nav-bottom-write-fab"
                >
                    +
                </button>
            </div>

            {/* 3. 오른쪽 그룹 (커뮤니티, 통계) */}
            {navItems.slice(2, 4).map((item) => {
                const isActive = currentView === item.id;
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`flex flex-col items-center gap-1 p-2 transition-colors duration-200 ${isActive ? 'text-[#7C71F5]' : ''}`}
                        style={{
                            color: isActive ? '#7C71F5' : 'var(--sub-text-color, #9CA3AF)'
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.color = 'var(--text-color, #6B7280)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.color = 'var(--sub-text-color, #9CA3AF)';
                            }
                        }}
                        data-gtm={`nav-bottom-${item.id}`}
                    >
                        <Icon className="w-6 h-6" />
                        <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default BottomNav;
