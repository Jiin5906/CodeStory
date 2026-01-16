import { FaPen, FaHome, FaRegCalendarAlt, FaChartPie, FaCog } from 'react-icons/fa';

const BottomNav = ({ onWriteClick }) => {
    return (
        <div className="bottom-nav-container">
            <div className="bottom-nav">
                <div className="nav-item active"><FaHome /></div>
                <div className="nav-item"><FaRegCalendarAlt /></div>
                
                <div style={{ width: '60px' }}></div> 
                
                <div className="nav-item"><FaChartPie /></div>
                <div className="nav-item"><FaCog /></div>
            </div>

            <button className="fab-btn" onClick={onWriteClick}>
                <FaPen />
            </button>
        </div>
    );
};

export default BottomNav;