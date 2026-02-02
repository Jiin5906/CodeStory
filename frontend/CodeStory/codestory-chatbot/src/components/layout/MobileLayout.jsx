import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import BottomTabBar from '../dashboard/BottomTabBar';

/**
 * MobileLayout — 모바일 전용 레이아웃
 *
 * 모든 메인 페이지에서 BottomTabBar가 항상 표시되도록 하는 레이아웃
 */
const MobileLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 현재 활성 탭 결정
    const getActiveTab = () => {
        const path = location.pathname;
        if (path.includes('/stats') || path.includes('/report')) return 'report';
        if (path.includes('/settings')) return 'settings';
        if (path.includes('/diary')) return 'diary';
        if (path.includes('/calendar')) return 'diary'; // calendar도 diary 탭으로 간주
        return 'home';
    };

    const [activeTab, setActiveTab] = useState(getActiveTab());

    // 탭 변경 핸들러
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);

        // 라우트 매핑
        const routeMap = {
            home: '/dashboard',
            diary: '/diary',
            report: '/stats',
            settings: '/settings'
        };

        navigate(routeMap[tabId]);
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-gradient-to-br from-[#FFF8F3] via-[#FFE8F0] to-[#F5E8FF]">
            {/* 메인 콘텐츠 영역 (스크롤 가능) */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>

            {/* 하단 탭바 (항상 고정) */}
            <BottomTabBar
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />
        </div>
    );
};

export default MobileLayout;
