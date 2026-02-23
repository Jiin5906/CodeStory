import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaShoppingBag } from 'react-icons/fa';
import MongleIcon from '../common/MongleIcons';

const ShopPage = () => {
    const navigate = useNavigate();

    return (
        <div
            className="flex-1 min-h-screen px-6 sm:px-12 py-10 overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-color)' }}
            data-gtm="view-shop-page"
        >
            {/* Back Button */}
            <button
                onClick={() => navigate('/dashboard')}
                className="mb-8 flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm transition-all"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-color)',
                    border: '1px solid var(--border-color)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-color)';
                    e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                    e.currentTarget.style.color = 'var(--text-color)';
                }}
                data-gtm="shop-back-button"
            >
                <FaArrowLeft />
                <span className="font-medium">돌아가기</span>
            </button>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto">
                <section
                    className="rounded-[2.5rem] p-12 shadow-sm text-center"
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)'
                    }}
                    data-gtm="shop-main-content"
                >
                    <div className="flex justify-center mb-6">
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(124, 113, 245, 0.1)' }}
                        >
                            <FaShoppingBag className="text-5xl text-[#7C71F5]" />
                        </div>
                    </div>

                    <h1
                        className="text-4xl font-bold mb-4"
                        style={{ color: 'var(--text-color)' }}
                    >
                        상점 준비 중
                    </h1>

                    <p
                        className="text-lg leading-relaxed mb-6"
                        style={{ color: 'var(--sub-text-color)' }}
                    >
                        곧 멋진 아이템들을 만나보실 수 있어요!
                        <br />
                        조금만 기다려주세요 <MongleIcon name="sparkle" size={16} className="ml-1" />
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center mt-10">
                        <div
                            className="px-6 py-3 rounded-2xl"
                            style={{
                                backgroundColor: 'rgba(124, 113, 245, 0.05)',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <span
                                className="text-sm font-medium"
                                style={{ color: 'var(--sub-text-color)' }}
                            >
                                <span className="flex items-center gap-1"><MongleIcon name="palette" size={14} /> 테마 꾸미기</span>
                            </span>
                        </div>
                        <div
                            className="px-6 py-3 rounded-2xl"
                            style={{
                                backgroundColor: 'rgba(124, 113, 245, 0.05)',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <span
                                className="text-sm font-medium"
                                style={{ color: 'var(--sub-text-color)' }}
                            >
                                <span className="flex items-center gap-1"><MongleIcon name="flower" size={14} /> 캐릭터 스킨</span>
                            </span>
                        </div>
                        <div
                            className="px-6 py-3 rounded-2xl"
                            style={{
                                backgroundColor: 'rgba(124, 113, 245, 0.05)',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <span
                                className="text-sm font-medium"
                                style={{ color: 'var(--sub-text-color)' }}
                            >
                                <span className="flex items-center gap-1"><MongleIcon name="pencil" size={14} /> 스티커팩</span>
                            </span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ShopPage;
