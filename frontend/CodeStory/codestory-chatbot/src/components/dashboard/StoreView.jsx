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

    // 화분 미리보기 (plantType별 고유 SVG — 플랜테리어 고품질 일러스트)
    if (item.type === 'pot') {
        const potId = item.id;

        // ── 선인장 화분 (테라코타 항아리 + 세로 주름 + 가시 + 핑크 꽃) ──
        if (potId === 'pot_cactus') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 50 70" width="50" height="70">
                        <defs>
                            <linearGradient id="cact-3d" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
                                <stop offset="28%" stopColor="rgba(255,255,255,0.15)" />
                                <stop offset="68%" stopColor="rgba(0,0,0,0)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
                            </linearGradient>
                        </defs>
                        {/* 화분 본체 */}
                        <path d="M8,52 Q5,52 5,60 Q5,67 8,68 Q25,70 42,68 Q45,67 45,60 Q45,52 42,52 Q25,50 8,52Z" fill={item.potColor} />
                        <path d="M8,52 Q5,52 5,60 Q5,67 8,68 Q25,70 42,68 Q45,67 45,60 Q45,52 42,52 Q25,50 8,52Z" fill="url(#cact-3d)" />
                        {/* 흙 이중 타원 */}
                        <ellipse cx="25" cy="52" rx="17" ry="3.5" fill="#2E1B0E" />
                        <ellipse cx="25" cy="52" rx="13.5" ry="2.3" fill="#4A2912" />
                        {/* 식물 그룹 — 호흡 애니메이션 */}
                        <g className="animate-pot-breathe">
                            {/* 왼쪽 팔 */}
                            <path d="M19,37 Q13,35 11,28 Q10,21 14,21 Q18,21 19.5,27 Q20,33 19,37Z" fill={item.plantColor} />
                            <path d="M13,25 Q12,28 12.5,32" fill="none" stroke="#1B5E20" strokeWidth="0.6" />
                            <line x1="13.5" y1="24" x2="11.5" y2="22.5" stroke="rgba(255,255,255,0.8)" strokeWidth="0.6" />
                            <line x1="13.5" y1="27" x2="11" y2="26" stroke="rgba(255,255,255,0.8)" strokeWidth="0.6" />
                            {/* 오른쪽 팔 */}
                            <path d="M31,33 Q38,30 40,23 Q40,16 36,16 Q32,16 31,22 Q30.5,27 31,33Z" fill={item.plantColor} />
                            <line x1="37.5" y1="19" x2="39.5" y2="17.5" stroke="rgba(255,255,255,0.8)" strokeWidth="0.6" />
                            <line x1="37.5" y1="22" x2="40" y2="21" stroke="rgba(255,255,255,0.8)" strokeWidth="0.6" />
                            {/* 메인 몸체 */}
                            <path d="M18,52 Q15,34 20,18 Q25,12 30,18 Q35,34 32,52Z" fill={item.plantColor} />
                            {/* 세로 주름(ribs) */}
                            <path d="M21.5,51 Q19.5,33 22,19" fill="none" stroke="#1B5E20" strokeWidth="0.9" opacity="0.65" />
                            <path d="M25,51 Q23,32 25,16" fill="none" stroke="#1B5E20" strokeWidth="0.9" opacity="0.55" />
                            <path d="M28.5,51 Q30.5,33 28,19" fill="none" stroke="#1B5E20" strokeWidth="0.9" opacity="0.65" />
                            {/* 하이라이트 */}
                            <path d="M19.5,49 Q17.5,33 20.5,20" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2.2" />
                            {/* 가시 선들 */}
                            {[28, 36, 44].map(y => (
                                <g key={y}>
                                    <line x1="19.5" y1={y} x2="17" y2={y - 1.5} stroke="rgba(255,255,255,0.88)" strokeWidth="0.65" />
                                    <line x1="30.5" y1={y} x2="33" y2={y - 1.5} stroke="rgba(255,255,255,0.88)" strokeWidth="0.65" />
                                </g>
                            ))}
                            <line x1="25" y1="22" x2="25" y2="19" stroke="rgba(255,255,255,0.88)" strokeWidth="0.65" />
                            {/* 꼭대기 핑크 꽃 6장 */}
                            {[0, 60, 120, 180, 240, 300].map(a => (
                                <ellipse key={a} cx="25" cy="12" rx="2.2" ry="4.3" fill="#F48FB1" transform={`rotate(${a} 25 12)`} />
                            ))}
                            <circle cx="25" cy="12" r="2.4" fill="#FFD54F" />
                            <circle cx="25" cy="12" r="1.1" fill="#FF8F00" />
                        </g>
                        {/* 화분 림 */}
                        <ellipse cx="25" cy="52" rx="17" ry="3" fill={item.potColor} />
                        <ellipse cx="25" cy="52" rx="17" ry="3" fill="url(#cact-3d)" />
                        <ellipse cx="25" cy="51.2" rx="15" ry="1.8" fill="white" opacity="0.14" />
                    </svg>
                </div>
            );
        }

        // ── 몬스테라 화분 (볼록 세라믹 + C bezier 잎 + mask 구멍 + 잎맥) ──
        if (potId === 'pot_monstera') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 50 70" width="50" height="70">
                        <defs>
                            <linearGradient id="mon-3d" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
                                <stop offset="28%" stopColor="rgba(255,255,255,0.18)" />
                                <stop offset="70%" stopColor="rgba(0,0,0,0)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
                            </linearGradient>
                            <mask id="mon-L">
                                <rect width="50" height="70" fill="white" />
                                <ellipse cx="11" cy="22" rx="3.5" ry="2.2" fill="black" transform="rotate(-30 11 22)" />
                                <ellipse cx="9" cy="14" rx="3" ry="2" fill="black" transform="rotate(-25 9 14)" />
                            </mask>
                            <mask id="mon-R">
                                <rect width="50" height="70" fill="white" />
                                <ellipse cx="39" cy="22" rx="3.5" ry="2.2" fill="black" transform="rotate(30 39 22)" />
                                <ellipse cx="41" cy="14" rx="3" ry="2" fill="black" transform="rotate(25 41 14)" />
                            </mask>
                        </defs>
                        {/* 화분 본체 — 볼록 배불뚝이 세라믹 */}
                        <path d="M13,52 Q7,51 5,57 Q4,63 7,67 Q25,70 43,67 Q46,63 45,57 Q43,51 37,52 Q25,50 13,52Z" fill={item.potColor} />
                        <path d="M13,52 Q7,51 5,57 Q4,63 7,67 Q25,70 43,67 Q46,63 45,57 Q43,51 37,52 Q25,50 13,52Z" fill="url(#mon-3d)" />
                        {/* 흙 이중 타원 */}
                        <ellipse cx="25" cy="52" rx="12.5" ry="3" fill="#2E1B0E" />
                        <ellipse cx="25" cy="52" rx="9.5" ry="2" fill="#4A2912" />
                        {/* 식물 그룹 — 호흡 애니메이션 */}
                        <g className="animate-pot-breathe">
                            {/* 줄기 */}
                            <line x1="25" y1="50" x2="25" y2="32" stroke="#2E7D32" strokeWidth="2.2" strokeLinecap="round" />
                            <line x1="25" y1="44" x2="15" y2="32" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="25" y1="40" x2="36" y2="28" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" />
                            {/* 왼쪽 잎 — mask로 fenestration 구멍 표현 */}
                            <path d="M22,35 C12,32 4,22 5,12 C6,5 14,4 18,9 C20,13 19,24 22,35Z"
                                fill={item.plantColor} mask="url(#mon-L)" />
                            {/* 왼쪽 잎맥 */}
                            <path d="M22,34 C14,26 7,16 8,8" fill="none" stroke="#1B5E20" strokeWidth="0.7" opacity="0.6" />
                            <path d="M14,20 C12,18 9,18 7,20" fill="none" stroke="#1B5E20" strokeWidth="0.5" opacity="0.4" />
                            {/* 오른쪽 잎 — mask로 fenestration 구멍 표현 */}
                            <path d="M28,35 C38,30 46,20 45,10 C44,4 36,4 32,9 C30,13 31,24 28,35Z"
                                fill={item.plantColor} mask="url(#mon-R)" />
                            {/* 오른쪽 잎맥 */}
                            <path d="M28,34 C36,24 43,14 42,8" fill="none" stroke="#1B5E20" strokeWidth="0.7" opacity="0.6" />
                            <path d="M36,20 C38,18 41,18 43,20" fill="none" stroke="#1B5E20" strokeWidth="0.5" opacity="0.4" />
                            {/* 위 잎 (중앙 새순) */}
                            <path d="M24,32 C20,20 22,10 25,4 C28,10 30,20 26,32Z" fill={item.plantColor} />
                            <path d="M25,32 C24,20 24,10 25,4" fill="none" stroke="#1B5E20" strokeWidth="0.8" opacity="0.5" />
                        </g>
                        {/* 화분 림 */}
                        <ellipse cx="25" cy="52" rx="12.5" ry="2.8" fill={item.potColor} />
                        <ellipse cx="25" cy="52" rx="12.5" ry="2.8" fill="url(#mon-3d)" />
                        <ellipse cx="25" cy="51.4" rx="10.5" ry="1.6" fill="white" opacity="0.14" />
                    </svg>
                </div>
            );
        }

        // ── 꽃 화분 (볼형 화분 + 이중 레이어 꽃잎 3송이) ──
        if (potId === 'pot_flower') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 50 70" width="50" height="70">
                        <defs>
                            <linearGradient id="flow-3d" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(0,0,0,0.28)" />
                                <stop offset="25%" stopColor="rgba(255,255,255,0.2)" />
                                <stop offset="65%" stopColor="rgba(0,0,0,0)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,0.22)" />
                            </linearGradient>
                        </defs>
                        {/* 화분 본체 — 넓은 볼형 */}
                        <path d="M6,55 Q4,55 4,61 Q4,67 6,68 Q25,70 44,68 Q46,67 46,61 Q46,55 44,55 Q25,53 6,55Z" fill={item.potColor} />
                        <path d="M6,55 Q4,55 4,61 Q4,67 6,68 Q25,70 44,68 Q46,67 46,61 Q46,55 44,55 Q25,53 6,55Z" fill="url(#flow-3d)" />
                        {/* 흙 이중 타원 */}
                        <ellipse cx="25" cy="55" rx="19" ry="3.5" fill="#2E1B0E" />
                        <ellipse cx="25" cy="55" rx="15" ry="2.2" fill="#4A2912" />
                        {/* 식물 그룹 — 흔들림 애니메이션 */}
                        <g className="animate-pot-sway">
                            {/* 잎 베이스 */}
                            <ellipse cx="25" cy="49" rx="18" ry="5" fill="#43A047" />
                            <ellipse cx="18" cy="47" rx="7" ry="3.5" fill="#66BB6A" />
                            <ellipse cx="32" cy="47" rx="7" ry="3.5" fill="#66BB6A" />
                            {/* 곡선 줄기 4개 */}
                            <path d="M17,51 Q12,42 10,22 Q10,10 12,8" fill="none" stroke="#388E3C" strokeWidth="1.8" strokeLinecap="round" />
                            <path d="M22,51 Q20,38 20,14 Q20,8 22,6" fill="none" stroke="#43A047" strokeWidth="1.8" strokeLinecap="round" />
                            <path d="M28,51 Q30,38 30,14 Q30,8 28,6" fill="none" stroke="#43A047" strokeWidth="1.8" strokeLinecap="round" />
                            <path d="M33,51 Q38,42 40,22 Q40,10 38,8" fill="none" stroke="#388E3C" strokeWidth="1.8" strokeLinecap="round" />
                            {/* 작은 잎사귀 */}
                            <ellipse cx="16" cy="36" rx="3.5" ry="1.5" fill="#66BB6A" transform="rotate(-35 16 36)" />
                            <ellipse cx="34" cy="38" rx="3" ry="1.3" fill="#66BB6A" transform="rotate(30 34 38)" />
                            {/* 꽃 1 — 왼쪽 (5장 핑크, 이중층) */}
                            {[0, 72, 144, 216, 288].map(a => (
                                <ellipse key={`f1o${a}`} cx="12" cy="20" rx="2.5" ry="5" fill="#F8BBD0" transform={`rotate(${a} 12 20)`} />
                            ))}
                            {[36, 108, 180, 252, 324].map(a => (
                                <ellipse key={`f1i${a}`} cx="12" cy="20" rx="2" ry="4" fill="#F48FB1" opacity="0.8" transform={`rotate(${a} 12 20)`} />
                            ))}
                            <circle cx="12" cy="20" r="2.5" fill="#FFD54F" />
                            <circle cx="12" cy="20" r="1.2" fill="#FF8F00" />
                            {/* 꽃 2 — 중앙 (7장 흰+분홍 이중층, 가장 큼) */}
                            {[0, 51.4, 102.8, 154.2, 205.6, 257, 308.4].map(a => (
                                <ellipse key={`f2o${a}`} cx="25" cy="10" rx="2.8" ry="5.5" fill="white" stroke="#FCE4EC" strokeWidth="0.3" transform={`rotate(${a} 25 10)`} />
                            ))}
                            {[25.7, 77.1, 128.5, 180, 231.4, 282.8, 334.2].map(a => (
                                <ellipse key={`f2i${a}`} cx="25" cy="10" rx="2.2" ry="4.5" fill={item.plantColor} opacity="0.7" transform={`rotate(${a} 25 10)`} />
                            ))}
                            <circle cx="25" cy="10" r="3" fill="#FFD54F" />
                            <circle cx="25" cy="10" r="1.5" fill="#FF6F00" />
                            {/* 꽃 3 — 오른쪽 (6장 라벤더, 이중층) */}
                            {[0, 60, 120, 180, 240, 300].map(a => (
                                <ellipse key={`f3o${a}`} cx="38" cy="20" rx="2.2" ry="4.5" fill="#CE93D8" transform={`rotate(${a} 38 20)`} />
                            ))}
                            {[30, 90, 150, 210, 270, 330].map(a => (
                                <ellipse key={`f3i${a}`} cx="38" cy="20" rx="1.8" ry="3.5" fill="#AB47BC" opacity="0.7" transform={`rotate(${a} 38 20)`} />
                            ))}
                            <circle cx="38" cy="20" r="2.5" fill="#FFE082" />
                            <circle cx="38" cy="20" r="1.1" fill="#FF8F00" />
                        </g>
                        {/* 화분 림 */}
                        <ellipse cx="25" cy="55" rx="19" ry="3" fill={item.potColor} />
                        <ellipse cx="25" cy="55" rx="19" ry="3" fill="url(#flow-3d)" />
                        <ellipse cx="25" cy="54.2" rx="16.5" ry="1.8" fill="white" opacity="0.14" />
                    </svg>
                </div>
            );
        }

        // ── 라벤더 화분 (키 큰 항아리 + 쌍 타원 floret 클러스터) ──
        if (potId === 'pot_lavender') {
            const lavStems = [
                { cx: 8,  sx: 18, sy: 50, tx: 8,  ty: 12 },
                { cx: 14, sx: 20, sy: 48, tx: 14, ty: 5  },
                { cx: 19, sx: 22, sy: 47, tx: 19, ty: 2  },
                { cx: 25, sx: 24, sy: 46, tx: 25, ty: 0  },
                { cx: 31, sx: 28, sy: 47, tx: 31, ty: 2  },
                { cx: 36, sx: 30, sy: 48, tx: 36, ty: 5  },
                { cx: 42, sx: 32, sy: 50, tx: 42, ty: 12 },
            ];
            const lavColors = ['#4A148C', '#6A1B9A', '#7B1FA2', '#AB47BC', '#CE93D8'];
            const lavRx = [2, 1.8, 1.7, 1.5, 1.3];
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 50 70" width="50" height="70">
                        <defs>
                            <linearGradient id="lav-3d" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(0,0,0,0.28)" />
                                <stop offset="25%" stopColor="rgba(255,255,255,0.18)" />
                                <stop offset="65%" stopColor="rgba(0,0,0,0)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,0.22)" />
                            </linearGradient>
                        </defs>
                        {/* 화분 본체 — 키 큰 항아리 */}
                        <path d="M13,50 Q10,50 9,57 Q8,64 11,67 Q25,70 39,67 Q42,64 41,57 Q40,50 37,50 Q25,48 13,50Z" fill={item.potColor} />
                        <path d="M13,50 Q10,50 9,57 Q8,64 11,67 Q25,70 39,67 Q42,64 41,57 Q40,50 37,50 Q25,48 13,50Z" fill="url(#lav-3d)" />
                        {/* 흙 이중 타원 */}
                        <ellipse cx="25" cy="50" rx="12.5" ry="3" fill="#2E1B0E" />
                        <ellipse cx="25" cy="50" rx="9.5" ry="2" fill="#4A2912" />
                        {/* 식물 그룹 — 흔들림 애니메이션 */}
                        <g className="animate-pot-sway">
                            {/* 줄기들 */}
                            {lavStems.map((s, si) => (
                                <line key={`ls${si}`} x1={s.sx} y1={s.sy} x2={s.tx} y2={s.ty}
                                    stroke="#7CB342" strokeWidth="1.3" strokeLinecap="round" />
                            ))}
                            {/* 쌍 타원 floret 클러스터 — 5단계 보라 그라데이션 */}
                            {lavStems.map((s, si) => (
                                <g key={`fc${si}`}>
                                    {[0, 3.5, 7, 10.5, 14].map((dy, di) => (
                                        <g key={di}>
                                            <ellipse cx={s.cx - 1.5} cy={s.ty + dy} rx={lavRx[di]} ry={lavRx[di] * 1.4}
                                                fill={lavColors[di]} transform={`rotate(-15 ${s.cx - 1.5} ${s.ty + dy})`} />
                                            <ellipse cx={s.cx + 1.5} cy={s.ty + dy} rx={lavRx[di]} ry={lavRx[di] * 1.4}
                                                fill={lavColors[di]} transform={`rotate(15 ${s.cx + 1.5} ${s.ty + dy})`} />
                                        </g>
                                    ))}
                                </g>
                            ))}
                        </g>
                        {/* 화분 림 */}
                        <ellipse cx="25" cy="50" rx="12.5" ry="2.8" fill={item.potColor} />
                        <ellipse cx="25" cy="50" rx="12.5" ry="2.8" fill="url(#lav-3d)" />
                        <ellipse cx="25" cy="49.3" rx="10.5" ry="1.6" fill="white" opacity="0.14" />
                    </svg>
                </div>
            );
        }

        // ── 장미 화분 (클래식 가든 포트 + 잎 덤불 + 레이어드 arc 장미 3송이) ──
        if (potId === 'pot_rose') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 50 70" width="50" height="70">
                        <defs>
                            <linearGradient id="rose-3d" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
                                <stop offset="28%" stopColor="rgba(255,255,255,0.15)" />
                                <stop offset="68%" stopColor="rgba(0,0,0,0)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
                            </linearGradient>
                        </defs>
                        {/* 화분 본체 — 클래식 가든 포트 */}
                        <path d="M9,52 Q6,52 5,59 Q5,67 8,68 Q25,70 42,68 Q45,67 45,59 Q44,52 41,52 Q25,50 9,52Z" fill={item.potColor} />
                        <path d="M9,52 Q6,52 5,59 Q5,67 8,68 Q25,70 42,68 Q45,67 45,59 Q44,52 41,52 Q25,50 9,52Z" fill="url(#rose-3d)" />
                        {/* 화분 칼라 */}
                        <path d="M8,52 Q25,55 42,52 Q41,50 25,50 Q9,50 8,52Z" fill={item.potColor} opacity="0.7" />
                        {/* 흙 이중 타원 */}
                        <ellipse cx="25" cy="52" rx="16.5" ry="3.5" fill="#2E1B0E" />
                        <ellipse cx="25" cy="52" rx="12.5" ry="2.2" fill="#4A2912" />
                        {/* 식물 그룹 — 호흡 애니메이션 */}
                        <g className="animate-pot-breathe">
                            {/* 잎 덤불 — 레이어드 초록 */}
                            <ellipse cx="25" cy="38" rx="20" ry="13" fill="#1B5E20" />
                            <ellipse cx="16" cy="33" rx="12" ry="9" fill="#2E7D32" />
                            <ellipse cx="35" cy="33" rx="12" ry="9" fill="#1B5E20" opacity="0.9" />
                            <ellipse cx="25" cy="28" rx="14" ry="8" fill="#388E3C" opacity="0.85" />
                            <ellipse cx="10" cy="40" rx="7" ry="5" fill="#2E7D32" opacity="0.6" />
                            <ellipse cx="40" cy="40" rx="7" ry="5" fill="#2E7D32" opacity="0.6" />
                            {/* 장미 1 — 왼쪽 (동심 arc 소용돌이) */}
                            <circle cx="14" cy="28" r="7" fill="#B71C1C" />
                            <path d="M14,21 Q21,21 21,28 Q21,35 14,35 Q7,32 7,28 Q7,21 14,21Z" fill="#C62828" />
                            <path d="M14,23 Q20,23 20,28 Q20,33 14,33" fill="#D32F2F" opacity="0.9" />
                            <path d="M14,25 Q18,25 18,28 Q18,32 14,31" fill="#E53935" opacity="0.8" />
                            <path d="M14,27 Q17,27.5 17,29 Q16.5,31 14,31" fill="#EF5350" opacity="0.65" />
                            <circle cx="13" cy="25" r="1.5" fill="white" opacity="0.2" />
                            {/* 장미 2 — 중앙 (가장 크고 선명) */}
                            <circle cx="25" cy="18" r="9" fill="#B71C1C" />
                            <path d="M25,9 Q35,9 35,18 Q35,27 25,27 Q17,24 16,18 Q17,12 25,9Z" fill="#C62828" />
                            <path d="M25,11 Q33,12 33,18 Q32,25 25,25" fill="#D32F2F" opacity="0.9" />
                            <path d="M25,14 Q31,15 31,19 Q30,24 25,24" fill="#E53935" opacity="0.8" />
                            <path d="M25,17 Q29,17.5 29,19 Q28,22 25,22" fill="#EF5350" opacity="0.65" />
                            <path d="M25,19 Q27,19.5 27,20.5" fill="none" stroke="#FFCDD2" strokeWidth="0.8" opacity="0.5" />
                            <circle cx="24" cy="14" r="1.8" fill="white" opacity="0.22" />
                            {/* 장미 3 — 오른쪽 */}
                            <circle cx="36" cy="29" r="6.5" fill="#C62828" />
                            <path d="M36,22.5 Q43,22.5 43,29 Q43,36 36,36 Q29,33 29,29 Q29,22.5 36,22.5Z" fill="#D32F2F" />
                            <path d="M36,25 Q41,25 41,29 Q41,34 36,33" fill="#E53935" opacity="0.85" />
                            <path d="M36,27 Q40,27.5 40,29.5 Q39,33 36,32" fill="#EF5350" opacity="0.7" />
                            <circle cx="35" cy="26" r="1.4" fill="white" opacity="0.2" />
                        </g>
                        {/* 화분 림 */}
                        <ellipse cx="25" cy="52" rx="16.5" ry="2.8" fill={item.potColor} />
                        <ellipse cx="25" cy="52" rx="16.5" ry="2.8" fill="url(#rose-3d)" />
                        <ellipse cx="25" cy="51.3" rx="14" ry="1.7" fill="white" opacity="0.14" />
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
