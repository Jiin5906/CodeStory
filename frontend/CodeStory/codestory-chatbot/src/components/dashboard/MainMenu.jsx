import React from 'react';
import { FaHeart, FaStore, FaTimes } from 'react-icons/fa';

/**
 * MainMenu — 홈 버튼 클릭 시 열리는 메인 메뉴
 *
 * 메뉴 항목:
 * 1. 내 감정 조각 보기
 * 2. 상점(Store)
 */
const MainMenu = ({ isOpen, onClose, onEmotionShardsClick, onStoreClick }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* 배경 오버레이 */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] animate-fade-in"
                onClick={onClose}
                data-gtm="main-menu-overlay"
            ></div>

            {/* 메뉴 모달 */}
            <div
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[90%] max-w-md animate-scale-in"
                data-gtm="main-menu-modal"
            >
                <div className="bg-gradient-to-br from-white via-pink-50 to-purple-50 rounded-3xl shadow-2xl border-4 border-white overflow-hidden">
                    {/* 헤더 */}
                    <div className="relative bg-gradient-to-r from-pink-400 to-purple-400 p-6 text-white">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold drop-shadow-md">🏠 메인 메뉴</h2>
                                <p className="text-sm text-white/90 mt-1">원하는 메뉴를 선택하세요</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all active:scale-95"
                                data-gtm="main-menu-close"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                    </div>

                    {/* 메뉴 항목들 */}
                    <div className="p-6 space-y-4">
                        {/* 내 감정 조각 보기 */}
                        <button
                            onClick={() => {
                                onEmotionShardsClick();
                                onClose();
                            }}
                            className="w-full group"
                            data-gtm="main-menu-emotion-shards"
                        >
                            <div className="bg-white hover:bg-pink-50 rounded-2xl p-6 shadow-md border-2 border-pink-100 hover:border-pink-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                <div className="flex items-center gap-4">
                                    {/* 아이콘 */}
                                    <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <FaHeart className="text-white text-2xl" />
                                    </div>
                                    {/* 텍스트 */}
                                    <div className="flex-1 text-left">
                                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                                            내 감정 조각 보기
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            수집한 감정 조각을 확인하세요
                                        </p>
                                    </div>
                                    {/* 화살표 */}
                                    <div className="text-pink-400 group-hover:translate-x-1 transition-transform">
                                        →
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* 상점(Store) */}
                        <button
                            onClick={() => {
                                onStoreClick();
                                onClose();
                            }}
                            className="w-full group"
                            data-gtm="main-menu-store"
                        >
                            <div className="bg-white hover:bg-purple-50 rounded-2xl p-6 shadow-md border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                <div className="flex items-center gap-4">
                                    {/* 아이콘 */}
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <FaStore className="text-white text-2xl" />
                                    </div>
                                    {/* 텍스트 */}
                                    <div className="flex-1 text-left">
                                        <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                                            상점
                                            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-semibold">
                                                NEW
                                            </span>
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            아이템과 꾸미기 요소를 구경하세요
                                        </p>
                                    </div>
                                    {/* 화살표 */}
                                    <div className="text-purple-400 group-hover:translate-x-1 transition-transform">
                                        →
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* 푸터 */}
                    <div className="px-6 pb-6">
                        <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-4 text-center">
                            <p className="text-xs text-gray-600">
                                💝 몽글이와 함께하는 감정 여행
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }

                .animate-scale-in {
                    animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
            `}</style>
        </>
    );
};

export default MainMenu;
