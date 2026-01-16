import { useState } from 'react';
import { FaPenNib, FaSignInAlt, FaUserPlus } from "react-icons/fa";

const Login = ({ onLogin, onSignup, onGuestLogin }) => {
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSignup) {
            onSignup(email, password, nickname);
        } else {
            onLogin(email, password);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* 배경 효과: 잉크 번짐 느낌 */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-900/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-900/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="bg-zinc-900/80 border border-zinc-800 p-8 sm:p-12 rounded-3xl shadow-2xl backdrop-blur-xl max-w-md w-full relative z-10">
                
                {/* 로고 영역 */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full mx-auto flex items-center justify-center mb-4 border border-zinc-700 shadow-inner">
                        <FaPenNib className="text-2xl text-pink-400" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-white mb-2">
                        {isSignup ? '새로운 기록 시작' : '공감 일기'}
                    </h2>
                    <p className="text-zinc-400 font-serif text-sm tracking-widest">
                        MY EMOTIONAL JOURNAL
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 이메일 입력 */}
                    <div className="relative">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email Address"
                            className="w-full bg-transparent border-b border-zinc-700 px-2 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors font-serif placeholder-zinc-600"
                            required
                        />
                    </div>

                    {/* 비밀번호 입력 */}
                    <div className="relative">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full bg-transparent border-b border-zinc-700 px-2 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors font-serif placeholder-zinc-600"
                            required
                        />
                    </div>

                    {/* 닉네임 입력 (회원가입 시에만 등장) */}
                    {isSignup && (
                        <div className="relative animate-fade-in-up">
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="Your Nickname"
                                className="w-full bg-transparent border-b border-zinc-700 px-2 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors font-serif placeholder-zinc-600"
                                required
                            />
                        </div>
                    )}

                    {/* 메인 액션 버튼 */}
                    <button
                        type="submit"
                        className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)] mt-4"
                    >
                        {isSignup ? <FaUserPlus /> : <FaSignInAlt />}
                        <span>{isSignup ? '다이어리 만들기' : '일기장 펼치기'}</span>
                    </button>
                </form>

                {/* 하단 전환 링크 */}
                <div className="mt-8 flex flex-col items-center gap-4">
                    <button
                        onClick={() => setIsSignup(!isSignup)}
                        className="text-zinc-500 text-sm hover:text-pink-300 transition-colors font-serif underline underline-offset-4"
                    >
                        {isSignup ? '이미 일기장이 있으신가요? 로그인' : '처음 오셨나요? 회원가입'}
                    </button>

                    <div className="w-full h-px bg-zinc-800"></div>

                    <button
                        onClick={onGuestLogin}
                        className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
                    >
                        게스트로 둘러보기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;