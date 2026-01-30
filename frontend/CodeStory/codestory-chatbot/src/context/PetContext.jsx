import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
import { petApi } from '../services/api';

const PetContext = createContext();

// Lock/Unlock 임계값 상수
const LOCK_THRESHOLD = 100;   // 100%에 도달하면 Lock
const UNLOCK_THRESHOLD = 30;  // 30% 이하이면 Unlock

// ─── 게이지 감소 속도 설정 ───
// 프로덕션: 100% → 0% = 2시간 (7200초)
// 개발 모드: 100% → 0% = 5분 (300초) - 테스트용
const IS_DEV_MODE = true; // 배포 시 false로 변경
const TOTAL_DECAY_TIME_MS = IS_DEV_MODE ? 300000 : 7200000; // 5분 or 2시간
const DECAY_INTERVAL_MS = 10000; // 10초마다 체크
const DECAY_AMOUNT = (100 / (TOTAL_DECAY_TIME_MS / DECAY_INTERVAL_MS)); // 동적 계산

// localStorage 키 상수
const STORAGE_KEYS = {
    AFFECTION: 'pet_affection_gauge',
    AIR: 'pet_air_gauge',
    ENERGY: 'pet_energy_gauge',
    LAST_UPDATE: 'pet_last_update'
};

// localStorage에서 게이지 값 불러오기 (없으면 기본값 50)
const loadGaugeFromStorage = (key, defaultValue = 50) => {
    try {
        const stored = localStorage.getItem(key);
        return stored !== null ? parseFloat(stored) : defaultValue;
    } catch {
        return defaultValue;
    }
};

// localStorage에 게이지 값 저장
const saveGaugeToStorage = (key, value) => {
    try {
        localStorage.setItem(key, value.toString());
    } catch (e) {
        console.error('[PetContext] localStorage 저장 실패:', e);
    }
};

export const PetProvider = ({ children }) => {
    const [petStatus, setPetStatus] = useState(null);
    const [emotionShards, setEmotionShards] = useState([]);
    const [isRubbing, setIsRubbing] = useState(false);

    // localStorage에서 초기값 불러오기
    const [affectionGauge, setAffectionGauge] = useState(() => loadGaugeFromStorage(STORAGE_KEYS.AFFECTION));
    const [airGauge, setAirGauge] = useState(() => loadGaugeFromStorage(STORAGE_KEYS.AIR));
    const [energyGauge, setEnergyGauge] = useState(() => loadGaugeFromStorage(STORAGE_KEYS.ENERGY));

    // Lock 상태 (100% 도달 시 Lock → 30% 이하 시 Unlock)
    const [isAffectionLocked, setIsAffectionLocked] = useState(false);
    const [isAirLocked, setIsAirLocked] = useState(false);
    const [isEnergyLocked, setIsEnergyLocked] = useState(false);

    const decayTimerRef = useRef(null);
    const saveToServerTimerRef = useRef(null);

    // ─── Lock/Unlock 로직 ───
    const checkLock = useCallback((value, currentLocked) => {
        if (value >= LOCK_THRESHOLD) return true;
        if (value <= UNLOCK_THRESHOLD) return false;
        return currentLocked; // 임계값 사이면 기존 상태 유지
    }, []);

    // ─── localStorage 동기화 ───
    useEffect(() => {
        saveGaugeToStorage(STORAGE_KEYS.AFFECTION, affectionGauge);
    }, [affectionGauge]);

    useEffect(() => {
        saveGaugeToStorage(STORAGE_KEYS.AIR, airGauge);
    }, [airGauge]);

    useEffect(() => {
        saveGaugeToStorage(STORAGE_KEYS.ENERGY, energyGauge);
    }, [energyGauge]);

    // ─── 서버에서 초기 상태 불러오기 (마운트 시 1회) ───
    useEffect(() => {
        const loadFromServer = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('diaryUser'));
                if (!user?.id) return;

                const data = await petApi.getStatus(user.id);
                if (data) {
                    setPetStatus(data);
                    // 서버 데이터가 있으면 localStorage 덮어쓰기
                    if (data.affectionGauge !== undefined) {
                        setAffectionGauge(data.affectionGauge);
                        saveGaugeToStorage(STORAGE_KEYS.AFFECTION, data.affectionGauge);
                    }
                    if (data.airGauge !== undefined) {
                        setAirGauge(data.airGauge);
                        saveGaugeToStorage(STORAGE_KEYS.AIR, data.airGauge);
                    }
                    if (data.energyGauge !== undefined) {
                        setEnergyGauge(data.energyGauge);
                        saveGaugeToStorage(STORAGE_KEYS.ENERGY, data.energyGauge);
                    }
                }
            } catch (e) {
                console.error('[PetContext] 서버 초기 로드 실패, localStorage 사용:', e);
            }
        };

        loadFromServer();
    }, []); // 마운트 시 1회만 실행

    // ─── Decay (자연 감소) 시뮬레이션 ───
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

    // ─── 서버에 상태 저장 (디바운스 5초) ───
    useEffect(() => {
        // 5초 디바운스: 마지막 변경 후 5초 뒤에 저장
        if (saveToServerTimerRef.current) {
            clearTimeout(saveToServerTimerRef.current);
        }

        saveToServerTimerRef.current = setTimeout(async () => {
            try {
                const user = JSON.parse(localStorage.getItem('diaryUser'));
                if (!user?.id) return;

                // 서버에 현재 게이지 상태 저장
                await petApi.saveGauges(user.id, {
                    affectionGauge,
                    airGauge,
                    energyGauge,
                    lastUpdate: new Date().toISOString()
                });

                console.log('[PetContext] 서버에 게이지 저장 완료');
            } catch (e) {
                console.error('[PetContext] 서버 저장 실패:', e);
            }
        }, 5000);

        return () => {
            if (saveToServerTimerRef.current) {
                clearTimeout(saveToServerTimerRef.current);
            }
        };
    }, [affectionGauge, airGauge, energyGauge]);

    const fetchPetStatus = useCallback(async (userId) => {
        if (!userId) return;
        try {
            const data = await petApi.getStatus(userId);
            setPetStatus(data);
        } catch (e) {
            console.error('[PetContext] fetchPetStatus 실패:', e);
        }
    }, []);

    const handleVentilateComplete = useCallback(async (userId) => {
        try {
            const data = await petApi.ventilate(userId);
            setPetStatus(data);
        } catch (e) {
            console.error('[PetContext] ventilate 실패:', e);
        }
    }, []);

    const handleAffectionComplete = useCallback(async (userId) => {
        try {
            const data = await petApi.affectionComplete(userId);
            setPetStatus(data);
            // Lock 후 reset하지 않음 — decay가 자연 감소 후 30% 이하에서 unlock
        } catch (e) {
            console.error('[PetContext] affectionComplete 실패:', e);
        }
    }, []);

    const handleCollectShard = useCallback(async (userId, shardId) => {
        try {
            const data = await petApi.collectShard(userId);
            setPetStatus(data);
            setEmotionShards(prev => prev.filter(s => s.id !== shardId));
        } catch (e) {
            console.error('[PetContext] collectShard 실패:', e);
        }
    }, []);

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

    // ─── Air Gauge 증가 (환기 버튼 클릭 시) ───
    const increaseAirGauge = useCallback((amount = 10) => {
        if (isAirLocked) return false; // Lock 중이면 증가 불가
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
