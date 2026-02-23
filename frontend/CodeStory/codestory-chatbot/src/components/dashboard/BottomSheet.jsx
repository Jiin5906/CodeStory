import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaHandSparkles, FaUtensils, FaMoon, FaStore } from 'react-icons/fa';
import { usePet } from '../../context/PetContext';
import { useStore } from '../../context/StoreContext';
import MongleIcon from '../common/MongleIcons';

/**
 * BottomSheet — 간소화된 2단계 시스템 (3단계 EXPANDED 제거)
 *
 * 스냅포인트:
 * 1. COLLAPSED (최소): 채팅 입력창만 (버튼 숨김)
 * 2. HALF (중간): 채팅 입력창 + 액션 버튼 (쓰다듬기, 식사, 잠자기)
 *
 * 변경사항:
 * - EXPANDED 상태 완전 삭제
 * - 홈 버튼 제거 (하단 탭바의 '홈' 탭이 대신함)
 * - 그리드 메뉴, 일기 리스트, 스트릭 카드 제거
 */


// 스냅포인트 높이 (캐릭터 가림 방지 + 슬림화)
const SNAP_POINTS = {
    COLLAPSED: 68,   // 채팅만 (슬림화)
    HALF: 120        // 채팅 + 버튼 (화면의 ~30% 이내)
};

// 액션 버튼 컴포넌트 (퍼센트 상시 표시)
// eslint-disable-next-line no-unused-vars
const ActionButton = ({ icon: Icon, value, onClick, isHome = false, accentColor, primaryColor, buttonColor, gtm }) => {
    const gaugeHeight = Math.min(100, Math.max(0, value));

    const getIconColor = () => {
        if (isHome) return 'text-white';
        if (value < 20) return 'text-red-400';
        if (value >= 50) return 'text-white';
        return 'text-gray-600';
    };

    const getIconAnimation = () => {
        if (value < 20) return 'animate-pulse';
        return '';
    };

    const handleClick = (e) => {
        e.stopPropagation();
        onClick?.();
    };

    return (
        <button
            onClick={handleClick}
            className={`w-12 h-12 rounded-xl relative overflow-hidden shadow-md active:scale-95 transition-all duration-200 ${isHome
                    ? 'hover:shadow-lg'
                    : 'bg-white hover:shadow-lg'
                } border border-white`}
            style={isHome ? { background: `linear-gradient(to bottom right, ${accentColor}, ${buttonColor})` } : undefined}
            data-gtm={gtm}
        >
            {/* 게이지 배경 */}
            {!isHome && (
                <div
                    className="absolute bottom-0 left-0 w-full transition-all duration-500 ease-out rounded-b-xl"
                    style={{
                        height: `${gaugeHeight}%`,
                        opacity: value < 20 ? 1 : 0.85,
                        background: `linear-gradient(to top, ${accentColor}, ${primaryColor})`
                    }}
                />
            )}

            {/* 아이콘 */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <Icon
                    className={`text-lg transition-all duration-300 ${getIconColor()} ${getIconAnimation()} drop-shadow-sm`}
                />
            </div>

            {/* 퍼센트 상시 표시 */}
            {!isHome && (
                <div className="absolute bottom-0.5 left-0 right-0 z-20 text-center">
                    <span className="text-[10px] font-bold text-white drop-shadow-md">
                        {Math.round(value)}%
                    </span>
                </div>
            )}

        </button>
    );
};

const BottomSheet = ({
    onWrite,
    onSleepClick,
    onStoreClick,
    onSnapChange,
}) => {
    const [snapPoint, setSnapPoint] = useState('COLLAPSED'); // COLLAPSED, HALF만 사용
    const [dragStartY, setDragStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [input, setInput] = useState('');

    const sheetRef = useRef(null);
    const { affectionGauge, hungerGauge, sleepGauge, isSleeping, showSleepToast, feedEmotion } = usePet();
    const { equippedItems, getEquippedItem } = useStore();
    const theme = useMemo(() => getEquippedItem('theme'), [equippedItems, getEquippedItem]);

    const accentColor = theme?.accentColor || '#FFB5C2';
    const primaryColor = theme?.decorationColors?.primary || '#FFD4DC';
    const buttonColor = theme?.buttonColor || '#FF9AAB';
    const bgFrom = theme?.bgFrom || '#FFF8F3';

    // 스냅포인트 높이 계산 (EXPANDED 제거)
    const getHeight = () => {
        if (snapPoint === 'HALF') {
            return `${SNAP_POINTS.HALF}px`;
        } else {
            return `${SNAP_POINTS.COLLAPSED}px`;
        }
    };

    // 드래그 시작
    const handleDragStart = (clientY) => {
        setIsDragging(true);
        setDragStartY(clientY);
        setCurrentY(0);
    };

    // 드래그 중
    const handleDragMove = (clientY) => {
        if (!isDragging) return;

        const deltaY = clientY - dragStartY;
        setCurrentY(deltaY);
    };

    // 드래그 끝
    const handleDragEnd = () => {
        if (!isDragging) return;

        setIsDragging(false);

        // velocity와 위치 기반으로 다음 스냅포인트 결정
        const threshold = 50; // 최소 이동 거리

        if (snapPoint === 'COLLAPSED') {
            if (currentY < -threshold) {
                setSnapPoint('HALF');
            }
        } else if (snapPoint === 'HALF') {
            if (currentY > threshold) {
                setSnapPoint('COLLAPSED');
            }
        }

        setCurrentY(0);
    };

    // 터치 이벤트
    const handleTouchStart = (e) => {
        handleDragStart(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
        // 바텀시트 영역에서만 기본 동작 방지
        if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
            handleDragMove(e.touches[0].clientY);
        }
    };

    const handleTouchEnd = () => {
        handleDragEnd();
    };

    // 마우스 이벤트 (데스크톱용)
    const handleMouseDown = (e) => {
        handleDragStart(e.clientY);
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            handleDragMove(e.clientY);
        }
    };

    const handleMouseUp = () => {
        handleDragEnd();
    };

    // 마우스 이벤트 리스너
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragStartY]);

    // 핸들바 클릭으로 토글
    const handleHandleClick = () => {
        if (snapPoint === 'COLLAPSED') {
            setSnapPoint('HALF');
        } else {
            setSnapPoint('COLLAPSED');
        }
    };

    // snapPoint 변경 시 부모에게 알림 (투어 연동용)
    useEffect(() => {
        onSnapChange?.(snapPoint);
    }, [snapPoint, onSnapChange]);

    const handleSubmit = () => {
        if (!input.trim()) return;
        onWrite(input);
        setInput('');
    };

    // 드래그 중 transform 계산 (개선된 경계 처리)
    const getTransform = () => {
        if (isDragging && currentY !== 0) {
            // 경계 저항 강화 (0.3으로 낮춤)
            const resistance = 0.3;

            // COLLAPSED 상태에서 아래로 드래그 시 저항
            if (snapPoint === 'COLLAPSED' && currentY > 0) {
                return `translateY(${Math.min(currentY * resistance, 30)}px)`;
            }
            // EXPANDED 상태에서 위로 드래그 시 저항
            else if (snapPoint === 'EXPANDED' && currentY < 0) {
                return `translateY(${Math.max(currentY * resistance, -30)}px)`;
            }
            // 정상 범위 내 드래그
            return `translateY(${Math.max(-200, Math.min(200, currentY))}px)`;
        }
        return 'translateY(0)';
    };

    return (
        <div
            ref={sheetRef}
            className="absolute w-full z-[50] backdrop-blur-xl rounded-t-3xl flex flex-col"
            style={{
                bottom: '4.1rem',
                height: getHeight(),
                transform: getTransform(),
                transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                background: `linear-gradient(to bottom, rgba(255,255,255,0.95), ${bgFrom}f2)`,
                borderTop: `1px solid ${primaryColor}4D`,
                boxShadow: `0 -4px 16px ${accentColor}1A`
            }}
            data-gtm="bottomsheet-container"
        >
            <div
                className="absolute top-0 left-0 right-0 h-[200vh] backdrop-blur-xl -z-10 rounded-t-3xl"
                style={{
                    background: `linear-gradient(to bottom, rgba(255,255,255,0.95), ${bgFrom}f2)`,
                    borderTop: `1px solid ${primaryColor}4D`
                }}
            />
            {/* 핸들바 영역 (드래그 가능) - 슬림화 */}
            <div
                className="pt-1.5 pb-0.5 px-4 cursor-grab active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                style={{ touchAction: 'none' }}
            >
                {/* 핸들바 */}
                <div
                    className="w-10 h-1 rounded-full mx-auto mb-1 cursor-pointer transition-colors"
                    style={{ backgroundColor: `${accentColor}66` }}
                    onClick={handleHandleClick}
                    data-gtm="bottomsheet-drag-handle"
                ></div>
            </div>

            {/* 채팅 입력창 - 슬림화 (공간 최적화) */}
            <div className="px-4 pb-2" onClick={(e) => e.stopPropagation()}>
                <div
                    className="relative flex items-center rounded-2xl shadow-md group transition-all duration-300"
                    style={{
                        background: `linear-gradient(to right, ${bgFrom}, white)`,
                        border: `1px solid ${primaryColor}66`,
                    }}
                    data-gtm="chat-input-area"
                >
                    <div className="pl-2.5 pr-1 opacity-70"><MongleIcon name="pencil" size={16} color="#9CA3AF" /></div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="오늘의 마음을 들려주세요..."
                        className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400 h-9 text-sm leading-tight"
                        data-gtm="chat-input-field"
                    />
                    <button
                        onClick={handleSubmit}
                        className="m-1 w-8 h-8 bg-gradient-to-br from-[#D4A5F5] to-[#B87FE0] rounded-full text-white shadow-md active:scale-95 hover:shadow-lg transition-all duration-200 flex items-center justify-center font-bold text-sm"
                        data-gtm="chat-submit-button"
                    >
                        ↑
                    </button>
                </div>
            </div>

            {/* 액션 버튼 그룹 - HALF에서만 표시 */}
            {snapPoint === 'HALF' && (
                <div className="px-4 pb-2 animate-fade-in-up">
                    <div className="flex justify-around items-center gap-2" data-gtm="action-buttons">
                        <ActionButton
                            icon={FaHandSparkles}
                            value={affectionGauge}
                            onClick={() => {
                                if (isSleeping) { showSleepToast(); return; }
                            }}
                            accentColor={accentColor}
                            primaryColor={primaryColor}
                            buttonColor={buttonColor}
                        />
                        <ActionButton
                            icon={FaUtensils}
                            value={hungerGauge}
                            onClick={() => {
                                if (isSleeping) { showSleepToast(); return; }
                                feedEmotion('hunger', 25);
                            }}
                            accentColor={accentColor}
                            primaryColor={primaryColor}
                            buttonColor={buttonColor}
                            gtm="action-btn-hunger"
                        />
                        <ActionButton
                            icon={FaMoon}
                            value={sleepGauge}
                            onClick={onSleepClick}
                            accentColor={accentColor}
                            primaryColor={primaryColor}
                            buttonColor={buttonColor}
                        />
                        <ActionButton
                            icon={FaStore}
                            value={100}
                            onClick={onStoreClick}
                            isHome={true}
                            accentColor={accentColor}
                            primaryColor={primaryColor}
                            buttonColor={buttonColor}
                        />
                    </div>
                </div>
            )}

            {/* CSS 애니메이션 */}
            <style jsx>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out;
                }

                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }

                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default BottomSheet;
