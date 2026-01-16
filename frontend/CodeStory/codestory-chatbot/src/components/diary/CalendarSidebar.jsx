import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { FaTimes, FaCalendarCheck } from 'react-icons/fa';
import './CalendarStyle.css'; 

const CalendarSidebar = ({ isOpen, onClose, selectedDate, onDateChange, writtenDates = [] }) => {
    return (
        <>
            {/* 1. 배경 어둡게 처리 (클릭하면 닫힘) */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* 2. 슬라이드 패널 */}
            <div className={`fixed top-0 left-0 h-full w-80 bg-zinc-900 border-r border-zinc-800 z-[60] transform transition-transform duration-300 ease-in-out shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                {/* 패널 헤더 */}
                <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold text-lg">
                        <FaCalendarCheck className="text-pink-500" />
                        <span>나의 기록</span>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg">
                        <FaTimes />
                    </button>
                </div>

                {/* 캘린더 영역 */}
                <div className="p-4 overflow-y-auto h-[calc(100%-80px)]">
                    <div className="calendar-wrapper bg-zinc-950/50 rounded-xl p-2 border border-zinc-800 mb-6">
                        <Calendar
                            onChange={(date) => {
                                onDateChange(date);
                                onClose(); // 날짜 선택하면 자동으로 닫힘 (원치 않으면 이 줄 삭제)
                            }}
                            value={selectedDate}
                            formatDay={(locale, date) => format(date, 'd')}
                            tileClassName={({ date }) => {
                                const dateStr = format(date, 'yyyy-MM-dd');
                                if (writtenDates.includes(dateStr)) return 'written-day';
                            }}
                        />
                    </div>

                    {/* 선택된 날짜 정보 */}
                    <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800/50">
                        <h3 className="text-sm font-medium text-pink-300 mb-1">
                            {format(selectedDate, 'yyyy년 M월 d일')}
                        </h3>
                        <p className="text-xs text-zinc-500">
                            작성된 일기를 클릭하면 대화 내용을 다시 볼 수 있습니다.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CalendarSidebar;