import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AnalyticsView — 관리자용 온보딩 데이터 통계 화면
 *
 * 기능:
 * - 총 회원수 / 온보딩 완료 수
 * - 성별 분포 (남성 / 여성 / 기타)
 * - 유입경로 분포
 */
const GENDER_LABEL = { '남성': '남성', '여성': '여성', '기타': '기타' };
const CHANNEL_LABEL = {
    family: '가족/친구',
    google: 'Google검색',
    naver: '네이버',
    youtube: 'YouTube',
    appstore: '앱스토어',
    instagram: 'Instagram',
};
const GENDER_COLOR = { '남성': '#60a5fa', '여성': '#f472b6', '기타': '#a78bfa' };
const CHANNEL_COLOR = {
    family: '#fb923c',
    google: '#4285F4',
    naver: '#03C75A',
    youtube: '#ef4444',
    appstore: '#3b82f6',
    instagram: '#ec4899',
};

function StatBar({ label, count, total, color }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="mb-3">
            <div className="flex justify-between text-sm font-semibold mb-1" style={{ color: 'var(--text-color)' }}>
                <span>{label}</span>
                <span>{count}명 ({pct}%)</span>
            </div>
            <div className="w-full h-4 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>
        </div>
    );
}

export default function AnalyticsView() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/admin/analytics')
            .then((r) => r.json())
            .then(setData)
            .catch(() => setError('데이터를 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div
            className="min-h-screen px-5 py-6 overflow-y-auto"
            style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}
            data-gtm="view-analytics"
        >
            {/* 상단 헤더 */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl text-lg"
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
                    data-gtm="analytics-back-btn"
                >
                    ←
                </button>
                <h1 className="text-xl font-bold">온보딩 데이터 통계</h1>
            </div>

            {loading && (
                <div className="text-center py-16" style={{ color: 'var(--sub-text-color)' }}>
                    데이터 불러오는 중...
                </div>
            )}

            {error && (
                <div className="text-center py-16 text-red-400">{error}</div>
            )}

            {data && (
                <div className="flex flex-col gap-4 max-w-lg mx-auto">
                    {/* 요약 카드 */}
                    <div className="grid grid-cols-2 gap-3">
                        <div
                            className="rounded-2xl p-4 text-center"
                            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
                            data-gtm="analytics-total-members"
                        >
                            <div className="text-3xl font-bold" style={{ color: '#7C71F5' }}>
                                {data.totalMembers}
                            </div>
                            <div className="text-xs mt-1" style={{ color: 'var(--sub-text-color)' }}>
                                전체 회원
                            </div>
                        </div>
                        <div
                            className="rounded-2xl p-4 text-center"
                            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
                            data-gtm="analytics-onboarding-completed"
                        >
                            <div className="text-3xl font-bold" style={{ color: '#22c55e' }}>
                                {data.onboardingCompleted}
                            </div>
                            <div className="text-xs mt-1" style={{ color: 'var(--sub-text-color)' }}>
                                온보딩 완료
                            </div>
                        </div>
                    </div>

                    {/* 성별 분포 */}
                    <div
                        className="rounded-2xl p-5"
                        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
                        data-gtm="analytics-gender-stats"
                    >
                        <h2 className="font-bold mb-4 text-base">성별 분포</h2>
                        {Object.entries(data.genderStats).length === 0 ? (
                            <p className="text-sm" style={{ color: 'var(--sub-text-color)' }}>
                                데이터 없음
                            </p>
                        ) : (
                            Object.entries(data.genderStats).map(([key, count]) => (
                                <StatBar
                                    key={key}
                                    label={GENDER_LABEL[key] || key}
                                    count={count}
                                    total={data.onboardingCompleted}
                                    color={GENDER_COLOR[key] || '#94a3b8'}
                                />
                            ))
                        )}
                    </div>

                    {/* 유입경로 분포 */}
                    <div
                        className="rounded-2xl p-5"
                        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
                        data-gtm="analytics-channel-stats"
                    >
                        <h2 className="font-bold mb-4 text-base">유입경로 분포</h2>
                        {Object.entries(data.channelStats).length === 0 ? (
                            <p className="text-sm" style={{ color: 'var(--sub-text-color)' }}>
                                데이터 없음
                            </p>
                        ) : (
                            Object.entries(data.channelStats)
                                .sort(([, a], [, b]) => b - a)
                                .map(([key, count]) => (
                                    <StatBar
                                        key={key}
                                        label={CHANNEL_LABEL[key] || key}
                                        count={count}
                                        total={data.onboardingCompleted}
                                        color={CHANNEL_COLOR[key] || '#94a3b8'}
                                    />
                                ))
                        )}
                    </div>

                    {/* 온보딩 완료율 */}
                    <div
                        className="rounded-2xl p-4 text-center"
                        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
                        data-gtm="analytics-completion-rate"
                    >
                        <div className="text-2xl font-bold" style={{ color: '#fb923c' }}>
                            {data.totalMembers > 0
                                ? Math.round((data.onboardingCompleted / data.totalMembers) * 100)
                                : 0}%
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--sub-text-color)' }}>
                            온보딩 완료율
                        </div>
                    </div>

                    {/* 새로고침 버튼 */}
                    <button
                        onClick={() => {
                            setLoading(true);
                            fetch('/api/admin/analytics')
                                .then((r) => r.json())
                                .then(setData)
                                .catch(() => setError('데이터를 불러오지 못했습니다.'))
                                .finally(() => setLoading(false));
                        }}
                        className="w-full py-3 rounded-2xl font-bold text-white transition-all"
                        style={{ background: '#7C71F5' }}
                        data-gtm="analytics-refresh-btn"
                    >
                        새로고침
                    </button>
                </div>
            )}
        </div>
    );
}
