import { FaGoogle, FaBookOpen, FaUserSecret, FaSignOutAlt } from "react-icons/fa";

const Login = ({ onLogin, onGuestLogin, onClose, canClose = true }) => {
  return (
    <div 
      // canClose가 true일 때만 배경 클릭 허용
      onClick={canClose ? onClose : undefined}
      className={`min-h-screen bg-zinc-950/90 flex flex-col items-center justify-center p-4 relative overflow-hidden 
      ${canClose ? 'cursor-pointer' : 'cursor-default'}`} 
    >
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -z-10"></div>

      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl text-center max-w-md w-full z-10 cursor-default"
      >
        <div className="w-16 h-16 bg-linear-to-br from-pink-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg">
          <FaBookOpen className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">감성 다이어리</h1>
        <p className="text-zinc-400 mb-8">당신의 하루를 AI와 함께 기록하세요.</p>

        <div className="space-y-3">
            {/* 1. 구글 로그인 버튼: 로그아웃 상태가 아닐 때(처음 접속 등)만 보여줌 */}
            {canClose && (
              <button
                onClick={onLogin}
                className="w-full bg-white text-zinc-900 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-100 transition-transform active:scale-95 shadow-lg"
              >
                <FaGoogle className="text-red-500" />
                <span>Google 계정으로 시작하기</span>
              </button>
            )}

            {/* 2. 게스트/로그아웃 버튼*/}
            <button
              onClick={onGuestLogin}
              className={`w-full font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 border 
              ${!canClose 
                ? 'bg-red-500/10 text-red-400 border-red-500/50 hover:bg-red-500/20' // 로그아웃 스타일
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white' // 게스트 스타일
              }`}
            >
              {!canClose ? <FaSignOutAlt /> : <FaUserSecret />}
              <span>{!canClose ? "로그아웃" : "로그인 없이 체험하기"}</span>
            </button>
        </div>

        {/* 안내 문구: 로그아웃 상태일 때는 표시 안 함 */}
        {canClose && (
          <p className="mt-6 text-xs text-zinc-500">
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;