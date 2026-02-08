import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { DEFAULT_EQUIPPED, getItemById } from '../data/StoreData';

const StoreContext = createContext();

// localStorage 키
const STORAGE_KEYS = {
    COINS: 'store_coins',
    OWNED_ITEMS: 'store_owned_items',
    EQUIPPED_ITEMS: 'store_equipped_items'
};

// localStorage 유틸리티
const loadFromStorage = (key, defaultValue) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`❌ [StoreContext] localStorage 로드 실패 (${key}):`, error);
        return defaultValue;
    }
};

const saveToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`❌ [StoreContext] localStorage 저장 실패 (${key}):`, error);
    }
};

export const StoreProvider = ({ children }) => {
    // ─── 상태 관리 ───
    const [coins, setCoins] = useState(() => loadFromStorage(STORAGE_KEYS.COINS, 1000)); // 초기 코인 1000원
    const [ownedItems, setOwnedItems] = useState(() => loadFromStorage(STORAGE_KEYS.OWNED_ITEMS, ['theme_default'])); // 기본 테마는 기본 보유
    const [equippedItems, setEquippedItems] = useState(() => loadFromStorage(STORAGE_KEYS.EQUIPPED_ITEMS, DEFAULT_EQUIPPED));

    // ─── localStorage 동기화 ───
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.COINS, coins);
    }, [coins]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.OWNED_ITEMS, ownedItems);
    }, [ownedItems]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.EQUIPPED_ITEMS, equippedItems);
    }, [equippedItems]);

    // ─── 코인 추가 ───
    const addCoins = useCallback((amount) => {
        setCoins(prev => {
            const newAmount = prev + amount;
            console.log(`💰 [StoreContext] 코인 획득: +${amount}원 (총: ${newAmount}원)`);
            return newAmount;
        });
    }, []);

    // ─── 코인 차감 ───
    const subtractCoins = useCallback((amount) => {
        setCoins(prev => {
            const newAmount = Math.max(0, prev - amount);
            console.log(`💰 [StoreContext] 코인 사용: -${amount}원 (총: ${newAmount}원)`);
            return newAmount;
        });
    }, []);

    // ─── 아이템 구매 ───
    const buyItem = useCallback((itemId) => {
        const item = getItemById(itemId);

        if (!item) {
            console.error('❌ [StoreContext] 존재하지 않는 아이템:', itemId);
            return { success: false, message: '아이템을 찾을 수 없습니다.' };
        }

        // 이미 보유 중인지 확인
        if (ownedItems.includes(itemId)) {
            return { success: false, message: '이미 보유 중인 아이템입니다.' };
        }

        // 코인 부족 확인
        if (coins < item.price) {
            return { success: false, message: `코인이 부족합니다. (필요: ${item.price}원)` };
        }

        // 구매 처리
        subtractCoins(item.price);
        setOwnedItems(prev => [...prev, itemId]);

        console.log(`🛒 [StoreContext] 아이템 구매 완료:`, item.name);
        return { success: true, message: `${item.name}을(를) 구매했습니다!` };
    }, [coins, ownedItems, subtractCoins]);

    // ─── 아이템 장착 ───
    const equipItem = useCallback((itemId) => {
        const item = getItemById(itemId);

        if (!item) {
            console.error('❌ [StoreContext] 존재하지 않는 아이템:', itemId);
            return { success: false, message: '아이템을 찾을 수 없습니다.' };
        }

        // 보유 중인지 확인
        if (!ownedItems.includes(itemId)) {
            return { success: false, message: '보유하지 않은 아이템입니다.' };
        }

        // 장착 처리
        if (item.category === 'theme') {
            setEquippedItems(prev => ({ ...prev, theme: itemId }));
            console.log(`✨ [StoreContext] 테마 장착:`, item.name);
        } else if (item.type) {
            // 가구 타입별 장착 (shelf, light, pot, cushion)
            setEquippedItems(prev => ({ ...prev, [item.type]: itemId }));
            console.log(`✨ [StoreContext] 가구 장착 (${item.type}):`, item.name);
        }

        return { success: true, message: `${item.name}을(를) 장착했습니다!` };
    }, [ownedItems]);

    // ─── 아이템 장착 해제 ───
    const unequipItem = useCallback((slotType) => {
        if (!['theme', 'shelf', 'light', 'pot', 'cushion'].includes(slotType)) {
            console.error('❌ [StoreContext] 잘못된 슬롯 타입:', slotType);
            return { success: false, message: '잘못된 슬롯 타입입니다.' };
        }

        // theme은 장착 해제 불가 (항상 하나는 장착되어 있어야 함)
        if (slotType === 'theme') {
            return { success: false, message: '테마는 장착 해제할 수 없습니다.' };
        }

        setEquippedItems(prev => ({ ...prev, [slotType]: null }));
        console.log(`🔓 [StoreContext] 장착 해제 (${slotType})`);
        return { success: true, message: '장착 해제되었습니다.' };
    }, []);

    // ─── 보유 여부 확인 ───
    const isOwned = useCallback((itemId) => {
        return ownedItems.includes(itemId);
    }, [ownedItems]);

    // ─── 장착 여부 확인 ───
    const isEquipped = useCallback((itemId) => {
        return Object.values(equippedItems).includes(itemId);
    }, [equippedItems]);

    // ─── 장착된 아이템 가져오기 ───
    const getEquippedItem = useCallback((slotType) => {
        const itemId = equippedItems[slotType];
        return itemId ? getItemById(itemId) : null;
    }, [equippedItems]);

    return (
        <StoreContext.Provider value={{
            coins,
            ownedItems,
            equippedItems,
            addCoins,
            subtractCoins,
            buyItem,
            equipItem,
            unequipItem,
            isOwned,
            isEquipped,
            getEquippedItem
        }}>
            {children}
        </StoreContext.Provider>
    );
};

// ─── Hook ───
export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within StoreProvider');
    }
    return context;
};
