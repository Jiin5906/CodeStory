import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// ── 투어 단계 설정 ──
const TOUR_STEPS = {
    main: [
        {
            id: 'chat',
            selector: '[data-gtm="chat-input-area"]',
            message: '몽글이에게 오늘 마음을 들려주세요\n메시지를 전송해야 다음 단계로 넘어갈 수 있어요!',
            tooltipPosition: 'top',
            controlled: true,
        },
        {
            id: 'shard',
            selector: '[data-gtm^="emotion-shard-"]',
            message: '감정 조각이 나왔어요!\n클릭해서 주워보세요!',
            tooltipPosition: 'bottom',
            controlled: true,
            autoAdvanceMs: 8000,
            blockWhenMissing: false,
        },
        {
            id: 'bottomtab',
            selector: '[data-gtm="bottomsheet-drag-handle"]',
            message: '화면 하단 바를 위로 올려보세요! 👆\n몽글이의 상태를 확인할 수 있어요!',
            tooltipPosition: 'top',
            controlled: true,
        },
        {
            id: 'hunger',
            selector: '[data-gtm="action-btn-hunger"]',
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
            message: '일기를 써볼까요? ✏️\n버튼을 눌러 일기 작성 화면을 열어보세요!',
            tooltipPosition: 'top',
            controlled: true,
        },
        {
            id: 'diary-score',
            selector: '[data-gtm="diary-mood-section"]',
            message: '오늘 하루의 마음 날씨 점수를 매겨주세요! 🌤️\n슬라이더로 오늘의 기분을 표현해 봐요!',
            tooltipPosition: 'top',
            controlled: false,
        },
        {
            id: 'diary-content',
            selector: '[data-gtm="diary-content-textarea"]',
            message: '오늘 있었던 일을 자유롭게 적어주세요 ✍️\n몽글이가 열심히 읽을게요!',
            tooltipPosition: 'top',
            controlled: false,
        },
        {
            id: 'diary-save',
            selector: '[data-gtm="diary-save-btn"]',
            message: '다 적었다면 일기를 저장해 보세요! 💾\n저장하면 다음 단계로 넘어가요!',
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

// 현재 로그인된 유저 ID를 localStorage에서 읽어 반환 (계정별 키 분리용)
const getUserId = () => {
    try {
        const u = JSON.parse(localStorage.getItem('diaryUser') || '{}');
        return u.id ?? 'guest';
    } catch {
        return 'guest';
    }
};

const TourContext = createContext(null);

export const TourProvider = ({ children }) => {
    const [isTourActive, setIsTourActive] = useState(false);
    const [tourType, setTourType] = useState(null);
    const [tourStepIndex, setTourStepIndex] = useState(0);
    const [canSkip, setCanSkip] = useState(false);

    // ref로 최신 값 추적 (stale closure 방지)
    const tourTypeRef = useRef(null);
    const tourQueueRef = useRef([]);
    const canSkipRef = useRef(false);

    useEffect(() => {
        tourTypeRef.current = tourType;
    }, [tourType]);

    useEffect(() => {
        canSkipRef.current = canSkip;
    }, [canSkip]);

    const currentSteps = tourType ? (TOUR_STEPS[tourType] || []) : [];
    const currentStep = currentSteps[tourStepIndex] || null;

    const startTourType = useCallback((type) => {
        setTourType(type);
        setTourStepIndex(0);
        setIsTourActive(true);
    }, []);

    const endTourCleanup = useCallback((type) => {
        const uid = getUserId();
        if (type === 'main') {
            localStorage.setItem(`hasSeenMainTour_${uid}`, 'true');
        } else if (type && type !== 'levelup') {
            localStorage.setItem(`hasSeenTour_${type}_${uid}`, 'true');
        }

        // 큐에 다음 투어가 있으면 자동으로 이어서 시작
        const queue = tourQueueRef.current;
        if (queue.length > 0) {
            const nextType = queue[0];
            tourQueueRef.current = queue.slice(1);
            setTimeout(() => startTourType(nextType), 300);
        } else {
            setCanSkip(false);
            setIsTourActive(false);
            setTourType(null);
            setTourStepIndex(0);
        }
    }, [startTourType]);

    const startMainTour = useCallback(() => {
        const hasSeen = localStorage.getItem(`hasSeenMainTour_${getUserId()}`);
        if (hasSeen) return;
        startTourType('main');
    }, [startTourType]);

    const startConditionalTour = useCallback((type) => {
        if (isTourActive) return;
        if (type !== 'levelup') {
            const hasSeen = localStorage.getItem(`hasSeenTour_${type}_${getUserId()}`);
            if (hasSeen) return;
        }
        startTourType(type);
    }, [isTourActive, startTourType]);

    // 모든 투어를 순서대로 실행 (테스트용)
    const startTourSequence = useCallback((types) => {
        if (!types || types.length === 0) return;
        const [first, ...rest] = types;
        tourQueueRef.current = rest;
        setCanSkip(true);
        startTourType(first);
    }, [startTourType]);

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
        // 건너뛰기: 큐 비우고 완전 종료
        tourQueueRef.current = [];
        endTourCleanup(tourTypeRef.current);
    }, [endTourCleanup]);

    // 투어 초기화 (테스트용)
    const resetTours = useCallback(() => {
        const uid = getUserId();
        localStorage.removeItem(`hasSeenMainTour_${uid}`);
        localStorage.removeItem(`hasSeenTour_affection_${uid}`);
        localStorage.removeItem(`hasSeenTour_lamp_${uid}`);
    }, []);

    return (
        <TourContext.Provider value={{
            isTourActive,
            tourType,
            tourStepIndex,
            currentStep,
            canSkip,
            startMainTour,
            startConditionalTour,
            startTourSequence,
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
