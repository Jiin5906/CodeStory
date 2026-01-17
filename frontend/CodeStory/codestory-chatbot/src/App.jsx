import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import './App.css';

import { authApi, diaryApi } from './services/api';
import Login from './components/auth/Login';
import Sidebar from './components/layout/Sidebar';
import MainDashboard from './components/dashboard/MainDashboard';
import RightPanel from './components/layout/RightPanel';
import DiaryEditor from './components/diary/DiaryEditor';
import EmotionModal from './components/diary/EmotionModal';
import ErrorBanner from './components/common/ErrorBanner';
import CalendarView from './components/calendar/CalendarView';
import MonthlyReport from './components/stats/MonthlyReport';
import Settings from './components/layout/Settings';
import SharedFeed from './components/feed/SharedFeed';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function AppContent() {
    const { currentTheme } = useTheme();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [view, setView] = useState('login');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [diaries, setDiaries] = useState([]);
    const [diaryDraft, setDiaryDraft] = useState({ content: '', tags: [], imageFile: null, isPublic: false });
    const [showEmotionModal, setShowEmotionModal] = useState(false);

    // ✅ 1. View 변경 감지 및 GA4 페이지뷰 전송
    useEffect(() => {
        const gtmId = import.meta.env.VITE_GTM_ID;
        if (gtmId) {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'pageview',
                page_path: `/${view}`,
                page_title: view.toUpperCase()
            });
            console.log(`📊 GA4 추적 중: ${view}`);
        }
    }, [view]);

    // ✅ 2. 초기 사용자 로드 및 데이터 페칭
    useEffect(() => {
        const storedUser = localStorage.getItem('diaryUser');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
                fetchDiaries(parsed.id);
                setView('dashboard');
            } catch (e) {
                setView('login');
            }
        } else {
            setView('login');
        }
    }, []);

    const fetchDiaries = async (userId) => {
        if (!userId) return;
        try {
            const data = await diaryApi.getDiaries(userId);
            setDiaries(Array.isArray(data) ? data : []);
        } catch (err) {
            setDiaries([]);
        }
    };

    const handleLoginSuccess = (userInfo) => {
        setUser(userInfo);
        localStorage.setItem('diaryUser', JSON.stringify(userInfo));
        fetchDiaries(userInfo.id);
        setView('dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('diaryUser');
        setUser(null);
        setView('login');
        setDiaries([]);
    };

    // ✅ 3. 일기 최종 제출 (중복 제거 및 GA4 이벤트 통합)
    const handleFinalSubmit = async (emotionData) => {
        if (loading) return;
        setLoading(true);
        try {
            const fullDiaryData = {
                ...diaryDraft,
                ...emotionData,
                userId: user.id,
                date: format(selectedDate, 'yyyy-MM-dd')
            };

            await diaryApi.saveDiary(fullDiaryData, diaryDraft.imageFile);

            // ✨ GA4 전송: 일기 저장 성공 이벤트
            if (window.dataLayer) {
                window.dataLayer.push({
                    event: 'diary_save_complete',
                    userId: user.id
                });
            }

            alert('일기가 저장되었습니다!');
            fetchDiaries(user.id);
            setShowEmotionModal(false);
            setView('dashboard');
        } catch (err) {
            console.error('Save Error:', err);
            setError('일기 저장에 실패했습니다. 로그를 확인하세요.');
        } finally {
            setLoading(false);
        }
    };

    const themeStyles = {
        '--bg-color': currentTheme.bgColor,
        '--card-bg': currentTheme.cardBg,
        '--text-color': currentTheme.textColor,
        '--sub-text-color': currentTheme.subTextColor,
        '--sidebar-bg': currentTheme.sidebarBg,
        '--accent-color': currentTheme.accentColor,
        '--border-color': currentTheme.borderColor,
        background: currentTheme.bgColor,
        color: currentTheme.textColor,
        minHeight: '100vh',
        transition: 'all 0.3s ease',
    };

    return (
        <div className="app-root" style={themeStyles}>
            {view === 'login' && <Login onLogin={(e, p) => authApi.login(e,p).then(handleLoginSuccess)} onSignup={(e,p,n) => authApi.signup(e,p,n).then(handleLoginSuccess)} onGuestLogin={() => handleLoginSuccess({id:0, nickname:'게스트'})} />}
            {view === 'editor' && (
                <div className="animate-fade-in" style={{position:'fixed', inset:0, zIndex:100, background:'var(--bg-color)', display:'flex', justifyContent:'center', alignItems:'center'}}>
                    <div style={{width:'90%', maxWidth:'1100px', height:'85vh', background:'var(--card-bg)', borderRadius:'24px', overflow:'hidden', border:'1px solid var(--border-color)'}}>
                        <DiaryEditor selectedDate={selectedDate} onBack={() => setView('dashboard')} onNext={(d) => {setDiaryDraft(d); setShowEmotionModal(true);}} />
                    </div>
                </div>
            )}
            {view !== 'login' && view !== 'editor' && (
                <div className="layout-container animate-fade-in">
                    <Sidebar onWriteClick={() => {setSelectedDate(new Date()); setView('editor'); setDiaryDraft({content:'', tags:[], imageFile:null, isPublic:false});}} currentView={view} onChangeView={setView} />
                    <div className="content-area" style={{flex:1, overflow:'hidden'}}>
                        {view === 'dashboard' ? <MainDashboard user={user} diaries={diaries} selectedDate={selectedDate} onDateChange={setSelectedDate} onLogout={handleLogout} /> : view === 'calendar' ? <CalendarView user={user} diaries={diaries} /> : view === 'stats' ? <MonthlyReport diaries={diaries} currentMonth={selectedDate} /> : view === 'shared' ? <SharedFeed /> : <Settings user={user} onNicknameChange={(n) => {const u={...user, nickname:n}; setUser(u); localStorage.setItem('diaryUser', JSON.stringify(u));}} />}
                    </div>
                    <RightPanel user={user} selectedDate={selectedDate} onDateSelect={(d) => {setSelectedDate(d); setView('dashboard');}} diaries={diaries} onLogout={handleLogout} onLogin={() => setView('login')} />
                </div>
            )}
            <ErrorBanner message={error} />
            {loading && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:999, display:'flex', justifyContent:'center', alignItems:'center', color:'white'}}>저장 중...</div>}
            {showEmotionModal && <EmotionModal onClose={() => setShowEmotionModal(false)} onSave={handleFinalSubmit} />}
        </div>
    );
}

function App() { return <ThemeProvider><AppContent /></ThemeProvider>; }
export default App;