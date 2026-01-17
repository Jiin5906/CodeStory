import { FaHeart, FaCloudSun, FaCoffee } from 'react-icons/fa';

const QUICK_ACTIONS = [
    {
        icon: FaHeart,
        label: '오늘의 감정',
        id: 'emotion', // ✅ 분석용 ID 추가
        prompt: '오늘 하루 내 기분이 어땠냐면...',
    },
    {
        icon: FaCloudSun,
        label: '힘든 일 털어놓기',
        id: 'hard-time', // ✅ 분석용 ID 추가
        prompt: '오늘 정말 힘든 일이 있었어. 위로가 필요해.',
    },
    {
        icon: FaCoffee,
        label: '소소한 행복',
        id: 'small-happiness', // ✅ 분석용 ID 추가
        prompt: '오늘 나에게 있었던 작은 행복을 이야기해 줄게.',
    },
];

const QuickActions = ({ onSelect }) => (
    <div className="text-center mt-6" data-gtm="quick-actions-container">
        <p className="text-zinc-400 text-sm mb-4">오늘 하루는 어땠나요?</p>

        <div className="flex flex-col justify-center gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
            {QUICK_ACTIONS.map(({ icon: Icon, label, prompt, id }) => (
                <button 
                    key={label} 
                    onClick={() => onSelect(prompt)} 
                    className="group flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-zinc-900/80 to-zinc-800/80 hover:from-zinc-800/80 hover:to-zinc-700/80 border border-zinc-700/50 hover:border-zinc-600/50 rounded-xl text-zinc-300 hover:text-zinc-200 transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 sm:justify-start"
                    /* ✅ 퀵 액션 버튼 추적: 어떤 유형의 프롬프트를 선택했는지 기록 */
                    data-gtm="quick-action-button"
                    data-gtm-label={label}
                    data-gtm-type={id}
                >
                    {/* ✅ 아이콘 클릭 시 이벤트 전파 방지를 위해 스타일 추가 권장 (Sidebar와 동일 원리) */}
                    <div className="text-pink-400 group-hover:text-pink-300 transition-colors pointer-events-none">
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-center sm:text-left text-sm pointer-events-none">{label}</span>
                </button>
            ))}
        </div>
    </div>
);

export default QuickActions;