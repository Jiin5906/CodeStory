import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import BottomTabBar from '../dashboard/BottomTabBar';
import { useTour } from '../../context/TourContext';
import AppTour from '../tour/AppTour';

/**
 * MobileLayout — 모바일 전용 레이아웃
 *
 * 모든 메인 페이지에서 BottomTabBar가 항상 표시되도록 하는 레이아웃
 */
const MobileLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isTourActive, currentStep, advanceTour } = useTour();

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

        const routeMap = {
            home: '/dashboard',
            diary: '/diary',
            report: '/stats',
            settings: '/settings'
        };

        navigate(routeMap[tabId]);

        // 투어: diary-tab 단계에서 일기 탭 클릭 감지
        if (isTourActive && currentStep?.id === 'diary-tab' && tabId === 'diary') {
            setTimeout(advanceTour, 300); // 라우트 전환 후 진행
        }
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

            {/* 앱 투어 오버레이 */}
            <AppTour />
        </div>
    );
};

export default MobileLayout;
