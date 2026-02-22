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
    const { equippedItems, getEquippedItem } = useStore();

    // 장착된 아이템 가져오기 (equippedItems 변경 시 자동 재계산)
    const equippedTheme = useMemo(() => {
        const theme = getEquippedItem('theme');
        console.log('🎨 [MobileDashboard] 장착된 테마:', theme);
        return theme;
    }, [getEquippedItem]);
    const equippedShelf = useMemo(() => getEquippedItem('shelf'), [getEquippedItem]);
    const equippedPot = useMemo(() => getEquippedItem('pot'), [getEquippedItem]);
    const equippedCushion = useMemo(() => getEquippedItem('cushion'), [getEquippedItem]);

    // 🪴 화분 렌더링 — 4레이어 샌드위치: ①뒷타원 ②흙 ③식물 ④화분앞면
    const renderPot = () => {
        if (!equippedPot) return null;
        const potId = equippedPot?.id;
        const pc = equippedPot?.potColor || '#C87941';
        const pl = equippedPot?.plantColor || '#4CAF50';
        const svgStyle = { width: '13vw', height: '22vw', display: 'block', overflow: 'visible' };

        // 화분 종류별 ①뒷타원 색상
        const backC = { pot_cactus:'#7A3020', pot_monstera:'#909090', pot_flower:'#9C5070', pot_lavender:'#80706A', pot_rose:'#6A4810' }[potId] || '#5A3010';

        return (
            <div className="absolute bottom-[2%] right-[8%] z-20 pointer-events-none">
                <svg viewBox="0 0 100 120" style={svgStyle}>
                    <defs>
                        <linearGradient id="md-pg" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(0,0,0,0.22)" />
                            <stop offset="38%" stopColor="rgba(255,255,255,0.18)" />
                            <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
                        </linearGradient>
                        {potId === 'pot_monstera' && (<>
                            <mask id="md-mL"><rect width="100" height="120" fill="white"/><ellipse cx="22" cy="48" rx="5" ry="3.5" fill="black" transform="rotate(-28 22 48)"/><ellipse cx="16" cy="30" rx="4" ry="3" fill="black" transform="rotate(-22 16 30)"/></mask>
                            <mask id="md-mR"><rect width="100" height="120" fill="white"/><ellipse cx="78" cy="48" rx="5" ry="3.5" fill="black" transform="rotate(28 78 48)"/><ellipse cx="84" cy="30" rx="4" ry="3" fill="black" transform="rotate(22 84 30)"/></mask>
                        </>)}
                    </defs>

                    {/* ① 뒷타원 — 화분 입구 안쪽 깊이감 */}
                    <ellipse cx="50" cy="84" rx="28" ry="7" fill={backC} />

                    {/* ② 흙 */}
                    <ellipse cx="50" cy="88" rx="26" ry="5.5" fill={potId==='pot_flower'?'#3D1A24':potId==='pot_lavender'?'#3A2840':'#3D2010'} />
                    <ellipse cx="50" cy="87" rx="18" ry="3.5" fill="rgba(0,0,0,0.3)" />

                    {/* ③ 식물 — 줄기 밑동은 y≥90에서 시작 */}
                    <g className="animate-pot-breathe">
                        {potId === 'pot_cactus' && (<>
                            {/* 왼팔 */}
                            <path d="M43,74 Q30,70 26,58 Q23,48 28,46 Q34,44 37,54 Q40,64 43,70Z" fill={pl} />
                            <path d="M31,70 Q30,58 31,48" fill="none" stroke="rgba(40,80,20,0.4)" strokeWidth="0.8"/>
                            {/* 오른팔 */}
                            <path d="M57,66 Q70,62 74,50 Q77,40 72,38 Q66,36 63,46 Q60,56 57,60Z" fill={pl} />
                            <path d="M69,62 Q70,50 69,40" fill="none" stroke="rgba(40,80,20,0.4)" strokeWidth="0.8"/>
                            {/* 메인 몸통 */}
                            <path d="M42,90 Q39,55 42,30 Q44,14 50,12 Q56,14 58,30 Q61,55 58,90Z" fill={pl} />
                            {/* 세로 리브 */}
                            <path d="M47,89 Q46,52 48,14" fill="none" stroke="rgba(40,80,20,0.4)" strokeWidth="1.2"/>
                            <path d="M50,89 Q50,50 50,12" fill="none" stroke="rgba(40,80,20,0.3)" strokeWidth="1"/>
                            <path d="M53,89 Q54,52 52,14" fill="none" stroke="rgba(40,80,20,0.4)" strokeWidth="1.2"/>
                            <path d="M43,88 Q42,54 45,22" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
                            {/* 가시 */}
                            {[35,50,65,78].map(y=>(<g key={y}>
                                <line x1="43" y1={y} x2="40" y2={y-2.5} stroke="rgba(255,255,255,0.85)" strokeWidth="0.8" strokeLinecap="round"/>
                                <line x1="57" y1={y} x2="60" y2={y-2.5} stroke="rgba(255,255,255,0.85)" strokeWidth="0.8" strokeLinecap="round"/>
                            </g>))}
                            {/* 정수리 꽃 */}
                            {[0,60,120,180,240,300].map(a=>(<ellipse key={a} cx="50" cy="12" rx="2.5" ry="6" fill="#F9B0CC" transform={`rotate(${a} 50 12)`}/>))}
                            <circle cx="50" cy="12" r="3.5" fill="#FFE8B0"/><circle cx="50" cy="12" r="1.6" fill="#FFCC60"/>
                        </>)}

                        {potId === 'pot_monstera' && (<>
                            <line x1="50" y1="92" x2="50" y2="52" stroke="#4A8040" strokeWidth="4" strokeLinecap="round"/>
                            <path d="M50,76 Q38,72 30,54" fill="none" stroke="#4A8040" strokeWidth="2.5" strokeLinecap="round"/>
                            <path d="M50,68 Q62,64 70,46" fill="none" stroke="#4A8040" strokeWidth="2.5" strokeLinecap="round"/>
                            {/* 왼쪽 잎 (fenestration mask) */}
                            <path d="M47,90 C26,82 6,58 8,30 C10,12 30,8 40,22 C44,32 44,68 47,90Z" fill={pl} mask="url(#md-mL)"/>
                            <path d="M47,88 C30,68 14,44 16,20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.9"/>
                            {/* 오른쪽 잎 (fenestration mask) */}
                            <path d="M53,90 C74,80 94,54 92,26 C90,8 70,6 60,20 C56,30 56,68 53,90Z" fill={pl} mask="url(#md-mR)"/>
                            <path d="M53,88 C70,66 86,40 84,16" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.9"/>
                            {/* 중앙 새순 */}
                            <path d="M47,90 C42,64 46,38 50,14 C54,38 58,64 53,90Z" fill={pl} opacity="0.9"/>
                            <path d="M50,90 C49,66 49,40 50,14" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.9"/>
                        </>)}

                        {potId === 'pot_flower' && (<>
                            {/* 잎 덤불 */}
                            <ellipse cx="50" cy="72" rx="34" ry="16" fill="#6AAA58"/>
                            <ellipse cx="35" cy="68" rx="17" ry="12" fill="#7EC468"/>
                            <ellipse cx="65" cy="68" rx="17" ry="12" fill="#7EC468"/>
                            <ellipse cx="50" cy="62" rx="22" ry="10" fill="#88CC70"/>
                            {/* 줄기 3개 */}
                            <path d="M36,92 Q29,68 25,35" fill="none" stroke="#5A9848" strokeWidth="2.8" strokeLinecap="round"/>
                            <path d="M50,92 Q50,65 50,22" fill="none" stroke="#60A44E" strokeWidth="2.8" strokeLinecap="round"/>
                            <path d="M64,92 Q71,68 75,35" fill="none" stroke="#5A9848" strokeWidth="2.8" strokeLinecap="round"/>
                            {/* 꽃 1 왼쪽 */}
                            {[0,72,144,216,288].map(a=>(<ellipse key={a} cx="25" cy="32" rx="4.5" ry="9" fill="#FDD0E0" transform={`rotate(${a} 25 32)`}/>))}
                            <circle cx="25" cy="32" r="4.5" fill="#FFE888"/><circle cx="25" cy="32" r="2" fill="#FFD050"/>
                            {/* 꽃 2 중앙 */}
                            {[0,51,103,154,206,257,309].map(a=>(<ellipse key={a} cx="50" cy="18" rx="4" ry="8.5" fill="#E8D8F8" transform={`rotate(${a} 50 18)`}/>))}
                            <circle cx="50" cy="18" r="5" fill="#FFE888"/><circle cx="50" cy="18" r="2.2" fill="#FFD050"/>
                            {/* 꽃 3 오른쪽 */}
                            {[0,72,144,216,288].map(a=>(<ellipse key={a} cx="75" cy="32" rx="4" ry="8" fill="#FFD8C0" transform={`rotate(${a} 75 32)`}/>))}
                            <circle cx="75" cy="32" r="4" fill="#FFE888"/><circle cx="75" cy="32" r="1.8" fill="#FFD050"/>
                        </>)}

                        {potId === 'pot_lavender' && (<>
                            {/* 잎사귀 */}
                            <ellipse cx="22" cy="72" rx="7" ry="3" fill="#94C878" transform="rotate(-25 22 72)"/>
                            <ellipse cx="78" cy="72" rx="7" ry="3" fill="#94C878" transform="rotate(25 78 72)"/>
                            {/* 줄기 5개 + 쌍타원 클러스터 */}
                            {[{sx:36,tx:25,ty:18},{sx:43,tx:38,ty:8},{sx:50,tx:50,ty:5},{sx:57,tx:62,ty:8},{sx:64,tx:75,ty:18}].map(({sx,tx,ty},i)=>(
                                <g key={i}>
                                    <path d={`M${sx},90 Q${tx+2},58 ${tx},${ty}`} fill="none" stroke="#8AB870" strokeWidth="1.8" strokeLinecap="round"/>
                                    {[0,4,8,12,16,20].map(dy=>{
                                        const lavC=['#D0A8F0','#C498E8','#B888E0','#AC78D8','#A068D0','#9858C8'][Math.min(Math.floor(dy/4),5)];
                                        const rx=Math.max(2.8-dy*0.08,0.8), ry=Math.max(4.2-dy*0.12,1.2);
                                        return (<g key={dy}>
                                            <ellipse cx={tx-3} cy={ty+dy} rx={rx} ry={ry} fill={lavC} transform={`rotate(-12 ${tx-3} ${ty+dy})`}/>
                                            <ellipse cx={tx+3} cy={ty+dy} rx={rx} ry={ry} fill={lavC} transform={`rotate(12 ${tx+3} ${ty+dy})`}/>
                                        </g>);
                                    })}
                                    <ellipse cx={tx} cy={ty-3} rx="1.8" ry="3" fill="#C898E8"/>
                                </g>
                            ))}
                        </>)}

                        {potId === 'pot_rose' && (<>
                            {/* 잎 덤불 */}
                            <ellipse cx="50" cy="64" rx="38" ry="24" fill="#5A9848"/>
                            <ellipse cx="34" cy="56" rx="22" ry="18" fill="#68A855"/>
                            <ellipse cx="64" cy="58" rx="20" ry="16" fill="#5A9848" opacity="0.9"/>
                            <ellipse cx="50" cy="46" rx="26" ry="16" fill="#74B860" opacity="0.85"/>
                            {/* 장미 1 왼쪽 */}
                            <circle cx="26" cy="48" r="13" fill="#D87080"/>
                            <path d="M26,35 Q38,35 38,48 Q38,61 26,61 Q16,58 15,48 Q16,36 26,35Z" fill="#E89098"/>
                            <path d="M26,39 Q36,40 36,48 Q35,58 26,57" fill="#F0AABA" opacity="0.9"/>
                            <path d="M26,43 Q33,44 33,49 Q32,57 26,56" fill="#F8C8D4" opacity="0.8"/>
                            <circle cx="25" cy="40" r="2" fill="rgba(255,255,255,0.28)"/>
                            {/* 장미 2 중앙 */}
                            <circle cx="50" cy="28" r="17" fill="#C86070"/>
                            <path d="M50,11 Q67,11 67,28 Q67,45 50,45 Q35,41 34,28 Q35,14 50,11Z" fill="#D87888"/>
                            <path d="M50,15 Q64,16 64,28 Q63,42 50,41" fill="#E898A8" opacity="0.9"/>
                            <path d="M50,20 Q61,21 61,29 Q60,40 50,39" fill="#F4B0C0" opacity="0.85"/>
                            <path d="M50,25 Q57,26 57,31 Q56,38 50,37" fill="#FDD0D8" opacity="0.75"/>
                            <circle cx="49" cy="18" r="2.5" fill="rgba(255,255,255,0.28)"/>
                            {/* 장미 3 오른쪽 */}
                            <circle cx="72" cy="52" r="12" fill="#D87888"/>
                            <path d="M72,40 Q84,40 84,52 Q84,65 72,65 Q62,62 61,52 Q62,41 72,40Z" fill="#E898A8"/>
                            <path d="M72,44 Q82,45 82,52 Q81,63 72,62" fill="#F4B0C0" opacity="0.88"/>
                            <circle cx="71" cy="44" r="1.8" fill="rgba(255,255,255,0.28)"/>
                        </>)}
                    </g>

                    {/* ④ 화분 몸통 + 잎 칼라 + 앞면 립 — 식물 밑동을 덮어 심어진 효과 */}
                    {potId === 'pot_cactus' && (<>
                        <path d="M22,84 L26,115 Q50,120 74,115 L78,84 Q50,91 22,84Z" fill={pc}/>
                        <path d="M22,84 L26,115 Q50,120 74,115 L78,84 Q50,91 22,84Z" fill="url(#md-pg)"/>
                        <ellipse cx="50" cy="89" rx="25" ry="7" fill="#94C878" opacity="0.8"/>
                        <path d="M22,84 A28,7 0 0 1 78,84 Z" fill={pc}/>
                        <path d="M24,84 A26,5.5 0 0 1 76,84 Z" fill="url(#md-pg)"/>
                        <path d="M26,84 A24,4 0 0 1 74,84 Z" fill="rgba(255,255,255,0.2)"/>
                    </>)}
                    {potId === 'pot_monstera' && (<>
                        <path d="M18,84 Q10,84 8,102 Q6,116 14,119 Q50,124 86,119 Q94,116 92,102 Q90,84 82,84 Q50,80 18,84Z" fill={pc}/>
                        <path d="M18,84 Q10,84 8,102 Q6,116 14,119 Q50,124 86,119 Q94,116 92,102 Q90,84 82,84 Q50,80 18,84Z" fill="url(#md-pg)"/>
                        <ellipse cx="50" cy="89" rx="26" ry="7" fill="#A4C89C" opacity="0.75"/>
                        <path d="M18,84 A32,7.5 0 0 1 82,84 Z" fill={pc}/>
                        <path d="M20,84 A30,5.5 0 0 1 80,84 Z" fill="url(#md-pg)"/>
                        <path d="M22,84 A28,3.8 0 0 1 78,84 Z" fill="rgba(255,255,255,0.22)"/>
                    </>)}
                    {potId === 'pot_flower' && (<>
                        <path d="M14,84 Q6,84 4,102 Q2,116 10,120 Q50,126 90,120 Q98,116 96,102 Q94,84 86,84 Q50,79 14,84Z" fill={pc}/>
                        <path d="M14,84 Q6,84 4,102 Q2,116 10,120 Q50,126 90,120 Q98,116 96,102 Q94,84 86,84 Q50,79 14,84Z" fill="url(#md-pg)"/>
                        <ellipse cx="50" cy="90" rx="30" ry="8" fill="#90C880" opacity="0.8"/>
                        <ellipse cx="34" cy="92" rx="12" ry="4.5" fill="#88C078" transform="rotate(-18 34 92)"/>
                        <ellipse cx="66" cy="92" rx="12" ry="4.5" fill="#88C078" transform="rotate(18 66 92)"/>
                        <path d="M14,84 A36,8 0 0 1 86,84 Z" fill={pc}/>
                        <path d="M16,84 A34,6 0 0 1 84,84 Z" fill="url(#md-pg)"/>
                        <path d="M18,84 A32,4.5 0 0 1 82,84 Z" fill="rgba(255,255,255,0.22)"/>
                    </>)}
                    {potId === 'pot_lavender' && (<>
                        <path d="M20,84 Q14,84 12,101 Q11,115 17,118 Q50,122 83,118 Q89,115 88,101 Q86,84 80,84 Q50,80 20,84Z" fill={pc}/>
                        <path d="M20,84 Q14,84 12,101 Q11,115 17,118 Q50,122 83,118 Q89,115 88,101 Q86,84 80,84 Q50,80 20,84Z" fill="url(#md-pg)"/>
                        <ellipse cx="50" cy="89" rx="24" ry="6.5" fill="#B0C898" opacity="0.75"/>
                        <ellipse cx="38" cy="91" rx="9" ry="3.5" fill="#A8C090" transform="rotate(-15 38 91)"/>
                        <ellipse cx="62" cy="91" rx="9" ry="3.5" fill="#A8C090" transform="rotate(15 62 91)"/>
                        <path d="M20,84 A30,7.5 0 0 1 80,84 Z" fill={pc}/>
                        <path d="M22,84 A28,5.5 0 0 1 78,84 Z" fill="url(#md-pg)"/>
                        <path d="M24,84 A26,3.8 0 0 1 76,84 Z" fill="rgba(255,255,255,0.22)"/>
                    </>)}
                    {potId === 'pot_rose' && (<>
                        <rect x="18" y="84" width="64" height="32" rx="2" fill={pc}/>
                        <rect x="18" y="84" width="64" height="32" rx="2" fill="url(#md-pg)"/>
                        <ellipse cx="50" cy="116" rx="32" ry="2.5" fill="rgba(0,0,0,0.15)"/>
                        <ellipse cx="50" cy="89" rx="28" ry="7.5" fill="#68A858" opacity="0.8"/>
                        <ellipse cx="36" cy="91" rx="11" ry="4" fill="#60A050" transform="rotate(-18 36 91)"/>
                        <ellipse cx="64" cy="91" rx="11" ry="4" fill="#60A050" transform="rotate(18 64 91)"/>
                        <path d="M18,84 A32,7.5 0 0 1 82,84 Z" fill="#D4A840"/>
                        <path d="M20,84 A30,6 0 0 1 80,84 Z" fill="#DDB860"/>
                        <path d="M22,84 A28,4 0 0 1 78,84 Z" fill="rgba(255,255,255,0.2)"/>
                    </>)}
                    {/* fallback (pot_monstera 기본값) */}
                    {!['pot_cactus','pot_monstera','pot_flower','pot_lavender','pot_rose'].includes(potId) && (<>
                        <path d="M22,84 L26,115 Q50,120 74,115 L78,84 Q50,91 22,84Z" fill={pc}/>
                        <path d="M22,84 L26,115 Q50,120 74,115 L78,84 Q50,91 22,84Z" fill="url(#md-pg)"/>
                        <path d="M22,84 A28,7 0 0 1 78,84 Z" fill={pc}/>
                        <path d="M24,84 A26,5 0 0 1 76,84 Z" fill="rgba(255,255,255,0.2)"/>
                    </>)}
                </svg>
            </div>
        );
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
                                {/* 💡 무드등 OFF 시 어두운 오버레이 */}
                                {!moodLightOn && (
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

                                {/* 🪴 우측 하단 대형 화분 (크기 증가) */}
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
