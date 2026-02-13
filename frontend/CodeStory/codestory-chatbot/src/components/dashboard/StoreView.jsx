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

    // 무드등 미리보기 (designType별 SVG)
    if (item.type === 'light') {
        const dt = item.designType || 'classic';
        const sc = item.shadeColor;
        const sd = item.shadeColorDark;
        const st = item.standColor;

        // 튤립 램프 — 꽃봉오리 + 줄기
        if (dt === 'tulip') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 50 80" width="50" height="80">
                        <path d="M25,42 Q8,28 12,10 Q16,0 25,6" fill={sc} stroke={sd} strokeWidth="0.5" />
                        <path d="M25,42 Q42,28 38,10 Q34,0 25,6" fill={sc} stroke={sd} strokeWidth="0.5" />
                        <path d="M19,40 Q18,16 25,2 Q32,16 31,40 Z" fill={sd} opacity="0.7" />
                        <path d="M21,42 Q25,46 29,42 L27,45 Q25,48 23,45 Z" fill={st} />
                        <path d="M25,45 Q24,60 25,72" fill="none" stroke={st} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M25,58 Q32,52 36,55 Q32,60 25,58" fill={st} opacity="0.6" />
                        <ellipse cx="25" cy="74" rx="8" ry="3" fill="#8B6914" />
                    </svg>
                </div>
            );
        }

        // 버섯 램프 — 넓은 갓 + 흰 도트
        if (dt === 'mushroom') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 60 70" width="60" height="70">
                        <path d="M3,38 Q3,6 30,3 Q57,6 57,38 Z" fill={sc} stroke={sd} strokeWidth="0.5" />
                        <path d="M6,35 Q30,45 54,35 L57,38 Q30,50 3,38 Z" fill="#FFFEF5" opacity="0.4" />
                        <circle cx="17" cy="16" r="3.5" fill="white" opacity="0.4" />
                        <circle cx="30" cy="10" r="4" fill="white" opacity="0.35" />
                        <circle cx="43" cy="15" r="3" fill="white" opacity="0.4" />
                        <circle cx="24" cy="27" r="2.5" fill="white" opacity="0.3" />
                        <circle cx="40" cy="28" r="3" fill="white" opacity="0.25" />
                        <path d="M22,38 Q20,52 22,62 L38,62 Q40,52 38,38 Z" fill={st} />
                        <ellipse cx="30" cy="64" rx="16" ry="4" fill={st} opacity="0.7" />
                    </svg>
                </div>
            );
        }

        // 달/구름 램프 — 초승달 + 별
        if (dt === 'moon') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 60 70" width="60" height="70">
                        <circle cx="28" cy="28" r="18" fill={sc} />
                        <circle cx="36" cy="22" r="15" fill="#F0F0F0" opacity="0.6" />
                        <circle cx="20" cy="26" r="2" fill={sd} opacity="0.2" />
                        <circle cx="24" cy="36" r="1.5" fill={sd} opacity="0.15" />
                        <g transform="translate(50,10)">
                            <line x1="0" y1="-3" x2="0" y2="3" stroke="#FFFACD" strokeWidth="1.2" strokeLinecap="round" />
                            <line x1="-3" y1="0" x2="3" y2="0" stroke="#FFFACD" strokeWidth="1.2" strokeLinecap="round" />
                        </g>
                        <circle cx="8" cy="12" r="1" fill="#E8E0FF" opacity="0.6" />
                        <circle cx="52" cy="40" r="0.8" fill="#FFFACD" opacity="0.5" />
                        <ellipse cx="22" cy="56" rx="8" ry="4" fill="white" opacity="0.4" />
                        <ellipse cx="32" cy="54" rx="10" ry="5" fill="white" opacity="0.4" />
                        <ellipse cx="42" cy="56" rx="8" ry="4" fill="white" opacity="0.4" />
                    </svg>
                </div>
            );
        }

        // 라바 램프 — 유리병 + 기포
        if (dt === 'lava') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 40 80" width="40" height="80">
                        <rect x="12" y="2" width="16" height="8" rx="2" fill={st} />
                        <path d="M14,10 Q13,10 12,14 L9,62 Q9,72 20,72 Q31,72 31,62 L28,14 Q27,10 26,10 Z"
                            fill="rgba(255,255,255,0.08)" stroke={`${sc}66`} strokeWidth="0.8" />
                        <ellipse cx="17" cy="30" rx="5" ry="8" fill={sc} opacity="0.8" />
                        <ellipse cx="24" cy="52" rx="4" ry="6" fill={sd} opacity="0.75" />
                        <ellipse cx="20" cy="42" rx="3" ry="4" fill={sc} opacity="0.6" />
                        <ellipse cx="20" cy="66" rx="8" ry="3" fill={sd} opacity="0.4" />
                        <line x1="13" y1="15" x2="11" y2="60" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                        <rect x="8" y="70" width="24" height="8" rx="2" fill={st} />
                    </svg>
                </div>
            );
        }

        // 기본 (classic) 램프 — 사다리꼴 갓 + 스탠드
        return (
            <div className="w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 50 80" width="50" height="80">
                    <polygon points="12,3 38,3 44,30 6,30" fill={sc} stroke={sd} strokeWidth="0.5" />
                    <circle cx="25" cy="18" r="4" fill="#FFFDE7" opacity="0.7" />
                    <circle cx="25" cy="32" r="2" fill={st} />
                    <rect x="23.5" y="33" width="3" height="35" rx="1.5" fill={st} />
                    <ellipse cx="25" cy="72" rx="14" ry="4" fill={st} />
                </svg>
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
    const handleBuy = async (itemId) => {
        const result = await buyItem(itemId);
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
