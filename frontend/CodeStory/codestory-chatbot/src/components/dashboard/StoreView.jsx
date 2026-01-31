import React from 'react';
import { FaTimes } from 'react-icons/fa';

/**
 * StoreView — 상점 (테스트용 간단한 UI)
 *
 * 현재는 UI 레이아웃만 구성
 */
const StoreView = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    // 테스트용 아이템 목록
    const testItems = [
        { id: 1, name: '무드등 스킨', emoji: '💡', price: 100, description: '예쁜 무드등 스킨' },
        { id: 2, name: '배경 테마', emoji: '🎨', price: 150, description: '새로운 배경 테마' },
        { id: 3, name: '감정 조각 팩', emoji: '💎', price: 50, description: '랜덤 감정 조각 5개' },
        { id: 4, name: '경험치 부스트', emoji: '⚡', price: 200, description: '2배 경험치 (1시간)' },
    ];

    return (
        <div className="fixed inset-0 z-[80] bg-gradient-to-b from-purple-100 via-pink-50 to-yellow-50 flex flex-col">
            {/* 헤더 */}
            <header className="relative z-50 pt-14 px-6 flex items-center justify-between">
                <button
                    onClick={onClose}
                    className="w-10 h-10 bg-white/90 rounded-full text-gray-600 shadow-md flex items-center justify-center border-2 border-white active:scale-95 hover:bg-white transition text-lg"
                    data-gtm="store-close-button"
                >
                    <FaTimes />
                </button>
                <div className="bg-white/60 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">
                    <h1 className="text-sm font-bold text-gray-600 flex items-center gap-2">
                        🏪 상점 (준비 중)
                    </h1>
                </div>
                <div className="w-10 h-10"></div>
            </header>

            {/* 메인 영역 */}
            <main className="flex-1 overflow-y-auto px-6 py-8">
                {/* 안내 메시지 */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 mb-6 text-center shadow-lg border-2 border-white">
                    <div className="text-6xl mb-4">🚧</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">상점 준비 중입니다</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        곧 다양한 아이템과 꾸미기 요소를 만나보실 수 있어요!
                    </p>
                </div>

                {/* 테스트용 아이템 그리드 */}
                <div className="grid grid-cols-2 gap-4">
                    {testItems.map(item => (
                        <div
                            key={item.id}
                            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border-2 border-white hover:shadow-xl transition-all hover:scale-105"
                            data-gtm={`store-item-${item.id}`}
                        >
                            {/* 아이템 이모지 */}
                            <div className="text-5xl mb-3 text-center">{item.emoji}</div>

                            {/* 아이템 정보 */}
                            <h3 className="text-sm font-bold text-gray-800 text-center mb-1">
                                {item.name}
                            </h3>
                            <p className="text-xs text-gray-500 text-center mb-3">
                                {item.description}
                            </p>

                            {/* 가격 및 구매 버튼 */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                    💰 {item.price}
                                </span>
                                <button className="text-xs bg-gradient-to-r from-purple-400 to-pink-400 text-white px-3 py-1.5 rounded-full font-bold active:scale-95 transition-transform opacity-50 cursor-not-allowed">
                                    준비 중
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 하단 안내 */}
                <div className="mt-8 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-4 text-center">
                    <p className="text-xs text-gray-600">
                        💝 더 많은 아이템이 곧 추가될 예정입니다
                    </p>
                </div>
            </main>
        </div>
    );
};

export default StoreView;
