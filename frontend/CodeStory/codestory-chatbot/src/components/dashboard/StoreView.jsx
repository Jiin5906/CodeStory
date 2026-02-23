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

    // 화분 미리보기 (ToDoUpgrade.txt 기준 통합 SVG)
    if (item.type === 'pot') {
        const potId = item.id;

        // ── 1. 피치 선인장 ──
        if (potId === 'pot_cactus') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
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
        }

        // ── 2. 기본 화분 (몬스테라) ──
        if (potId === 'pot_monstera') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
                        <defs>
                            <linearGradient id="sv-leaf-dark" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#00897B"/>
                                <stop offset="100%" stopColor="#004D40"/>
                            </linearGradient>
                            <linearGradient id="sv-leaf-mid" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#26A69A"/>
                                <stop offset="100%" stopColor="#00796B"/>
                            </linearGradient>
                            <linearGradient id="sv-leaf-light" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#4DB6AC"/>
                                <stop offset="100%" stopColor="#00897B"/>
                            </linearGradient>
                        </defs>
                        <ellipse cx="60" cy="150" rx="22" ry="4" fill="rgba(0,0,0,0.14)"/>
                        <path d="M 33 108 L 39 145 Q 60 153 81 145 L 87 108 Z" fill="#B8956A"/>
                        <path d="M 33 108 L 39 145 L 43 144 L 37 108 Z" fill="#CDAA80" opacity="0.7"/>
                        <g className="animate-pot-breathe" transform="translate(0, 8)">
                            <path d="M 30 95 Q 60 30 90 95 Z" fill="url(#sv-leaf-dark)"/>
                            <ellipse cx="60" cy="40" rx="16" ry="34" fill="url(#sv-leaf-dark)"/>
                            <ellipse cx="35" cy="55" rx="14" ry="30" fill="url(#sv-leaf-dark)" transform="rotate(-30 35 55)"/>
                            <ellipse cx="85" cy="55" rx="14" ry="30" fill="url(#sv-leaf-dark)" transform="rotate(30 85 55)"/>
                            <ellipse cx="20" cy="75" rx="12" ry="24" fill="url(#sv-leaf-dark)" transform="rotate(-55 20 75)"/>
                            <ellipse cx="100" cy="75" rx="12" ry="24" fill="url(#sv-leaf-dark)" transform="rotate(55 100 75)"/>
                            <ellipse cx="45" cy="55" rx="16" ry="32" fill="url(#sv-leaf-mid)" transform="rotate(-15 45 55)"/>
                            <ellipse cx="75" cy="55" rx="16" ry="32" fill="url(#sv-leaf-mid)" transform="rotate(15 75 55)"/>
                            <ellipse cx="60" cy="65" rx="18" ry="34" fill="url(#sv-leaf-light)"/>
                            <ellipse cx="35" cy="80" rx="14" ry="24" fill="url(#sv-leaf-light)" transform="rotate(-40 35 80)"/>
                            <ellipse cx="85" cy="80" rx="14" ry="24" fill="url(#sv-leaf-light)" transform="rotate(40 85 80)"/>
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
        }

        // ── 3. 스프링 데이지 (꽃화분) ──
        if (potId === 'pot_flower') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
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
        }

        // ── 4. 라일락 라벤더 ──
        if (potId === 'pot_lavender') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
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
        }

        // ── 5. 로즈 골드 팟 ──
        if (potId === 'pot_rose') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
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
        <div className="fixed inset-0 z-[150] bg-gradient-to-b from-[#FFF8F3] via-[#FFE8F0] to-[#F5E8FF] flex flex-col">
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
                                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border-2 border-white hover:shadow-xl transition-all flex flex-col"
                                data-gtm={`store-item-${item.id}`}
                            >
                                {/* 아이템 미리보기 */}
                                <div className="h-20 mb-3 rounded-xl bg-gradient-to-b from-gray-50 to-gray-100">
                                    <ItemPreview item={item} />
                                </div>

                                {/* 아이템 정보 */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-gray-800 text-center mb-1 truncate whitespace-nowrap">
                                        {item.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 text-center mb-3 truncate">
                                        {item.description}
                                    </p>
                                </div>

                                {/* 가격 및 버튼 */}
                                <div className="flex flex-col gap-2 mt-auto">
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
