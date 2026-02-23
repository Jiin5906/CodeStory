import { usePet } from '../../context/PetContext';
import MongleIcon from '../common/MongleIcons';

const EVOLUTION_LABELS = {
    BABY: { icon: 'babyChick', text: '아기몽글이' },
    KID: { icon: 'sprout', text: '꼬리몽글이' },
    ADULT: { icon: 'flower', text: '성인몽글이' }
};

export default function ExpBar() {
    const { petStatus } = usePet();

    if (!petStatus) return null;

    // 파생 값은 state 없이 직접 계산
    const displayProgress = (petStatus.currentExp / petStatus.requiredExp) * 100;

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
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#fff',
                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                whiteSpace: 'nowrap'
            }}>
                {(() => {
                    const label = EVOLUTION_LABELS[petStatus.evolutionStage] || EVOLUTION_LABELS.BABY;
                    return (
                        <>
                            <MongleIcon name={label.icon} size={16} />
                            {label.text} Lv.{petStatus.level}
                        </>
                    );
                })()}
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
