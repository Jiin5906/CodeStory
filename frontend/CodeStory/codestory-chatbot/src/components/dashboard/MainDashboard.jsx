import React, { useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaTrash, FaGlobe, FaLock, FaChevronLeft, FaChevronRight, FaQuoteLeft } from 'react-icons/fa';
import Lottie from 'lottie-react';
import { diaryApi } from '../../services/api';
import mongleAnimation from '../../assets/mongleIDLE.json';

const MainDashboard = ({ user, diaries, selectedDate, onDateChange, onRefresh }) => {
    const [localDiaries, setLocalDiaries] = useState(diaries);

    useEffect(() => {
        setLocalDiaries(diaries);
    }, [diaries]);

    const dailyDiaries = localDiaries
        .filter(d => isSameDay(new Date(d.date), selectedDate))
        .sort((a, b) => b.id - a.id);

    const changeDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        onDateChange(newDate);
    };

    const handleDelete = async (id) => {
        if (window.confirm('정말 이 일기를 삭제하시겠습니까?')) {
            try {
                await diaryApi.deleteDiary(id);
                alert('삭제되었습니다.');
                if (onRefresh) onRefresh();
                else window.location.reload();
            } catch (e) {
                console.error("삭제 실패:", e);
                alert("삭제 중 오류가 발생했습니다.");
            }
        }
    };

    const handleToggleShare = async (id, currentStatus) => {
        const confirmMessage = currentStatus ? "공유를 해제하시겠습니까?" : "일기를 커뮤니티에 공유하시겠습니까?";
        if (!window.confirm(confirmMessage)) return;

        setLocalDiaries(prev => prev.map(d => d.id === id ? { ...d, shared: !currentStatus } : d));

        try {
            await diaryApi.toggleShare(id);
            if (onRefresh) onRefresh();
        } catch (e) {
            console.error("상태 변경 실패:", e);
            alert("서버 연결에 실패했습니다.");
            setLocalDiaries(diaries);
        }
    };

    return (
        <div
            className="flex-1 min-h-screen px-12 py-10 overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-color)' }}
            data-gtm="view-dashboard"
        >

            {/* 1. Hero Section: 몽글이와 인사 */}
            <section
                className="rounded-[2.5rem] p-8 shadow-sm flex items-center justify-between mb-10 relative overflow-hidden"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)'
                }}
            >
                {/* 배경 데코레이션 */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -z-0 translate-x-20 -translate-y-20"></div>

                <div className="relative z-10 pl-4">
                    <p
                        className="font-medium mb-2 text-lg"
                        style={{ color: 'var(--sub-text-color)' }}
                    >
                        {format(selectedDate, 'yyyy년 M월 d일 EEEE', { locale: ko })}
                    </p>
                    <h1
                        className="text-3xl font-bold leading-snug"
                        style={{ color: 'var(--text-color)' }}
                    >
                        반가워요, <span className="text-[#7C71F5]">{user?.nickname || '게스트'}</span>님!<br/>
                        오늘 어떤 하루를 보내셨나요?
                    </h1>
                </div>

                <div className="relative z-10 flex flex-col items-center" data-gtm="dashboard-mongle-animation">
                    <div className="w-40 h-40 bg-purple-50 rounded-full flex items-center justify-center">
                        <Lottie animationData={mongleAnimation} loop={true} autoplay={true} style={{ width: 140, height: 140 }} />
                    </div>
                </div>
            </section>

            {/* 2. 날짜 이동 컨트롤 (넓은 스타일) */}
            <div className="flex items-center justify-center gap-8 mb-8">
                <button
                    onClick={() => changeDate(-1)}
                    className="p-3 rounded-full shadow-md transition-all"
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--sub-text-color)',
                        border: '1px solid var(--border-color)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#7C71F5';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--sub-text-color)';
                        e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
                    }}
                    data-gtm="dashboard-prev-date"
                >
                    <FaChevronLeft />
                </button>
                <div className="text-center" data-gtm="dashboard-current-date-display">
                    <span
                        className="block text-4xl font-black tracking-tight"
                        style={{ color: 'var(--text-color)' }}
                    >
                        {format(selectedDate, 'd')}
                    </span>
                    <span
                        className="block text-sm font-bold uppercase tracking-widest mt-1"
                        style={{ color: 'var(--sub-text-color)' }}
                    >
                        {format(selectedDate, 'MMMM', { locale: ko })}
                    </span>
                </div>
                <button
                    onClick={() => changeDate(1)}
                    className="p-3 rounded-full shadow-md transition-all"
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--sub-text-color)',
                        border: '1px solid var(--border-color)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#7C71F5';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--sub-text-color)';
                        e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
                    }}
                    data-gtm="dashboard-next-date"
                >
                    <FaChevronRight />
                </button>
            </div>

            {/* 3. 일기 리스트 섹션 */}
            <div className="max-w-3xl mx-auto">
                {dailyDiaries.length > 0 ? (
                    <div className="space-y-8">
                        {dailyDiaries.map((diary) => (
                            <article
                                key={diary.id}
                                className="rounded-[2rem] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-1 duration-300"
                                style={{
                                    backgroundColor: 'var(--card-bg)',
                                    border: '1px solid var(--border-color)'
                                }}
                                data-gtm="dashboard-diary-card"
                            >
                                {/* Header: 기분 & 액션 */}
                                <div className="flex justify-between items-start mb-6">
                                    <div
                                        className="flex items-center gap-3 px-4 py-2 rounded-2xl"
                                        style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
                                    >
                                        <span className="text-2xl">{diary.emoji}</span>
                                        <div
                                            className="h-4 w-[1px]"
                                            style={{ backgroundColor: 'var(--border-color)' }}
                                        ></div>
                                        <span
                                            className="font-bold text-sm"
                                            style={{ color: 'var(--text-color)' }}
                                        >
                                            기분 {diary.mood}점
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleToggleShare(diary.id, diary.shared); }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${diary.shared ? 'bg-purple-100 text-[#7C71F5]' : ''}`}
                                            style={!diary.shared ? {
                                                backgroundColor: 'rgba(0,0,0,0.05)',
                                                color: 'var(--sub-text-color)'
                                            } : {}}
                                            onMouseEnter={(e) => {
                                                if (!diary.shared) {
                                                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.08)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!diary.shared) {
                                                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
                                                }
                                            }}
                                        >
                                            {diary.shared ? <><FaGlobe /> 공유됨</> : <><FaLock /> 비공개</>}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(diary.id)}
                                            className="p-2 rounded-lg transition-colors"
                                            style={{
                                                color: 'var(--sub-text-color)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(250, 82, 82, 0.1)';
                                                e.currentTarget.style.color = '#FA5252';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = 'var(--sub-text-color)';
                                            }}
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Body: 이미지 & 텍스트 */}
                                {diary.imageUrl && (
                                    <div className="rounded-2xl overflow-hidden mb-6 shadow-sm">
                                        <img src={diary.imageUrl} alt="diary" className="w-full h-auto object-cover max-h-[400px]" />
                                    </div>
                                )}

                                {diary.title && (
                                    <h3
                                        className="text-xl font-bold mb-4"
                                        style={{ color: 'var(--text-color)' }}
                                    >
                                        {diary.title}
                                    </h3>
                                )}
                                <p
                                    className="leading-relaxed whitespace-pre-line text-lg mb-8"
                                    style={{ color: 'var(--text-color)' }}
                                >
                                    {diary.content}
                                </p>

                                {/* Footer: AI 답변 & 태그 */}
                                {diary.aiResponse && (
                                    <div
                                        className="rounded-2xl p-6 relative group"
                                        style={{
                                            backgroundColor: 'rgba(124, 113, 245, 0.05)',
                                            border: '1px solid var(--border-color)'
                                        }}
                                    >
                                        <FaQuoteLeft className="text-[#7C71F5] text-xl opacity-20 absolute top-4 left-4" />
                                        <div className="pl-6 relative z-10">
                                            <span className="text-xs font-bold text-[#7C71F5] mb-2 block tracking-wide">AI CodeStory의 공감 편지</span>
                                            <p
                                                className="leading-relaxed text-sm"
                                                style={{ color: 'var(--text-color)' }}
                                            >
                                                {diary.aiResponse}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2 mt-6">
                                    {diary.tags?.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 rounded-full text-xs font-medium"
                                            style={{
                                                backgroundColor: 'var(--card-bg)',
                                                border: '1px solid var(--border-color)',
                                                color: 'var(--sub-text-color)'
                                            }}
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                        <div className="text-6xl mb-4 grayscale opacity-50">📝</div>
                        <p
                            className="font-medium text-lg"
                            style={{ color: 'var(--sub-text-color)' }}
                        >
                            아직 작성된 일기가 없어요.
                        </p>
                        <p
                            className="text-sm mt-1"
                            style={{ color: 'var(--sub-text-color)' }}
                        >
                            오늘의 소중한 감정을 기록해볼까요?
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainDashboard;
