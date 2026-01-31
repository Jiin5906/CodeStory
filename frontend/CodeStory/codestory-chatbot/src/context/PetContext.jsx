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

// 수면 게이지 설정
const AWAKE_TIME_MS = IS_DEV_MODE ? 600000 : 61200000; // 10분 or 17시간 (깨어있을 때)
const SLEEP_TIME_MS = IS_DEV_MODE ? 300000 : 25200000; // 5분 or 7시간 (잘 때)
const SLEEP_DECAY_AMOUNT = (100 / (AWAKE_TIME_MS / DECAY_INTERVAL_MS));
const SLEEP_RECOVERY_AMOUNT = (100 / (SLEEP_TIME_MS / DECAY_INTERVAL_MS));

// 배고픔 게이지 설정
const HUNGER_DECAY_AMOUNT = (100 / (TOTAL_DECAY_TIME_MS / DECAY_INTERVAL_MS));

// 자동 저장 간격
const AUTO_SAVE_INTERVAL_MS = 30000; // 30초

// 강제 수면 조건
const FORCE_SLEEP_THRESHOLD = 10; // 수면 게이지 10% 이하
const INACTIVITY_TIME_MS = 300000; // 5분 동안 입력 없으면

// localStorage 키
const STORAGE_KEYS = {
    AFFECTION: 'pet_affection_gauge',
    AIR: 'pet_air_gauge',
    ENERGY: 'pet_energy_gauge',
    SLEEP: 'pet_sleep_gauge',
    HUNGER: 'pet_hunger_gauge',
    IS_SLEEPING: 'pet_is_sleeping',
    MOOD_LIGHT_ON: 'pet_mood_light_on',
    LAST_INTERACTION: 'pet_last_interaction_time',
    EMOTION_SHARDS: 'pet_emotion_shards',
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
    const [emotionShards, setEmotionShards] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.EMOTION_SHARDS);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });
    const [isRubbing, setIsRubbing] = useState(false);

    // 게이지 상태 (localStorage 초기값)
    const [affectionGauge, setAffectionGauge] = useState(() => loadGaugeFromStorage(STORAGE_KEYS.AFFECTION));
    const [airGauge, setAirGauge] = useState(() => loadGaugeFromStorage(STORAGE_KEYS.AIR));
    const [energyGauge, setEnergyGauge] = useState(() => loadGaugeFromStorage(STORAGE_KEYS.ENERGY));
    const [sleepGauge, setSleepGauge] = useState(() => loadGaugeFromStorage(STORAGE_KEYS.SLEEP, 100));
    const [hungerGauge, setHungerGauge] = useState(() => loadGaugeFromStorage(STORAGE_KEYS.HUNGER, 50));

    // 수면 시스템 상태
    const [isSleeping, setIsSleeping] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.IS_SLEEPING);
        return stored === 'true';
    });
    const [moodLightOn, setMoodLightOn] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.MOOD_LIGHT_ON);
        return stored !== 'false'; // 기본값 true
    });
    const [lastInteractionTime, setLastInteractionTime] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.LAST_INTERACTION);
        return stored ? parseInt(stored) : Date.now();
    });

    // Lock 상태
    const [isAffectionLocked, setIsAffectionLocked] = useState(false);
    const [isAirLocked, setIsAirLocked] = useState(false);
    const [isEnergyLocked, setIsEnergyLocked] = useState(false);

    // ✅ 동시성 제어 플래그
    const [isApiLoading, setIsApiLoading] = useState(false);

    // Refs
    const decayTimerRef = useRef(null);
    const autoSaveTimerRef = useRef(null);
    const inactivityTimerRef = useRef(null);
    const gaugesRef = useRef({ affectionGauge, airGauge, energyGauge, sleepGauge, hungerGauge });

    // ─── gaugesRef 및 localStorage 동기화 ───
    useEffect(() => {
        gaugesRef.current = { affectionGauge, airGauge, energyGauge, sleepGauge, hungerGauge };
        localStorage.setItem(STORAGE_KEYS.AFFECTION, affectionGauge);
        localStorage.setItem(STORAGE_KEYS.AIR, airGauge);
        localStorage.setItem(STORAGE_KEYS.ENERGY, energyGauge);
        localStorage.setItem(STORAGE_KEYS.SLEEP, sleepGauge);
        localStorage.setItem(STORAGE_KEYS.HUNGER, hungerGauge);
    }, [affectionGauge, airGauge, energyGauge, sleepGauge, hungerGauge]);

    // ─── 수면 상태 localStorage 동기화 ───
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.IS_SLEEPING, isSleeping);
        localStorage.setItem(STORAGE_KEYS.MOOD_LIGHT_ON, moodLightOn);
        localStorage.setItem(STORAGE_KEYS.LAST_INTERACTION, lastInteractionTime);
    }, [isSleeping, moodLightOn, lastInteractionTime]);

    // ─── 감정 조각 localStorage 동기화 ───
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.EMOTION_SHARDS, JSON.stringify(emotionShards));
    }, [emotionShards]);

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
            // 기존 게이지들 (깨어 있을 때만 감소)
            if (!isSleeping) {
                // ✅ 쓰다듬기 게이지: Lock 상태가 아닐 때만 감소
                setAffectionGauge(prev => {
                    // Lock 상태면 감소하지 않음
                    if (isAffectionLocked) return prev;
                    const next = Math.max(0, prev - DECAY_AMOUNT);
                    setIsAffectionLocked(locked => checkLock(next, locked));
                    return next;
                });

                setAirGauge(prev => {
                    // Lock 상태면 감소하지 않음
                    if (isAirLocked) return prev;
                    const next = Math.max(0, prev - DECAY_AMOUNT);
                    setIsAirLocked(locked => checkLock(next, locked));
                    return next;
                });

                setEnergyGauge(prev => {
                    // Lock 상태면 감소하지 않음
                    if (isEnergyLocked) return prev;
                    const next = Math.max(0, prev - DECAY_AMOUNT);
                    setIsEnergyLocked(locked => checkLock(next, locked));
                    return next;
                });
            }

            // 수면 게이지: 깨어있을 때 감소, 잘 때 회복
            setSleepGauge(prev => {
                if (isSleeping) {
                    return Math.min(100, prev + SLEEP_RECOVERY_AMOUNT);
                } else {
                    return Math.max(0, prev - SLEEP_DECAY_AMOUNT);
                }
            });

            // 배고픔 게이지: 깨어있을 때만 감소
            if (!isSleeping) {
                setHungerGauge(prev => Math.max(0, prev - HUNGER_DECAY_AMOUNT));
            }
        }, DECAY_INTERVAL_MS);

        return () => {
            if (decayTimerRef.current) clearInterval(decayTimerRef.current);
        };
    }, [checkLock, isSleeping, isAffectionLocked, isAirLocked, isEnergyLocked]);

    // ─── 강제 수면 체크 (비활동 시) ───
    useEffect(() => {
        if (isSleeping || moodLightOn) {
            // 자는 중이거나 무드등이 켜져있으면 타이머 초기화
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
                inactivityTimerRef.current = null;
            }
            return;
        }

        // 수면 게이지가 10% 이하이고 5분간 입력 없으면 강제 수면
        const checkForceSleep = () => {
            const timeSinceLastInteraction = Date.now() - lastInteractionTime;
            if (sleepGauge <= FORCE_SLEEP_THRESHOLD && timeSinceLastInteraction >= INACTIVITY_TIME_MS) {
                console.log('😴 [ForceSleep] 강제 수면 진입');
                setMoodLightOn(false);
                setIsSleeping(true);
            }
        };

        inactivityTimerRef.current = setTimeout(checkForceSleep, INACTIVITY_TIME_MS);

        return () => {
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
        };
    }, [isSleeping, moodLightOn, sleepGauge, lastInteractionTime]);

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
                    sleepGauge: currentGauges.sleepGauge,
                    hungerGauge: currentGauges.hungerGauge,
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

    // ─── 무드등 토글 ───
    const toggleMoodLight = useCallback(() => {
        setMoodLightOn(prev => {
            const newValue = !prev;
            if (newValue) {
                // 무드등 켜기 (기상)
                setIsSleeping(false);
                console.log('💡 [MoodLight] 무드등 켜짐 - 몽글이 기상');
            } else {
                // 무드등 끄기 (수면)
                setIsSleeping(true);
                console.log('💡 [MoodLight] 무드등 꺼짐 - 몽글이 수면');
            }
            return newValue;
        });
        setLastInteractionTime(Date.now());
    }, []);

    // ─── 배고픔 게이지 증가 (식사) ───
    const feedEmotion = useCallback((emotionType, amount = 25) => {
        setHungerGauge(prev => {
            const next = Math.min(100, prev + amount);
            return next;
        });
        setLastInteractionTime(Date.now());
    }, []);

    // ─── 사용자 상호작용 (마지막 시간 업데이트) ───
    const updateInteraction = useCallback(() => {
        setLastInteractionTime(Date.now());
    }, []);

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
            sleepGauge,
            setSleepGauge,
            hungerGauge,
            setHungerGauge,
            isSleeping,
            setIsSleeping,
            moodLightOn,
            setMoodLightOn,
            lastInteractionTime,
            isAffectionLocked,
            setIsAffectionLocked,
            isAirLocked,
            isEnergyLocked,
            increaseAirGauge,
            toggleMoodLight,
            feedEmotion,
            updateInteraction,
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
