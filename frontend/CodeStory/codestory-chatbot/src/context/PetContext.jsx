import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
import { petApi } from '../services/api';

const PetContext = createContext();

// ─── 상수 정의 ───
const LOCK_THRESHOLD = 100;   // 100%에 도달하면 Lock
const UNLOCK_THRESHOLD = 30;  // 30% 이하이면 Unlock

// 게이지 감소 속도 설정
const IS_DEV_MODE = true; // 배포 시 false로 변경
const TOTAL_DECAY_TIME_MS = IS_DEV_MODE ? 300000 : 7200000; // 5분 or 2시간
const DECAY_INTERVAL_MS = 10000; // 10초마다 체크
const DECAY_AMOUNT = (100 / (TOTAL_DECAY_TIME_MS / DECAY_INTERVAL_MS));

// 자동 저장 간격
const AUTO_SAVE_INTERVAL_MS = 30000; // 30초

// localStorage 키
const STORAGE_KEYS = {
    AFFECTION: 'pet_affection_gauge',
    AIR: 'pet_air_gauge',
    ENERGY: 'pet_energy_gauge',
};

// localStorage 유틸리티
const loadGaugeFromStorage = (key, defaultValue = 50) => {
    try {
        const stored = localStorage.getItem(key);
        return stored !== null ? parseFloat(stored) : defaultValue;
    } catch {
        return defaultValue;
    }
};

export const PetProvider = ({ children }) => {
    const [petStatus, setPetStatus] = useState(null);
    const [emotionShards, setEmotionShards] = useState([]);
    const [isRubbing, setIsRubbing] = useState(false);

    // 게이지 상태 (localStorage 초기값)
    const [affectionGauge, setAffectionGauge] = useState(() => loadGaugeFromStorage(STORAGE_KEYS.AFFECTION));
    const [airGauge, setAirGauge] = useState(() => loadGaugeFromStorage(STORAGE_KEYS.AIR));
    const [energyGauge, setEnergyGauge] = useState(() => loadGaugeFromStorage(STORAGE_KEYS.ENERGY));

    // Lock 상태
    const [isAffectionLocked, setIsAffectionLocked] = useState(false);
    const [isAirLocked, setIsAirLocked] = useState(false);
    const [isEnergyLocked, setIsEnergyLocked] = useState(false);

    // ✅ 동시성 제어 플래그
    const [isApiLoading, setIsApiLoading] = useState(false);

    // Refs
    const decayTimerRef = useRef(null);
    const autoSaveTimerRef = useRef(null);
    const gaugesRef = useRef({ affectionGauge, airGauge, energyGauge });

    // ─── gaugesRef 및 localStorage 동기화 ───
    useEffect(() => {
        gaugesRef.current = { affectionGauge, airGauge, energyGauge };
        localStorage.setItem(STORAGE_KEYS.AFFECTION, affectionGauge);
        localStorage.setItem(STORAGE_KEYS.AIR, airGauge);
        localStorage.setItem(STORAGE_KEYS.ENERGY, energyGauge);
    }, [affectionGauge, airGauge, energyGauge]);

    // ─── Lock/Unlock 로직 ───
    const checkLock = useCallback((value, currentLocked) => {
        if (value >= LOCK_THRESHOLD) return true;
        if (value <= UNLOCK_THRESHOLD) return false;
        return currentLocked;
    }, []);

    // ─── 서버에서 PetStatus 조회 및 로컬 state 동기화 ───
    const fetchPetStatus = useCallback(async (userId) => {
        if (!userId) return;
        try {
            const data = await petApi.getStatus(userId);
            if (data) {
                setPetStatus(data);
                // ✅ 서버 데이터로 로컬 게이지 동기화
                if (data.affectionGauge !== undefined) setAffectionGauge(data.affectionGauge);
                if (data.airGauge !== undefined) setAirGauge(data.airGauge);
                if (data.energyGauge !== undefined) setEnergyGauge(data.energyGauge);
            }
        } catch (e) {
            console.error('[PetContext] fetchPetStatus 실패:', e);
        }
    }, []);

    // ─── 초기 로드 (마운트 시 1회) ───
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('diaryUser'));
        if (user?.id) {
            fetchPetStatus(user.id);
        }
    }, [fetchPetStatus]);

    // ─── 게이지 자연 감소 (Decay) ───
    useEffect(() => {
        decayTimerRef.current = setInterval(() => {
            setAffectionGauge(prev => {
                const next = Math.max(0, prev - DECAY_AMOUNT);
                setIsAffectionLocked(locked => checkLock(next, locked));
                return next;
            });
            setAirGauge(prev => {
                const next = Math.max(0, prev - DECAY_AMOUNT);
                setIsAirLocked(locked => checkLock(next, locked));
                return next;
            });
            setEnergyGauge(prev => {
                const next = Math.max(0, prev - DECAY_AMOUNT);
                setIsEnergyLocked(locked => checkLock(next, locked));
                return next;
            });
        }, DECAY_INTERVAL_MS);

        return () => {
            if (decayTimerRef.current) clearInterval(decayTimerRef.current);
        };
    }, [checkLock]);

    // ─── 주기적 자동 저장 (30초마다) ───
    useEffect(() => {
        autoSaveTimerRef.current = setInterval(async () => {
            // ✅ 사용자 액션 중이면 저장 건너뛰기
            if (isApiLoading) {
                console.log('💾 [AutoSave] API 호출 중이므로 건너뜀');
                return;
            }

            const user = JSON.parse(localStorage.getItem('diaryUser'));
            if (!user?.id) return;

            try {
                // ✅ gaugesRef로 최신 값 읽기
                const currentGauges = gaugesRef.current;
                await petApi.saveGauges(user.id, {
                    affectionGauge: currentGauges.affectionGauge,
                    airGauge: currentGauges.airGauge,
                    energyGauge: currentGauges.energyGauge,
                    lastUpdate: new Date().toISOString()
                });
                console.log('💾 [AutoSave] 주기적 저장 완료');
            } catch (e) {
                // ✅ 자동 저장 실패는 무시 (중요하지 않음)
                console.warn('⚠️ [AutoSave] 저장 실패 (무시됨):', e.message);
            }
        }, AUTO_SAVE_INTERVAL_MS);

        return () => {
            if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
        };
    }, [isApiLoading]);

    // ─── 공통 액션 핸들러 (동시성 제어 + 서버 동기화) ───
    const handleAction = useCallback(async (apiCall) => {
        // ✅ 중복 호출 방지
        if (isApiLoading) {
            console.log('⚠️ [handleAction] 이미 API 호출 중이므로 무시');
            return;
        }

        setIsApiLoading(true);
        try {
            const data = await apiCall();
            setPetStatus(data);

            // ✅ 서버 응답으로 로컬 게이지 동기화
            if (data.affectionGauge !== undefined) setAffectionGauge(data.affectionGauge);
            if (data.airGauge !== undefined) setAirGauge(data.airGauge);
            if (data.energyGauge !== undefined) setEnergyGauge(data.energyGauge);
        } catch (e) {
            console.error('❌ [handleAction] API 호출 실패:', e);

            // ✅ 409 Conflict 발생 시 즉시 서버 데이터로 동기화
            if (e.response?.status === 409) {
                console.log('🚨 [handleAction] 409 Conflict 감지! 서버 데이터로 즉시 동기화');
                const user = JSON.parse(localStorage.getItem('diaryUser'));
                if (user?.id) {
                    await fetchPetStatus(user.id);
                }
            }
        } finally {
            setIsApiLoading(false);
        }
    }, [isApiLoading, fetchPetStatus]);

    // ─── 환기 완료 ───
    const handleVentilateComplete = useCallback((userId) => {
        handleAction(() => petApi.ventilate(userId));
    }, [handleAction]);

    // ─── 쓰다듬기 완료 ───
    const handleAffectionComplete = useCallback((userId) => {
        handleAction(() => petApi.affectionComplete(userId));
    }, [handleAction]);

    // ─── 감정 조각 수집 ───
    const handleCollectShard = useCallback((userId, shardId) => {
        handleAction(async () => {
            const data = await petApi.collectShard(userId);
            setEmotionShards(prev => prev.filter(s => s.id !== shardId));
            return data;
        });
    }, [handleAction]);

    // ─── 감정 조각 생성 ───
    const spawnEmotionShard = useCallback((emotion) => {
        if (!emotion || emotion === 'neutral') return;
        const id = Date.now() + Math.random();
        const xPercent = 20 + Math.random() * 60;
        const yPercent = 30 + Math.random() * 40;
        const newShard = { id, emotion, x: xPercent, y: yPercent };
        setEmotionShards(prev => [...prev, newShard]);

        // 10초 후 자동 소멸
        setTimeout(() => {
            setEmotionShards(prev => prev.filter(s => s.id !== id));
        }, 10000);
    }, []);

    // ─── Air Gauge 증가 (환기 버튼 클릭) ───
    const increaseAirGauge = useCallback((amount = 10) => {
        if (isAirLocked) return false;
        setAirGauge(prev => {
            const next = Math.min(LOCK_THRESHOLD, prev + amount);
            setIsAirLocked(checkLock(next, false));
            return next;
        });
        return true;
    }, [isAirLocked, checkLock]);

    return (
        <PetContext.Provider value={{
            petStatus,
            emotionShards,
            isRubbing,
            setIsRubbing,
            affectionGauge,
            setAffectionGauge,
            airGauge,
            setAirGauge,
            energyGauge,
            setEnergyGauge,
            isAffectionLocked,
            setIsAffectionLocked,
            isAirLocked,
            isEnergyLocked,
            increaseAirGauge,
            checkLock,
            fetchPetStatus,
            handleVentilateComplete,
            handleAffectionComplete,
            handleCollectShard,
            spawnEmotionShard
        }}>
            {children}
        </PetContext.Provider>
    );
};

export const usePet = () => useContext(PetContext);
