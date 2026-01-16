import { FaSearch, FaRegBell, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';

const Header = ({ user, onLogout, onLoginRedirect }) => {
    // 게스트인지 확인 (id가 0이면 게스트)
    const isGuest = user?.id === 0;

    return (
        <header className="flex justify-between items-center px-5 py-6">
            {/* 로고 */}
            <div className="text-2xl font-bold tracking-wider font-serif text-white">
                Codestory
            </div>

            {/* 우측 아이콘 및 버튼 영역 */}
            <div className="flex items-center gap-5 text-zinc-400">
                <FaSearch className="text-xl cursor-pointer hover:text-white transition-colors" />
                <FaRegBell className="text-xl cursor-pointer hover:text-white transition-colors" />

                {/* 구분선 */}
                <div className="w-px h-4 bg-zinc-700 mx-1"></div>

                {/* 로그인/로그아웃 버튼 로직 */}
                {isGuest ? (
                    // 1. 게스트일 때 -> 로그인 버튼 표시
                    <button 
                        onClick={onLoginRedirect}
                        className="flex items-center gap-2 text-sm font-bold text-[#00C896] hover:text-[#00E0A8] transition-colors"
                    >
                        <span>로그인</span>
                        <FaSignInAlt />
                    </button>
                ) : (
                    // 2. 회원일 때 -> 로그아웃 버튼 표시
                    <button 
                        onClick={onLogout}
                        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-red-400 transition-colors"
                        title="로그아웃"
                    >
                        <span className="hidden sm:inline">{user?.nickname}님</span>
                        <FaSignOutAlt />
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;