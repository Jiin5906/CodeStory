import React from 'react';
import { FaHome, FaCalendarAlt, FaChartPie, FaCog, FaGlobe } from 'react-icons/fa'; // 지구본 아이콘 추가
import './Sidebar.css';

const Sidebar = ({ onWriteClick, currentView, onChangeView }) => {
    return (
        <div className="sidebar">
            <div className="logo-area">
                <h2>CodeStory</h2>
            </div>

            <button className="write-btn" onClick={onWriteClick}>
                + 일기 쓰기
            </button>

            <nav className="nav-menu">
                <ul>
                    <li className={currentView === 'dashboard' ? 'active' : ''} onClick={() => onChangeView('dashboard')}>
                        <FaHome /> 홈 피드
                    </li>
                    <li className={currentView === 'calendar' ? 'active' : ''} onClick={() => onChangeView('calendar')}>
                        <FaCalendarAlt /> 캘린더
                    </li>
                    <li className={currentView === 'stats' ? 'active' : ''} onClick={() => onChangeView('stats')}>
                        <FaChartPie /> 감정 통계
                    </li>
                    <li className={currentView === 'shared' ? 'active' : ''} onClick={() => onChangeView('shared')}>
                        <FaGlobe /> 감정 공유
                    </li>
                    <li className={currentView === 'settings' ? 'active' : ''} onClick={() => onChangeView('settings')}>
                        <FaCog /> 설정
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;