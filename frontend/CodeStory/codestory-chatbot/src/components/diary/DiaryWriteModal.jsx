import React, { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaXmark, FaFloppyDisk, FaCalendar } from 'react-icons/fa6';
import MoodSlider from './MoodSlider';

/**
 * DiaryWriteModal - 일기 작성 모달 (Mongle Pastel Theme)
 *
 * 날짜 선택, Mood Slider, Text Area 포함
 */
const DiaryWriteModal = ({ isOpen, onClose, onSave, initialDate = new Date() }) => {
    const [selectedDate, setSelectedDate] = useState(format(initialDate, 'yyyy-MM-dd'));
    const [moodScore, setMoodScore] = useState(50);
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!content.trim()) {
            alert('일기 내용을 입력해주세요!');
            return;
        }

        setIsSaving(true);
        try {
            const diaryData = {
                id: Date.now(),
                date: selectedDate,
                moodScore,
                content: content.trim(),
                emotionTag: getMoodEmotionTag(moodScore),
                createdAt: new Date().toISOString()
            };

            await onSave(diaryData);

            // 초기화
            setContent('');
            setMoodScore(50);
            setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
            onClose();
        } catch (error) {
            console.error('일기 저장 실패:', error);
            alert('일기 저장에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    // 점수에 따른 감정 태그 결정
    const getMoodEmotionTag = (score) => {
        if (score >= 80) return 'very_happy';
        if (score >= 60) return 'happy';
        if (score >= 40) return 'neutral';
        if (score >= 20) return 'sad';
        return 'very_sad';
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
            data-gtm="diary-write-modal-overlay"
        >
            <div
                className="relative w-full max-w-[430px] h-[85vh] bg-gradient-to-b from-[#FFF8F3] to-[#FFE8F0] rounded-3xl shadow-lg overflow-hidden animate-slide-up mx-4"
                onClick={(e) => e.stopPropagation()}
                data-gtm="diary-write-modal-content"
            >
                {/* 헤더 (흰색 배경 + Jua 폰트) */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white/60 backdrop-blur-md border-b border-[#FFD4DC]/30">
                    <h2 className="text-xl font-cute text-gray-700">일기 작성</h2>
                    <button
                        onClick={onClose}
                        className="text-xl text-gray-300 hover:text-gray-500 hover:scale-110 transition-transform"
                        data-gtm="diary-write-close-btn"
                    >
                        <FaXmark />
                    </button>
                </div>

                {/* 바디 */}
                <div className="overflow-y-auto h-[calc(100%-140px)] p-6 space-y-6">
                    {/* 날짜 선택 */}
                    <div data-gtm="diary-date-section">
                        <label className="flex items-center gap-2 text-sm font-cute text-gray-600 mb-2">
                            <FaCalendar className="text-[#FFB5C2]" />
                            날짜 선택
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-4 py-3 bg-white rounded-2xl border border-[#FFD4DC]/40 focus:border-[#FFB5C2] focus:outline-none transition-colors text-gray-600 font-cute"
                            data-gtm="diary-date-input"
                        />
                        <p className="mt-2 text-xs text-gray-400 font-cute">
                            {format(new Date(selectedDate), 'yyyy년 M월 d일 EEEE', { locale: ko })}
                        </p>
                    </div>

                    {/* Mood Slider */}
                    <div data-gtm="diary-mood-section">
                        <MoodSlider value={moodScore} onChange={setMoodScore} />
                    </div>

                    {/* Text Area */}
                    <div data-gtm="diary-content-section">
                        <label className="text-sm font-cute text-gray-600 mb-2 block">
                            오늘 있었던 일을 적어주세요
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="오늘 하루 어떤 일이 있었나요? 몽글이에게 들려주세요..."
                            className="w-full h-48 px-4 py-3 bg-white rounded-2xl border border-[#FFD4DC]/40 focus:border-[#FFB5C2] focus:outline-none transition-colors resize-none text-gray-600 placeholder:text-gray-300 font-cute text-sm"
                            data-gtm="diary-content-textarea"
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-400 font-cute">
                                {content.length} / 1000자
                            </span>
                            {content.length > 0 && (
                                <span className="text-xs text-[#FFB5C2] font-cute animate-fade-in">
                                    좋아요! 계속 써주세요
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 푸터 (저장 버튼) */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/60 backdrop-blur-md border-t border-[#FFD4DC]/30">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !content.trim()}
                        className="w-full py-3 bg-white text-[#FFB5C2] font-cute rounded-2xl shadow-sm hover:shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2 border-[#FFD4DC]/40"
                        data-gtm="diary-save-btn"
                    >
                        <FaFloppyDisk />
                        {isSaving ? '저장 중...' : '일기 저장하기'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiaryWriteModal;
