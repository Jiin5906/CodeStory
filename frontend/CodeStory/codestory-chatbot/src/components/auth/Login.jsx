import { useState } from 'react';
import { FaPenNib, FaSignInAlt, FaUserPlus } from "react-icons/fa";

const Login = ({ onLogin, onSignup, onGuestLogin }) => {
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // 로그인/회원가입 로직 연결 (중요: 파라미터 순서 유지)
        if (isSignup) {
            onSignup(email, password, nickname);
        } else {
            onLogin(email, password);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0e1a]">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#f59e0b]/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-15%] right-[-8%] w-[500px] h-[500px] bg-[#3b82f6]/10 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 opacity-[0.03] bg-paper-grain"></div>
            </div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="relative bg-[#0f1729]/90 border border-[#1e3a5f] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.1)] backdrop-blur-xl">
                    
                    {/* Header Section */}
                    <div className="p-10 pb-0 text-center">
                        <div className="relative inline-block mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#1e3a5f] to-[#0f1729] rounded-full flex items-center justify-center border border-[#2563eb]/30 shadow-lg mx-auto">
                                <FaPenNib className="text-3xl text-[#fbbf24] drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold text-[#fef3c7] mb-2 font-handwritten tracking-wide">
                            {isSignup ? '새로운 기록 시작' : '공감 일기'}
                        </h2>
                        <p className="text-[#64748b] text-xs tracking-[0.3em] uppercase font-mono mb-8">
                            My Emotional Journal
                        </p>
                    </div>

                    {/* Form Section */}
                    <div className="p-10 pt-4">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Input */}
                            <div className="group">
                                <label className="block text-[#94a3b8] text-xs uppercase tracking-wider mb-2 font-mono">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#1e293b]/50 border border-[#334155] rounded-lg px-4 py-3 text-[#fef3c7] focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition-all placeholder-[#475569]"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>

                            {/* Password Input */}
                            <div className="group">
                                <label className="block text-[#94a3b8] text-xs uppercase tracking-wider mb-2 font-mono">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#1e293b]/50 border border-[#334155] rounded-lg px-4 py-3 text-[#fef3c7] focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition-all placeholder-[#475569]"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {/* Nickname Input (Signup only) */}
                            {isSignup && (
                                <div className="group animate-fade-in-up">
                                    <label className="block text-[#94a3b8] text-xs uppercase tracking-wider mb-2 font-mono">Nickname</label>
                                    <input
                                        type="text"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        className="w-full bg-[#1e293b]/50 border border-[#334155] rounded-lg px-4 py-3 text-[#fef3c7] focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition-all placeholder-[#475569]"
                                        placeholder="Your Nickname"
                                        required
                                    />
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-[#0f1729] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all active:scale-[0.98] mt-6"
                            >
                                {isSignup ? <FaUserPlus /> : <FaSignInAlt />}
                                <span>{isSignup ? '다이어리 만들기' : '일기장 펼치기'}</span>
                            </button>
                        </form>

                        {/* Footer Actions */}
                        <div className="mt-8 flex flex-col items-center gap-4 border-t border-[#1e3a5f] pt-6">
                            <button
                                onClick={() => setIsSignup(!isSignup)}
                                className="text-[#94a3b8] text-sm hover:text-[#fbbf24] transition-colors"
                            >
                                {isSignup ? '이미 계정이 있으신가요? 로그인' : '처음이신가요? 회원가입'}
                            </button>
                            <button
                                onClick={onGuestLogin}
                                className="text-[#64748b] text-xs hover:text-[#94a3b8] transition-colors font-mono"
                            >
                                게스트로 둘러보기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;