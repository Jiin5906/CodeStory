import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// ── 투어 단계 설정 ──
const TOUR_STEPS = {
    main: [
        {
            id: 'chat',
            selector: '[data-gtm="chat-input-area"]',
            message: '몽글이에게 오늘 마음을 들려주세요 💬\n메시지를 전송해야 다음 단계로 넘어갈 수 있어요!',
            tooltipPosition: 'top',
            controlled: true,
        },
        {
            id: 'shard',
            selector: '[data-gtm^="emotion-shard-"]',
            message: '감정 조각이 나왔어요! ✨\n클릭해서 주워보세요!',
            tooltipPosition: 'bottom',
            controlled: true,
            autoAdvanceMs: 8000,
        },
        {
            id: 'hunger',
            selector: '[data-gtm="chat-input-area"]',
            message: '감정 조각을 주우면 몽글이의 허기 수치가 올라가요! 🍽️\n몽글이를 잘 챙겨주세요!',
            tooltipPosition: 'top',
            controlled: false,
        },
        {
            id: 'diary-tab',
            selector: '[data-gtm="tab-diary"]',
            message: '일기 탭을 눌러보세요 📖\n오늘 하루를 일기로 기록해요!',
            tooltipPosition: 'top',
            controlled: true,
        },
        {
            id: 'diary-write',
            selector: '[data-gtm="diary-fab-write-btn"],[data-gtm="diary-empty-write-btn"]',
            message: '일기를 써볼까요? ✏️\n버튼을 눌러 일기를 작성하고 저장해보세요!\n저장하면 다음 단계로 넘어가요.',
            tooltipPosition: 'top',
            controlled: true,
        },
        {
            id: 'report-tab',
            selector: '[data-gtm="tab-report"]',
            message: '리포트 탭에서 몽글이가 감정 팔레트와 마음 날씨를 만들어줘요! 📊\n대화와 일기가 쌓일수록 더 정확해져요!',
            tooltipPosition: 'top',
            controlled: false,
            isLast: true,
        },
    ],
    affection: [
        {
            id: 'affection-bar',
            selector: '[data-gtm="chat-input-area"]',
            message: '몽글이의 쓰다듬기 게이지가 낮아요! 💕\n몽글이를 문질러서 사랑을 표현해주세요!',
            tooltipPosition: 'top',
            controlled: false,
        },
        {
            id: 'affection-pet',
            selector: '[data-gtm="mongle-character"]',
            message: '몽글이를 손가락으로 문질러보세요! 🐾\n쓰다듬기 게이지가 올라가요!',
            tooltipPosition: 'bottom',
            controlled: true,
            isLast: true,
        },
    ],
    lamp: [
        {
            id: 'lamp-wake',
            selector: '[data-gtm="mood-light-button"]',
            message: '몽글이가 자고 있어요 😴\n램프를 눌러서 몽글이를 깨워보세요!',
            tooltipPosition: 'right',
            controlled: true,
        },
        {
            id: 'lamp-done',
            selector: '[data-gtm="mood-light-button"]',
            message: '이렇게 램프를 껐다 켤 수 있어요! 💡\n무드등으로 몽글이의 기상과 수면을 조절해보세요!',
            tooltipPosition: 'right',
            controlled: false,
            isLast: true,
        },
    ],
    levelup: [
        {
            id: 'levelup-shop',
            selector: '[data-gtm="chat-input-area"]',
            message: '레벨업을 축하해요! 🎉\n채팅창을 위로 올리면 상점 버튼이 나타나요!\n새로운 가구와 테마를 구매해보세요!',
            tooltipPosition: 'top',
            controlled: false,
            isLast: true,
        },
    ],
};

const TourContext = createContext(null);

export const TourProvider = ({ children }) => {
    const [isTourActive, setIsTourActive] = useState(false);
    const [tourType, setTourType] = useState(null);
    const [tourStepIndex, setTourStepIndex] = useState(0);

    // ref로 최신 tourType 추적 (stale closure 방지)
    const tourTypeRef = useRef(null);
    useEffect(() => {
        tourTypeRef.current = tourType;
    }, [tourType]);

    const currentSteps = tourType ? (TOUR_STEPS[tourType] || []) : [];
    const currentStep = currentSteps[tourStepIndex] || null;

    const endTourCleanup = useCallback((type) => {
        if (type === 'main') {
            localStorage.setItem('hasSeenMainTour', 'true');
        } else if (type && type !== 'levelup') {
            localStorage.setItem(`hasSeenTour_${type}`, 'true');
        }
        setIsTourActive(false);
        setTourType(null);
        setTourStepIndex(0);
    }, []);

    const startMainTour = useCallback(() => {
        const hasSeen = localStorage.getItem('hasSeenMainTour');
        if (hasSeen) return;
        setTourType('main');
        setTourStepIndex(0);
        setIsTourActive(true);
    }, []);

    const startConditionalTour = useCallback((type) => {
        if (isTourActive) return;
        if (type !== 'levelup') {
            const hasSeen = localStorage.getItem(`hasSeenTour_${type}`);
            if (hasSeen) return;
        }
        setTourType(type);
        setTourStepIndex(0);
        setIsTourActive(true);
    }, [isTourActive]);

    const advanceTour = useCallback(() => {
        if (!isTourActive) return;
        setTourStepIndex(prev => {
            const type = tourTypeRef.current;
            const steps = TOUR_STEPS[type] || [];
            const nextIndex = prev + 1;
            if (nextIndex >= steps.length) {
                // 마지막 단계 완료 → 투어 종료 (비동기)
                setTimeout(() => endTourCleanup(type), 0);
                return prev;
            }
            return nextIndex;
        });
    }, [isTourActive, endTourCleanup]);

    const endTour = useCallback(() => {
        endTourCleanup(tourTypeRef.current);
    }, [endTourCleanup]);

    // 투어 초기화 (테스트용)
    const resetTours = useCallback(() => {
        localStorage.removeItem('hasSeenMainTour');
        localStorage.removeItem('hasSeenTour_affection');
        localStorage.removeItem('hasSeenTour_lamp');
    }, []);

    return (
        <TourContext.Provider value={{
            isTourActive,
            tourType,
            tourStepIndex,
            currentStep,
            startMainTour,
            startConditionalTour,
            advanceTour,
            endTour,
            resetTours,
        }}>
            {children}
        </TourContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTour = () => useContext(TourContext);
