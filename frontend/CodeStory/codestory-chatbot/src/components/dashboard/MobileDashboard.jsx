import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaChevronRight } from 'react-icons/fa';
import Lottie from 'lottie-react';
import mongleAnimation from '../../assets/mongleIDLE.json';

// 불꽃 애니메이션 스타일 정의 (CSS-in-JS)
const fireStyle = `
  @keyframes burn {
    0% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(255, 100, 0, 0.3)); }
    50% { transform: scale(1.05); filter: drop-shadow(0 0 6px rgba(255, 69, 0, 0.5)); }
    100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(255, 100, 0, 0.3)); }
  }
  .burning-icon { animation: burn 2s infinite ease-in-out; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

const MobileDashboard = ({ user, diaries, onWriteClick }) => {
    // Streak 데이터 (가라 데이터, 추후 실제 props로 연결)
    const streakDays = 5;
    const maxStreak = 7;
    const fillPercentage = Math.min((streakDays / maxStreak) * 100, 100);

    // 요일 배열 (월~일)
    const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
    const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // 0(일) -> 6, 1(월) -> 0

    return (
        <div
            className="min-h-screen pb-32"
            style={{ backgroundColor: 'var(--bg-color, #F5F7FA)' }}
        >
            <style>{fireStyle}</style>

            <main className="px-5 pt-2">

                {/* 1. Streak Section: 불꽃 기록 위젯 */}
                <section className="mt-2 mb-6">
                    <div
                        className="rounded-3xl p-5 shadow-sm relative overflow-hidden"
                        style={{
                            backgroundColor: 'var(--card-bg, white)',
                            border: '1px solid var(--border-color, #F3F4F6)'
                        }}
                        data-gtm="mobile-streak-widget"
                    >

                        <div className="flex justify-between items-center mb-4 cursor-pointer group">
                            <div className="flex items-center gap-3">
                                {/* 불꽃 아이콘 Wrapper */}
                                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 relative">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 burning-icon" viewBox="0 0 20 20">
                                        <defs>
                                            <linearGradient id="fireFill" x1="0%" y1="100%" x2="0%" y2="0%">
                                                <stop offset={`${fillPercentage}%`} stopColor="#FF5722" />
                                                <stop offset={`${fillPercentage}%`} stopColor="#E5E7EB" />
                                            </linearGradient>
                                        </defs>
                                        <path fill="url(#fireFill)" stroke="#FF5722" strokeWidth="0.5" fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                    </svg>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-xs text-orange-400 font-bold">Great! 잘하고 있어요</span>
                                    <span
                                        className="font-bold text-lg leading-none"
                                        style={{ color: 'var(--text-color, #1F2937)' }}
                                    >
                                        {streakDays}일 연속 기록 중
                                    </span>
                                </div>
                            </div>

                            <div
                                className="group-hover:text-[#7C71F5] transition-colors"
                                style={{ color: 'var(--sub-text-color, #D1D5DB)' }}
                            >
                                <FaChevronRight />
                            </div>
                        </div>

                        {/* 요일 표시 */}
                        <div className="flex justify-between items-center text-center px-1">
                            {weekDays.map((day, idx) => {
                                const isToday = idx === todayIndex;
                                return (
                                    <div key={day} className={`flex flex-col gap-1 items-center ${isToday ? 'relative' : 'opacity-40'}`}>
                                        <span className={`text-xs font-medium ${day === '일' ? 'text-red-400' : ''} ${isToday ? 'font-bold' : ''}`}
                                            style={{ color: isToday ? 'var(--text-color, #1F2937)' : (day === '일' ? '#F87171' : 'var(--sub-text-color, #6B7280)') }}
                                        >
                                            {day}
                                        </span>
                                        <div className={`w-2 h-2 rounded-full ${isToday ? 'bg-[#7C71F5]' : 'bg-gray-200'}`}></div>
                                        {isToday && (
                                            <svg className="w-3 h-3 text-[#7C71F5] absolute -bottom-4 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 8L6 16h12l-6-8z" />
                                            </svg>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 2. Hero Section: Lottie 캐릭터 & 인사말 */}
                <section className="mt-4 flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-[260px] aspect-square flex items-center justify-center group cursor-pointer" onClick={onWriteClick}>
                        {/* 배경 효과 */}
                        <div className="absolute -z-10 w-[120%] h-[120%] bg-gradient-to-t from-purple-100/60 to-blue-50/60 rounded-full blur-3xl animate-pulse"></div>

                        {/* 캐릭터 박스 */}
                        <div className="w-full h-full bg-white/40 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center border-2 border-white/60 shadow-xl overflow-hidden relative transition-transform duration-500 group-hover:scale-105">
                            {/* Lottie Animation */}
                            <Lottie
                                animationData={mongleAnimation}
                                loop={true}
                                autoplay={true}
                                style={{ width: 160, height: 160 }}
                            />
                        </div>

                        {/* 말풍선 */}
                        <div className="absolute -bottom-5 bg-gray-800 text-white text-[12px] font-bold px-4 py-2.5 rounded-2xl shadow-xl transform translate-y-2">
                            오늘 하루는 어땠나요? 👂
                            <div className="absolute top-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-800 rotate-45"></div>
                        </div>
                    </div>
                </section>

                {/* 3. Main Action Card: 일기 쓰기 */}
                <section className="mt-10">
                    <div
                        onClick={onWriteClick}
                        className="rounded-[2rem] p-7 shadow-lg shadow-gray-200/50 relative overflow-hidden group cursor-pointer transition-transform active:scale-98"
                        style={{
                            backgroundColor: 'var(--card-bg, white)',
                            border: '1px solid var(--border-color, #F3F4F6)'
                        }}
                        data-gtm="mobile-write-card"
                    >
                        {/* 배경 데코 */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-50 rounded-full blur-3xl -z-0 translate-x-10 -translate-y-10 opacity-70"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-5">
                                <h2
                                    className="text-xl font-bold"
                                    style={{ color: 'var(--text-color, #1F2937)' }}
                                >
                                    오늘의 기록
                                </h2>
                                <span className="px-3 py-1 bg-purple-50 text-[#7C71F5] text-xs font-bold rounded-full">작성 전</span>
                            </div>
                            <p
                                className="text-sm leading-relaxed mb-8"
                                style={{ color: 'var(--sub-text-color, #6B7280)' }}
                            >
                                아직 기록된 이야기가 없어요.<br />
                                오늘 느낀 소소한 감정을 털어놓아 보세요.
                            </p>
                            <button className="w-full bg-[#7C71F5] hover:bg-[#6A5FE0] text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2">
                                <span>✏️</span>
                                <span>일기 쓰러 가기</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* 4. Past Memories: 가로 스크롤 섹션 */}
                <section className="mt-8">
                    <div className="flex justify-between items-end mb-4 px-1">
                        <h3
                            className="font-bold text-lg"
                            style={{ color: 'var(--text-color, #1F2937)' }}
                        >
                            지난 추억
                        </h3>
                        <button
                            className="text-xs font-medium hover:text-[#7C71F5]"
                            style={{ color: 'var(--sub-text-color, #9CA3AF)' }}
                        >
                            전체보기 &gt;
                        </button>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-6 snap-x hide-scrollbar px-1">
                        {/* 더미 데이터 매핑 (실제 diaries 데이터 연동 필요) */}
                        {[
                            { date: '1월 18일', mood: 3, emoji: '🙂', color: 'bg-yellow-50' },
                            { date: '1월 17일', mood: 5, emoji: '🥰', color: 'bg-pink-50' },
                            { date: '1월 16일', mood: 2, emoji: '💧', color: 'bg-blue-50' },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="min-w-[120px] p-4 rounded-2xl shadow-sm snap-center flex flex-col items-center"
                                style={{
                                    backgroundColor: 'var(--card-bg, white)',
                                    border: '1px solid var(--border-color, #F9FAFB)'
                                }}
                                data-gtm="mobile-memory-card"
                            >
                                <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center text-xl mb-3`}>{item.emoji}</div>
                                <span
                                    className="font-bold text-sm"
                                    style={{ color: 'var(--text-color, #1F2937)' }}
                                >
                                    {item.date}
                                </span>
                                <span
                                    className="text-xs mt-1"
                                    style={{ color: 'var(--sub-text-color, #9CA3AF)' }}
                                >
                                    기분 {item.mood}점
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
};

export default MobileDashboard;
