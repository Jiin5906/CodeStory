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

export const PetProvider = ({ children }) => {
    const [petStatus, setPetStatus] = useState(null);
    const [emotionShards, setEmotionShards] = useState([]);
    const [isRubbing, setIsRubbing] = useState(false);
    const [affectionGauge, setAffectionGauge] = useState(50);

    // 상태 게이지 (0~100)
    const [airGauge, setAirGauge] = useState(50);
    const [energyGauge, setEnergyGauge] = useState(50);

    // Lock 상태 (100% 도달 시 Lock → 30% 이하 시 Unlock)
    const [isAffectionLocked, setIsAffectionLocked] = useState(false);
    const [isAirLocked, setIsAirLocked] = useState(false);
    const [isEnergyLocked, setIsEnergyLocked] = useState(false);

    const decayTimerRef = useRef(null);

    // ─── Lock/Unlock 로직 ───
    const checkLock = useCallback((value, currentLocked) => {
        if (value >= LOCK_THRESHOLD) return true;
        if (value <= UNLOCK_THRESHOLD) return false;
        return currentLocked; // 임계값 사이면 기존 상태 유지
    }, []);

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
