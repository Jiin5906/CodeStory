import React from 'react';
import { FaHome, FaCalendarAlt, FaChartPie, FaCog, FaGlobe, FaPenFancy } from 'react-icons/fa';

const Sidebar = ({ onWriteClick, currentView, onChangeView }) => {
    const navItems = [
        { id: 'dashboard', icon: <FaHome />, label: '홈 피드' },
        { id: 'calendar', icon: <FaCalendarAlt />, label: '캘린더' },
        { id: 'stats', icon: <FaChartPie />, label: '감정 통계' },
        { id: 'shared', icon: <FaGlobe />, label: '감정 공유' },
        { id: 'settings', icon: <FaCog />, label: '설정' },
    ];

    return (
        <aside
            className="hidden md:flex w-[280px] h-screen sticky top-0 flex-col px-6 py-8 z-50"
            style={{
                backgroundColor: 'var(--sidebar-bg, var(--card-bg))',
                borderRight: '1px solid var(--border-color)'
            }}
        >
            {/* 로고 영역 */}
            <div className="flex items-center gap-3 mb-12 px-2">
                <div className="w-8 h-8 bg-[#7C71F5] rounded-lg flex items-center justify-center text-white font-bold text-xl">C</div>
                <h2
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: 'var(--text-color)' }}
                >
                    CodeStory
                </h2>
            </div>

            {/* 메인 CTA 버튼: 일기 쓰기 */}
            <button
                id="gtm-btn-write"
                className="w-full bg-[#7C71F5] hover:bg-[#6A5FE0] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-purple-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 mb-10 group"
                onClick={onWriteClick}
            >
                <FaPenFancy className="group-hover:rotate-12 transition-transform" />
                <span>일기 쓰기</span>
            </button>

            {/* 내비게이션 메뉴 */}
            <nav className="flex-1">
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <button
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium gtm-nav-item
                                    ${currentView === item.id
                                        ? 'font-bold shadow-sm'
                                        : 'hover:bg-opacity-50'
                                    }`}
                                style={{
                                    backgroundColor: currentView === item.id
                                        ? 'rgba(124, 113, 245, 0.1)'
                                        : 'transparent',
                                    color: currentView === item.id
                                        ? '#7C71F5'
                                        : 'var(--sub-text-color)'
                                }}
                                onMouseEnter={(e) => {
                                    if (currentView !== item.id) {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-color, rgba(0,0,0,0.03))';
                                        e.currentTarget.style.color = 'var(--text-color)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (currentView !== item.id) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = 'var(--sub-text-color)';
                                    }
                                }}
                                data-gtm={`nav-${item.id}`}
                                onClick={() => onChangeView(item.id)}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* 하단 저작권/버전 정보 */}
            <div
                className="px-4 text-xs mt-auto"
                style={{ color: 'var(--sub-text-color, #ccc)' }}
            >
                <p>© 2026 AI Empathy Diary</p>
                <p>Version 2.0.0</p>
            </div>
        </aside>
    );
};

export default Sidebar;
