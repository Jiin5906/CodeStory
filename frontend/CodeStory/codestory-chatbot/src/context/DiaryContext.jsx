import React, { createContext, useContext, useState, useEffect } from 'react';

const DiaryContext = createContext();

export const useDiary = () => {
    const context = useContext(DiaryContext);
    if (!context) {
        throw new Error('useDiary must be used within DiaryProvider');
    }
    return context;
};

export const DiaryProvider = ({ children }) => {
    const [diaries, setDiaries] = useState([]);
    const [loading, setLoading] = useState(true);

    // LocalStorage에서 일기 데이터 로드
    useEffect(() => {
        const loadDiaries = () => {
            try {
                const stored = localStorage.getItem('mongel_diaries');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setDiaries(parsed);
                }
            } catch (error) {
                console.error('일기 데이터 로드 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDiaries();
    }, []);

    // 일기 데이터 변경 시 LocalStorage에 저장
    useEffect(() => {
        if (!loading) {
            try {
                localStorage.setItem('mongel_diaries', JSON.stringify(diaries));
            } catch (error) {
                console.error('일기 데이터 저장 실패:', error);
            }
        }
    }, [diaries, loading]);

    // 일기 추가
    const addDiary = (diary) => {
        setDiaries((prev) => [diary, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
    };

    // 일기 삭제
    const deleteDiary = (id) => {
        setDiaries((prev) => prev.filter((d) => d.id !== id));
    };

    // 일기 수정
    const updateDiary = (id, updates) => {
        setDiaries((prev) =>
            prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
        );
    };

    // 특정 날짜의 일기 가져오기
    const getDiaryByDate = (date) => {
        return diaries.find((d) => d.date === date);
    };

    // 최근 N개의 일기 가져오기
    const getRecentDiaries = (count = 5) => {
        return diaries.slice(0, count);
    };

    // 평균 감정 점수 계산
    const getAverageMoodScore = (days = 7) => {
        if (diaries.length === 0) return 50;

        const recent = diaries.slice(0, days);
        const sum = recent.reduce((acc, d) => acc + (d.moodScore || 50), 0);
        return Math.round(sum / recent.length);
    };

    // 감정 트렌드 분석 (최근 감정이 올라가는 중인지 내려가는 중인지)
    const getMoodTrend = () => {
        if (diaries.length < 2) return 'neutral';

        const recent3 = diaries.slice(0, 3);
        const avg = recent3.reduce((acc, d) => acc + d.moodScore, 0) / recent3.length;

        if (avg >= 70) return 'positive';
        if (avg <= 30) return 'negative';
        return 'neutral';
    };

    const value = {
        diaries,
        loading,
        addDiary,
        deleteDiary,
        updateDiary,
        getDiaryByDate,
        getRecentDiaries,
        getAverageMoodScore,
        getMoodTrend
    };

    return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
};
