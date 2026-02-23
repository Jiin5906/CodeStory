import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus, FaGoogle } from "react-icons/fa";

const Login = ({ onLogin, onSignup }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');

    // OAuth2 리디렉션 후 토큰 처리
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const refreshToken = params.get('refreshToken');
        const userId = params.get('userId');
        const userEmail = params.get('email');
        const userNickname = params.get('nickname');

        if (token && userId) {
            // JWT 토큰과 사용자 정보 저장
            localStorage.setItem('accessToken', token);
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }

            const userInfo = {
                id: parseInt(userId),
                email: userEmail,
                nickname: userNickname
            };
            localStorage.setItem('diaryUser', JSON.stringify(userInfo));

            console.log('[OAuth2] Google 로그인 성공 - UserId:', userId);

            // 대시보드로 이동 (replace: true로 뒤로가기 시 토큰 노출 방지)
            navigate('/dashboard', { replace: true });
        }
    }, [location, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // 로그인/회원가입 로직 연결 (중요: 파라미터 순서 유지)
        if (isSignup) {
            onSignup(email, password, nickname);
        } else {
            onLogin(email, password);
        }
    };

    // Google OAuth2 로그인
    const handleGoogleLogin = () => {
        // 백엔드 OAuth2 인증 엔드포인트로 리디렉션
        const backendUrl = import.meta.env.PROD
            ? 'https://logam.click'
            : 'http://localhost:8080';
        window.location.href = `${backendUrl}/oauth2/authorization/google`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-to-b from-rose-50 via-[#FDF5F7] to-purple-50/40">

            {/* ── 배경: 소프트 그라디언트 오브 ── */}
            <div aria-hidden="true" className="pointer-events-none">
                {/* 큰 블러 오브 — 좌상단 */}
                <div className="absolute -top-32 -left-24 w-80 h-80 bg-rose-200/30 rounded-full blur-[90px]" />
                {/* 큰 블러 오브 — 우하단 */}
                <div className="absolute -bottom-24 -right-16 w-72 h-72 bg-purple-200/25 rounded-full blur-[80px]" />
                {/* 중간 오브 */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-100/20 rounded-full blur-[100px]" />

                {/* 떠다니는 작은 버블 (rose/lavender 계열) */}
                <span className="login-bg-bubble bg-rose-200/40"    style={{ left: '7%',  width: '1.8rem',  height: '1.8rem',  animationDuration: '7s',   animationDelay: '0s'   }} />
                <span className="login-bg-bubble bg-pink-200/35"    style={{ left: '21%', width: '1.1rem',  height: '1.1rem',  animationDuration: '9.5s', animationDelay: '1.8s' }} />
                <span className="login-bg-bubble bg-purple-200/30"  style={{ left: '73%', width: '3.2rem',  height: '3.2rem',  animationDuration: '11s',  animationDelay: '0.7s' }} />
                <span className="login-bg-bubble bg-rose-100/50"    style={{ left: '86%', width: '0.9rem',  height: '0.9rem',  animationDuration: '6.5s', animationDelay: '3.2s' }} />
                <span className="login-bg-bubble bg-fuchsia-200/25" style={{ left: '53%', width: '2.1rem',  height: '2.1rem',  animationDuration: '8.5s', animationDelay: '0.4s' }} />
                <span className="login-bg-bubble bg-pink-100/45"    style={{ left: '39%', width: '1.4rem',  height: '1.4rem',  animationDuration: '10s',  animationDelay: '2.5s' }} />
            </div>

            <div className="relative z-10 w-full max-w-[390px]">

                {/* ── 헤더: 타이틀 + 서브 문구 ── */}
                <div className="pt-4 mb-9 text-center">
                    {/* 장식 라인 */}
                    <div className="flex items-center justify-center gap-2 mb-5">
                        <span className="block w-8 h-px bg-rose-200" />
                        <span className="text-rose-300 text-[10px] tracking-[0.25em] font-semibold uppercase">공감일기</span>
                        <span className="block w-8 h-px bg-rose-200" />
                    </div>

                    {/* 메인 타이틀 — Gowun Batang 손글씨체 */}
                    <h1
                        style={{ fontFamily: "'Gowun Batang', serif" }}
                        className="text-[2.15rem] font-bold text-[#3D2340] leading-snug tracking-tight"
                    >
                        오늘 하루,<br />
                        <span className="text-[#C96A8E]">어떠셨나요?</span>
                    </h1>

                    {/* 서브 문구 */}
                    <p className="mt-3.5 text-[#C9A0B0] text-sm font-medium leading-relaxed">
                        오늘의 감정을 기록하면<br />
                        따뜻하게 공감해드릴게요.
                    </p>
                </div>

                {/* ── 폼 카드 ── */}
                <div className="bg-white/90 backdrop-blur-sm rounded-[32px] border-2 border-rose-100 shadow-[0_8px_0_0_#fce7f3] px-7 pt-7 pb-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                        {/* 이메일 */}
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-rose-50/60 border-2 border-rose-100 rounded-2xl px-5 py-4 text-[#3D2340] font-medium text-sm focus:outline-none focus:border-rose-300 focus:bg-white transition-colors placeholder-rose-200"
                            placeholder="이메일 주소"
                            required
                        />

                        {/* 비밀번호 */}
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-rose-50/60 border-2 border-rose-100 rounded-2xl px-5 py-4 text-[#3D2340] font-medium text-sm focus:outline-none focus:border-rose-300 focus:bg-white transition-colors placeholder-rose-200"
                            placeholder="비밀번호"
                            required
                        />

                        {/* 닉네임 — 회원가입 시 슬라이드 인 (login-fade-slide-in: index.css) */}
                        {isSignup && (
                            <div className="login-fade-slide-in">
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="w-full bg-rose-50/60 border-2 border-rose-100 rounded-2xl px-5 py-4 text-[#3D2340] font-medium text-sm focus:outline-none focus:border-rose-300 focus:bg-white transition-colors placeholder-rose-200"
                                    placeholder="닉네임"
                                    required
                                />
                            </div>
                        )}

                        {/* ── 메인 3D 버튼 (더스티 로즈) ── */}
                        <button
                            type="submit"
                            className="w-full mt-2 py-[1.05rem] bg-[#C96A8E] border-b-[5px] border-[#A8476B] text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 hover:bg-[#D980A0] active:border-b-0 active:translate-y-[5px] transition-[background-color,transform,border-width] duration-75 select-none tracking-wide"
                            data-gtm="auth-email-submit"
                        >
                            {isSignup ? <FaUserPlus size={17} /> : <FaSignInAlt size={17} />}
                            <span>{isSignup ? '다이어리 만들기' : '일기장 펼치기'}</span>
                        </button>
                    </form>

                    {/* 구분선 */}
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-rose-100" />
                        <span className="text-rose-200 font-semibold text-[10px] tracking-[0.2em] uppercase">또는</span>
                        <div className="flex-1 h-px bg-rose-100" />
                    </div>

                    {/* ── Google 3D 버튼 ── */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full py-[1.05rem] bg-white border-2 border-rose-100 border-b-[5px] border-b-rose-200 text-[#3D2340] font-bold text-base rounded-2xl flex items-center justify-center gap-3 hover:bg-rose-50/50 active:border-b-0 active:translate-y-[5px] transition-[background-color,transform,border-width] duration-75 select-none"
                        data-gtm="auth-google-login"
                    >
                        <FaGoogle className="text-[#4285F4] text-lg" />
                        <span>Google로 계속하기</span>
                    </button>
                </div>

                {/* ── 하단 모드 전환 ── */}
                <div className="flex flex-col items-center gap-3 mt-6">
                    <button
                        onClick={() => setIsSignup(!isSignup)}
                        className="text-[#C96A8E] font-semibold text-sm hover:text-[#A8476B] transition-colors"
                    >
                        {isSignup
                            ? '이미 계정이 있으신가요? 로그인 →'
                            : '처음이신가요? 회원가입 →'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Login;
