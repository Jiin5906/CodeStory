import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useStore } from '../../context/StoreContext';
import { THEMES, SHELVES, LIGHTS, POTS, CUSHIONS, getItemsByType } from '../../data/StoreData';
import MongleIcon from '../common/MongleIcons';

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

    // 선반 미리보기 (shelfType별 고유 소품 SVG)
    if (item.type === 'shelf') {
        const shelfId = item.id;
        const sc = item.color; // shelf color
        const scl = item.colorLight;

        // 기본 선반 (원목 - 책 + 카메라 + 선인장)
        if (shelfId === 'shelf_wood') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 70 50" width="70" height="50">
                        {/* 선반 */}
                        <rect x="5" y="28" width="60" height="4" rx="1" fill={sc} />
                        <rect x="5" y="28" width="60" height="2" rx="1" fill={scl} opacity="0.5" />
                        {/* 책 2권 */}
                        <rect x="8" y="14" width="5" height="14" rx="0.5" fill="#FF8FA3" />
                        <rect x="14" y="18" width="4" height="10" rx="0.5" fill="#FFB5C2" />
                        {/* 카메라 */}
                        <rect x="22" y="20" width="10" height="8" rx="1.5" fill="#FF9FB1" />
                        <circle cx="27" cy="24" r="2.5" fill="white" opacity="0.8" />
                        {/* 선인장 */}
                        <ellipse cx="44" cy="22" rx="3" ry="6" fill="#7CB342" />
                        <rect x="41" y="26" width="6" height="3" rx="0.5" fill="#FF9980" />
                        {/* 박스 */}
                        <rect x="54" y="19" width="8" height="9" rx="0.5" fill="#D4A5F5" />
                        <rect x="54" y="19" width="8" height="2" rx="0.5" fill="white" opacity="0.3" />
                    </svg>
                </div>
            );
        }

        // 화이트 선반 (모던 - 시계 + 모노톤 책 + 연필꽂이)
        if (shelfId === 'shelf_white') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 70 50" width="70" height="50">
                        {/* 선반 */}
                        <rect x="5" y="28" width="60" height="4" rx="1" fill={sc} stroke="#E5E7EB" strokeWidth="0.5" />
                        {/* 디지털 시계 */}
                        <rect x="8" y="18" width="14" height="10" rx="1.5" fill="#1F2937" />
                        <text x="15" y="25.5" textAnchor="middle" fill="#4ADE80" fontSize="5" fontFamily="monospace">12:30</text>
                        {/* 쌓인 책들 (눕힘) */}
                        <rect x="26" y="22" width="12" height="2.5" rx="0.3" fill="#4B5563" />
                        <rect x="27" y="19.5" width="10" height="2.5" rx="0.3" fill="#6B7280" />
                        <rect x="26.5" y="17" width="11" height="2.5" rx="0.3" fill="#374151" />
                        {/* 연필꽂이 */}
                        <rect x="46" y="20" width="8" height="8" rx="1" fill="#9CA3AF" />
                        <line x1="48" y1="14" x2="48" y2="20" stroke="#F59E0B" strokeWidth="1.2" />
                        <line x1="51" y1="16" x2="51" y2="20" stroke="#3B82F6" strokeWidth="1.2" />
                        <line x1="53" y1="15" x2="53" y2="20" stroke="#10B981" strokeWidth="1.2" />
                    </svg>
                </div>
            );
        }

        // 파스텔 선반 (러블리 - 곰인형 + 하트 거울 + 향수병)
        if (shelfId === 'shelf_pastel') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 70 50" width="70" height="50">
                        {/* 선반 */}
                        <rect x="5" y="28" width="60" height="4" rx="1" fill={sc} />
                        <rect x="5" y="28" width="60" height="2" rx="1" fill={scl} opacity="0.4" />
                        {/* 곰인형 */}
                        <circle cx="16" cy="21" r="6" fill="#D2A06D" />
                        <circle cx="12" cy="16" r="2.5" fill="#D2A06D" />
                        <circle cx="20" cy="16" r="2.5" fill="#D2A06D" />
                        <circle cx="12" cy="16" r="1.5" fill="#C4915A" />
                        <circle cx="20" cy="16" r="1.5" fill="#C4915A" />
                        <circle cx="14" cy="20" r="1" fill="#1F1F1F" />
                        <circle cx="18" cy="20" r="1" fill="#1F1F1F" />
                        <ellipse cx="16" cy="23" rx="1.5" ry="1" fill="#B07D4F" />
                        {/* 하트 거울 */}
                        <path d="M37,18 Q37,14 40,14 Q43,14 43,18 Q43,14 46,14 Q49,14 49,18 Q49,24 43,28 Q37,24 37,18 Z" fill="#FFB6C1" />
                        <path d="M39,18 Q39,15.5 41,15.5 Q43,15.5 43,18 Q43,15.5 45,15.5 Q47,15.5 47,18 Q47,23 43,26 Q39,23 39,18 Z" fill="#E0F0FF" opacity="0.6" />
                        {/* 향수병 */}
                        <ellipse cx="58" cy="23" rx="4" ry="5" fill="#E9D5FF" opacity="0.7" stroke="#C084FC" strokeWidth="0.5" />
                        <rect x="56.5" y="17" width="3" height="3" rx="0.5" fill="#C084FC" />
                        <line x1="55" y1="17" x2="61" y2="17" stroke="#F472B6" strokeWidth="0.8" />
                    </svg>
                </div>
            );
        }

        // 민트 선반 (가드닝 - 덩굴 + 물뿌리개 + 토기 화분)
        if (shelfId === 'shelf_mint') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 70 55" width="70" height="55">
                        {/* 선반 */}
                        <rect x="5" y="28" width="60" height="4" rx="1" fill={sc} />
                        <rect x="5" y="28" width="60" height="2" rx="1" fill={scl} opacity="0.4" />
                        {/* 덩굴 (선반 아래로) */}
                        <path d="M12,32 Q8,38 12,42 Q16,46 12,50" fill="none" stroke="#4ADE80" strokeWidth="1.5" />
                        <circle cx="10" cy="36" r="2" fill="#4ADE80" opacity="0.7" />
                        <circle cx="14" cy="40" r="1.8" fill="#22C55E" opacity="0.7" />
                        <circle cx="10" cy="45" r="2" fill="#4ADE80" opacity="0.6" />
                        {/* 물뿌리개 */}
                        <ellipse cx="30" cy="23" rx="6" ry="5" fill="#67E8F9" />
                        <path d="M36,21 L44,17" stroke="#67E8F9" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="44" cy="16.5" r="1.5" fill="#67E8F9" opacity="0.6" />
                        <rect x="28" y="18" width="2" height="4" rx="1" fill="#22D3EE" />
                        {/* 토기 화분 2개 */}
                        <polygon points="48,28 51,28 52,22 47,22" fill="#C2956B" />
                        <ellipse cx="49.5" cy="20" rx="2" ry="3" fill="#4ADE80" />
                        <polygon points="56,28 59,28 60,23 55,23" fill="#B8865A" />
                        <ellipse cx="57.5" cy="21" rx="1.8" ry="2.5" fill="#22C55E" />
                    </svg>
                </div>
            );
        }

        // 라벤더 선반 (미스틱 - 수정구슬 + 캔들 + 타로 카드)
        if (shelfId === 'shelf_lavender') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 70 50" width="70" height="50">
                        {/* 선반 */}
                        <rect x="5" y="28" width="60" height="4" rx="1" fill={sc} />
                        <rect x="5" y="28" width="60" height="2" rx="1" fill={scl} opacity="0.4" />
                        {/* 수정구슬 */}
                        <circle cx="16" cy="21" r="6" fill="#C4B5FD" opacity="0.5" />
                        <circle cx="16" cy="21" r="6" fill="url(#crystalGrad)" opacity="0.4" />
                        <circle cx="14" cy="19" r="1.5" fill="white" opacity="0.5" />
                        <rect x="12" y="27" width="8" height="2" rx="0.5" fill="#7C3AED" opacity="0.7" />
                        {/* 캔들 */}
                        <rect x="34" y="18" width="6" height="10" rx="1" fill="#FDE68A" />
                        <rect x="36" y="14" width="2" height="4" rx="0.5" fill="#FFFBEB" />
                        <ellipse cx="37" cy="13" rx="2" ry="3" fill="#FB923C" opacity="0.8">
                            <animate attributeName="ry" values="3;2.5;3" dur="0.8s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.8;0.5;0.8" dur="0.8s" repeatCount="indefinite" />
                        </ellipse>
                        {/* 타로 카드 */}
                        <rect x="52" y="16" width="8" height="12" rx="0.8" fill="#581C87" transform="rotate(8 56 22)" />
                        <rect x="53" y="17.5" width="6" height="9" rx="0.5" fill="#7C3AED" opacity="0.5" transform="rotate(8 56 22)" />
                        <circle cx="56" cy="22" r="2" fill="#E9D5FF" opacity="0.4" transform="rotate(8 56 22)" />
                        <defs>
                            <radialGradient id="crystalGrad">
                                <stop offset="0%" stopColor="white" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
                            </radialGradient>
                        </defs>
                    </svg>
                </div>
            );
        }

        // fallback
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div
                    className="w-4/5 h-3 rounded-md shadow-md"
                    style={{
                        background: `linear-gradient(to bottom, ${scl}, ${sc})`,
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

    // 화분 미리보기 (고품질 플랜테리어 SVG — 5종 차별화 디자인)
    if (item.type === 'pot') {
        const potId = item.id;

        // ── 선인장 화분 (테라코타 원통 + 리브 세로주름 + 팔 2개 + 핑크 꽃) ──
        if (potId === 'pot_cactus') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 50 70" width="50" height="70">
                        <defs>
                            <linearGradient id="cp-pot" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#B84A32" />
                                <stop offset="38%" stopColor="#E07050" />
                                <stop offset="100%" stopColor="#A03828" />
                            </linearGradient>
                            <linearGradient id="cp-cac" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#4E8030" />
                                <stop offset="42%" stopColor="#7CC048" />
                                <stop offset="100%" stopColor="#407028" />
                            </linearGradient>
                            <linearGradient id="cp-arm" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#4A7830" />
                                <stop offset="50%" stopColor="#72B040" />
                                <stop offset="100%" stopColor="#3E6C28" />
                            </linearGradient>
                        </defs>
                        {/* ─ 화분 몸체: 테라코타 원통 하단 테이퍼 ─ */}
                        <path d="M10,48 L40,48 L37,66 Q25,69 13,66 Z" fill="url(#cp-pot)" />
                        <path d="M12,50 Q25,53 38,50 L36,65 Q25,67 14,65 Z" fill="rgba(255,255,255,0.07)" />
                        <path d="M12,56 Q25,59 38,56" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8" />
                        {/* ─ 흙 ─ */}
                        <ellipse cx="25" cy="48" rx="15" ry="3.5" fill="#2E1B0E" />
                        <ellipse cx="25" cy="47.2" rx="10" ry="2" fill="#4A2C12" />
                        {/* ─ 선인장 식물 그룹 ─ */}
                        <g className="animate-pot-breathe">
                            {/* 왼쪽 팔 */}
                            <path d="M20.5,38 Q11,35 10,27 Q9,19 14,19 Q19,19 20,26 Q20.5,32 20.5,38 Z" fill="url(#cp-arm)" />
                            <path d="M15,34 Q14,26 15,20" fill="none" stroke="rgba(40,80,20,0.5)" strokeWidth="0.8" />
                            <line x1="10.5" y1="25" x2="9" y2="24" stroke="rgba(255,255,255,0.8)" strokeWidth="0.6" strokeLinecap="round" />
                            <line x1="10" y1="28.5" x2="8.5" y2="28" stroke="rgba(255,255,255,0.8)" strokeWidth="0.6" strokeLinecap="round" />
                            {/* 오른쪽 팔 */}
                            <path d="M29.5,32 Q38,28 39,20 Q40,13 35,13 Q30,13 29.5,20 Q29,26 29.5,32 Z" fill="url(#cp-arm)" />
                            <path d="M34.5,28 Q35.5,21 34.5,14" fill="none" stroke="rgba(40,80,20,0.5)" strokeWidth="0.8" />
                            <line x1="39.5" y1="17" x2="41" y2="16.5" stroke="rgba(255,255,255,0.8)" strokeWidth="0.6" strokeLinecap="round" />
                            <line x1="39.5" y1="21" x2="41" y2="21" stroke="rgba(255,255,255,0.8)" strokeWidth="0.6" strokeLinecap="round" />
                            {/* 메인 몸통 */}
                            <path d="M18,48 Q17,22 25,13 Q33,22 32,48 Z" fill="url(#cp-cac)" />
                            {/* 세로 리브 (선인장 특유의 주름) */}
                            <path d="M21.5,47 Q21,23 25,14" fill="none" stroke="rgba(40,80,20,0.45)" strokeWidth="1.1" />
                            <path d="M25,47 Q24.5,21 25,13" fill="none" stroke="rgba(40,80,20,0.35)" strokeWidth="1" />
                            <path d="M28.5,47 Q29,23 25,14" fill="none" stroke="rgba(40,80,20,0.45)" strokeWidth="1.1" />
                            {/* 하이라이트 세로선 */}
                            <path d="M20,46 Q19,24 23.5,15" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2.2" />
                            {/* 가시 (짧고 흰 선들) */}
                            {[24, 31, 38].map(y => (
                                <g key={y}>
                                    <line x1="18.5" y1={y} x2="16.5" y2={y - 1.2} stroke="rgba(255,255,255,0.85)" strokeWidth="0.65" strokeLinecap="round" />
                                    <line x1="31.5" y1={y} x2="33.5" y2={y - 1.2} stroke="rgba(255,255,255,0.85)" strokeWidth="0.65" strokeLinecap="round" />
                                </g>
                            ))}
                            {/* 정수리 꽃 (핑크 6장 꽃잎) */}
                            {[0, 60, 120, 180, 240, 300].map(a => (
                                <ellipse key={a} cx="25" cy="13" rx="2.2" ry="4.5" fill="#F9B0CC" transform={`rotate(${a} 25 13)`} />
                            ))}
                            <circle cx="25" cy="13" r="2.5" fill="#FFE8B0" />
                            <circle cx="25" cy="13" r="1.1" fill="#FFCC60" />
                        </g>
                        {/* ─ 화분 림 (위로 튀어나온 테두리) ─ */}
                        <path d="M9,48 Q9,44 10.5,43.5 L39.5,43.5 Q41,44 41,48 Q41,50 25,51 Q9,50 9,48 Z" fill="#C85040" />
                        <ellipse cx="25" cy="43.5" rx="15" ry="2.2" fill="#D46050" />
                        <ellipse cx="25" cy="42.8" rx="12" ry="1.2" fill="rgba(255,255,255,0.2)" />
                    </svg>
                </div>
            );
        }

        // ── 몬스테라 화분 (흰 볼록 세라믹 + 넓은 찢잎 fenestration + 잎맥) ──
        if (potId === 'pot_monstera') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 50 70" width="50" height="70">
                        <defs>
                            <linearGradient id="mp-pot" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#D4CCC4" />
                                <stop offset="42%" stopColor="#F5F0EC" />
                                <stop offset="100%" stopColor="#C4BCB4" />
                            </linearGradient>
                            {/* 왼쪽 잎 구멍 마스크 */}
                            <mask id="mp-mL">
                                <rect width="50" height="70" fill="white" />
                                <ellipse cx="9.5" cy="24" rx="3.8" ry="2.4" fill="black" transform="rotate(-28 9.5 24)" />
                                <ellipse cx="7.5" cy="15" rx="3" ry="1.9" fill="black" transform="rotate(-22 7.5 15)" />
                            </mask>
                            {/* 오른쪽 잎 구멍 마스크 */}
                            <mask id="mp-mR">
                                <rect width="50" height="70" fill="white" />
                                <ellipse cx="40.5" cy="24" rx="3.8" ry="2.4" fill="black" transform="rotate(28 40.5 24)" />
                                <ellipse cx="42.5" cy="15" rx="3" ry="1.9" fill="black" transform="rotate(22 42.5 15)" />
                            </mask>
                            {/* 중앙 잎 구멍 마스크 */}
                            <mask id="mp-mC">
                                <rect width="50" height="70" fill="white" />
                                <ellipse cx="20.5" cy="11" rx="2.6" ry="2" fill="black" transform="rotate(-14 20.5 11)" />
                                <ellipse cx="29.5" cy="11" rx="2.6" ry="2" fill="black" transform="rotate(14 29.5 11)" />
                            </mask>
                        </defs>
                        {/* ─ 화분 몸체 (볼록 볼형 세라믹) ─ */}
                        <path d="M11,50 Q5,52 5,60 Q5,67 11,68 Q25,70 39,68 Q45,67 45,60 Q45,52 39,50 Q25,48 11,50 Z" fill="url(#mp-pot)" />
                        <path d="M13,52 Q25,55 37,52 Q37,64 25,66 Q13,64 13,52 Z" fill="rgba(255,255,255,0.1)" />
                        {/* 도자기 질감 띠 */}
                        <path d="M10,57 Q25,60 40,57" fill="none" stroke="rgba(180,170,160,0.25)" strokeWidth="0.7" />
                        {/* ─ 흙 ─ */}
                        <ellipse cx="25" cy="50" rx="14" ry="3.2" fill="#2E1B0E" />
                        <ellipse cx="25" cy="49.2" rx="10" ry="2" fill="#4A2C12" />
                        {/* ─ 식물 그룹 ─ */}
                        <g className="animate-pot-breathe">
                            {/* 줄기들 */}
                            <line x1="25" y1="51" x2="25" y2="30" stroke="#4A8040" strokeWidth="2.2" strokeLinecap="round" />
                            <path d="M25,43 Q17,39 13,32" fill="none" stroke="#4A8040" strokeWidth="1.6" strokeLinecap="round" />
                            <path d="M25,38 Q33,34 37,27" fill="none" stroke="#4A8040" strokeWidth="1.6" strokeLinecap="round" />
                            {/* 왼쪽 큰 잎 (fenestration 구멍) */}
                            <path d="M24,43 C14,39 4,28 5,16 C6,8 14,7 18,12 C21,17 20,30 24,43 Z" fill="#2E7A40" mask="url(#mp-mL)" />
                            <path d="M24,42 C16,33 9,22 10,13" fill="none" stroke="rgba(20,60,30,0.5)" strokeWidth="0.9" />
                            <path d="M14,38 Q10,30 10,20" fill="none" stroke="rgba(160,230,170,0.3)" strokeWidth="0.7" />
                            <path d="M18,40 Q16,31 16,20" fill="none" stroke="rgba(160,230,170,0.25)" strokeWidth="0.6" />
                            {/* 오른쪽 큰 잎 (fenestration 구멍) */}
                            <path d="M26,38 C36,32 46,21 45,10 C44,4 36,4 32,9 C29,14 30,27 26,38 Z" fill="#369048" mask="url(#mp-mR)" />
                            <path d="M26,37 C34,27 41,17 40,10" fill="none" stroke="rgba(20,60,30,0.5)" strokeWidth="0.9" />
                            <path d="M36,34 Q40,26 40,16" fill="none" stroke="rgba(160,230,170,0.3)" strokeWidth="0.7" />
                            {/* 중앙 위 잎 (fenestration 구멍) */}
                            <path d="M23,30 C18,18 20,8 25,3 C30,8 32,18 27,30 Z" fill="#2E7A40" mask="url(#mp-mC)" />
                            <path d="M25,30 C24,18 24,8 25,3" fill="none" stroke="rgba(20,60,30,0.45)" strokeWidth="0.9" />
                        </g>
                        {/* ─ 잎 칼라 ─ */}
                        <ellipse cx="25" cy="51" rx="12" ry="3.2" fill="#A4C89C" opacity="0.75" />
                        {/* ─ 화분 림 ─ */}
                        <ellipse cx="25" cy="50" rx="14" ry="2.8" fill="url(#mp-pot)" />
                        <ellipse cx="25" cy="49.2" rx="11" ry="1.6" fill="rgba(255,255,255,0.28)" />
                    </svg>
                </div>
            );
        }

        // ── 꽃 화분 (블러쉬 핑크 넓은 볼 + 잎덤불 + 데이지 3송이) ──
        if (potId === 'pot_flower') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 50 70" width="50" height="70">
                        <defs>
                            <linearGradient id="fp-pot" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#D890A0" />
                                <stop offset="42%" stopColor="#F8D0DC" />
                                <stop offset="100%" stopColor="#C87890" />
                            </linearGradient>
                        </defs>
                        {/* ─ 화분 몸체 (넓은 볼형) ─ */}
                        <path d="M7,54 Q4,55 4,62 Q4,68 7,69 Q25,71 43,69 Q46,68 46,62 Q46,55 43,54 Q25,52 7,54 Z" fill="url(#fp-pot)" />
                        <path d="M9,56 Q25,59 41,56 Q40,67 25,68.5 Q10,67 9,56 Z" fill="rgba(255,255,255,0.1)" />
                        <path d="M8,61 Q25,64 42,61" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.7" />
                        {/* ─ 흙 ─ */}
                        <ellipse cx="25" cy="54" rx="18" ry="3.8" fill="#2E1B0E" />
                        <ellipse cx="25" cy="53.2" rx="13" ry="2.2" fill="#4A2C12" />
                        {/* ─ 식물 그룹 ─ */}
                        <g className="animate-pot-sway">
                            {/* 잎 덤불 베이스 */}
                            <ellipse cx="25" cy="46" rx="18" ry="8" fill="#6AAA58" />
                            <ellipse cx="15" cy="44" rx="9" ry="6" fill="#7EC468" />
                            <ellipse cx="35" cy="44" rx="9" ry="6" fill="#7EC468" />
                            <ellipse cx="25" cy="41" rx="12" ry="6" fill="#88CC70" />
                            {/* 줄기 3개 (두꺼운 S자 곡선) */}
                            <path d="M18,51 Q14,43 13,24" fill="none" stroke="#5A9848" strokeWidth="2.2" strokeLinecap="round" />
                            <path d="M25,51 Q24,40 25,16" fill="none" stroke="#60A44E" strokeWidth="2.2" strokeLinecap="round" />
                            <path d="M32,51 Q36,43 37,24" fill="none" stroke="#5A9848" strokeWidth="2.2" strokeLinecap="round" />
                            {/* 잎사귀 쌍 (줄기 중간) */}
                            <ellipse cx="10" cy="35" rx="4" ry="2" fill="#78C060" transform="rotate(-40 10 35)" />
                            <ellipse cx="40" cy="37" rx="4" ry="2" fill="#78C060" transform="rotate(40 40 37)" />
                            <ellipse cx="20" cy="28" rx="3.5" ry="1.8" fill="#78C060" transform="rotate(-30 20 28)" />
                            <ellipse cx="30" cy="28" rx="3.5" ry="1.8" fill="#78C060" transform="rotate(30 30 28)" />
                            {/* 꽃 1 왼쪽 (핑크 데이지 5장 외층+5장 내층) */}
                            {[0, 72, 144, 216, 288].map(a => (
                                <ellipse key={`f1o${a}`} cx="13" cy="22" rx="2.8" ry="5.5" fill="#FDD0E0" transform={`rotate(${a} 13 22)`} />
                            ))}
                            {[36, 108, 180, 252, 324].map(a => (
                                <ellipse key={`f1i${a}`} cx="13" cy="22" rx="2.2" ry="4.5" fill="#FCB8D0" opacity="0.85" transform={`rotate(${a} 13 22)`} />
                            ))}
                            <circle cx="13" cy="22" r="3" fill="#FFE888" />
                            <circle cx="13" cy="22" r="1.4" fill="#FFD050" />
                            {/* 꽃 2 중앙 (라벤더 데이지 7장) */}
                            {[0, 51.4, 102.8, 154.3, 205.7, 257.1, 308.6].map(a => (
                                <ellipse key={`f2o${a}`} cx="25" cy="11" rx="2.6" ry="5.2" fill="#E8D8F8" transform={`rotate(${a} 25 11)`} />
                            ))}
                            {[25.7, 77.1, 128.6, 180, 231.4, 282.9, 334.3].map(a => (
                                <ellipse key={`f2i${a}`} cx="25" cy="11" rx="2" ry="4" fill="#D4B8F0" opacity="0.82" transform={`rotate(${a} 25 11)`} />
                            ))}
                            <circle cx="25" cy="11" r="3.2" fill="#FFE888" />
                            <circle cx="25" cy="11" r="1.5" fill="#FFD050" />
                            {/* 꽃 3 오른쪽 (피치 데이지 5장) */}
                            {[0, 72, 144, 216, 288].map(a => (
                                <ellipse key={`f3o${a}`} cx="37" cy="22" rx="2.5" ry="5" fill="#FFD8C0" transform={`rotate(${a} 37 22)`} />
                            ))}
                            {[36, 108, 180, 252, 324].map(a => (
                                <ellipse key={`f3i${a}`} cx="37" cy="22" rx="2" ry="4" fill="#FFBCA0" opacity="0.85" transform={`rotate(${a} 37 22)`} />
                            ))}
                            <circle cx="37" cy="22" r="2.8" fill="#FFE888" />
                            <circle cx="37" cy="22" r="1.3" fill="#FFD050" />
                        </g>
                        {/* ─ 잎 칼라 ─ */}
                        <ellipse cx="25" cy="55" rx="16" ry="4" fill="#90C880" opacity="0.8" />
                        <ellipse cx="15" cy="56.5" rx="6" ry="2.2" fill="#88C078" transform="rotate(-18 15 56.5)" />
                        <ellipse cx="35" cy="56.5" rx="6" ry="2.2" fill="#88C078" transform="rotate(18 35 56.5)" />
                        {/* ─ 화분 림 ─ */}
                        <ellipse cx="25" cy="54" rx="18" ry="3.2" fill="url(#fp-pot)" />
                        <ellipse cx="25" cy="53.2" rx="14.5" ry="1.8" fill="rgba(255,255,255,0.25)" />
                    </svg>
                </div>
            );
        }

        // ── 라벤더 화분 (크림 도자기 달걀형 + 5줄기 × 6노드 쌍타원 클러스터) ──
        if (potId === 'pot_lavender') {
            const lavStems = [
                { sx: 19, sy: 51, tx: 10, ty: 9 },
                { sx: 21, sy: 50, tx: 17, ty: 4 },
                { sx: 25, sy: 50, tx: 25, ty: 2 },
                { sx: 29, sy: 50, tx: 33, ty: 4 },
                { sx: 31, sy: 51, tx: 40, ty: 9 },
            ];
            const stemXs = [10, 17, 25, 33, 40];
            const stemTops = [9, 4, 2, 4, 9];
            const lavColors = ['#D0A8F0', '#C498E8', '#B888E0', '#AC78D8', '#A068D0'];
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 50 70" width="50" height="70">
                        <defs>
                            <linearGradient id="lp-pot" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#C8C4B0" />
                                <stop offset="42%" stopColor="#F5F0E0" />
                                <stop offset="100%" stopColor="#B8B4A0" />
                            </linearGradient>
                        </defs>
                        {/* ─ 화분 몸체 (크림 도자기 달걀형) ─ */}
                        <path d="M13,50 Q9,50 8,57 Q7,64 10,67 Q25,70 40,67 Q43,64 42,57 Q41,50 37,50 Q25,48 13,50 Z" fill="url(#lp-pot)" />
                        <path d="M15,52 Q25,55 35,52 Q34,66 25,67.5 Q16,66 15,52 Z" fill="rgba(255,255,255,0.1)" />
                        {/* 도자기 장식 띠 */}
                        <path d="M14,57 Q25,60 36,57" fill="none" stroke="rgba(180,170,140,0.35)" strokeWidth="0.7" />
                        <path d="M13,62 Q25,65 37,62" fill="none" stroke="rgba(180,170,140,0.25)" strokeWidth="0.5" />
                        {/* ─ 흙 ─ */}
                        <ellipse cx="25" cy="50" rx="12.5" ry="3" fill="#2E1B0E" />
                        <ellipse cx="25" cy="49.3" rx="9" ry="1.8" fill="#4A2C12" />
                        {/* ─ 식물 그룹 ─ */}
                        <g className="animate-pot-sway">
                            {/* 줄기 5개 (곡선 path) */}
                            {lavStems.map((s, i) => (
                                <path key={i} d={`M${s.sx},${s.sy} Q${s.tx + 2},${(s.sy + s.ty) / 2} ${s.tx},${s.ty}`}
                                    fill="none" stroke="#8AB870" strokeWidth="1.4" strokeLinecap="round" />
                            ))}
                            {/* 잎사귀 쌍 (줄기 중간부) */}
                            {[
                                { cx: 13, cy: 35, r: -25 }, { cx: 37, cy: 35, r: 25 },
                                { cx: 19, cy: 28, r: -20 }, { cx: 31, cy: 28, r: 20 },
                            ].map((l, i) => (
                                <ellipse key={i} cx={l.cx} cy={l.cy} rx="3.5" ry="1.8" fill="#94C878" transform={`rotate(${l.r} ${l.cx} ${l.cy})`} />
                            ))}
                            {/* 꽃송이 클러스터 (각 줄기 × 6노드 쌍타원) */}
                            {stemXs.map((sx, si) => {
                                const ty = stemTops[si];
                                return (
                                    <g key={si}>
                                        {[0, 3.5, 7, 10.5, 14, 17.5].map((dy, di) => (
                                            <g key={di}>
                                                <ellipse
                                                    cx={sx - 1.8} cy={ty + dy}
                                                    rx={Math.max(2.2 - di * 0.22, 0.8)} ry={Math.max((2.2 - di * 0.22) * 1.5, 1.2)}
                                                    fill={lavColors[Math.min(di, 4)]}
                                                    transform={`rotate(-12 ${sx - 1.8} ${ty + dy})`}
                                                />
                                                <ellipse
                                                    cx={sx + 1.8} cy={ty + dy}
                                                    rx={Math.max(2.2 - di * 0.22, 0.8)} ry={Math.max((2.2 - di * 0.22) * 1.5, 1.2)}
                                                    fill={lavColors[Math.min(di, 4)]}
                                                    transform={`rotate(12 ${sx + 1.8} ${ty + dy})`}
                                                />
                                            </g>
                                        ))}
                                        {/* 꼭대기 꽃봉오리 */}
                                        <ellipse cx={sx} cy={ty - 2} rx="1.5" ry="2.5" fill="#C898E8" />
                                        <ellipse cx={sx} cy={ty - 4.5} rx="1" ry="1.5" fill="#D8A8F0" />
                                    </g>
                                );
                            })}
                        </g>
                        {/* ─ 잎 칼라 ─ */}
                        <ellipse cx="25" cy="51" rx="11" ry="3.2" fill="#B0C898" opacity="0.75" />
                        <ellipse cx="18" cy="52.2" rx="4.5" ry="1.8" fill="#A8C090" transform="rotate(-15 18 52.2)" />
                        <ellipse cx="32" cy="52.2" rx="4.5" ry="1.8" fill="#A8C090" transform="rotate(15 32 52.2)" />
                        {/* ─ 화분 림 ─ */}
                        <ellipse cx="25" cy="50" rx="12.5" ry="2.8" fill="url(#lp-pot)" />
                        <ellipse cx="25" cy="49.2" rx="10" ry="1.5" fill="rgba(255,255,255,0.25)" />
                    </svg>
                </div>
            );
        }

        // ── 장미 화분 (다크 원통 + 골드 림 + 잎덤불 + 소용돌이 장미 3송이) ──
        if (potId === 'pot_rose') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 50 70" width="50" height="70">
                        <defs>
                            <linearGradient id="rp-pot" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#524848" />
                                <stop offset="42%" stopColor="#746868" />
                                <stop offset="100%" stopColor="#423838" />
                            </linearGradient>
                            <linearGradient id="rp-gold" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#A88040" />
                                <stop offset="38%" stopColor="#DDB860" />
                                <stop offset="100%" stopColor="#986830" />
                            </linearGradient>
                        </defs>
                        {/* ─ 화분 몸체 (모던 원통) ─ */}
                        <rect x="10" y="50" width="30" height="18" rx="1" fill="url(#rp-pot)" />
                        <rect x="12" y="52" width="26" height="14" fill="rgba(255,255,255,0.05)" />
                        <path d="M11,56 Q25,58 39,56" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.7" />
                        <path d="M11,62 Q25,64 39,62" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                        <ellipse cx="25" cy="68" rx="15" ry="2" fill="#383030" />
                        {/* ─ 골드 림 ─ */}
                        <rect x="9" y="47" width="32" height="5" rx="1.5" fill="url(#rp-gold)" />
                        <rect x="10" y="47.5" width="30" height="2" rx="1" fill="rgba(255,255,255,0.2)" />
                        {/* ─ 흙 ─ */}
                        <ellipse cx="25" cy="50" rx="15" ry="3.2" fill="#2E1B0E" />
                        <ellipse cx="25" cy="49.2" rx="11" ry="2" fill="#4A2C12" />
                        {/* ─ 식물 그룹 ─ */}
                        <g className="animate-pot-breathe">
                            {/* 잎 덤불 (여러 타원 겹침) */}
                            <ellipse cx="25" cy="37" rx="19" ry="13" fill="#5A9848" />
                            <ellipse cx="15" cy="33" rx="12" ry="10" fill="#68A855" />
                            <ellipse cx="36" cy="33" rx="12" ry="10" fill="#5A9848" opacity="0.9" />
                            <ellipse cx="25" cy="27" rx="14" ry="9" fill="#74B860" opacity="0.85" />
                            <ellipse cx="9" cy="41" rx="7" ry="5" fill="#68A855" opacity="0.65" />
                            <ellipse cx="41" cy="41" rx="7" ry="5" fill="#68A855" opacity="0.65" />
                            {/* 장미 1 왼쪽 (5겹 소용돌이 arc) */}
                            <circle cx="13" cy="29" r="7.5" fill="#D87080" />
                            <path d="M13,21.5 Q21,21 21,29 Q21,37 13,37 Q5,34 5,29 Q5,21.5 13,21.5 Z" fill="#E89098" />
                            <path d="M13,23.5 Q19.5,23.5 19.5,29 Q19.5,34.5 13,35" fill="#F0AABA" opacity="0.9" />
                            <path d="M13,26 Q18,26.5 18,29.5 Q17.5,33.5 13,33" fill="#F8C8D4" opacity="0.82" />
                            <path d="M13,28 Q16.5,28.5 16.5,30 Q16,32.5 13,32" fill="#FEDED8" opacity="0.72" />
                            <path d="M13,29.5 Q15,30 15,31" fill="none" stroke="#FFCDD4" strokeWidth="0.8" opacity="0.5" />
                            <circle cx="12" cy="24.5" r="1.5" fill="rgba(255,255,255,0.28)" />
                            {/* 장미 2 중앙 (가장 크고 선명, 5겹) */}
                            <circle cx="25" cy="18" r="9.5" fill="#C86070" />
                            <path d="M25,8.5 Q35.5,8.5 35.5,18 Q35.5,27.5 25,27.5 Q15.5,24.5 15.5,18 Q16,11.5 25,8.5 Z" fill="#D87888" />
                            <path d="M25,11 Q33.5,11.5 33.5,18 Q33,25 25,25" fill="#E898A8" opacity="0.9" />
                            <path d="M25,14 Q31,14.5 31,18.5 Q30.5,23.5 25,23" fill="#F4B0C0" opacity="0.85" />
                            <path d="M25,17 Q29,17.5 29,19 Q28.5,22 25,21.5" fill="#FDD0D8" opacity="0.75" />
                            <path d="M25,19.5 Q27,20 27,21" fill="none" stroke="#FDE0E8" strokeWidth="0.9" opacity="0.5" />
                            <circle cx="24" cy="13" r="2" fill="rgba(255,255,255,0.28)" />
                            {/* 장미 3 오른쪽 (5겹) */}
                            <circle cx="37" cy="30" r="7" fill="#D87888" />
                            <path d="M37,23 Q44,23 44,30 Q44,37 37,37 Q30,34 29.5,30 Q30,23 37,23 Z" fill="#E898A8" />
                            <path d="M37,25.5 Q42.5,25.5 42.5,30 Q42,35 37,34.5" fill="#F4B0C0" opacity="0.88" />
                            <path d="M37,28 Q41,28.5 41,30.5 Q40.5,34 37,33.5" fill="#FDD0D8" opacity="0.75" />
                            <path d="M37,30.5 Q39.5,31 39.5,32" fill="none" stroke="#FDE0E8" strokeWidth="0.8" opacity="0.5" />
                            <circle cx="36" cy="27" r="1.4" fill="rgba(255,255,255,0.28)" />
                        </g>
                        {/* ─ 잎 칼라 ─ */}
                        <ellipse cx="25" cy="51" rx="14" ry="4" fill="#68A858" opacity="0.8" />
                        <ellipse cx="15" cy="52.5" rx="5.5" ry="2" fill="#60A050" transform="rotate(-18 15 52.5)" />
                        <ellipse cx="35" cy="52.5" rx="5.5" ry="2" fill="#60A050" transform="rotate(18 35 52.5)" />
                    </svg>
                </div>
            );
        }

        // fallback
        return (
            <div className="w-full h-full flex flex-col items-center justify-end pb-2">
                <div
                    className="w-8 h-8 rounded-full mb-1"
                    style={{ background: `radial-gradient(circle, ${item.plantColor}, ${item.plantColor}DD)` }}
                ></div>
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

    // 방석 미리보기 (cushionType별 고유 형태)
    if (item.type === 'cushion') {
        const cId = item.id;

        // 기본 방석 (둥근 사각형)
        if (cId === 'cushion_pink') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 60 40" width="56" height="38">
                        <rect x="3" y="6" width="54" height="28" rx="10" fill={item.color} />
                        <rect x="3" y="6" width="54" height="14" rx="10" fill="white" opacity="0.2" />
                        <ellipse cx="30" cy="34" rx="24" ry="3" fill="rgba(0,0,0,0.1)" />
                        {/* 스티치 */}
                        <rect x="10" y="16" width="40" height="0.8" rx="0.4" fill={item.colorDark} opacity="0.3" />
                    </svg>
                </div>
            );
        }

        // 구름 방석 (거대한 뭉게구름)
        if (cId === 'cushion_blue') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 64 40" width="60" height="38">
                        <ellipse cx="32" cy="34" rx="28" ry="3" fill="rgba(0,0,0,0.08)" />
                        {/* 구름 베이스 */}
                        <ellipse cx="32" cy="28" rx="30" ry="9" fill="#E8F4FD" />
                        {/* 구름 봉우리들 */}
                        <ellipse cx="16" cy="24" rx="11" ry="10" fill={item.color} />
                        <ellipse cx="48" cy="24" rx="11" ry="10" fill={item.color} />
                        <ellipse cx="32" cy="20" rx="16" ry="14" fill="white" />
                        <ellipse cx="22" cy="22" rx="12" ry="11" fill={item.color} opacity="0.7" />
                        <ellipse cx="42" cy="22" rx="12" ry="11" fill={item.color} opacity="0.7" />
                        <ellipse cx="10" cy="26" rx="8" ry="7" fill={item.color} opacity="0.8" />
                        <ellipse cx="54" cy="26" rx="8" ry="7" fill={item.color} opacity="0.8" />
                        {/* 하이라이트 */}
                        <ellipse cx="28" cy="14" rx="10" ry="5" fill="white" opacity="0.5" />
                        <ellipse cx="20" cy="18" rx="5" ry="3" fill="white" opacity="0.3" />
                    </svg>
                </div>
            );
        }

        // 벨벳 방석 (황실 고급 + 금테)
        if (cId === 'cushion_purple') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 64 45" width="60" height="42">
                        <ellipse cx="32" cy="38" rx="26" ry="3" fill="rgba(0,0,0,0.1)" />
                        {/* 두꺼운 금테 */}
                        <ellipse cx="32" cy="24" rx="30" ry="16" fill="#DAA520" />
                        <ellipse cx="32" cy="24" rx="30" ry="16" fill="url(#goldGrad2)" />
                        {/* 벨벳 본체 */}
                        <ellipse cx="32" cy="24" rx="27" ry="14" fill="#7B1FA2" />
                        <ellipse cx="32" cy="24" rx="27" ry="14" fill="url(#velvetGrad2)" />
                        {/* 터프팅 주름 */}
                        <path d="M32,24 L8,14" stroke="white" strokeWidth="0.4" opacity="0.15" />
                        <path d="M32,24 L56,14" stroke="white" strokeWidth="0.4" opacity="0.15" />
                        <path d="M32,24 L8,34" stroke="white" strokeWidth="0.4" opacity="0.15" />
                        <path d="M32,24 L56,34" stroke="white" strokeWidth="0.4" opacity="0.15" />
                        <path d="M32,24 L32,10" stroke="white" strokeWidth="0.4" opacity="0.12" />
                        <path d="M32,24 L32,38" stroke="white" strokeWidth="0.4" opacity="0.12" />
                        <path d="M32,24 L10,24" stroke="white" strokeWidth="0.4" opacity="0.12" />
                        <path d="M32,24 L54,24" stroke="white" strokeWidth="0.4" opacity="0.12" />
                        {/* 금색 단추 */}
                        <circle cx="32" cy="24" r="4" fill="#FFD700" />
                        <circle cx="32" cy="24" r="2.5" fill="#DAA520" />
                        <circle cx="31" cy="23" r="1" fill="white" opacity="0.4" />
                        {/* 하이라이트 */}
                        <ellipse cx="28" cy="17" rx="12" ry="5" fill="white" opacity="0.12" />
                        <defs>
                            <radialGradient id="velvetGrad2">
                                <stop offset="0%" stopColor="#9C27B0" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#4A148C" stopOpacity="0.5" />
                            </radialGradient>
                            <linearGradient id="goldGrad2" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#FFD700" stopOpacity="0.6" />
                                <stop offset="50%" stopColor="#B8860B" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#FFD700" stopOpacity="0.6" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            );
        }

        // 꽃 모양 방석 (둥근 꽃잎 6장 + 꽃술)
        if (cId === 'cushion_yellow') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 64 44" width="60" height="42">
                        <defs>
                            <radialGradient id="flowerCenter">
                                <stop offset="0%" stopColor="#FFF8E1" />
                                <stop offset="50%" stopColor="#FFCA28" />
                                <stop offset="100%" stopColor="#FF9800" />
                            </radialGradient>
                        </defs>
                        {/* 그림자 */}
                        <ellipse cx="32" cy="40" rx="26" ry="3" fill="rgba(0,0,0,0.08)" />
                        {/* 꽃잎 6장 (넓고 둥글게 펼쳐짐) */}
                        <ellipse cx="16" cy="14" rx="12" ry="9" fill="#FFE082" transform="rotate(-20 16 14)" />
                        <ellipse cx="48" cy="14" rx="12" ry="9" fill="#FFE082" transform="rotate(20 48 14)" />
                        <ellipse cx="6" cy="24" rx="12" ry="8" fill="#FFD54F" transform="rotate(-5 6 24)" />
                        <ellipse cx="58" cy="24" rx="12" ry="8" fill="#FFD54F" transform="rotate(5 58 24)" />
                        <ellipse cx="16" cy="34" rx="11" ry="8" fill="#FFC107" transform="rotate(15 16 34)" />
                        <ellipse cx="48" cy="34" rx="11" ry="8" fill="#FFC107" transform="rotate(-15 48 34)" />
                        {/* 꽃잎 하이라이트 */}
                        <ellipse cx="16" cy="12" rx="6" ry="3.5" fill="white" opacity="0.3" transform="rotate(-20 16 12)" />
                        <ellipse cx="48" cy="12" rx="6" ry="3.5" fill="white" opacity="0.3" transform="rotate(20 48 12)" />
                        {/* 중앙 꽃술 */}
                        <ellipse cx="32" cy="24" rx="16" ry="12" fill="url(#flowerCenter)" />
                        {/* 꽃술 하이라이트 */}
                        <ellipse cx="28" cy="20" rx="8" ry="4" fill="white" opacity="0.3" />
                        {/* 질감 */}
                        <circle cx="28" cy="21" r="1" fill="white" opacity="0.5" />
                        <circle cx="35" cy="25" r="0.7" fill="white" opacity="0.4" />
                        {/* 스티치 */}
                        <ellipse cx="32" cy="24" rx="10" ry="7" fill="none" stroke={item.colorDark} strokeWidth="0.5" strokeDasharray="2,2" opacity="0.25" />
                    </svg>
                </div>
            );
        }

        // 나뭇잎 방석 (대형 몬스테라 매트)
        if (cId === 'cushion_mint') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 64 45" width="60" height="42">
                        {/* 잎 본체 (하트형) */}
                        <path d="M32,4 Q52,4 58,22 Q62,34 50,40 Q42,44 32,42 Q22,44 14,40 Q2,34 6,22 Q12,4 32,4 Z"
                            fill={item.color} />
                        <path d="M32,7 Q50,7 55,22 Q58,32 48,38 Q40,42 32,40 Q24,42 16,38 Q6,32 9,22 Q14,7 32,7 Z"
                            fill={item.colorDark} opacity="0.35" />
                        {/* 중앙 잎맥 */}
                        <path d="M32,5 L32,42" stroke="#2E7D32" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
                        {/* 좌우 잎맥 */}
                        <path d="M32,14 Q22,12 10,20" fill="none" stroke="#2E7D32" strokeWidth="1" opacity="0.22" />
                        <path d="M32,14 Q42,12 54,20" fill="none" stroke="#2E7D32" strokeWidth="1" opacity="0.22" />
                        <path d="M32,24 Q20,22 8,30" fill="none" stroke="#2E7D32" strokeWidth="0.8" opacity="0.18" />
                        <path d="M32,24 Q44,22 56,30" fill="none" stroke="#2E7D32" strokeWidth="0.8" opacity="0.18" />
                        <path d="M32,32 Q24,30 16,36" fill="none" stroke="#2E7D32" strokeWidth="0.6" opacity="0.15" />
                        <path d="M32,32 Q40,30 48,36" fill="none" stroke="#2E7D32" strokeWidth="0.6" opacity="0.15" />
                        {/* 하이라이트 */}
                        <ellipse cx="26" cy="16" rx="10" ry="5" fill="white" opacity="0.2" transform="rotate(-5 26 16)" />
                        {/* 물방울 */}
                        <ellipse cx="32" cy="4" rx="1.5" ry="2" fill="#4ADE80" opacity="0.5" />
                    </svg>
                </div>
            );
        }

        // fallback
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
// 아이템 ID별 정교한 아이콘 매핑
const getItemIcon = (item) => {
    const idMap = {
        // 테마
        theme_ocean:   { name: 'cloud',   color: '#4FC3F7' },
        theme_autumn:  { name: 'leaf',    color: '#FF7043' },
        theme_galaxy:  { name: 'star',    color: '#9370DB' },
        theme_default: { name: 'sun',     color: '#FFB74D' },
        // 무드등
        light_warm:    { name: 'sun',     color: '#FF8A65' },
        light_pink:    { name: 'flower',  color: '#F48FB1' },
        light_mint:    { name: 'leaf',    color: '#EF5350' },
        light_blue:    { name: 'moon',    color: '#FFE082' },
        light_rainbow: { name: 'water',   color: '#CE93D8' },
        // 선반
        shelf_wood:     { name: 'leaf',    color: '#D4A373' },
        shelf_white:    { name: 'sparkle', color: '#90A4AE' },
        shelf_pastel:   { name: 'heart',   color: '#F48FB1' },
        shelf_mint:     { name: 'leaf',    color: '#66BB6A' },
        shelf_lavender: { name: 'moon',    color: '#B39DDB' },
        // 화분
        pot_monstera:  { name: 'leaf',   color: '#4CAF50' },
        pot_cactus:    { name: 'sun',    color: '#388E3C' },
        pot_flower:    { name: 'flower', color: '#EC407A' },
        pot_lavender:  { name: 'flower', color: '#AB47BC' },
        pot_rose:      { name: 'rose',   color: '#E53935' },
        // 방석
        cushion_pink:   { name: 'heart',   color: '#F48FB1' },
        cushion_blue:   { name: 'cloud',   color: '#4FC3F7' },
        cushion_purple: { name: 'sparkle', color: '#CE93D8' },
        cushion_yellow: { name: 'flower',  color: '#FFB74D' },
        cushion_mint:   { name: 'leaf',    color: '#66BB6A' },
    };
    return idMap[item.id] || { name: 'sparkle', color: '#FFD59E' };
};

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
                        상점
                    </h1>
                </div>

                {/* 코인 표시 */}
                <div className="bg-white/90 px-4 py-2 rounded-full shadow-md border-2 border-white">
                    <div className="flex items-center gap-2">
                        <MongleIcon name="coin" size={18} />
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
                        테마
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
                        가구
                    </button>
                </div>
            </div>

            {/* 가구 필터 (가구 탭일 때만 표시) */}
            {activeTab === 'furniture' && (
                <div className="px-6 pb-4">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {[
                            { id: 'all', label: '전체', emoji: '' },
                            { id: 'shelf', label: '선반', emoji: '' },
                            { id: 'light', label: '무드등', emoji: '' },
                            { id: 'pot', label: '화분', emoji: '' },
                            { id: 'cushion', label: '방석', emoji: '' }
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
                                <h3 className="text-sm font-bold text-gray-800 text-center mb-1 flex items-center justify-center gap-1.5">
                                    <MongleIcon name={getItemIcon(item).name} size={16} color={getItemIcon(item).color} />
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
                                                <span className="text-xs font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full flex items-center gap-1">
                                                    <MongleIcon name="coin" size={14} /> {item.price}
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
                        <div className="mb-4"><MongleIcon name="search" size={56} /></div>
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
