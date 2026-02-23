import React from 'react';
import { usePet } from '../../context/PetContext';
import MongleIcon from '../common/MongleIcons';

// ─── 색상 로직: 퍼센트에 따라 적합한 클래스 반환 ───
const getBarColor = (percent) => {
    if (percent <= 30) return 'bg-red-400';
    if (percent <= 70) return 'bg-yellow-400';
    return 'bg-green-400';
};

const getTextColor = (percent) => {
    if (percent <= 30) return 'text-red-500';
    if (percent <= 70) return 'text-yellow-600';
    return 'text-green-600';
};

/**
 * StatusCard — 단일 상태 게이지 카드
 *
 * Props:
 *   icon     {string}   아이콘 이모지
 *   label    {string}   상태 이름
 *   value    {number}   현재 퍼센트 (0~100)
 *   locked   {boolean}  Lock 상태
 *   gtmKey   {string}   GTM 추적 키
 */
const StatusCard = ({ icon, label, value, locked, gtmKey }) => {
    const clampedValue = Math.min(100, Math.max(0, Math.round(value)));
    const barColor = getBarColor(clampedValue);
    const textColor = getTextColor(clampedValue);

    return (
        <div
            className="relative flex flex-col items-center gap-2 bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-white/50 shadow-sm"
            data-gtm={gtmKey}
        >
            {/* Lock 배지 */}
            {locked && (
                <span className="absolute top-1.5 right-1.5 text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">
                    Full
                </span>
            )}

            {/* 아이콘 + 라벨 */}
            <div className="flex flex-col items-center gap-0.5">
                <MongleIcon name={icon} size={22} />
                <span className="text-[10px] font-bold text-slate-500">{label}</span>
            </div>

            {/* 퍼센트 텍스트 */}
            <span className={`text-[11px] font-extrabold ${textColor}`}>
                {clampedValue}%
            </span>

            {/* 리니어 프로그레스 바 */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${barColor} transition-all duration-500`}
                    style={{ width: `${clampedValue}%` }}
                />
            </div>
        </div>
    );
};

/**
 * StatusDashboard — 3종 상태 게이지 카드 (BottomSheet 내 퀵태그 대체)
 */
const StatusDashboard = () => {
    const {
        affectionGauge,
        energyGauge,
        isAffectionLocked,
        isEnergyLocked
    } = usePet();

    return (
        <div
            className="grid grid-cols-2 gap-2 w-full"
            data-gtm="status-dashboard"
        >
            <StatusCard
                icon="heart"
                label="쓰다듬기"
                value={affectionGauge}
                locked={isAffectionLocked}
                gtmKey="status-card-affection"
            />
            <StatusCard
                icon="moon"
                label="잠자기"
                value={energyGauge}
                locked={isEnergyLocked}
                gtmKey="status-card-energy"
            />
        </div>
    );
};

export default StatusDashboard;
