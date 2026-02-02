import React, { useState, useRef, useEffect } from 'react';
import { usePet } from '../../context/PetContext';

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


// 스냅포인트 높이 (최적화 - 캐릭터 공간 확보)
const SNAP_POINTS = {
    COLLAPSED: 80,   // 채팅만 (버튼 숨김) - 축소
    HALF: 150        // 채팅 + 버튼 - 축소
};

// 액션 버튼 컴포넌트
const ActionButton = ({ icon, label, value, onClick, isHome = false }) => {
    const [showPercent, setShowPercent] = useState(false);
    const [labelText, setLabelText] = useState(label);

    const gaugeHeight = Math.min(100, Math.max(0, value));

    const getIconColor = () => {
        if (value < 20) return 'text-red-400';
        if (value >= 50) return 'text-white';
        return 'text-gray-400';
    };

    const getIconAnimation = () => {
        if (value < 20) return 'animate-pulse';
        return '';
    };

    const handleClick = (e) => {
        e.stopPropagation();

        if (!isHome && value < 100) {
            setShowPercent(true);
            setLabelText(`${Math.round(value)}%`);
            setTimeout(() => {
                setShowPercent(false);
                setLabelText(label);
            }, 1500);
        }

        onClick?.();
    };

    return (
        <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={handleClick}>
            <button
                className={`w-12 h-12 rounded-xl relative overflow-hidden shadow-md active:scale-95 transition-all duration-200 ${
                    isHome
                        ? 'bg-gradient-to-br from-[#FFB5C2] to-[#FF9AAB] hover:shadow-lg'
                        : 'bg-white hover:shadow-lg'
                } border border-white`}
            >
                {/* 게이지 배경 */}
                {!isHome && (
                    <div
                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#FFB5C2] to-[#FFD4DC] transition-all duration-500 ease-out rounded-b-[14px]"
                        style={{
                            height: `${gaugeHeight}%`,
                            opacity: value < 20 ? 1 : 0.85
                        }}
                    />
                )}

                {/* 아이콘 */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <span
                        className={`text-xl transition-all duration-300 ${
                            isHome ? 'text-white drop-shadow-sm' : getIconColor()
                        } ${getIconAnimation()}`}
                    >
                        {icon}
                    </span>
                </div>
            </button>

            {/* 라벨 */}
            <span
                className={`text-[9px] font-semibold transition-all duration-300 ${
                    showPercent ? 'text-[#FFB5C2] scale-110' : 'text-gray-500'
                }`}
            >
                {labelText}
            </span>
        </div>
    );
};

const BottomSheet = ({
    onWrite,
    onVentilateClick
}) => {
    const [snapPoint, setSnapPoint] = useState('COLLAPSED'); // COLLAPSED, HALF만 사용
    const [dragStartY, setDragStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [input, setInput] = useState('');

    const sheetRef = useRef(null);
    const { affectionGauge, hungerGauge, sleepGauge } = usePet();

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
            className="absolute w-full z-50 bg-gradient-to-b from-white/95 to-[#FFF8F3]/95 backdrop-blur-xl border-t border-[#FFD4DC]/30 rounded-t-3xl shadow-[0_-4px_16px_rgba(255,181,194,0.1)] flex flex-col"
            style={{
                bottom: '3.5rem', // 탭바 높이(56px = 3.5rem) 위에 배치
                height: getHeight(),
                transform: getTransform(),
                transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            data-gtm="bottomsheet-container"
        >
            {/* 핸들바 영역 (드래그 가능) */}
            <div
                className="pt-2 pb-1 px-4 cursor-grab active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                style={{ touchAction: 'none' }}
            >
                {/* 핸들바 */}
                <div
                    className="w-10 h-1 bg-[#FFB5C2]/40 rounded-full mx-auto mb-2 cursor-pointer hover:bg-[#FFB5C2]/60 transition-colors"
                    onClick={handleHandleClick}
                ></div>
            </div>

            {/* 채팅 입력창 - 항상 표시 */}
            <div className="px-4 pb-3" onClick={(e) => e.stopPropagation()}>
                <div
                    className="relative flex items-center bg-gradient-to-r from-[#FFF8F3] to-white rounded-2xl border border-[#FFD4DC]/40 shadow-md group focus-within:border-[#FFB5C2] focus-within:shadow-lg transition-all duration-300"
                    data-gtm="chat-input-area"
                >
                    <div className="pl-3 pr-1 text-lg opacity-70">✏️</div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="오늘의 마음을 들려주세요..."
                        className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400 h-10 text-sm leading-relaxed"
                        data-gtm="chat-input-field"
                    />
                    <button
                        onClick={handleSubmit}
                        className="m-1.5 w-9 h-9 bg-gradient-to-br from-[#D4A5F5] to-[#B87FE0] rounded-full text-white shadow-md active:scale-95 hover:shadow-lg transition-all duration-200 flex items-center justify-center font-bold text-base"
                        data-gtm="chat-submit-button"
                    >
                        ↑
                    </button>
                </div>
            </div>

            {/* 액션 버튼 그룹 - HALF에서만 표시 (홈 버튼 제거) */}
            {snapPoint === 'HALF' && (
                <div className="px-4 pb-3 animate-fade-in-up">
                    <div className="flex justify-around items-end gap-1" data-gtm="action-buttons">
                        <ActionButton
                            icon="🤚"
                            label="쓰다듬기"
                            value={affectionGauge}
                            onClick={() => {}}
                        />
                        <ActionButton
                            icon="🍽️"
                            label="식사"
                            value={hungerGauge}
                            onClick={() => {}}
                        />
                        <ActionButton
                            icon="🌙"
                            label="잠자기"
                            value={sleepGauge}
                            onClick={onVentilateClick}
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
