import React, { useState, useMemo, useEffect, useRef } from 'react';
import { startOfDay, parseISO } from 'date-fns';
import MainRoom from './MainRoom';
import BottomSheet from './BottomSheet';
import BottomTabBar from './BottomTabBar';
import CalendarView from '../calendar/CalendarView';
import ReportView from './ReportView';
import SettingsView from './SettingsView';
import MindRecord from '../../change/MindRecord';
import CircularProgressNew from './CircularProgressNew';
import MoodLight from './MoodLight';
import MainMenu from './MainMenu';
import StoreView from './StoreView';
import LevelUpModal from '../common/LevelUpModal';
import MongleIcon, { SmartEmoji } from '../common/MongleIcons';
import { chatApi } from '../../services/api';
import { usePet } from '../../context/PetContext';
import { useStore } from '../../context/StoreContext';

const MobileDashboard = ({ user, diaries, onWriteClick, onCalendarClick, onStatsClick, onSettingsClick }) => {
    const [latestLog, setLatestLog] = useState(null);
    const [aiResponse, setAiResponse] = useState(null);
    const [emotion, setEmotion] = useState(null);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [isMindRecordOpen, setIsMindRecordOpen] = useState(false);
    const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
    const [isStoreViewOpen, setIsStoreViewOpen] = useState(false);

    // 탭바 상태 (home, diary, report, settings)
    const [activeTab, setActiveTab] = useState('home');

    // 인터랙티브 효과를 위한 상태
    const [isWindowOpen, setIsWindowOpen] = useState(false);

    // 창문 관련 확장 상태
    const [windowColdAnimation, setWindowColdAnimation] = useState(false);
    const [windowClosedAnimation, setWindowClosedAnimation] = useState(false);

    const coldTimerRef = useRef(null);

    const { petStatus, emotionShards, handleCollectShard, spawnEmotionShard, moodLightOn, coins, coinToast, showLevelUpModal, levelUpInfo, triggerLevelUpModal, closeLevelUpModal } = usePet();
    // TODO: 로티 진화 구현 후 true로 변경 — 레벨/EXP UI 임시 숨김
    const SHOW_LEVEL_UP_UI = false;
    const { getEquippedItem } = useStore();

    // 장착된 아이템 가져오기 (equippedItems 변경 시 자동 재계산)
    const equippedTheme = useMemo(() => {
        const theme = getEquippedItem('theme');
        console.log('🎨 [MobileDashboard] 장착된 테마:', theme);
        return theme;
    }, [getEquippedItem]);
    const equippedShelf = useMemo(() => getEquippedItem('shelf'), [getEquippedItem]);
    const equippedPot = useMemo(() => getEquippedItem('pot'), [getEquippedItem]);
    const equippedCushion = useMemo(() => getEquippedItem('cushion'), [getEquippedItem]);

    // 🪴 화분 렌더링 — ToDoUpgrade.txt 기준 통합 SVG
    const renderPot = () => {
        if (!equippedPot) return null;
        const potId = equippedPot?.id;
        const svgStyle = { width: '13vw', height: '17.4vw', display: 'block', overflow: 'visible' };

        if (potId === 'pot_cactus') return (
            <div className="absolute bottom-[26%] right-[4%] z-20 pointer-events-none" style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))' }}>
                <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" style={svgStyle}>
                    <ellipse cx="60" cy="150" rx="22" ry="4" fill="rgba(0,0,0,0.14)"/>
                    <path d="M 33 108 L 39 145 Q 60 153 81 145 L 87 108 Z" fill="#CF6A38"/>
                    <path d="M 33 108 L 39 145 L 43 144 L 37 108 Z" fill="#E07848" opacity="0.7"/>
                    <g className="animate-pot-breathe" transform="translate(0, 8)">
                        <ellipse cx="32" cy="65" rx="14" ry="22" fill="#43A047" transform="rotate(-20 32 65)"/>
                        <ellipse cx="88" cy="60" rx="12" ry="18" fill="#43A047" transform="rotate(25 88 60)"/>
                        <ellipse cx="60" cy="65" rx="22" ry="40" fill="#43A047"/>
                        <ellipse cx="43" cy="68" rx="8" ry="10" fill="#43A047" transform="rotate(-20 43 68)"/>
                        <ellipse cx="77" cy="64" rx="7" ry="9" fill="#43A047" transform="rotate(25 77 64)"/>
                        <ellipse cx="55" cy="50" rx="7" ry="14" fill="#66BB6A" opacity="0.5"/>
                        <ellipse cx="28" cy="60" rx="4" ry="8" fill="#66BB6A" opacity="0.4" transform="rotate(-20 28 60)"/>
                        <ellipse cx="84" cy="56" rx="3.5" ry="7" fill="#66BB6A" opacity="0.4" transform="rotate(25 84 56)"/>
                        <circle cx="60" cy="40" r="2" fill="white" opacity="0.6"/>
                        <circle cx="50" cy="55" r="2" fill="white" opacity="0.6"/>
                        <circle cx="70" cy="65" r="2" fill="white" opacity="0.6"/>
                        <circle cx="60" cy="80" r="2" fill="white" opacity="0.6"/>
                        <circle cx="30" cy="57" r="1.5" fill="white" opacity="0.5"/>
                        <circle cx="85" cy="55" r="1.5" fill="white" opacity="0.5"/>
                        <circle cx="55" cy="22" r="5" fill="#F06292"/>
                        <circle cx="65" cy="22" r="5" fill="#F06292"/>
                        <circle cx="60" cy="17" r="5" fill="#F06292"/>
                        <circle cx="60" cy="25" r="8" fill="#E91E63"/>
                        <circle cx="60" cy="25" r="3" fill="#FFF176"/>
                    </g>
                    <ellipse cx="60" cy="108" rx="27" ry="6" fill="#A04820"/>
                    <ellipse cx="60" cy="106" rx="27" ry="6" fill="#B85530"/>
                    <ellipse cx="60" cy="106" rx="23" ry="4.5" fill="#4E342E"/>
                    <ellipse cx="56" cy="104" rx="7" ry="2" fill="#6D4C41" opacity="0.6"/>
                </svg>
            </div>
        );

        if (potId === 'pot_monstera') return (
            <div className="absolute bottom-[26%] right-[4%] z-20 pointer-events-none" style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))' }}>
                <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" style={svgStyle}>
                    <defs>
                        <linearGradient id="md-leaf-dark" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#00897B"/>
                            <stop offset="100%" stopColor="#004D40"/>
                        </linearGradient>
                        <linearGradient id="md-leaf-mid" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#26A69A"/>
                            <stop offset="100%" stopColor="#00796B"/>
                        </linearGradient>
                        <linearGradient id="md-leaf-light" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#4DB6AC"/>
                            <stop offset="100%" stopColor="#00897B"/>
                        </linearGradient>
                    </defs>
                    <ellipse cx="60" cy="150" rx="22" ry="4" fill="rgba(0,0,0,0.14)"/>
                    <path d="M 33 108 L 39 145 Q 60 153 81 145 L 87 108 Z" fill="#B8956A"/>
                    <path d="M 33 108 L 39 145 L 43 144 L 37 108 Z" fill="#CDAA80" opacity="0.7"/>
                    <g className="animate-pot-breathe" transform="translate(0, 8)">
                        <path d="M 30 95 Q 60 30 90 95 Z" fill="url(#md-leaf-dark)"/>
                        <ellipse cx="60" cy="40" rx="16" ry="34" fill="url(#md-leaf-dark)"/>
                        <ellipse cx="35" cy="55" rx="14" ry="30" fill="url(#md-leaf-dark)" transform="rotate(-30 35 55)"/>
                        <ellipse cx="85" cy="55" rx="14" ry="30" fill="url(#md-leaf-dark)" transform="rotate(30 85 55)"/>
                        <ellipse cx="20" cy="75" rx="12" ry="24" fill="url(#md-leaf-dark)" transform="rotate(-55 20 75)"/>
                        <ellipse cx="100" cy="75" rx="12" ry="24" fill="url(#md-leaf-dark)" transform="rotate(55 100 75)"/>
                        <ellipse cx="45" cy="55" rx="16" ry="32" fill="url(#md-leaf-mid)" transform="rotate(-15 45 55)"/>
                        <ellipse cx="75" cy="55" rx="16" ry="32" fill="url(#md-leaf-mid)" transform="rotate(15 75 55)"/>
                        <ellipse cx="60" cy="65" rx="18" ry="34" fill="url(#md-leaf-light)"/>
                        <ellipse cx="35" cy="80" rx="14" ry="24" fill="url(#md-leaf-light)" transform="rotate(-40 35 80)"/>
                        <ellipse cx="85" cy="80" rx="14" ry="24" fill="url(#md-leaf-light)" transform="rotate(40 85 80)"/>
                        <path d="M60,35 Q60,65 60,95" stroke="rgba(255,255,255,0.45)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <path d="M45,30 Q50,65 55,95" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                        <path d="M75,30 Q70,65 65,95" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                    </g>
                    <ellipse cx="60" cy="108" rx="27" ry="6" fill="#8D6340"/>
                    <ellipse cx="60" cy="106" rx="27" ry="6" fill="#A07048"/>
                    <ellipse cx="60" cy="106" rx="23" ry="4.5" fill="#4E342E"/>
                    <ellipse cx="56" cy="104" rx="7" ry="2" fill="#6D4C41" opacity="0.6"/>
                </svg>
            </div>
        );

        if (potId === 'pot_flower') return (
            <div className="absolute bottom-[26%] right-[4%] z-20 pointer-events-none" style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))' }}>
                <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" style={svgStyle}>
                    <ellipse cx="60" cy="150" rx="22" ry="4" fill="rgba(0,0,0,0.14)"/>
                    <path d="M 33 108 L 39 145 Q 60 153 81 145 L 87 108 Z" fill="#E8789A"/>
                    <path d="M 33 108 L 39 145 L 43 144 L 37 108 Z" fill="#F29AB4" opacity="0.7"/>
                    <g className="animate-pot-sway">
                        <path d="M 50 88 Q 30 73 35 63 Q 45 78 50 88" fill="#7CB342"/>
                        <path d="M 70 88 Q 90 73 85 63 Q 75 78 70 88" fill="#7CB342"/>
                        <path d="M 60 112 Q 40 68 30 40" fill="none" stroke="#558B2F" strokeWidth="3" strokeLinecap="round"/>
                        <path d="M 60 112 L 60 30" fill="none" stroke="#558B2F" strokeWidth="4" strokeLinecap="round"/>
                        <path d="M 60 112 Q 80 68 90 45" fill="none" stroke="#558B2F" strokeWidth="3" strokeLinecap="round"/>
                        <circle cx="30" cy="40" r="14" fill="#FFF176"/>
                        <circle cx="23" cy="35" r="8" fill="#FFEE58"/>
                        <circle cx="37" cy="35" r="8" fill="#FFEE58"/>
                        <circle cx="30" cy="28" r="8" fill="#FFEE58"/>
                        <circle cx="30" cy="38" r="6" fill="#FDD835"/>
                        <circle cx="30" cy="38" r="3" fill="#F57F17"/>
                        <circle cx="60" cy="30" r="16" fill="#F48FB1"/>
                        <circle cx="51" cy="23" r="9" fill="#E91E63"/>
                        <circle cx="69" cy="23" r="9" fill="#E91E63"/>
                        <circle cx="60" cy="15" r="9" fill="#E91E63"/>
                        <circle cx="60" cy="28" r="7" fill="#C2185B"/>
                        <circle cx="60" cy="28" r="3.5" fill="#FFF176"/>
                        <circle cx="90" cy="45" r="12" fill="#CE93D8"/>
                        <circle cx="84" cy="39" r="7" fill="#AB47BC"/>
                        <circle cx="96" cy="39" r="7" fill="#AB47BC"/>
                        <circle cx="90" cy="33" r="7" fill="#AB47BC"/>
                        <circle cx="90" cy="43" r="5" fill="#7B1FA2"/>
                        <circle cx="90" cy="43" r="2.5" fill="#FFF176"/>
                    </g>
                    <ellipse cx="60" cy="108" rx="27" ry="6" fill="#AD1457"/>
                    <ellipse cx="60" cy="106" rx="27" ry="6" fill="#C2185B"/>
                    <ellipse cx="60" cy="106" rx="23" ry="4.5" fill="#4E342E"/>
                    <ellipse cx="56" cy="104" rx="7" ry="2" fill="#6D4C41" opacity="0.6"/>
                </svg>
            </div>
        );

        if (potId === 'pot_lavender') return (
            <div className="absolute bottom-[26%] right-[4%] z-20 pointer-events-none" style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))' }}>
                <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" style={svgStyle}>
                    <ellipse cx="60" cy="150" rx="22" ry="4" fill="rgba(0,0,0,0.14)"/>
                    <path d="M 33 108 L 39 145 Q 60 153 81 145 L 87 108 Z" fill="#9C6DC8"/>
                    <path d="M 33 108 L 39 145 L 43 144 L 37 108 Z" fill="#B490DC" opacity="0.7"/>
                    <g className="animate-pot-sway">
                        <path d="M 60 112 Q 30 73 25 30" fill="none" stroke="#558B2F" strokeWidth="2.5" strokeLinecap="round"/>
                        <path d="M 60 112 Q 45 68 40 20" fill="none" stroke="#558B2F" strokeWidth="2.5" strokeLinecap="round"/>
                        <path d="M 60 112 L 60 15" fill="none" stroke="#558B2F" strokeWidth="3" strokeLinecap="round"/>
                        <path d="M 60 112 Q 75 68 80 20" fill="none" stroke="#558B2F" strokeWidth="2.5" strokeLinecap="round"/>
                        <path d="M 60 112 Q 90 73 95 30" fill="none" stroke="#558B2F" strokeWidth="2.5" strokeLinecap="round"/>
                        <circle cx="25" cy="45" r="5" fill="#CE93D8"/>
                        <circle cx="22" cy="38" r="5" fill="#AB47BC"/>
                        <circle cx="28" cy="34" r="4" fill="#8E24AA"/>
                        <circle cx="25" cy="28" r="4" fill="#6A1B9A"/>
                        <circle cx="40" cy="35" r="5" fill="#CE93D8"/>
                        <circle cx="37" cy="28" r="5" fill="#AB47BC"/>
                        <circle cx="43" cy="24" r="4" fill="#8E24AA"/>
                        <circle cx="40" cy="18" r="4" fill="#6A1B9A"/>
                        <circle cx="60" cy="30" r="5.5" fill="#CE93D8"/>
                        <circle cx="56" cy="22" r="5.5" fill="#AB47BC"/>
                        <circle cx="64" cy="18" r="4.5" fill="#8E24AA"/>
                        <circle cx="60" cy="12" r="4.5" fill="#6A1B9A"/>
                        <circle cx="80" cy="35" r="5" fill="#CE93D8"/>
                        <circle cx="83" cy="28" r="5" fill="#AB47BC"/>
                        <circle cx="77" cy="24" r="4" fill="#8E24AA"/>
                        <circle cx="80" cy="18" r="4" fill="#6A1B9A"/>
                        <circle cx="95" cy="45" r="5" fill="#CE93D8"/>
                        <circle cx="98" cy="38" r="5" fill="#AB47BC"/>
                        <circle cx="92" cy="34" r="4" fill="#8E24AA"/>
                        <circle cx="95" cy="28" r="4" fill="#6A1B9A"/>
                    </g>
                    <ellipse cx="60" cy="108" rx="27" ry="6" fill="#4A148C"/>
                    <ellipse cx="60" cy="106" rx="27" ry="6" fill="#6A1B9A"/>
                    <ellipse cx="60" cy="106" rx="23" ry="4.5" fill="#4E342E"/>
                    <ellipse cx="56" cy="104" rx="7" ry="2" fill="#6D4C41" opacity="0.6"/>
                </svg>
            </div>
        );

        if (potId === 'pot_rose') return (
            <div className="absolute bottom-[26%] right-[4%] z-20 pointer-events-none" style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))' }}>
                <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" style={svgStyle}>
                    <ellipse cx="60" cy="150" rx="22" ry="4" fill="rgba(0,0,0,0.14)"/>
                    <path d="M 33 108 L 39 145 Q 60 153 81 145 L 87 108 Z" fill="#E9909A"/>
                    <path d="M 33 108 L 39 145 L 43 144 L 37 108 Z" fill="#F4B0B8" opacity="0.7"/>
                    <g className="animate-pot-breathe" transform="translate(0, 8)">
                        <ellipse cx="60" cy="70" rx="42" ry="32" fill="#43A047"/>
                        <ellipse cx="40" cy="75" rx="22" ry="16" fill="#2E7D32" transform="rotate(-25 40 75)"/>
                        <ellipse cx="80" cy="75" rx="22" ry="16" fill="#2E7D32" transform="rotate(25 80 75)"/>
                        <g transform="translate(35, 50)">
                            <circle r="13" fill="#F48FB1"/>
                            <circle r="10" fill="#E91E63"/>
                            <circle r="7" fill="#C2185B"/>
                            <path d="M -3 -1 C -1 -4, 3 -3, 4 0 C 5 4, 1 6, -2 5 C -6 3, -6 -2, -3 -5 C 2 -8, 7 -5, 6 1" fill="none" stroke="#FF80AB" strokeWidth="1.5" strokeLinecap="round"/>
                        </g>
                        <g transform="translate(60, 65)">
                            <circle r="17" fill="#F48FB1"/>
                            <circle r="13" fill="#E91E63"/>
                            <circle r="9" fill="#C2185B"/>
                            <circle r="5" fill="#AD1457"/>
                            <circle r="2" fill="#FCE4EC"/>
                            <path d="M -4 -2 C -2 -6, 4 -5, 6 -1 C 7 5, 1 8, -3 6 C -8 4, -8 -3, -4 -7 C 3 -11, 10 -7, 8 2 C 6 10, -5 10, -8 3" fill="none" stroke="#FF4081" strokeWidth="2" strokeLinecap="round"/>
                        </g>
                        <g transform="translate(85, 55)">
                            <circle r="15" fill="#F48FB1"/>
                            <circle r="11" fill="#E91E63"/>
                            <circle r="8" fill="#C2185B"/>
                            <path d="M -3 -1 C -1 -5, 4 -4, 5 0 C 6 5, 1 7, -3 5 C -7 3, -7 -3, -3 -6 C 2 -10, 8 -6, 7 0" fill="none" stroke="#FF80AB" strokeWidth="1.8" strokeLinecap="round"/>
                        </g>
                    </g>
                    <ellipse cx="60" cy="108" rx="27" ry="6" fill="#880E4F"/>
                    <ellipse cx="60" cy="106" rx="27" ry="6" fill="#AD1457"/>
                    <ellipse cx="60" cy="106" rx="23" ry="4.5" fill="#4E342E"/>
                    <ellipse cx="56" cy="104" rx="7" ry="2" fill="#6D4C41" opacity="0.6"/>
                </svg>
            </div>
        );

        return null;
    };

    const today = startOfDay(new Date());

    // 실시간 낮/밤 판별 (06:00 ~ 17:59: 낮, 18:00 ~ 05:59: 밤)
    const currentHour = new Date().getHours();
    const isNightTime = currentHour >= 18 || currentHour < 6;

    // 스트릭(연속 작성일) 계산 로직
    // 감정별 색상 매핑 (11가지 + 백엔드 호환 별칭)
    const getEmotionColor = (emotion) => {
        const emotionMap = {
            // ━━━ 프론트엔드 표준 감정 (11가지) ━━━
            'anger': 'bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_15px_rgba(239,68,68,0.6)]',
            'happiness': 'bg-gradient-to-br from-pink-400 to-pink-600 shadow-[0_0_15px_rgba(236,72,153,0.6)]',
            'depression': 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_15px_rgba(59,130,246,0.6)]',
            'sadness': 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_15px_rgba(96,165,250,0.6)]',
            'anxiety': 'bg-gradient-to-br from-orange-500 to-orange-700 shadow-[0_0_15px_rgba(249,115,22,0.6)]',
            'fear': 'bg-gradient-to-br from-purple-600 to-purple-800 shadow-[0_0_15px_rgba(147,51,234,0.6)]',
            'surprise': 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-[0_0_15px_rgba(250,204,21,0.6)]',
            'love': 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-[0_0_15px_rgba(251,113,133,0.6)]',
            'calm': 'bg-gradient-to-br from-teal-400 to-teal-600 shadow-[0_0_15px_rgba(45,212,191,0.6)]',
            'neutral': 'bg-gradient-to-br from-gray-300 to-gray-500 shadow-[0_0_15px_rgba(156,163,175,0.6)]',
            'normal': 'bg-gradient-to-br from-white to-gray-200 shadow-[0_0_15px_rgba(229,231,235,0.6)]',

            // ━━━ 백엔드 호환 별칭 (안전장치) ━━━
            'happy': 'bg-gradient-to-br from-pink-400 to-pink-600 shadow-[0_0_15px_rgba(236,72,153,0.6)]',
            'sad': 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_15px_rgba(96,165,250,0.6)]',
            'angry': 'bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_15px_rgba(239,68,68,0.6)]',
            'anxious': 'bg-gradient-to-br from-orange-500 to-orange-700 shadow-[0_0_15px_rgba(249,115,22,0.6)]',
            'scared': 'bg-gradient-to-br from-purple-600 to-purple-800 shadow-[0_0_15px_rgba(147,51,234,0.6)]',
            'surprised': 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-[0_0_15px_rgba(250,204,21,0.6)]',
            'loving': 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-[0_0_15px_rgba(251,113,133,0.6)]',
            'peaceful': 'bg-gradient-to-br from-teal-400 to-teal-600 shadow-[0_0_15px_rgba(45,212,191,0.6)]',
            'depressed': 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_15px_rgba(59,130,246,0.6)]'
        };
        return emotionMap[emotion.toLowerCase()] || emotionMap['normal'];
    };

    const streakDays = useMemo(() => {
        if (!diaries || diaries.length === 0) return 0;

        const sortedDates = diaries
            .map(d => startOfDay(parseISO(d.date)))
            .sort((a, b) => b - a);

        if (sortedDates.length === 0) return 0;

        const latestDate = sortedDates[0];
        const daysDiff = Math.floor((today - latestDate) / (1000 * 60 * 60 * 24));

        if (daysDiff > 1) return 0;

        let streak = 1;
        let currentDate = latestDate;

        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = sortedDates[i];
            const diff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));

            if (diff === 1) {
                streak++;
                currentDate = prevDate;
            } else if (diff === 0) {
                continue;
            } else {
                break;
            }
        }
        return streak;
    }, [diaries, today]);

    // 창문 열기/닫기 핸들러
    const handleWindowClick = () => {
        if (!isWindowOpen) {
            // 열기
            setIsWindowOpen(true);
            setWindowColdAnimation(false);

            // 30초 미폐쇄 감지
            coldTimerRef.current = setTimeout(() => {
                setWindowColdAnimation(true);
            }, 30000);
        } else {
            // 닫기
            setIsWindowOpen(false);
            setWindowClosedAnimation(true);

            // 타이머 정리
            if (coldTimerRef.current) {
                clearTimeout(coldTimerRef.current);
                coldTimerRef.current = null;
            }
            setWindowColdAnimation(false);

            // 3초 후 windowClosedAnimation 리셋
            setTimeout(() => {
                setWindowClosedAnimation(false);
            }, 3000);
        }
    };

    // 컴포넌트 정리 시 타이머 방지 누수
    useEffect(() => {
        return () => {
            if (coldTimerRef.current) clearTimeout(coldTimerRef.current);
        };
    }, []);

    // 채팅 및 AI 응답 핸들러
    const handleWrite = async (content) => {
        setLatestLog(content);
        setIsAiThinking(true);
        setAiResponse(null);
        setEmotion(null);

        try {
            console.log('💬 채팅 입력 → ChatAPI 호출 (감정 분석 포함)');

            // 채팅 API 호출 (감정 태그 포함)
            const response = await chatApi.sendMessage(user.id, content);

            if (response) {
                // response 구조: { response: "AI 응답 내용", emotion: "happiness" }
                setAiResponse(response.response);

                if (response.emotion) {
                    setEmotion(response.emotion);
                    console.log('✨ 감정 감지:', response.emotion);
                    // 감정 조각 생성
                    spawnEmotionShard(response.emotion);
                }
            }

            if (onWriteClick) {
                onWriteClick();
            }
        } catch (error) {
            console.error('채팅 처리 실패:', error);
            setAiResponse('죄송해요, 지금은 답변을 드릴 수 없어요. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsAiThinking(false);
        }
    };

    // 탭 변경 핸들러
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);

        // 기존 콜백 호출 (호환성 유지)
        if (tabId === 'report' && onStatsClick) {
            onStatsClick();
        } else if (tabId === 'settings' && onSettingsClick) {
            onSettingsClick();
        }
    };

    return (
        <div className="bg-gradient-to-br from-[#FFF8F3] via-[#FFE8F0] to-[#F5E8FF] md:flex md:min-h-screen md:items-center md:justify-center font-body" data-gtm="view-mobile-dashboard-new">

            {/* 반응형 비율 유지 래퍼 (3-레이어) */}
            <div className="relative w-full h-[100dvh] flex items-center justify-center">
                <div
                    className="relative flex w-full flex-col overflow-hidden md:rounded-[3rem] md:border-[10px] md:border-white bg-gradient-to-b from-[#FFF8F3] to-[#FFE8F0] md:shadow-[0_30px_80px_-15px_rgba(255,181,194,0.4)] md:ring-1 md:ring-[#FFD4DC]"
                    style={{
                        aspectRatio: '9 / 19.5',
                        maxHeight: '100dvh',
                        maxWidth: 'calc(100dvh * 9 / 19.5)',
                    }}
                >

                    {/* 메인 화면 영역 - 탭에 따라 다른 콘텐츠 표시 */}
                    <div className="relative w-full flex-1 overflow-hidden">
                        {/* 홈 탭: 다마고치 룸 표시 */}
                        {activeTab === 'home' && (
                            <div className="absolute inset-0">
                                {/* 💡 무드등 OFF 시 어두운 오버레이 (상점 열려 있을 때는 비활성화) */}
                                {!moodLightOn && !isStoreViewOpen && (
                                    <div
                                        className="absolute inset-0 bg-black/60 z-[100] pointer-events-none transition-opacity duration-700"
                                        style={{ mixBlendMode: 'multiply' }}
                                    />
                                )}

                                {/* 🎨 벽 배경 (상단 60%) - 테마에 따라 변경 */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${equippedTheme?.gradient || 'from-purple-100 via-pink-50 to-yellow-50'}`} style={{
                                    backgroundImage: `
                            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.4) 0%, transparent 3%),
                            radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.3) 0%, transparent 2.5%),
                            radial-gradient(circle at 35% 70%, rgba(255, 255, 255, 0.35) 0%, transparent 2.8%),
                            radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 3%),
                            radial-gradient(circle at 15% 85%, rgba(255, 255, 255, 0.3) 0%, transparent 2.5%),
                            radial-gradient(circle at 70% 75%, rgba(255, 255, 255, 0.35) 0%, transparent 2.8%),
                            radial-gradient(circle at 45% 15%, rgba(255, 255, 255, 0.3) 0%, transparent 2.5%),
                            radial-gradient(circle at 90% 65%, rgba(255, 255, 255, 0.4) 0%, transparent 3%)
                        `,
                                    backgroundSize: '100% 100%',
                                    backgroundPosition: '0 0'
                                }}></div>

                                {/* 🪵 바닥 (하단 40%) - 테마에 따라 변경 */}
                                <div className="absolute bottom-0 w-full h-[40%]" style={{
                                    backgroundColor: equippedTheme?.floorColor || '#FFCC80',
                                    backgroundImage: `
                            linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
                            linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
                        `,
                                    backgroundSize: '120px 100%, 40px 100%',
                                    backgroundPosition: '0 0, 0 0'
                                }}></div>

                                {/* 🪟 대형 창문 (우측) - 다마고치 스타일, 일부 잘림 */}
                                <div
                                    className="absolute top-[5%] right-[-12%] z-20 w-[40%] h-[48%]"
                                    data-gtm="window-decoration-click"
                                    style={{
                                        filter: 'drop-shadow(-4px 8px 16px rgba(0,0,0,0.25))'
                                    }}
                                >
                                    <div className="relative w-full h-full">
                                        {/* 창문 틀 (큰 아치형) - 테마에 따라 변경 */}
                                        <div className="absolute inset-0 rounded-tl-[45%] rounded-tr-[45%] rounded-b-2xl border-[10px] overflow-hidden" style={{
                                            borderColor: equippedTheme?.windowBorderColor || '#5DADE2',
                                            boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.15), inset 0 -4px 8px rgba(255,255,255,0.3), 0 0 0 2px rgba(255,255,255,0.4)',
                                            background: `linear-gradient(135deg, ${equippedTheme?.windowBorderColor || '#6EC1E4'} 0%, ${equippedTheme?.windowBorderColor || '#5DADE2'} 100%)`
                                        }}>
                                            {/* 하늘 배경 (낮/밤 조건부 렌더링) */}
                                            <div className={`absolute inset-0 transition-colors duration-1000 ${isNightTime
                                                    ? 'bg-gradient-to-b from-slate-900 via-indigo-950 to-indigo-900'
                                                    : 'bg-gradient-to-b from-[#87CEEB] via-[#A8D8F0] to-[#C8EDF9]'
                                                }`}>
                                                {/* 밤하늘 장식 (별과 달) */}
                                                {isNightTime && (
                                                    <>
                                                        {/* 🌙 달 */}
                                                        <div className="absolute top-[15%] right-[20%] animate-pulse" style={{ animationDuration: '3s' }}>
                                                            <MongleIcon name="moon" size={36} />
                                                        </div>
                                                        {/* 별들 */}
                                                        <div className="absolute top-[20%] left-[15%] animate-pulse" style={{ animationDuration: '2s' }}><MongleIcon name="star" size={22} /></div>
                                                        <div className="absolute top-[10%] left-[30%] animate-pulse" style={{ animationDuration: '2.5s' }}><MongleIcon name="sparkle" size={14} /></div>
                                                        <div className="absolute top-[25%] right-[35%] animate-pulse" style={{ animationDuration: '3s' }}><MongleIcon name="star" size={18} /></div>
                                                        <div className="absolute top-[35%] left-[25%] animate-pulse" style={{ animationDuration: '2.2s' }}><MongleIcon name="sparkle" size={12} /></div>
                                                    </>
                                                )}
                                            </div>

                                            {/* 마을 풍경 (항상 표시) - 사실적 레이어링 */}
                                            <div className="absolute inset-0 overflow-hidden">
                                                {/* ☁️ 구름 레이어 (뒤쪽) */}
                                                <div className="absolute top-[12%] left-[8%] flex gap-1 opacity-70">
                                                    <div className="w-6 h-3.5 bg-white/70 rounded-full"></div>
                                                    <div className="w-7 h-4.5 bg-white/80 rounded-full -ml-3"></div>
                                                    <div className="w-5 h-3.5 bg-white/70 rounded-full -ml-2"></div>
                                                </div>
                                                <div className="absolute top-[20%] right-[12%] flex gap-1 opacity-60">
                                                    <div className="w-5 h-3 bg-white/60 rounded-full"></div>
                                                    <div className="w-6 h-3.5 bg-white/70 rounded-full -ml-2"></div>
                                                    <div className="w-4 h-3 bg-white/60 rounded-full -ml-1"></div>
                                                </div>

                                                {/* 🌄 땅/잔디 레이어 (하단) */}
                                                <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-b from-[#9CCC65] via-[#8BC34A] to-[#7CB342]" style={{
                                                    boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.1)'
                                                }}>
                                                    {/* 잔디 질감 */}
                                                    <div className="absolute inset-0" style={{
                                                        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(124,179,66,0.3) 3px, rgba(124,179,66,0.3) 4px)',
                                                        opacity: 0.5
                                                    }}></div>
                                                </div>

                                                {/* 🏠 집 (좌측 뒤편 - 작고 높게) */}
                                                <div className="absolute bottom-[32%] left-[8%]" style={{
                                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                                                }}>
                                                    <div className="w-10 h-8 bg-gradient-to-b from-[#FFE8B3] to-[#FFDAA0] rounded-md"></div>
                                                    <div className="absolute -top-4 -left-1 w-12 h-6 bg-gradient-to-b from-[#7CB5E8] to-[#5A9FD4]" style={{
                                                        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                                                    }}></div>
                                                    <div className="absolute top-1 right-2 w-2.5 h-2.5 bg-[#FFE8CC]/90 rounded-sm border border-[#8B6F47]"></div>
                                                </div>

                                                {/* 🌳 나무 (좌측 뒤편) */}
                                                <div className="absolute bottom-[30%] left-[22%]">
                                                    <div className="w-2 h-9 bg-gradient-to-b from-[#8B6F47] to-[#6B5537] rounded-full" style={{
                                                        boxShadow: 'inset -1px 0 2px rgba(0,0,0,0.3)'
                                                    }}></div>
                                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-7 h-7 bg-gradient-to-br from-[#81C784] to-[#558B2F] rounded-full opacity-90" style={{
                                                        boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.15)'
                                                    }}></div>
                                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-gradient-to-br from-[#A5D6A7] to-[#81C784] rounded-full opacity-90"></div>
                                                </div>

                                                {/* 🏠 집 (중앙 앞쪽 - 크고 낮게) */}
                                                <div className="absolute bottom-[28%] left-[38%]" style={{
                                                    filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))'
                                                }}>
                                                    <div className="w-14 h-11 bg-gradient-to-b from-[#FFDA9E] to-[#FFB88C] rounded-lg"></div>
                                                    <div className="absolute -top-7 -left-1 w-16 h-9 bg-gradient-to-b from-[#E85D75] to-[#D4476B]" style={{
                                                        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                                                    }}></div>
                                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-6 bg-[#8B6F47] rounded-t-lg"></div>
                                                </div>

                                                {/* 🌳 나무 (좌측 앞쪽 - 크게) */}
                                                <div className="absolute bottom-[26%] left-[5%]">
                                                    <div className="w-3 h-14 bg-gradient-to-b from-[#8B6F47] to-[#6B5537] rounded-full" style={{
                                                        boxShadow: 'inset -1px 0 3px rgba(0,0,0,0.3)'
                                                    }}></div>
                                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-11 h-11 bg-gradient-to-br from-[#81C784] to-[#558B2F] rounded-full" style={{
                                                        boxShadow: 'inset -2px -2px 5px rgba(0,0,0,0.2), inset 2px 2px 5px rgba(255,255,255,0.25)'
                                                    }}></div>
                                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-[#A5D6A7] to-[#81C784] rounded-full" style={{
                                                        boxShadow: 'inset -1px -1px 3px rgba(0,0,0,0.15)'
                                                    }}></div>
                                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-[#C8E6C9] to-[#A5D6A7] rounded-full"></div>
                                                </div>

                                                {/* 🌳 나무 (우측 - 일부만 보임, 크게) */}
                                                <div className="absolute bottom-[24%] right-[-8%]">
                                                    <div className="w-3.5 h-16 bg-gradient-to-b from-[#8B6F47] to-[#6B5537] rounded-full" style={{
                                                        boxShadow: 'inset -2px 0 3px rgba(0,0,0,0.3)'
                                                    }}></div>
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-[#66BB6A] to-[#4CAF50] rounded-full" style={{
                                                        boxShadow: 'inset -3px -3px 6px rgba(0,0,0,0.2), inset 2px 2px 5px rgba(255,255,255,0.25)'
                                                    }}></div>
                                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-9 h-9 bg-gradient-to-br from-[#81C784] to-[#66BB6A] rounded-full"></div>
                                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-7 h-7 bg-gradient-to-br from-[#A5D6A7] to-[#81C784] rounded-full"></div>
                                                </div>

                                                {/* 🌿 잔디 디테일 (앞쪽) */}
                                                <div className="absolute bottom-[22%] left-[15%] w-4 h-6 bg-gradient-to-t from-[#7CB342] to-[#8BC34A] opacity-80" style={{
                                                    clipPath: 'polygon(50% 0%, 30% 40%, 10% 80%, 0% 100%, 25% 100%, 40% 70%, 50% 100%, 60% 70%, 75% 100%, 100% 100%, 90% 80%, 70% 40%)'
                                                }}></div>
                                                <div className="absolute bottom-[23%] left-[62%] w-3.5 h-5 bg-gradient-to-t from-[#7CB342] to-[#8BC34A] opacity-70" style={{
                                                    clipPath: 'polygon(50% 0%, 30% 40%, 10% 80%, 0% 100%, 25% 100%, 40% 70%, 50% 100%, 60% 70%, 75% 100%, 100% 100%, 90% 80%, 70% 40%)'
                                                }}></div>
                                            </div>

                                            {/* 창살 (세로) - 밝은 색상 */}
                                            <div className="absolute left-1/2 top-0 bottom-0 w-2 -translate-x-1/2 bg-[#4A9FD4] opacity-60" style={{
                                                boxShadow: 'inset 0 0 4px rgba(0,0,0,0.2)'
                                            }}></div>

                                            {/* 창살 (가로) - 밝은 색상 */}
                                            <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 bg-[#4A9FD4] opacity-60" style={{
                                                boxShadow: 'inset 0 0 4px rgba(0,0,0,0.2)'
                                            }}></div>

                                            {/* 창문 내부 그림자 (입체감) */}
                                            <div className="absolute inset-0 pointer-events-none" style={{
                                                boxShadow: 'inset 0 8px 16px rgba(0,0,0,0.1)'
                                            }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* 📚 좌측 선반 2단 (다마고치 스타일) */}
                                <div className="absolute top-[28%] left-[8%] z-20 pointer-events-none" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
                                    {/* 상단 선반 */}
                                    <div className="relative w-[26.05%] h-[0.58%] bg-[#D7B896] rounded-md mb-[1.86%]" style={{
                                        boxShadow: '0 2px 0 rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)'
                                    }}>
                                        {/* 선반 위 소품들 */}
                                        <div className="absolute -top-[2.33%] left-[7.14%] flex gap-[7.14%] items-end">
                                            {/* 📚 책 */}
                                            <div className="w-[14.29%] h-[2.33%] bg-gradient-to-br from-[#FF8FA3] to-[#FF6B8A] rounded-sm" style={{
                                                boxShadow: '2px 0 0 rgba(0,0,0,0.1)'
                                            }}></div>
                                            <div className="w-[10.71%] h-[1.86%] bg-gradient-to-br from-[#FFB5C2] to-[#FF9FB1] rounded-sm mt-[0.47%]" style={{
                                                boxShadow: '2px 0 0 rgba(0,0,0,0.1)'
                                            }}></div>

                                            {/* 📷 카메라 */}
                                            <div className="relative w-[25%] h-[1.40%] bg-gradient-to-br from-[#FF9FB1] to-[#FF8FA3] rounded-md" style={{
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                                            }}>
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[10.71%] h-[0.70%] bg-white/80 rounded-full"></div>
                                                <div className="absolute top-[0.23%] right-[3.57%] w-[5.36%] h-[0.35%] bg-white/60 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 하단 선반 */}
                                    <div className="relative w-[26.05%] h-[0.58%] bg-[#D7B896] rounded-md" style={{
                                        boxShadow: '0 2px 0 rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)'
                                    }}>
                                        {/* 선반 위 소품들 */}
                                        <div className="absolute -top-[2.79%] left-[7.14%] flex gap-[10.71%] items-end">
                                            {/* 🌵 선인장 화분 */}
                                            <div className="relative w-[28.57%] h-[2.79%]">
                                                {/* 화분 */}
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[25%] h-[1.16%] bg-gradient-to-b from-[#FF9980] to-[#FF8060] rounded-b-md" style={{
                                                    clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
                                                }}></div>
                                                {/* 선인장 몸통 */}
                                                <div className="absolute bottom-[0.70%] left-1/2 -translate-x-1/2 w-[14.29%] h-[1.63%] bg-gradient-to-br from-[#7CB342] to-[#558B2F] rounded-lg"></div>
                                                {/* 선인장 팔 */}
                                                <div className="absolute bottom-[1.16%] left-0 w-[7.14%] h-[0.70%] bg-gradient-to-br from-[#7CB342] to-[#558B2F] rounded-full"></div>
                                                <div className="absolute bottom-[1.16%] right-0 w-[7.14%] h-[0.70%] bg-gradient-to-br from-[#7CB342] to-[#558B2F] rounded-full"></div>
                                            </div>

                                            {/* 📦 박스 */}
                                            <div className="relative w-[21.43%] h-[1.63%] bg-gradient-to-br from-[#D4A5F5] to-[#B87FE0] rounded-sm" style={{
                                                boxShadow: '2px 2px 0 rgba(0,0,0,0.1)'
                                            }}>
                                                <div className="absolute top-0 left-0 right-0 h-[0.35%] bg-white/30"></div>
                                                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1.79%] bg-white/30"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 💜 펫 + 방석 통합 컨테이너 (반응형 동기화) */}
                                <div
                                    className="absolute bottom-[22%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none"
                                    data-gtm="pet-cushion-container"
                                >
                                    {/* 펫 (MainRoom) */}
                                    <div className="-mb-6 z-30 pointer-events-auto">
                                        <div className="w-[37.21vw] max-w-40 rounded-full flex items-center justify-center" style={{ aspectRatio: '1 / 1' }}>
                                            <MainRoom
                                                latestLog={latestLog}
                                                aiResponse={aiResponse}
                                                emotion={emotion}
                                                isAiThinking={isAiThinking}
                                                user={user}
                                                windowColdAnimation={windowColdAnimation}
                                                windowClosedAnimation={windowClosedAnimation}
                                            />
                                        </div>
                                    </div>

                                    {/* 방석 */}
                                    <div data-gtm="decoration-premium-cushion">
                                        <div className="relative w-52 h-28">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#E8C5FF] via-[#D4A5F5] to-[#C490E4] rounded-[50%]"
                                                style={{
                                                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
                                                    boxShadow: 'inset 0 -8px 16px rgba(139,92,246,0.4), inset 0 6px 12px rgba(255,255,255,0.5)'
                                                }}
                                            ></div>

                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-16">
                                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40 rounded-full -translate-y-1/2"></div>
                                                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/40 rounded-full -translate-x-1/2"></div>
                                            </div>

                                            <div className="absolute inset-3 rounded-[50%] border-2 border-dashed border-white/35"></div>

                                            <div className="absolute top-3 left-5 w-2.5 h-2.5 bg-white/50 rounded-full"></div>
                                            <div className="absolute top-3 right-5 w-2.5 h-2.5 bg-white/50 rounded-full"></div>
                                            <div className="absolute bottom-3 left-5 w-2.5 h-2.5 bg-white/50 rounded-full"></div>
                                            <div className="absolute bottom-3 right-5 w-2.5 h-2.5 bg-white/50 rounded-full"></div>

                                            <div className="absolute inset-0 overflow-hidden rounded-[50%]">
                                                <div className="absolute left-[15%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/25 to-transparent"></div>
                                                <div className="absolute left-[30%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                                                <div className="absolute left-[45%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/25 to-transparent"></div>
                                                <div className="absolute left-[60%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                                                <div className="absolute left-[75%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/25 to-transparent"></div>
                                                <div className="absolute left-[85%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                                            </div>

                                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-36 h-8 bg-white/45 rounded-[50%] blur-md"></div>
                                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-48 h-4 bg-black/25 rounded-[50%] blur-lg"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* 💡 무드등 (좌측 하단) */}
                                <div className="absolute bottom-[26%] left-[6%] z-25 w-[15%] h-[37%] pointer-events-none flex items-end justify-center">
                                    <MoodLight />
                                </div>

                                {/* 🪴 우측 하단 대형 화분 (장착된 화분 없을 때만 기본 표시) */}
                                {!equippedPot && (
                                <div className="absolute bottom-[26%] right-[4%] z-20 pointer-events-none" style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))' }}>
                                    <div className="relative w-[22.33%] h-[10.23%]">
                                        {/* 화분 */}
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[18.60%] h-[3.72%] bg-gradient-to-b from-[#FF9980] to-[#FF7A5A] rounded-b-3xl" style={{
                                            clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
                                            boxShadow: '0 6px 12px rgba(0,0,0,0.25), inset 0 3px 0 rgba(255,255,255,0.3)'
                                        }}></div>

                                        {/* 중앙 큰 잎 */}
                                        <div className="absolute bottom-[3.26%] left-1/2 -translate-x-1/2 w-[5.58%] h-[6.05%] bg-gradient-to-t from-[#66BB6A] to-[#81C784] rounded-full"></div>

                                        {/* 좌측 잎들 (크기 2배) */}
                                        <div className="absolute bottom-[3.72%] left-0 w-[10.23%] h-[4.19%] bg-gradient-to-br from-[#81C784] to-[#66BB6A] rounded-full rotate-[-35deg]" style={{
                                            boxShadow: 'inset -3px 3px 6px rgba(0,0,0,0.12)'
                                        }}></div>
                                        <div className="absolute bottom-[5.12%] left-[-0.47%] w-[8.37%] h-[3.49%] bg-gradient-to-br from-[#A5D6A7] to-[#81C784] rounded-full rotate-[-25deg]"></div>

                                        {/* 우측 잎들 (크기 2배) */}
                                        <div className="absolute bottom-[3.72%] right-0 w-[10.23%] h-[4.19%] bg-gradient-to-bl from-[#81C784] to-[#66BB6A] rounded-full rotate-[35deg]" style={{
                                            boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.12)'
                                        }}></div>
                                        <div className="absolute bottom-[5.12%] right-[-0.47%] w-[8.37%] h-[3.49%] bg-gradient-to-bl from-[#A5D6A7] to-[#81C784] rounded-full rotate-[25deg]"></div>

                                        {/* 상단 작은 잎들 (크기 2배) */}
                                        <div className="absolute bottom-[6.51%] left-[2.79%] w-[7.44%] h-[2.79%] bg-gradient-to-br from-[#C8E6C9] to-[#A5D6A7] rounded-full rotate-[-15deg]"></div>
                                        <div className="absolute bottom-[6.51%] right-[2.79%] w-[7.44%] h-[2.79%] bg-gradient-to-bl from-[#C8E6C9] to-[#A5D6A7] rounded-full rotate-[15deg]"></div>

                                        {/* 추가 잎들로 더 풍성하게 */}
                                        <div className="absolute bottom-[4.65%] left-[0.93%] w-[6.51%] h-[2.33%] bg-gradient-to-br from-[#A5D6A7] to-[#81C784] rounded-full rotate-[-40deg]" style={{
                                            opacity: 0.9
                                        }}></div>
                                        <div className="absolute bottom-[4.65%] right-[0.93%] w-[6.51%] h-[2.33%] bg-gradient-to-bl from-[#A5D6A7] to-[#81C784] rounded-full rotate-[40deg]" style={{
                                            opacity: 0.9
                                        }}></div>
                                    </div>
                                </div>
                                )}

                                {/* 🧩 감정 조각 렌더링 (바닥 위에 표시) */}
                                {emotionShards && emotionShards.map(shard => (
                                    <div
                                        key={shard.id}
                                        className={`absolute z-25 w-[7.44%] rounded-full cursor-pointer pointer-events-auto animate-bounce active:scale-90 transition-transform duration-200 ${getEmotionColor(shard.emotion)}`}
                                        style={{
                                            aspectRatio: '1 / 1',
                                            left: `${shard.x}%`,
                                            bottom: `${shard.y}%`,
                                            animationDuration: '1.5s'
                                        }}
                                        onClick={() => {
                                            handleCollectShard(user?.id, shard.id);
                                        }}
                                        data-gtm="emotion-shard-collect"
                                    >
                                        {/* 내부 빛나는 효과 */}
                                        <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse"></div>
                                    </div>
                                ))}

                                {/* 🪑 장착된 가구 렌더링 */}
                                {/* 선반 (벽 상단) */}
                                {equippedShelf && (
                                    <div className="absolute top-[28%] left-[8%] z-20 pointer-events-none" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
                                        <div
                                            className="w-[26.05%] h-[0.58%] rounded-md"
                                            style={{
                                                background: `linear-gradient(to bottom, ${equippedShelf.colorLight}, ${equippedShelf.color})`,
                                                boxShadow: '0 2px 0 rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)'
                                            }}
                                        ></div>
                                    </div>
                                )}
                                {/* 화분 (바닥 우측) */}
                                {renderPot()}
                                {/* 방석 (바닥 중앙 - 몽글이 아래) */}
                                {equippedCushion && (
                                    <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                                        <div
                                            className="w-[20vw] h-[14vw] rounded-3xl"
                                            style={{
                                                background: `radial-gradient(ellipse at center, ${equippedCushion.color}, ${equippedCushion.colorDark})`,
                                                boxShadow: `0 6px 12px rgba(0,0,0,0.3), inset 0 -4px 10px rgba(0,0,0,0.15)`
                                            }}
                                        ></div>
                                    </div>
                                )}

                                {/* ✨ 반짝이는 별 장식 (다이아몬드 모양) */}
                                <div className="absolute top-[12%] left-[15%] z-5 pointer-events-none">
                                    <div className="relative w-[7.44%] rotate-45 bg-white/60 animate-pulse" style={{
                                        aspectRatio: '1 / 1',
                                        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                                        filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))',
                                        animationDuration: '2s'
                                    }}></div>
                                </div>
                                <div className="absolute top-[25%] right-[20%] z-5 pointer-events-none">
                                    <div className="relative w-[5.58%] rotate-45 bg-white/50 animate-pulse" style={{
                                        aspectRatio: '1 / 1',
                                        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                                        filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.7))',
                                        animationDuration: '2.5s'
                                    }}></div>
                                </div>
                                <div className="absolute top-[18%] right-[35%] z-5 pointer-events-none">
                                    <div className="relative w-[4.65%] rotate-45 bg-white/40 animate-pulse" style={{
                                        aspectRatio: '1 / 1',
                                        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                                        filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.6))',
                                        animationDuration: '3s'
                                    }}></div>
                                </div>
                            </div>
                        )}

                        {/* 일기 탭: 캘린더 뷰 표시 */}
                        {activeTab === 'diary' && (
                            <div className="absolute inset-0 bg-white">
                                <CalendarView diaries={diaries} />
                            </div>
                        )}

                        {/* 리포트 탭: 통계 뷰 표시 */}
                        {activeTab === 'report' && (
                            <div className="absolute inset-0">
                                <ReportView user={user} diaries={diaries} />
                            </div>
                        )}

                        {/* 설정 탭: 설정 뷰 표시 */}
                        {activeTab === 'settings' && (
                            <div className="absolute inset-0">
                                <SettingsView user={user} />
                            </div>
                        )}
                    </div>

                    {/* 헤더 영역 (스트릭 배지만) - 홈 탭에서만 표시 */}
                    {activeTab === 'home' && (
                        <>
                            <div
                                className="absolute top-0 z-40 flex w-full items-end justify-end gap-2 px-6 md:px-8 pointer-events-none"
                                style={{ paddingTop: 'max(3.5rem, calc(1rem + env(safe-area-inset-top)))' }}
                                data-gtm="mobile-dashboard-header"
                            >
                                {/* 코인 표시 */}
                                <div
                                    className="rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 shadow-lg border-2 pointer-events-auto"
                                    data-gtm="mobile-coin-display"
                                    style={{
                                        borderColor: `${equippedTheme?.decorationColors?.primary || '#FFD4DC'}40`
                                    }}
                                >
                                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                                        <MongleIcon name="coin" size={16} /> {coins}
                                    </span>
                                </div>

                                {/* 스트릭 배지 - 테마에 따라 변경 */}
                                <div
                                    className="rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 shadow-lg border-2 pointer-events-auto cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-200"
                                    onClick={onCalendarClick}
                                    data-gtm="mobile-dashboard-streak-indicator"
                                    style={{
                                        borderColor: `${equippedTheme?.decorationColors?.primary || '#FFD4DC'}40`
                                    }}
                                >
                                    <span className="text-xs font-bold" style={{
                                        color: equippedTheme?.accentColor || '#FFB5C2'
                                    }}>
                                        <SmartEmoji value={equippedTheme?.emoji || 'flower'} size={14} className="mr-0.5" /> {streakDays}일차
                                    </span>
                                </div>
                            </div>

                            {/* 코인 획득 토스트 */}
                            {coinToast && (
                                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[200] animate-bounce">
                                    <div className="rounded-full bg-amber-400 text-white px-5 py-2 shadow-lg text-sm font-bold flex items-center gap-1.5">
                                        <MongleIcon name="coin" size={18} /> {coinToast}
                                    </div>
                                </div>
                            )}

                            {/* TODO: 로티 진화 구현 후 주석 해제 — 레벨 HUD (CircularProgressNew) */}
                            {SHOW_LEVEL_UP_UI && (
                            <div
                                className="pointer-events-auto"
                                style={{ position: 'absolute', top: 'max(1.5rem, calc(0.5rem + env(safe-area-inset-top)))', left: '1.5rem', zIndex: 50 }}
                            >
                                <CircularProgressNew
                                    level={petStatus?.level ?? 1}
                                    percent={petStatus ? (petStatus.currentExp / petStatus.requiredExp) * 100 : 0}
                                />
                            </div>
                            )}
                        </>
                    )}

                    {/* BottomSheet - 홈 탭에서만 표시 */}
                    {activeTab === 'home' && (
                        <BottomSheet
                            onWrite={handleWrite}
                            onSleepClick={handleWindowClick}
                            onStoreClick={() => setIsStoreViewOpen(true)}
                        />
                    )}

                    {/* 마음 기록 오버레이 */}
                    <MindRecord
                        isOpen={isMindRecordOpen}
                        onClose={() => setIsMindRecordOpen(false)}
                        userName={user?.nickname}
                        diaries={diaries}
                        data-gtm="mind-record-screen"
                    />

                    {/* 메인 메뉴 */}
                    <MainMenu
                        isOpen={isMainMenuOpen}
                        onClose={() => setIsMainMenuOpen(false)}
                        onEmotionShardsClick={onCalendarClick}
                        onStoreClick={() => setIsStoreViewOpen(true)}
                    />

                    {/* 상점 */}
                    <StoreView
                        isOpen={isStoreViewOpen}
                        onClose={() => setIsStoreViewOpen(false)}
                    />

                    {/* TODO: 로티 진화 구현 후 주석 해제 — 레벨업 축하 모달 */}
                    {SHOW_LEVEL_UP_UI && (
                    <LevelUpModal
                        isOpen={showLevelUpModal}
                        onClose={closeLevelUpModal}
                        prevLevel={levelUpInfo.prevLevel}
                        newLevel={levelUpInfo.newLevel}
                        rewardCoins={levelUpInfo.rewardCoins}
                    />
                    )}

                    {/* TODO: 로티 진화 구현 후 주석 해제 — 레벨업 테스트 버튼 */}
                    {SHOW_LEVEL_UP_UI && (
                    <div className="fixed top-2 left-2 z-[500] flex flex-col gap-2">
                        <button
                            className="px-3 py-2 rounded-xl text-xs font-bold text-white shadow-lg active:scale-95 transition-transform"
                            style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}
                            onClick={() => triggerLevelUpModal(
                                petStatus?.level || 5,
                                (petStatus?.level || 5) + 1,
                                150
                            )}
                            data-gtm="test-levelup-btn"
                        >
                            <MongleIcon name="testTube" size={14} className="mr-1" /> 레벨업 테스트
                        </button>
                    </div>
                    )}

                    {/* 하단 탭바 - 항상 표시 */}
                    <BottomTabBar
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default MobileDashboard;
