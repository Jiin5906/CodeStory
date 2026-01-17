import { FaPen, FaHome, FaRegCalendarAlt, FaChartPie, FaCog } from 'react-icons/fa';

const BottomNav = ({ onWriteClick }) => {
    return (
        <div className="bottom-nav-container" data-gtm="view-bottom-nav">
            <div className="bottom-nav">
                {/* 각 메뉴 아이템에 고유한 data-gtm을 부여했습니다. */}
                <div className="nav-item active" data-gtm="nav-bottom-home">
                    <FaHome className="pointer-events-none" />
                </div>
                <div className="nav-item" data-gtm="nav-bottom-calendar">
                    <FaRegCalendarAlt className="pointer-events-none" />
                </div>
                
                {/* 중앙 글쓰기 버튼을 위한 빈 공간 */}
                <div style={{ width: '60px' }}></div> 
                
                <div className="nav-item" data-gtm="nav-bottom-stats">
                    <FaChartPie className="pointer-events-none" />
                </div>
                <div className="nav-item" data-gtm="nav-bottom-settings">
                    <FaCog className="pointer-events-none" />
                </div>
            </div>

            {/* 핵심 액션: 글쓰기 버튼 (Floating Action Button) */}
            <button 
                className="fab-btn" 
                onClick={onWriteClick}
                data-gtm="nav-bottom-write-fab"
            >
                <FaPen className="pointer-events-none" />
            </button>
        </div>
    );
};

export default BottomNav;