import React from 'react';
import { FaHome, FaBook, FaChartPie, FaCog } from 'react-icons/fa';

/**
 * BottomTabBar — 고정형 하단 탭바 (중앙 FAB 포함)
 *
 * 5개 항목:
 * 1. 홈 (Home)
 * 2. 일기 (Diary)
 * 3. [중앙 FAB] - 메인 액션 버튼
 * 4. 리포트 (Report)
 * 5. 설정 (Settings)
 */
const BottomTabBar = ({ activeTab, onTabChange, onCentralAction }) => {
    const leftTabs = [
        { id: 'home', icon: FaHome, label: '홈', gtm: 'tab-home' },
        { id: 'diary', icon: FaBook, label: '일기', gtm: 'tab-diary' }
    ];

    const rightTabs = [
        { id: 'report', icon: FaChartPie, label: '리포트', gtm: 'tab-report' },
        { id: 'settings', icon: FaCog, label: '설정', gtm: 'tab-settings' }
    ];

    const TabButton = ({ tab }) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
            <button
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all duration-300 active:scale-95 flex-1"
                data-gtm={tab.gtm}
            >
                <Icon
                    className={`text-xl transition-all duration-300 ${
                        isActive ? 'text-[#B87FE0]' : 'text-gray-400'
                    }`}
                />
                <span
                    className={`text-[10px] font-medium transition-all duration-300 ${
                        isActive ? 'text-[#B87FE0]' : 'text-gray-400'
                    }`}
                >
                    {tab.label}
                </span>
            </button>
        );
    };

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-[60] bg-[#1C1C1E] border-t border-gray-800 flex items-center justify-between h-20"
            style={{
                paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
                maxWidth: '430px',
                margin: '0 auto'
            }}
            data-gtm="bottom-tab-bar"
        >
            {/* 왼쪽 탭들 */}
            <div className="flex flex-1">
                {leftTabs.map((tab) => (
                    <TabButton key={tab.id} tab={tab} />
                ))}
            </div>

            {/* 중앙 FAB */}
            <div className="relative flex items-center justify-center" style={{ width: '80px' }}>
                <button
                    onClick={onCentralAction}
                    className="absolute -top-8 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform duration-200"
                    data-gtm="tab-central-fab"
                >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#D4A5F5] to-[#B87FE0] rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 bg-white rounded-full"></div>
                    </div>
                </button>
            </div>

            {/* 오른쪽 탭들 */}
            <div className="flex flex-1">
                {rightTabs.map((tab) => (
                    <TabButton key={tab.id} tab={tab} />
                ))}
            </div>
        </div>
    );
};

export default BottomTabBar;
