import { useState, useEffect } from 'react';
import { usePet } from '../../context/PetContext';

const EVOLUTION_LABELS = {
    BABY: '🐣 아기몽글이',
    KID: '🌱 꼬리몽글이',
    ADULT: '🌸 성인몽글이'
};

export default function ExpBar() {
    const { petStatus } = usePet();
    const [displayProgress, setDisplayProgress] = useState(0);

    useEffect(() => {
        if (!petStatus) return;
        const target = (petStatus.currentExp / petStatus.requiredExp) * 100;
        setDisplayProgress(target);
    }, [petStatus]);

    if (!petStatus) return null;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'rgba(0,0,0,0.15)',
            borderRadius: '20px',
            backdropFilter: 'blur(8px)',
            minWidth: '180px'
        }} data-gtm="exp-bar">
            <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#fff',
                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                whiteSpace: 'nowrap'
            }}>
                {EVOLUTION_LABELS[petStatus.evolutionStage] || '🐣 아기몽글이'} Lv.{petStatus.level}
            </span>
            <div style={{
                flex: 1,
                height: '8px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '4px',
                overflow: 'hidden',
                minWidth: '60px'
            }}>
                <div style={{
                    height: '100%',
                    width: `${Math.min(displayProgress, 100)}%`,
                    background: 'linear-gradient(90deg, #e84393, #fd9644)',
                    borderRadius: '4px',
                    transition: 'width 0.8s ease'
                }} />
            </div>
        </div>
    );
}
