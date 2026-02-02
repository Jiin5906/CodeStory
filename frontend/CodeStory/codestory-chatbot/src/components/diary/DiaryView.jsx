import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { useDiary } from '../../context/DiaryContext';
import DiaryWriteModal from './DiaryWriteModal';

/**
 * DiaryView - 일기 메인 화면
 *
 * Empty State + List Mode
 */
const DiaryView = () => {
    const { diaries, addDiary, deleteDiary, loading } = useDiary();
    const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

    const handleSaveDiary = async (diaryData) => {
        addDiary(diaryData);
        console.log('일기 저장됨:', diaryData);

        // GTM 이벤트
        if (window.dataLayer) {
            window.dataLayer.push({ event: 'diary_created', mood_score: diaryData.moodScore });
        }
    };

    const handleDeleteDiary = (id) => {
        if (window.confirm('정말 이 일기를 삭제하시겠어요?')) {
            deleteDiary(id);

            // GTM 이벤트
            if (window.dataLayer) {
                window.dataLayer.push({ event: 'diary_deleted' });
            }
        }
    };

    // 점수에 따른 이모지 반환
    const getMoodEmoji = (score) => {
        if (score >= 80) return '😄';
        if (score >= 60) return '😊';
        if (score >= 40) return '😐';
        if (score >= 20) return '😔';
        return '😢';
    };

    // 점수에 따른 색상 반환
    const getMoodColor = (score) => {
        if (score >= 80) return 'from-pink-100 to-pink-200 border-pink-300';
        if (score >= 60) return 'from-yellow-100 to-pink-100 border-yellow-300';
        if (score >= 40) return 'from-gray-100 to-yellow-100 border-gray-300';
        if (score >= 20) return 'from-blue-100 to-gray-100 border-blue-300';
        return 'from-blue-200 to-blue-100 border-blue-400';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full" data-gtm="diary-loading">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-bounce">📔</div>
                    <p className="text-gray-500">일기를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative w-full h-full overflow-y-auto bg-gradient-to-b from-[#FFF8F3] to-[#FFE8F0]"
            style={{ paddingBottom: '4.5rem' }}
            data-gtm="view-diary"
        >
            {/* 헤더 */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#FFD4DC]/30 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">📔 나의 일기</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {diaries.length > 0
                                ? `총 ${diaries.length}개의 소중한 기록`
                                : '첫 일기를 작성해보세요'}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsWriteModalOpen(true)}
                        className="w-14 h-14 bg-gradient-to-r from-[#FFB5C2] to-[#FF9AAB] text-white rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center text-2xl"
                        data-gtm="diary-fab-write-btn"
                    >
                        <FaPlus />
                    </button>
                </div>
            </div>

            {/* 바디 */}
            <div className="px-6 py-6">
                {diaries.length === 0 ? (
                    /* Empty State */
                    <div
                        className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in"
                        data-gtm="diary-empty-state"
                    >
                        <div className="relative mb-6">
                            {/* 몽글이 펜 들고 있는 이미지 대신 큰 이모지 */}
                            <div className="text-9xl animate-bounce">✍️</div>
                            <div className="absolute -bottom-2 -right-2 text-5xl">🌸</div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-700 mb-3 text-center">
                            아직 작성된 일기가 없어요
                        </h2>
                        <p className="text-gray-500 text-center mb-8 px-4">
                            몽글이에게 오늘 하루를 들려주세요!<br />
                            당신의 이야기가 몽글이를 더 똑똑하게 만들어요 💝
                        </p>
                        <button
                            onClick={() => setIsWriteModalOpen(true)}
                            className="px-8 py-4 bg-gradient-to-r from-[#FFB5C2] to-[#FF9AAB] text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center gap-3"
                            data-gtm="diary-empty-write-btn"
                        >
                            <FaPlus />
                            첫 일기 쓰러 가기
                        </button>
                    </div>
                ) : (
                    /* List Mode */
                    <div className="space-y-4 animate-fade-in" data-gtm="diary-list-section">
                        {diaries.map((diary) => (
                            <div
                                key={diary.id}
                                className={`bg-gradient-to-br ${getMoodColor(diary.moodScore)} backdrop-blur-sm rounded-3xl p-6 border-2 shadow-md hover:shadow-lg transition-all`}
                                data-gtm={`diary-card-${diary.id}`}
                            >
                                {/* 카드 헤더 */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl">{getMoodEmoji(diary.moodScore)}</span>
                                        <div>
                                            <p className="text-sm font-bold text-gray-600">
                                                {format(parseISO(diary.date), 'yyyy년 M월 d일', { locale: ko })}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {format(parseISO(diary.date), 'EEEE', { locale: ko })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1 bg-white/60 rounded-full text-xs font-bold text-[#FFB5C2]">
                                            {diary.moodScore}점
                                        </div>
                                        <button
                                            onClick={() => handleDeleteDiary(diary.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            data-gtm={`diary-delete-${diary.id}`}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>

                                {/* 카드 내용 */}
                                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {diary.content.length > 150
                                            ? `${diary.content.substring(0, 150)}...`
                                            : diary.content}
                                    </p>
                                </div>

                                {/* 카드 푸터 */}
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-xs text-gray-400">
                                        {format(parseISO(diary.createdAt), 'HH:mm', { locale: ko })} 작성
                                    </span>
                                    {diary.content.length > 150 && (
                                        <button
                                            className="text-xs text-[#FFB5C2] font-bold hover:underline"
                                            data-gtm={`diary-read-more-${diary.id}`}
                                        >
                                            더 보기 →
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Action Button (리스트가 있을 때도 표시) */}
            {diaries.length > 0 && (
                <button
                    onClick={() => setIsWriteModalOpen(true)}
                    className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-r from-[#FFB5C2] to-[#FF9AAB] text-white rounded-full shadow-2xl hover:shadow-xl active:scale-95 transition-all flex items-center justify-center text-3xl z-50 animate-bounce"
                    data-gtm="diary-fab-floating-btn"
                    style={{ animationDuration: '2s' }}
                >
                    <FaPlus />
                </button>
            )}

            {/* Write Modal */}
            <DiaryWriteModal
                isOpen={isWriteModalOpen}
                onClose={() => setIsWriteModalOpen(false)}
                onSave={handleSaveDiary}
            />
        </div>
    );
};

export default DiaryView;
