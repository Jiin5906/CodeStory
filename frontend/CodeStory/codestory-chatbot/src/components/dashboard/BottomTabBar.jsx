import React from 'react';
import { FaHome, FaBook, FaChartPie, FaCog } from 'react-icons/fa';

/**
 * BottomTabBar — 고정형 하단 탭바
 *
 * 4개 탭:
 * 1. 홈/대화 (Home)
 * 2. 일기 (Diary)
 * 3. 리포트 (Report)
 * 4. 설정 (Settings)
 */
const BottomTabBar = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'home', icon: FaHome, label: '홈', gtm: 'tab-home' },
        { id: 'diary', icon: FaBook, label: '일기', gtm: 'tab-diary' },
        { id: 'report', icon: FaChartPie, label: '리포트', gtm: 'tab-report' },
        { id: 'settings', icon: FaCog, label: '설정', gtm: 'tab-settings' }
    ];

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-xl border-t border-[#FFD4DC]/30 shadow-[0_-2px_10px_rgba(255,181,194,0.1)] flex justify-around items-center h-14"
            style={{
                paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))'
            }}
            data-gtm="bottom-tab-bar"
        >
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className="flex flex-col items-center justify-center gap-0.5 px-2 py-1 transition-all duration-300 active:scale-95 flex-1"
                        data-gtm={tab.gtm}
                    >
                        <Icon
                            className={`text-lg transition-all duration-300 ${
                                isActive
                                    ? 'text-[#FFB5C2] drop-shadow-[0_1px_4px_rgba(255,181,194,0.6)]'
                                    : 'text-gray-400'
                            }`}
                        />
                        <span
                            className={`text-[9px] font-bold transition-all duration-300 ${
                                isActive ? 'text-[#FFB5C2]' : 'text-gray-400'
                            }`}
                        >
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default BottomTabBar;