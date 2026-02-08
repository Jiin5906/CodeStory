import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useStore } from '../../context/StoreContext';
import { THEMES, SHELVES, LIGHTS, POTS, CUSHIONS, getItemsByType } from '../../data/StoreData';

/**
 * 아이템 미리보기 렌더링 컴포넌트
 */
const ItemPreview = ({ item }) => {
    // 테마 미리보기
    if (item.category === 'theme') {
        return (
            <div className={`w-full h-full rounded-xl bg-gradient-to-br ${item.gradient} border-2 border-white/50`}>
                <div className="flex items-center justify-center h-full text-4xl">
                    {item.emoji}
                </div>
            </div>
        );
    }

    // 선반 미리보기
    if (item.type === 'shelf') {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div
                    className="w-4/5 h-3 rounded-md shadow-md"
                    style={{
                        background: `linear-gradient(to bottom, ${item.colorLight}, ${item.color})`,
                        boxShadow: `0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)`
                    }}
                ></div>
            </div>
        );
    }

    // 무드등 미리보기
    if (item.type === 'light') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                {/* 전구 갓 */}
                <div
                    className="w-10 h-10 rounded-t-lg"
                    style={{
                        background: `linear-gradient(to bottom, ${item.shadeColor}, ${item.shadeColorDark})`,
                        boxShadow: `0 0 15px ${item.shadeColor}, inset 0 2px 4px rgba(255,255,255,0.3)`,
                        clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
                    }}
                ></div>
                {/* 스탠드 */}
                <div
                    className="w-1 h-8 rounded-full"
                    style={{
                        background: `linear-gradient(to right, #3A3A3A, ${item.standColor}, #3A3A3A)`
                    }}
                ></div>
                {/* 받침대 */}
                <div
                    className="w-8 h-2 rounded-full"
                    style={{
                        background: `linear-gradient(to bottom, ${item.standColor}, #1A1A1A)`
                    }}
                ></div>
            </div>
        );
    }

    // 화분 미리보기
    if (item.type === 'pot') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-end pb-2">
                {/* 식물 */}
                <div
                    className="w-8 h-8 rounded-full mb-1"
                    style={{
                        background: `radial-gradient(circle, ${item.plantColor}, ${item.plantColor}DD)`
                    }}
                ></div>
                {/* 화분 */}
                <div
                    className="w-10 h-6 rounded-b-lg"
                    style={{
                        background: `linear-gradient(to bottom, ${item.potColor}, ${item.potColor}CC)`,
                        clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
                    }}
                ></div>
            </div>
        );
    }

    // 방석 미리보기
    if (item.type === 'cushion') {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div
                    className="w-14 h-10 rounded-2xl"
                    style={{
                        background: `radial-gradient(ellipse at center, ${item.color}, ${item.colorDark})`,
                        boxShadow: `0 4px 8px rgba(0,0,0,0.2), inset 0 -2px 6px rgba(0,0,0,0.1)`
                    }}
                ></div>
            </div>
        );
    }

    return null;
};

/**
 * StoreView — 상점 (방 꾸미기 중심)
 */
const StoreView = ({ isOpen, onClose }) => {
    const { coins, buyItem, equipItem, isOwned, isEquipped } = useStore();

    const [activeTab, setActiveTab] = useState('theme'); // 'theme' | 'furniture'
    const [furnitureFilter, setFurnitureFilter] = useState('all'); // 'all' | 'shelf' | 'light' | 'pot' | 'cushion'
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    if (!isOpen) return null;

    // ─── Toast 표시 함수 ───
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // ─── 구매 핸들러 ───
    const handleBuy = (itemId) => {
        const result = buyItem(itemId);
        showToast(result.message, result.success ? 'success' : 'error');
    };

    // ─── 장착 핸들러 ───
    const handleEquip = (itemId) => {
        const result = equipItem(itemId);
        showToast(result.message, result.success ? 'success' : 'error');
    };

    // ─── 현재 탭에 따른 아이템 목록 ───
    const getCurrentItems = () => {
        if (activeTab === 'theme') {
            return THEMES;
        } else {
            // 가구 탭
            if (furnitureFilter === 'all') {
                return [...SHELVES, ...LIGHTS, ...POTS, ...CUSHIONS];
            } else {
                return getItemsByType(furnitureFilter);
            }
        }
    };

    const currentItems = getCurrentItems();

    return (
        <div className="fixed inset-0 z-[80] bg-gradient-to-b from-purple-100 via-pink-50 to-yellow-50 flex flex-col">
            {/* 헤더 */}
            <header className="relative z-50 pt-14 px-6 flex items-center justify-between">
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="w-10 h-10 bg-white/90 rounded-full text-gray-600 shadow-md flex items-center justify-center border-2 border-white active:scale-95 hover:bg-white transition text-lg"
                    data-gtm="store-close-button"
                >
                    <FaTimes />
                </button>

                {/* 타이틀 */}
                <div className="bg-white/60 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">
                    <h1 className="text-sm font-bold text-gray-600 flex items-center gap-2">
                        🏪 상점
                    </h1>
                </div>

                {/* 코인 표시 */}
                <div className="bg-white/90 px-4 py-2 rounded-full shadow-md border-2 border-white">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">💰</span>
                        <span className="text-sm font-bold text-gray-700">{coins}원</span>
                    </div>
                </div>
            </header>

            {/* 탭 메뉴 */}
            <div className="px-6 pt-6 pb-4">
                <div className="flex gap-2 bg-white/70 p-2 rounded-2xl shadow-md">
                    <button
                        onClick={() => setActiveTab('theme')}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                            activeTab === 'theme'
                                ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-lg'
                                : 'bg-transparent text-gray-600 hover:bg-white/50'
                        }`}
                        data-gtm="store-tab-theme"
                    >
                        🎨 테마
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('furniture');
                            setFurnitureFilter('all');
                        }}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                            activeTab === 'furniture'
                                ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-lg'
                                : 'bg-transparent text-gray-600 hover:bg-white/50'
                        }`}
                        data-gtm="store-tab-furniture"
                    >
                        🪑 가구
                    </button>
                </div>
            </div>

            {/* 가구 필터 (가구 탭일 때만 표시) */}
            {activeTab === 'furniture' && (
                <div className="px-6 pb-4">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {[
                            { id: 'all', label: '전체', emoji: '🏪' },
                            { id: 'shelf', label: '선반', emoji: '📦' },
                            { id: 'light', label: '무드등', emoji: '💡' },
                            { id: 'pot', label: '화분', emoji: '🌿' },
                            { id: 'cushion', label: '방석', emoji: '💗' }
                        ].map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setFurnitureFilter(filter.id)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                                    furnitureFilter === filter.id
                                        ? 'bg-white text-purple-600 shadow-md'
                                        : 'bg-white/50 text-gray-600 hover:bg-white/70'
                                }`}
                                data-gtm={`store-filter-${filter.id}`}
                            >
                                {filter.emoji} {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 메인 영역: 아이템 그리드 */}
            <main className="flex-1 overflow-y-auto px-6 pb-8">
                <div className="grid grid-cols-2 gap-4">
                    {currentItems.map(item => {
                        const owned = isOwned(item.id);
                        const equipped = isEquipped(item.id);

                        return (
                            <div
                                key={item.id}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border-2 border-white hover:shadow-xl transition-all"
                                data-gtm={`store-item-${item.id}`}
                            >
                                {/* 아이템 미리보기 */}
                                <div className="h-20 mb-3 rounded-xl bg-gradient-to-b from-gray-50 to-gray-100">
                                    <ItemPreview item={item} />
                                </div>

                                {/* 아이템 정보 */}
                                <h3 className="text-sm font-bold text-gray-800 text-center mb-1">
                                    {item.name}
                                </h3>
                                <p className="text-xs text-gray-500 text-center mb-3 h-8">
                                    {item.description}
                                </p>

                                {/* 가격 및 버튼 */}
                                <div className="flex flex-col gap-2">
                                    {!owned && (
                                        <>
                                            <div className="flex items-center justify-center">
                                                <span className="text-xs font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                                                    💰 {item.price}원
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleBuy(item.id)}
                                                disabled={coins < item.price}
                                                className={`text-xs font-bold px-4 py-2 rounded-full transition-all ${
                                                    coins >= item.price
                                                        ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white active:scale-95 hover:shadow-lg'
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                                data-gtm={`store-buy-${item.id}`}
                                            >
                                                {coins >= item.price ? '구매하기' : '코인 부족'}
                                            </button>
                                        </>
                                    )}
                                    {owned && !equipped && (
                                        <button
                                            onClick={() => handleEquip(item.id)}
                                            className="text-xs bg-gradient-to-r from-green-400 to-emerald-400 text-white px-4 py-2 rounded-full font-bold active:scale-95 hover:shadow-lg transition-all"
                                            data-gtm={`store-equip-${item.id}`}
                                        >
                                            장착하기
                                        </button>
                                    )}
                                    {equipped && (
                                        <button
                                            disabled
                                            className="text-xs bg-gray-200 text-gray-500 px-4 py-2 rounded-full font-bold cursor-not-allowed"
                                        >
                                            ✓ 장착 중
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 아이템 없음 */}
                {currentItems.length === 0 && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 text-center shadow-lg border-2 border-white">
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-sm text-gray-600">아이템이 없습니다.</p>
                    </div>
                )}
            </main>

            {/* Toast 알림 */}
            {toast.show && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] animate-fade-in">
                    <div className={`px-6 py-3 rounded-full shadow-2xl font-bold text-sm ${
                        toast.type === 'success'
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                    }`}>
                        {toast.message}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreView;
