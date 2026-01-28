import React, { createContext, useState, useContext, useCallback } from 'react';
import { petApi } from '../services/api';

const PetContext = createContext();

export const PetProvider = ({ children }) => {
    const [petStatus, setPetStatus] = useState(null);
    const [emotionShards, setEmotionShards] = useState([]);
    const [isRubbing, setIsRubbing] = useState(false);
    const [affectionGauge, setAffectionGauge] = useState(0);

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
            setAffectionGauge(0);
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

    return (
        <PetContext.Provider value={{
            petStatus,
            emotionShards,
            isRubbing,
            setIsRubbing,
            affectionGauge,
            setAffectionGauge,
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
