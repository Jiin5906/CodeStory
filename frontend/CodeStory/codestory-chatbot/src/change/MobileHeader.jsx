import React from 'react';
import { FaBars } from 'react-icons/fa';

const MobileHeader = ({ user, onMenuClick, notificationCount = 1 }) => {
    return (
        <header 
            className="sticky top-0 z-50 flex justify-between items-center px-5 py-4 bg-[#F5F7FA]/90 backdrop-blur-sm transition-all duration-300"
            data-gtm="view-mobile-header"
        >
            {/* 좌측: 햄버거 메뉴 (사이드바 열기용) */}
            <button 
                onClick={onMenuClick}
                className="p-2 -ml-2 hover:bg-gray-200/50 rounded-full transition-colors text-gray-700"
                aria-label="메뉴 열기"
            >
                <FaBars className="w-6 h-6" />
            </button>

            {/* 중앙: 앱 타이틀 */}
            <h1 className="text-lg font-bold text-gray-800 tracking-tight">나의 공감 일기</h1>

            {/* 우측: 알림 아이콘 */}
            <div className="relative cursor-pointer active:scale-95 transition-transform">
                <div className="p-2 bg-white rounded-full shadow-sm text-yellow-400 border border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                    </svg>
                </div>
                {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white shadow-sm"></span>
                )}
            </div>
        </header>
    );
};

export default MobileHeader;