import { FaBolt, FaCalendarAlt, FaSignOutAlt, FaUserCircle, FaSignInAlt, FaUserSecret } from 'react-icons/fa';

const Header = ({ selectedModel, user, onToggleCalendar, onLogout, onLoginRedirect }) => (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-zinc-800/50 backdrop-blur-md bg-zinc-950/80">
        {/* 모바일에서는 패딩을 줄이고(py-2), 데스크탑에서는 원래대로(sm:py-3) 유지 */}
        <div className="max-w-4xl mx-auto px-3 py-2 sm:px-6 sm:py-3">
            <div className="flex items-center justify-between">

                {/* 1. 로고와 타이틀 */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* 로고 크기: 모바일(w-7) -> 데스크탑(sm:w-8) */}
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-linear-to-br from-pink-500 to-purple-600 rounded-xl
                        flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <FaBolt className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div>
                        {/* 핵심 수정: whitespace-nowrap (줄바꿈 방지), text-base (모바일 폰트 작게) */}
                        <h1 className="text-base sm:text-lg font-bold bg-linear-to-r from-white to-zinc-400 bg-clip-text text-transparent whitespace-nowrap">
                            CodeStory 감성 다이어리
                        </h1>
                    </div>
                </div>

                {/* 2. 우측 컨트롤 패널 */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* 모델 배지 (모바일 숨김 유지) */}
                    <div className="hidden sm:flex px-2.5 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-xs text-zinc-400">
                        {selectedModel?.shortLabel || 'GPT-4o'}
                        <div className="ml-2 w-1.5 h-1.5 bg-green-500 rounded-full self-center animate-pulse"></div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 pl-3 border-l border-zinc-800 ml-1">
                        {/* 로그인 상태일 때 */}
                        {user ? (
                            <>
                                <button 
                                    onClick={onToggleCalendar}
                                    className="p-2 text-zinc-400 hover:text-pink-400 hover:bg-zinc-800 rounded-lg transition-all"
                                    title="일기 달력 보기"
                                >
                                    <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>

                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="User" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-zinc-700" />
                                ) : (
                                    <FaUserCircle className="w-7 h-7 sm:w-8 sm:h-8 text-zinc-600" />
                                )}

                                <button 
                                    onClick={onLogout}
                                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-all"
                                    title="로그아웃"
                                >
                                    <FaSignOutAlt className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </>
                        ) : (
                            /* 비로그인(게스트) 상태일 때 */
                            <>
                                <div className="flex items-center gap-2 px-2 hidden sm:flex">
                                    <FaUserSecret className="w-5 h-5 text-zinc-500" />
                                    <span className="text-sm text-zinc-500">게스트 모드</span>
                                </div>
                                <button 
                                    onClick={onLoginRedirect}
                                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs sm:text-sm flex items-center gap-2 transition-colors border border-zinc-700 whitespace-nowrap"
                                    title="로그인 하러 가기"
                                >
                                    <FaSignInAlt />
                                    <span>로그인</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </header>
);

export default Header;