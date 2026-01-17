import React from 'react';
import { FaHome, FaCalendarAlt, FaChartPie, FaCog, FaGlobe } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ onWriteClick, currentView, onChangeView }) => {
    return (
        <div className="sidebar">
            <div className="logo-area">
                <h2>CodeStory</h2>
            </div>

            {/* ✅ ID와 클래스를 추가하여 '일기 쓰기' 클릭 추적 가능 */}
            <button 
                id="gtm-btn-write" 
                className="write-btn" 
                onClick={onWriteClick}
            >
                + 일기 쓰기
            </button>

            <nav className="nav-menu">
                <ul>
                    {/* ✅ data-gtm 속성을 사용하여 메뉴별 클릭 구분 가능 */}
                    <li 
                        className={currentView === 'dashboard' ? 'active gtm-nav-item' : 'gtm-nav-item'} 
                        data-gtm="nav-dashboard"
                        onClick={() => onChangeView('dashboard')}
                    >
                        <FaHome /> 홈 피드
                    </li>
                    <li 
                        className={currentView === 'calendar' ? 'active gtm-nav-item' : 'gtm-nav-item'} 
                        data-gtm="nav-calendar"
                        onClick={() => onChangeView('calendar')}
                    >
                        <FaCalendarAlt /> 캘린더
                    </li>
                    <li 
                        className={currentView === 'stats' ? 'active gtm-nav-item' : 'gtm-nav-item'} 
                        data-gtm="nav-stats"
                        onClick={() => onChangeView('stats')}
                    >
                        <FaChartPie /> 감정 통계
                    </li>
                    <li 
                        className={currentView === 'shared' ? 'active gtm-nav-item' : 'gtm-nav-item'} 
                        data-gtm="nav-shared"
                        onClick={() => onChangeView('shared')}
                    >
                        <FaGlobe /> 감정 공유
                    </li>
                    <li 
                        className={currentView === 'settings' ? 'active gtm-nav-item' : 'gtm-nav-item'} 
                        data-gtm="nav-settings"
                        onClick={() => onChangeView('settings')}
                    >
                        <FaCog /> 설정
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;