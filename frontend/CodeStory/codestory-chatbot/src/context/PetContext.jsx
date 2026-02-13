import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
import { petApi, coinApi } from '../services/api';

const PetContext = createContext();

// ─── 상수 정의 ───
const LOCK_THRESHOLD = 100;   // 100%에 도달하면 Lock
const UNLOCK_THRESHOLD = 30;  // 30% 이하이면 Unlock

// 게이지 감소 속도 설정 (4단계 밸런싱: 5분→10분 / 2시간→4시간)
const IS_DEV_MODE = true; // 배포 시 false로 변경
const TOTAL_DECAY_TIME_MS = IS_DEV_MODE ? 600000 : 14400000; // 10분 or 4시간
const DECAY_INTERVAL_MS = 10000; // 10초마다 체크
const DECAY_AMOUNT = (100 / (TOTAL_DECAY_TIME_MS / DECAY_INTERVAL_MS));

// 수면 게이지 설정 (4단계 밸런싱: 10분→15분 / 17시간→20시간)
const AWAKE_TIME_MS = IS_DEV_MODE ? 900000 : 72000000; // 15분 or 20시간 (깨어있을 때)
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

// 자동 수면 (비활동 3시간)
const AUTO_SLEEP_INACTIVITY_MS = IS_DEV_MODE ? 300000 : 10800000; // 5분 or 3시간

// 쓰다듬기 Lock 유지 시간
const AFFECTION_LOCK_DURATION_MS = IS_DEV_MODE ? 60000 : 300000; // 1분 or 5분

// localStorage 키
const STORAGE_KEYS = {
    AFFECTION: 'pet_affection_gauge',
    ENERGY: 'pet_energy_gauge',
    SLEEP: 'pet_sleep_gauge',
    HUNGER: 'pet_hunger_gauge',
    IS_SLEEPING: 'pet_is_sleeping',
    MOOD_LIGHT_ON: 'pet_mood_light_on',
    LAST_INTERACTION: 'pet_last_interaction_time',
    EMOTION_SHARDS: 'pet_emotion_shards',
    AFFECTION_LOCK_UNTIL: 'pet_affection_lock_until',
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
    const [energyGauge, setEnergyGauge] = useState(() => loadGaugeFromStorage(STORAGE_KEYS.ENERGY));
    const [sleepGauge, setSleepGauge] = useState(() => loadGaugeFromStorage(STORAGE_KEYS.SLEEP, 100));
    const [hungerGauge, setHungerGauge] = useState(() => loadGaugeFromStorage(STORAGE_KEYS.HUNGER, 50));

    // 수면 시스템 상태 (새로고침 시 비활동 시간 기반으로 수면 여부 판단)
    const [isSleeping, setIsSleeping] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.IS_SLEEPING);
        if (stored !== 'true') return false;
        // 마지막 상호작용 시간 확인: 임계값 초과 시에만 수면 유지
        const lastTime = localStorage.getItem(STORAGE_KEYS.LAST_INTERACTION);
        if (!lastTime) return false;
        const elapsed = Date.now() - parseInt(lastTime);
        return elapsed >= AUTO_SLEEP_INACTIVITY_MS;
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
    const [affectionLockUntil, setAffectionLockUntil] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.AFFECTION_LOCK_UNTIL);
        return stored ? parseInt(stored) : null;
    });
    const [isEnergyLocked, setIsEnergyLocked] = useState(false);

    // ━━━ 코인 시스템 ━━━
    const [coins, setCoins] = useState(0);
    const [coinToast, setCoinToast] = useState(null);

    // ━━━ 수면 토스트 (2단계) ━━━
    const [sleepToast, setSleepToast] = useState(null);

    // 동시성 제어 플래그
    const [isApiLoading, setIsApiLoading] = useState(false);

    // Refs
    const decayTimerRef = useRef(null);
    const autoSaveTimerRef = useRef(null);
    const inactivityTimerRef = useRef(null);
    const autoSleepTimerRef = useRef(null);
    const gaugesRef = useRef({ affectionGauge, energyGauge, sleepGauge, hungerGauge });
    const prevGaugesRef = useRef({ affectionGauge: 0, hungerGauge: 0, sleepGauge: 0 });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ─── useCallback 정의 (useEffect보다 반드시 먼저 선언) ───
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // ─── Lock/Unlock 로직 ───
    const checkLock = useCallback((value, currentLocked) => {
        if (value >= LOCK_THRESHOLD) return true;
        if (value <= UNLOCK_THRESHOLD) return false;
        return currentLocked;
    }, []);

    // ─── 수면 토스트 표시 (2단계) ───
    const showSleepToast = useCallback((message) => {
        setSleepToast(message || '몽글이가 자고 있어요. 램프를 켜서 깨워주세요.');
        setTimeout(() => setSleepToast(null), 3000);
    }, []);

    // ─── 서버에서 PetStatus 조회 및 로컬 state 동기화 ───
    const fetchPetStatus = useCallback(async (userId) => {
        if (!userId) return;
        try {
            const data = await petApi.getStatus(userId);
            if (data) {
                setPetStatus(data);

                // CRITICAL: Lock이 유효한 경우 affectionGauge는 서버 값으로 덮어쓰지 않음
                const storedLockUntil = localStorage.getItem(STORAGE_KEYS.AFFECTION_LOCK_UNTIL);
                const isLockActive = storedLockUntil && parseInt(storedLockUntil) > Date.now();

                if (isLockActive) {
                    console.log('[fetchPetStatus] Lock 활성 상태 - affectionGauge 서버 동기화 건너뜀');
                } else {
                    if (data.affectionGauge !== undefined) setAffectionGauge(data.affectionGauge);
                }

                // 다른 게이지들은 항상 동기화
                if (data.energyGauge !== undefined) setEnergyGauge(data.energyGauge);
            }
        } catch (e) {
            console.error('[PetContext] fetchPetStatus 실패:', e);
        }
    }, []);

    // ─── 코인 조회 ───
    const fetchCoins = useCallback(async (userId) => {
        if (!userId) return;
        try {
            const data = await coinApi.getCoins(userId);
            if (data?.coins !== undefined) setCoins(data.coins);
        } catch (e) {
            console.error('[PetContext] fetchCoins 실패:', e);
        }
    }, []);

    // ─── 코인 토스트 표시 ───
    const showCoinToast = useCallback((amount) => {
        setCoinToast(`+${amount}원 획득!`);
        setTimeout(() => setCoinToast(null), 2500);
    }, []);

    // ─── 게이지 100% 코인 보상 ───
    const triggerGaugeReward = useCallback(async (gaugeType) => {
        const user = JSON.parse(localStorage.getItem('diaryUser'));
        if (!user?.id) return;
        try {
            const data = await coinApi.giveGaugeReward(user.id, gaugeType);
            if (data?.rewarded) {
                setCoins(data.coins);
                showCoinToast(data.amount);
            }
        } catch (e) {
            console.error('[PetContext] triggerGaugeReward 실패:', e);
        }
    }, [showCoinToast]);

    // ─── 감정 조각 코인 보상 ───
    const triggerShardReward = useCallback(async () => {
        const user = JSON.parse(localStorage.getItem('diaryUser'));
        if (!user?.id) return;
        try {
            const data = await coinApi.giveShardReward(user.id);
            if (data?.rewarded) {
                setCoins(data.coins);
                showCoinToast(data.amount);
            }
        } catch (e) {
            console.error('[PetContext] triggerShardReward 실패:', e);
        }
    }, [showCoinToast]);

    // ─── 코인 사용 (상점 구매 등) ───
    const spendCoins = useCallback(async (amount) => {
        const user = JSON.parse(localStorage.getItem('diaryUser'));
        if (!user?.id) return { success: false };
        try {
            const data = await coinApi.spendCoins(user.id, amount);
            if (data?.success) {
                setCoins(data.coins);
            }
            return data;
        } catch (e) {
            console.error('[PetContext] spendCoins 실패:', e);
            return { success: false };
        }
    }, []);

    // ─── 일기 작성 코인 보상 ───
    const triggerDiaryReward = useCallback(async () => {
        const user = JSON.parse(localStorage.getItem('diaryUser'));
        if (!user?.id) return;
        try {
            const data = await coinApi.giveDiaryReward(user.id);
            if (data?.rewarded) {
                setCoins(data.coins);
                showCoinToast(data.amount);
            }
        } catch (e) {
            console.error('[PetContext] triggerDiaryReward 실패:', e);
        }
    }, [showCoinToast]);

    // ─── 쓰다듬기 완료 ───
    const handleAffectionComplete = useCallback(async (userId) => {
        // Lock 시간 설정
        const lockUntil = Date.now() + AFFECTION_LOCK_DURATION_MS;
        setAffectionLockUntil(lockUntil);

        // 게이지를 100%로 설정
        setAffectionGauge(100);

        // 서버 API 호출 (동시성 제어)
        if (isApiLoading) {
            console.log('[AffectionComplete] 이미 API 호출 중이므로 무시');
            return;
        }

        setIsApiLoading(true);
        try {
            const data = await petApi.affectionComplete(userId);
            setPetStatus(data);

            // CRITICAL: affectionGauge는 서버 응답으로 덮어쓰지 않고 100% 유지
            if (data.energyGauge !== undefined) setEnergyGauge(data.energyGauge);

            // 레벨업 보상 토스트
            if (data.levelUpReward) {
                showCoinToast(data.levelUpReward.amount);
                setCoins(data.levelUpReward.totalCoins);
            }
        } catch (e) {
            console.error('[AffectionComplete] API 호출 실패:', e);
        } finally {
            setIsApiLoading(false);
        }
    }, [isApiLoading, showCoinToast]);

    // ─── 감정 조각 수집 (Bug A 수정: handleAction 래퍼 제거) ───
    const handleCollectShard = useCallback(async (userId, shardId) => {
        // Bug A 수정: handleAction을 사용하지 않고 직접 API 호출
        // affectionGauge와 hungerGauge는 로컬에서 관리하므로 서버 응답으로 덮어쓰지 않음
        try {
            const data = await petApi.collectShard(userId);
            setEmotionShards(prev => prev.filter(s => s.id !== shardId));
            setPetStatus(data);
            // energyGauge만 서버와 동기화
            if (data.energyGauge !== undefined) setEnergyGauge(data.energyGauge);
            // 감정 조각 수집 코인 보상
            triggerShardReward();

            // 레벨업 보상 토스트
            if (data.levelUpReward) {
                showCoinToast(data.levelUpReward.amount);
                setCoins(data.levelUpReward.totalCoins);
            }
        } catch (e) {
            console.error('[handleCollectShard] API 호출 실패:', e);
        }
    }, [triggerShardReward, showCoinToast]);

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

    // ─── 무드등 토글 ───
    const toggleMoodLight = useCallback(() => {
        setMoodLightOn(prev => {
            const newValue = !prev;
            if (newValue) {
                // 무드등 켜기 (기상)
                setIsSleeping(false);
                console.log('[MoodLight] 무드등 켜짐 - 몽글이 기상');
            } else {
                // 무드등 끄기 (수면)
                setIsSleeping(true);
                console.log('[MoodLight] 무드등 꺼짐 - 몽글이 수면');
            }
            return newValue;
        });
        setLastInteractionTime(Date.now());
    }, []);

    // ─── 배고픔 게이지 증가 (식사) + 수면 체크 ───
    const feedEmotion = useCallback((emotionType, amount = 25) => {
        // 수면 중 차단
        if (isSleeping) {
            showSleepToast();
            return;
        }

        setHungerGauge(prev => {
            const next = Math.min(100, prev + amount);
            return next;
        });
        setLastInteractionTime(Date.now());
    }, [isSleeping, showSleepToast]);

    // ─── 사용자 상호작용 (마지막 시간 업데이트) ───
    const updateInteraction = useCallback(() => {
        setLastInteractionTime(Date.now());
    }, []);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ─── useEffect 정의 (useCallback 이후에 배치) ───
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // ─── gaugesRef 및 localStorage 동기화 ───
    useEffect(() => {
        gaugesRef.current = { affectionGauge, energyGauge, sleepGauge, hungerGauge };
        localStorage.setItem(STORAGE_KEYS.AFFECTION, affectionGauge);
        localStorage.setItem(STORAGE_KEYS.ENERGY, energyGauge);
        localStorage.setItem(STORAGE_KEYS.SLEEP, sleepGauge);
        localStorage.setItem(STORAGE_KEYS.HUNGER, hungerGauge);
    }, [affectionGauge, energyGauge, sleepGauge, hungerGauge]);

    // ─── 수면 상태 localStorage 동기화 ───
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.IS_SLEEPING, isSleeping);
        localStorage.setItem(STORAGE_KEYS.MOOD_LIGHT_ON, moodLightOn);
        localStorage.setItem(STORAGE_KEYS.LAST_INTERACTION, lastInteractionTime);
    }, [isSleeping, moodLightOn, lastInteractionTime]);

    // ─── affectionLockUntil localStorage 동기화 ───
    useEffect(() => {
        if (affectionLockUntil !== null) {
            localStorage.setItem(STORAGE_KEYS.AFFECTION_LOCK_UNTIL, affectionLockUntil);
        } else {
            localStorage.removeItem(STORAGE_KEYS.AFFECTION_LOCK_UNTIL);
        }
    }, [affectionLockUntil]);

    // ─── 감정 조각 localStorage 동기화 ───
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.EMOTION_SHARDS, JSON.stringify(emotionShards));
    }, [emotionShards]);

    // ─── 쓰다듬기 Lock 시간 기반 체크 ───
    useEffect(() => {
        if (affectionLockUntil === null) {
            setIsAffectionLocked(false);
            return;
        }

        const checkLockExpiry = () => {
            const now = Date.now();
            if (now >= affectionLockUntil) {
                console.log('[AffectionLock] Lock 해제됨 (시간 경과)');
                setIsAffectionLocked(false);
                setAffectionLockUntil(null);
            } else {
                setIsAffectionLocked(true);
            }
        };

        checkLockExpiry();
        const interval = setInterval(checkLockExpiry, 1000);
        return () => clearInterval(interval);
    }, [affectionLockUntil]);

    // ─── 초기 로드 (마운트 시 1회) ───
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('diaryUser'));
        if (user?.id) {
            fetchPetStatus(user.id);
            fetchCoins(user.id);
        }
    }, [fetchPetStatus, fetchCoins]);

    // ─── 게이지 100% 코인 보상 자동 감지 ───
    useEffect(() => {
        const prev = prevGaugesRef.current;
        if (affectionGauge >= 100 && prev.affectionGauge < 100) {
            triggerGaugeReward('affection');
        }
        if (hungerGauge >= 100 && prev.hungerGauge < 100) {
            triggerGaugeReward('hunger');
        }
        if (sleepGauge >= 100 && prev.sleepGauge < 100) {
            triggerGaugeReward('sleep');
        }
        prevGaugesRef.current = { affectionGauge, hungerGauge, sleepGauge };
    }, [affectionGauge, hungerGauge, sleepGauge, triggerGaugeReward]);

    // ─── 게이지 자연 감소 (Decay) ───
    useEffect(() => {
        decayTimerRef.current = setInterval(() => {
            // 기존 게이지들 (깨어 있을 때만 감소)
            if (!isSleeping) {
                setAffectionGauge(prev => {
                    if (isAffectionLocked) return prev;
                    const next = Math.max(0, prev - DECAY_AMOUNT);
                    setIsAffectionLocked(locked => checkLock(next, locked));
                    return next;
                });

                setEnergyGauge(prev => {
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
    }, [checkLock, isSleeping, isAffectionLocked, isEnergyLocked]);

    // ─── 강제 수면 체크 (수면게이지 10% 이하 + 비활동 5분) ───
    useEffect(() => {
        if (isSleeping) {
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
                inactivityTimerRef.current = null;
            }
            return;
        }

        const checkForceSleep = () => {
            const timeSinceLastInteraction = Date.now() - lastInteractionTime;
            if (sleepGauge <= FORCE_SLEEP_THRESHOLD && timeSinceLastInteraction >= INACTIVITY_TIME_MS) {
                console.log('[ForceSleep] 강제 수면 진입 (수면게이지 10% 이하)');
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
    }, [isSleeping, sleepGauge, lastInteractionTime]);

    // ─── 자동 수면 (30분 비활동) ── 2단계 ───
    useEffect(() => {
        if (isSleeping) {
            if (autoSleepTimerRef.current) {
                clearTimeout(autoSleepTimerRef.current);
                autoSleepTimerRef.current = null;
            }
            return;
        }

        const checkAutoSleep = () => {
            const timeSinceLastInteraction = Date.now() - lastInteractionTime;
            if (timeSinceLastInteraction >= AUTO_SLEEP_INACTIVITY_MS) {
                console.log('[AutoSleep] 자동 수면 진입 (비활동 30분)');
                setMoodLightOn(false);
                setIsSleeping(true);
            }
        };

        autoSleepTimerRef.current = setTimeout(checkAutoSleep, AUTO_SLEEP_INACTIVITY_MS);

        return () => {
            if (autoSleepTimerRef.current) {
                clearTimeout(autoSleepTimerRef.current);
            }
        };
    }, [isSleeping, lastInteractionTime]);

    // ─── 주기적 자동 저장 (30초마다) ───
    useEffect(() => {
        autoSaveTimerRef.current = setInterval(async () => {
            if (isApiLoading) return;

            const user = JSON.parse(localStorage.getItem('diaryUser'));
            if (!user?.id) return;

            try {
                const currentGauges = gaugesRef.current;
                await petApi.saveGauges(user.id, {
                    affectionGauge: currentGauges.affectionGauge,
                    energyGauge: currentGauges.energyGauge,
                    sleepGauge: currentGauges.sleepGauge,
                    hungerGauge: currentGauges.hungerGauge,
                    lastUpdate: new Date().toISOString()
                });
            } catch (e) {
                console.warn('[AutoSave] 저장 실패 (무시됨):', e.message);
            }
        }, AUTO_SAVE_INTERVAL_MS);

        return () => {
            if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
        };
    }, [isApiLoading]);

    return (
        <PetContext.Provider value={{
            petStatus,
            emotionShards,
            isRubbing,
            setIsRubbing,
            affectionGauge,
            setAffectionGauge,
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
            isEnergyLocked,
            toggleMoodLight,
            feedEmotion,
            updateInteraction,
            checkLock,
            fetchPetStatus,
            handleAffectionComplete,
            handleCollectShard,
            spawnEmotionShard,
            coins,
            coinToast,
            fetchCoins,
            spendCoins,
            triggerGaugeReward,
            triggerShardReward,
            triggerDiaryReward,
            // 수면 토스트
            sleepToast,
            showSleepToast,
        }}>
            {children}
        </PetContext.Provider>
    );
};

export const usePet = () => useContext(PetContext);
