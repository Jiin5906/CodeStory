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
        <aside className="w-[280px] h-screen sticky top-0 flex flex-col bg-white border-r border-gray-100 px-6 py-8 z-50">
            {/* 로고 영역 */}
            <div className="flex items-center gap-3 mb-12 px-2">
                <div className="w-8 h-8 bg-[#7C71F5] rounded-lg flex items-center justify-center text-white font-bold text-xl">C</div>
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">CodeStory</h2>
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
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium
                                    ${currentView === item.id 
                                        ? 'bg-purple-50 text-[#7C71F5] font-bold shadow-sm' 
                                        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                                    } gtm-nav-item`}
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
            <div className="px-4 text-xs text-gray-300 mt-auto">
                <p>© 2026 AI Empathy Diary</p>
                <p>Version 2.0.0</p>
            </div>
        </aside>
    );
};

export default Sidebar;