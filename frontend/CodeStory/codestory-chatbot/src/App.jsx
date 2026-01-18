import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import './App.css';

import { authApi, diaryApi } from './services/api';
import Login from './components/auth/Login';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
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
    const navigate = useNavigate();
    const location = useLocation();
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [diaries, setDiaries] = useState([]);
    const [diaryDraft, setDiaryDraft] = useState({ content: '', tags: [], imageFile: null, isPublic: false });
    const [showEmotionModal, setShowEmotionModal] = useState(false);

    // ✅ GA4/GTM 페이지뷰 전송 (기존 유지 및 보완)
    useEffect(() => {
        const gtmId = import.meta.env.VITE_GTM_ID;
        if (gtmId && window.dataLayer) {
            window.dataLayer.push({
                event: 'pageview',
                page_path: location.pathname,
                page_title: location.pathname === '/' ? 'DASHBOARD' : location.pathname.substring(1).toUpperCase(),
                user_status: user ? 'logged_in' : 'guest' // ✅ 로그인 여부 정보 추가
            });
        }
    }, [location, user]);

    // 초기 사용자 체크 로직 (생략 - 기존 동일)
    useEffect(() => {
        const storedUser = localStorage.getItem('diaryUser');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
                fetchDiaries(parsed.id);
                if (location.pathname === '/' || location.pathname === '/login') {
                    navigate('/dashboard');
                }
            } catch (e) { navigate('/login'); }
        } else if (location.pathname !== '/login') {
            navigate('/login');
        }
    }, []);

    const fetchDiaries = async (userId) => {
        if (!userId) return;
        try {
            const data = await diaryApi.getDiaries(userId);
            setDiaries(Array.isArray(data) ? data : []);
        } catch (err) { setDiaries([]); }
    };

    const handleLoginSuccess = (userInfo) => {
        setUser(userInfo);
        localStorage.setItem('diaryUser', JSON.stringify(userInfo));
        fetchDiaries(userInfo.id);
        navigate('/dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('diaryUser');
        setUser(null);
        setDiaries([]);
        navigate('/login');
    };

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
            
            // ✅ 성공 이벤트 데이터 레이어 전송
            if (window.dataLayer) {
                window.dataLayer.push({ event: 'diary_save_success' });
            }
            
            alert('일기가 저장되었습니다!');
            fetchDiaries(user.id);
            setShowEmotionModal(false);
            navigate('/dashboard');
        } catch (err) {
            setError('일기 저장에 실패했습니다.');
            if (window.dataLayer) {
                window.dataLayer.push({ event: 'diary_save_error', error_msg: err.message });
            }
        } finally { setLoading(false); }
    };

    const themeStyles = {
        background: currentTheme.bgColor,
        color: currentTheme.textColor,
        minHeight: '100vh',
        transition: 'all 0.3s ease',
    };

    return (
        <div className="app-root" style={themeStyles} data-gtm="app-root-container">
            <Routes>
                <Route path="/login" element={<Login onLogin={(e, p) => authApi.login(e,p).then(handleLoginSuccess)} onSignup={(e,p,n) => authApi.signup(e,p,n).then(handleLoginSuccess)} onGuestLogin={() => handleLoginSuccess({id:0, nickname:'게스트'})} />} />
                
                <Route path="/editor" element={
                    <div className="animate-fade-in" style={{position:'fixed', inset:0, zIndex:100, background:'var(--bg-color)', display:'flex', justifyContent:'center', alignItems:'center'}} data-gtm="view-full-editor">
                        <div style={{width:'90%', maxWidth:'1100px', height:'85vh', background:'var(--card-bg)', borderRadius:'24px', overflow:'hidden', border:'1px solid var(--border-color)'}}>
                            <DiaryEditor selectedDate={selectedDate} onBack={() => navigate('/dashboard')} onNext={(d) => {setDiaryDraft(d); setShowEmotionModal(true);}} />
                        </div>
                    </div>
                } />

                <Route path="/*" element={
                    <div className="layout-container animate-fade-in" data-gtm="main-layout-wrapper">
                        <Sidebar onWriteClick={() => {setSelectedDate(new Date()); navigate('/editor');}} currentView={location.pathname.substring(1) || 'dashboard'} onChangeView={(v) => navigate(`/${v}`)} />

                        <main className="content-area" style={{flex:1, overflow:'hidden'}} data-gtm="page-content-main">
                            <Routes>
                                <Route path="dashboard" element={<MainDashboard user={user} diaries={diaries} selectedDate={selectedDate} onDateChange={setSelectedDate} onRefresh={() => fetchDiaries(user.id)} />} />
                                <Route path="calendar" element={<CalendarView user={user} diaries={diaries} />} />
                                <Route path="stats" element={<MonthlyReport diaries={diaries} currentMonth={selectedDate} />} />
                                <Route path="shared" element={<SharedFeed />} />
                                <Route path="settings" element={<Settings user={user} onNicknameChange={(n) => {const u={...user, nickname:n}; setUser(u); localStorage.setItem('diaryUser', JSON.stringify(u));}} />} />
                                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </main>

                        <RightPanel user={user} selectedDate={selectedDate} onDateSelect={(d) => {setSelectedDate(d); navigate('/dashboard');}} diaries={diaries} onLogout={handleLogout} onLogin={() => navigate('/login')} />

                        {/* Mobile Bottom Navigation */}
                        <BottomNav
                            currentView={location.pathname.substring(1) || 'dashboard'}
                            onNavigate={(v) => navigate(`/${v}`)}
                            onWriteClick={() => {setSelectedDate(new Date()); navigate('/editor');}}
                        />
                    </div>
                } />
            </Routes>

            <ErrorBanner message={error} />
            
            {loading && (
                <div 
                    style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:999, display:'flex', justifyContent:'center', alignItems:'center', color:'white'}}
                    data-gtm="global-loading-overlay"
                >
                    저장 중...
                </div>
            )}
            
            {showEmotionModal && (
                <EmotionModal onClose={() => setShowEmotionModal(false)} onSave={handleFinalSubmit} />
            )}
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <Router>
                <AppContent />
            </Router>
        </ThemeProvider>
    );
}

export default App;