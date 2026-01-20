import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { format, isSameDay, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaChevronRight, FaQuoteLeft, FaShareAlt, FaTrash, FaTimes, FaGlobe, FaLock } from 'react-icons/fa';
import Lottie from 'lottie-react';
import mongleAnimation from '../../assets/mongleIDLE.json';
import CalendarModal from '../components/CalendarModal';

// --- [Sub Component] 일기 상세 보기 모달 ---
const DiaryDetailModal = ({ diary, isOpen, onClose, onToggleShare, onDelete }) => {
    if (!isOpen || !diary) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="bg-white w-full max-w-md h-[85vh] sm:h-auto sm:max-h-[80vh] sm:rounded-[2rem] rounded-t-[2rem] p-6 relative overflow-y-auto animate-slide-up shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-2 border-b border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500">{format(parseISO(diary.date), 'yyyy년 M월 d일 EEEE', { locale: ko })}</span>
                        <span className="text-xl font-bold text-gray-800">나의 기록</span>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><FaTimes /></button>
                </div>

                {/* Content */}
                <div className="space-y-6 pb-20">
                    {/* Mood & Title */}
                    <div className="flex items-center gap-3">
                        <div className="text-4xl">{diary.emoji}</div>
                        <div>
                            <span className="block text-xs text-[#7C71F5] font-bold mb-1">기분 {diary.mood}점</span>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">{diary.title || '제목 없음'}</h2>
                        </div>
                    </div>

                    {/* Image */}
                    {diary.imageUrl && (
                        <div className="rounded-2xl overflow-hidden shadow-sm">
                            <img src={diary.imageUrl} alt="diary" className="w-full object-cover" />
                        </div>
                    )}

                    {/* User Diary */}
                    <div className="bg-gray-50 rounded-2xl p-5 text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {diary.content}
                    </div>

                    {/* AI Response */}
                    {diary.aiResponse ? (
                        <div className="bg-[#F8F9FE] rounded-2xl p-6 relative border border-purple-100">
                            <FaQuoteLeft className="text-[#7C71F5] text-xl opacity-20 absolute top-4 left-4" />
                            <div className="pl-4 relative z-10">
                                <span className="text-xs font-bold text-[#7C71F5] mb-2 block">AI의 공감 답장</span>
                                <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{diary.aiResponse}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-4 bg-gray-50 rounded-xl text-gray-400 text-sm">
                            아직 AI 답장이 도착하지 않았어요.
                        </div>
                    )}
                </div>

                {/* Footer Actions (Fixed Bottom) */}
                <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 flex gap-3">
                    <button
                        onClick={() => onToggleShare(diary.id)}
                        className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${diary.shared ? 'bg-[#7C71F5] text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        {diary.shared ? <><FaGlobe /> 공유 중</> : <><FaLock /> 비공개</>}
                    </button>
                    <button
                        onClick={() => { if (window.confirm('삭제하시겠습니까?')) onDelete(diary.id); }}
                        className="w-14 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100"
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- [Sub Component] 타임라인(전체보기) 모달 ---
const TimelineModal = ({ diaries, isOpen, onClose, onSelectDiary }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-[#F5F7FA] w-full max-w-md h-[90vh] rounded-t-[2rem] sm:rounded-[2rem] relative overflow-hidden flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="bg-white p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                    <h2 className="text-lg font-bold text-gray-800">지난 추억 모아보기</h2>
                    <button onClick={onClose}><FaTimes className="text-gray-400" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {diaries.length === 0 ? (
                        <div className="text-center text-gray-400 mt-20">작성된 일기가 없습니다.</div>
                    ) : (
                        diaries.map(diary => (
                            <div key={diary.id} onClick={() => onSelectDiary(diary)} className="bg-white p-4 rounded-2xl shadow-sm active:scale-98 transition-transform cursor-pointer flex gap-4 border border-gray-50">
                                <div className="flex flex-col items-center justify-center min-w-[50px]">
                                    <span className="text-2xl">{diary.emoji}</span>
                                    <span className="text-xs font-bold text-gray-400 mt-1">{format(parseISO(diary.date), 'M.d')}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-800 truncate">{diary.title || '제목 없음'}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{diary.content}</p>
                                </div>
                                <div className="flex items-center text-gray-300"><FaChevronRight /></div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- [Main Component] 메인 대시보드 ---
const MainDashboard = ({ user, diaries = [], onWriteClick, onNavigate, onToggleShare, onDelete }) => { // props 추가됨

    // State
    const [selectedDiary, setSelectedDiary] = useState(null); // 상세 보기용
    const [isTimelineOpen, setIsTimelineOpen] = useState(false); // 전체 보기용
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [calendarDate, setCalendarDate] = useState(new Date());

    // Logic: 오늘 일기 찾기
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayDiary = diaries.find(d => d.date === today);

    // Logic: Streak 계산 (기존 유지)
    const currentStreak = useMemo(() => {
        // ... (기존 스트릭 로직 유지) ...
        if (!diaries.length) return 0;
        const sorted = [...new Set(diaries.map(d => d.date))].sort();
        // (간소화된 예시) 실제로는 상세 로직 필요
        return diaries.length > 0 ? diaries.length : 0;
    }, [diaries]);

    // (이하 렌더링 부분에서 todayDiary 유무에 따른 분기 처리 적용)

    return (
        <div className="bg-[#F5F7FA] min-h-screen pb-32">
            {/* ... Modals ... */}
            <DiaryDetailModal
                diary={selectedDiary}
                isOpen={!!selectedDiary}
                onClose={() => setSelectedDiary(null)}
                onToggleShare={onToggleShare}
                onDelete={onDelete}
            />
            <TimelineModal
                diaries={diaries}
                isOpen={isTimelineOpen}
                onClose={() => setIsTimelineOpen(false)}
                onSelectDiary={(d) => { setSelectedDiary(d); }} // 타임라인에서 클릭 시 상세 보기 오픈
            />
            {/* ... CalendarModal ... */}

            <main className="px-5 pt-2">
                {/* ... Streak Section (기존 유지) ... */}

                {/* ... Lottie Section (기존 유지) ... */}

                {/* ★ [핵심 수정] 오늘의 기록 카드 ★ */}
                <section className="mt-10">
                    {todayDiary ? (
                        // 1. 작성 완료된 상태 (클릭 시 내용 확인)
                        <div
                            onClick={() => setSelectedDiary(todayDiary)}
                            className="bg-white rounded-[2rem] p-7 shadow-lg shadow-purple-100/50 border border-purple-50 relative overflow-hidden cursor-pointer active:scale-98 transition-transform"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">오늘의 기록</h2>
                                <span className="px-3 py-1 bg-[#7C71F5] text-white text-xs font-bold rounded-full">작성 완료!</span>
                            </div>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="text-4xl bg-gray-50 rounded-2xl w-16 h-16 flex items-center justify-center">{todayDiary.emoji}</div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-800 text-lg truncate">{todayDiary.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                        {todayDiary.aiResponse ? `AI: ${todayDiary.aiResponse}` : todayDiary.content}
                                    </p>
                                </div>
                            </div>
                            <div className="w-full py-3 rounded-xl bg-[#F5F7FA] text-[#7C71F5] font-bold text-sm flex items-center justify-center gap-2">
                                내용 자세히 보기 <FaChevronRight size={10} />
                            </div>
                        </div>
                    ) : (
                        // 2. 작성 전 상태 (기존 코드)
                        <div
                            onClick={onWriteClick}
                            className="bg-white rounded-[2rem] p-7 shadow-lg shadow-gray-200/50 border border-gray-100 relative overflow-hidden group cursor-pointer active:scale-98 transition-transform"
                        >
                            {/* ... 기존 작성 유도 UI ... */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-50 rounded-full blur-3xl -z-0 translate-x-10 -translate-y-10 opacity-70"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-5">
                                    <h2 className="text-xl font-bold text-gray-800">오늘의 기록</h2>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-400 text-xs font-bold rounded-full">작성 전</span>
                                </div>
                                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                    아직 기록된 이야기가 없어요.<br /> 오늘 느낀 소소한 감정을 털어놓아 보세요.
                                </p>
                                <button className="w-full bg-[#7C71F5] text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-purple-200 flex items-center justify-center gap-2">
                                    <span>✏️</span> <span>일기 쓰러 가기</span>
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* ★ [핵심 수정] 지난 추억 전체보기 연결 ★ */}
                <section className="mt-8">
                    <div className="flex justify-between items-end mb-4 px-1">
                        <h3 className="text-gray-800 font-bold text-lg">지난 추억</h3>
                        <button
                            className="text-gray-400 text-xs font-medium hover:text-[#7C71F5] flex items-center gap-1"
                            onClick={() => setIsTimelineOpen(true)} // 클릭 시 타임라인 모달 오픈
                        >
                            전체보기 <FaChevronRight size={10} />
                        </button>
                    </div>
                    {/* 가로 스크롤 리스트 (기존 유지, 클릭 시 상세 보기 연결) */}
                    <div className="flex gap-3 overflow-x-auto pb-6 snap-x hide-scrollbar px-1">
                        {diaries.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedDiary(item)}
                                className="min-w-[120px] bg-white p-4 rounded-2xl shadow-sm border border-gray-50 snap-center flex flex-col items-center active:scale-95 transition-transform"
                            >
                                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-xl mb-3">{item.emoji}</div>
                                <span className="text-gray-800 font-bold text-sm">{format(parseISO(item.date), 'M월 d일')}</span>
                                <span className="text-gray-400 text-xs mt-1">기분 {item.mood}점</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default MainDashboard;