import React, { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaPlus, FaTrash, FaBookOpen, FaFaceSmile, FaFaceMeh, FaFaceFrown, FaFaceSadTear, FaFaceGrinBeam } from 'react-icons/fa6';
import { useDiary } from '../../context/DiaryContext';
import { usePet } from '../../context/PetContext';
import { useStore } from '../../context/StoreContext';
import { useTour } from '../../context/TourContext';
import DiaryWriteModal from './DiaryWriteModal';

/**
 * DiaryView - 일기 메인 화면 (Mongle Pastel Theme)
 *
 * Empty State + List Mode
 */
const DiaryView = () => {
    const { diaries, addDiary, deleteDiary, loading } = useDiary();
    const { triggerDiaryReward } = usePet();
    const { isTourActive, currentStep, advanceTour } = useTour();
    const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

    const { equippedItems, getEquippedItem } = useStore();
    const theme = useMemo(() => getEquippedItem('theme'), [equippedItems, getEquippedItem]);

    const accentColor = theme?.accentColor || '#FFB5C2';
    const primaryColor = theme?.decorationColors?.primary || '#FFD4DC';
    const bgFrom = theme?.bgFrom || '#FFF8F3';
    const bgTo = theme?.bgTo || '#FFE8F0';

    const handleSaveDiary = async (diaryData) => {
        addDiary(diaryData);
        console.log('일기 저장됨:', diaryData);

        // 코인 보상
        triggerDiaryReward();

        // 투어: diary-save 단계 완료 (저장 시 report-tab으로 이동)
        if (isTourActive && currentStep?.id === 'diary-save') {
            setTimeout(advanceTour, 400);
        }

        // GTM 이벤트
        if (window.dataLayer) {
            window.dataLayer.push({ event: 'diary_created', mood_score: diaryData.moodScore });
        }
    };

    // 일기 작성 모달 열기 + 투어 diary-write 단계 완료
    const handleOpenWriteModal = () => {
        setIsWriteModalOpen(true);
        if (isTourActive && currentStep?.id === 'diary-write') {
            setTimeout(advanceTour, 300);
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

    // 점수에 따른 FontAwesome 아이콘 반환
    const getMoodIcon = (score) => {
        if (score >= 80) return <FaFaceGrinBeam style={{ color: accentColor }} />; // 아주 좋음
        if (score >= 60) return <FaFaceSmile className="text-[#FFD4A5]" />; // 좋음
        if (score >= 40) return <FaFaceMeh className="text-gray-400" />; // 보통
        if (score >= 20) return <FaFaceFrown className="text-blue-300" />; // 나쁨
        return <FaFaceSadTear className="text-blue-400" />; // 아주 나쁨
    };

    // 점수에 따른 테두리 색상 반환
    const getMoodBorderStyle = (score) => {
        if (score >= 80) return { borderColor: accentColor };
        if (score >= 60) return { borderColor: '#FFD4A5' };
        if (score >= 40) return { borderColor: '#D1D5DB' };
        if (score >= 20) return { borderColor: '#BFDBFE' };
        return { borderColor: '#93C5FD' };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full" data-gtm="diary-loading">
                <div className="text-center">
                    <FaBookOpen className="text-6xl mb-4 mx-auto animate-bounce" style={{ color: `${accentColor}80` }} />
                    <p className="text-gray-500 font-cute">일기를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative w-full h-full overflow-y-auto"
            style={{
                paddingBottom: '4.5rem',
                background: `linear-gradient(to bottom, ${bgFrom}, ${bgTo})`
            }}
            data-gtm="view-diary"
        >
            {/* 헤더 (투명 배경 + Jua 폰트) */}
            <div
                className="sticky top-0 z-10 bg-white/60 backdrop-blur-md px-6 py-4"
                style={{ borderBottom: `1px solid ${primaryColor}4D` }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-cute text-gray-700 flex items-center gap-2">
                            <FaBookOpen style={{ color: accentColor }} />
                            나의 일기
                        </h1>
                        <p className="text-xs text-gray-500 mt-1 font-cute">
                            {diaries.length > 0
                                ? `총 ${diaries.length}개의 소중한 기록`
                                : '첫 일기를 작성해보세요'}
                        </p>
                    </div>
                    <button
                        onClick={handleOpenWriteModal}
                        className="w-12 h-12 bg-white rounded-full shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center border-2"
                        style={{ color: accentColor, borderColor: `${primaryColor}66` }}
                        data-gtm="diary-fab-write-btn"
                    >
                        <FaPlus className="text-xl" />
                    </button>
                </div>
            </div>

            {/* 바디 */}
            <div className="px-6 py-6">
                {diaries.length === 0 ? (
                    /* Empty State (심플한 라인 아이콘) */
                    <div
                        className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in"
                        data-gtm="diary-empty-state"
                    >
                        <div className="relative mb-8">
                            <FaBookOpen className="text-9xl text-white/50" />
                        </div>
                        <h2 className="text-xl font-cute text-gray-600 mb-3 text-center">
                            아직 작성된 일기가 없어요
                        </h2>
                        <p className="text-sm text-gray-400 text-center mb-8 px-4 font-cute">
                            몽글이에게 오늘 하루를 들려주세요<br />
                            당신의 이야기가 몽글이를 더 똑똑하게 만들어요
                        </p>
                        <button
                            onClick={handleOpenWriteModal}
                            className="px-6 py-3 bg-white font-cute rounded-2xl shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-2 border-2"
                            style={{ color: accentColor, borderColor: `${primaryColor}66` }}
                            data-gtm="diary-empty-write-btn"
                        >
                            <FaPlus />
                            첫 일기 쓰러 가기
                        </button>
                    </div>
                ) : (
                    /* List Mode (흰색 배경 + 파스텔 테두리) */
                    <div className="space-y-4 animate-fade-in" data-gtm="diary-list-section">
                        {diaries.map((diary) => (
                            <div
                                key={diary.id}
                                className="bg-white rounded-3xl p-6 border-2 shadow-sm hover:shadow-md transition-all"
                                style={getMoodBorderStyle(diary.moodScore)}
                                data-gtm={`diary-card-${diary.id}`}
                            >
                                {/* 카드 헤더 */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl">
                                            {getMoodIcon(diary.moodScore)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-cute text-gray-600">
                                                {format(parseISO(diary.date), 'yyyy년 M월 d일', { locale: ko })}
                                            </p>
                                            <p className="text-xs text-gray-400 font-cute">
                                                {format(parseISO(diary.date), 'EEEE', { locale: ko })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="px-3 py-1 rounded-full text-xs font-cute border"
                                            style={{
                                                backgroundColor: bgFrom,
                                                color: accentColor,
                                                borderColor: `${primaryColor}4D`
                                            }}
                                        >
                                            {diary.moodScore}점
                                        </div>
                                        <button
                                            onClick={() => handleDeleteDiary(diary.id)}
                                            className="text-gray-300 hover:text-red-400 transition-colors"
                                            data-gtm={`diary-delete-${diary.id}`}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>

                                {/* 카드 내용 */}
                                <div className="rounded-2xl p-4" style={{ backgroundColor: `${bgFrom}80` }}>
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap font-cute text-sm">
                                        {diary.content.length > 150
                                            ? `${diary.content.substring(0, 150)}...`
                                            : diary.content}
                                    </p>
                                </div>

                                {/* 카드 푸터 */}
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-xs text-gray-300 font-cute">
                                        {format(parseISO(diary.createdAt), 'HH:mm', { locale: ko })} 작성
                                    </span>
                                    {diary.content.length > 150 && (
                                        <button
                                            className="text-xs font-cute hover:underline"
                                            style={{ color: accentColor }}
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

            {/* Floating Action Button (흰색 + 파스텔 테두리) */}
            {diaries.length > 0 && (
                <button
                    onClick={handleOpenWriteModal}
                    className="fixed bottom-24 right-6 w-14 h-14 bg-white rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center text-2xl z-50 border-2"
                    style={{ color: accentColor, borderColor: `${primaryColor}66` }}
                    data-gtm="diary-fab-floating-btn"
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
