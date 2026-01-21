import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaMask, FaSignInAlt, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Settings = ({ user, onNicknameChange, onLogout }) => {
    const navigate = useNavigate();
    const [nickname, setNickname] = useState('');
    const [isAnonymousDefault, setIsAnonymousDefault] = useState(false);

    useEffect(() => {
        if (user && user.nickname) {
            setNickname(user.nickname);
        }
        const savedPreference = localStorage.getItem('anonymousDefault');
        if (savedPreference !== null) {
            setIsAnonymousDefault(savedPreference === 'true');
        }
    }, [user]);

    const handleNicknameSave = () => {
        if (nickname.trim() && onNicknameChange) {
            onNicknameChange(nickname);
            alert('닉네임이 변경되었습니다.');
        }
    };

    const handleAnonymousToggle = (e) => {
        const newValue = e.target.checked;
        setIsAnonymousDefault(newValue);
        localStorage.setItem('anonymousDefault', newValue.toString());
    };

    const handleLogout = () => {
        if (window.confirm('로그아웃 하시겠습니까?')) {
            localStorage.removeItem('diaryUser');
            navigate('/login');
            if (onLogout) onLogout();
        }
    };

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-gradient-to-br from-[#fff1f2] via-[#ffe4e6] to-[#fecdd3] overflow-y-auto"
            data-gtm="view-settings-mobile"
        >
            {/* 헤더 */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 px-6 bg-white/30 backdrop-blur-md border-b border-white/20 shadow-sm" data-gtm="settings-header">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-2xl text-slate-600 hover:scale-110 transition-transform p-2"
                    data-gtm="settings-back-button"
                >
                    <FaArrowLeft />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-slate-800">설정</span>
                    <span className="text-xs text-slate-500 tracking-wider">SETTINGS</span>
                </div>
                <div className="w-10"></div> {/* 중앙 정렬을 위한 spacer */}
            </div>

            {/* 컨텐츠 영역 */}
            <div className="max-w-2xl mx-auto p-6 pb-24 space-y-5" data-gtm="settings-content">

                {/* 프로필 설정 */}
                <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/50" data-gtm="settings-section-profile">
                    <div className="flex items-center gap-3 mb-5">
                        <FaUserCircle className="text-rose-500 text-2xl" />
                        <h3 className="text-lg font-bold text-slate-800">프로필 설정</h3>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">닉네임</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="닉네임을 입력하세요"
                                className="flex-1 px-4 py-3 bg-white/80 border border-white/60 rounded-2xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-rose-300 focus:bg-white transition-all"
                                data-gtm="input-settings-nickname"
                            />
                            <button
                                onClick={handleNicknameSave}
                                className="px-6 py-3 bg-gradient-to-tr from-rose-400 to-orange-300 text-white font-bold rounded-2xl shadow-lg shadow-rose-200/50 hover:shadow-xl active:scale-95 transition-all"
                                data-gtm="btn-save-nickname"
                            >
                                변경
                            </button>
                        </div>
                    </div>
                </div>

                {/* 일기 업로드 방식 설정 */}
                <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/50" data-gtm="settings-section-anonymous">
                    <div className="flex items-center gap-3 mb-5">
                        <FaMask className="text-rose-500 text-2xl" />
                        <h3 className="text-lg font-bold text-slate-800">일기 업로드 방식</h3>
                    </div>

                    <p className="text-sm text-slate-600 mb-4">
                        일기 공유 시 기본적으로 익명으로 올릴지 선택하세요.
                    </p>

                    <div className="flex items-center justify-between bg-white/50 rounded-2xl p-4">
                        <div>
                            <span className="block font-semibold text-slate-700">익명으로 올리기</span>
                            <span className="text-xs text-slate-500">
                                {isAnonymousDefault
                                    ? '일기가 기본적으로 익명으로 공유됩니다'
                                    : '일기가 기본적으로 닉네임과 함께 공유됩니다'}
                            </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer" data-gtm="switch-anonymous-default">
                            <input
                                type="checkbox"
                                checked={isAnonymousDefault}
                                onChange={handleAnonymousToggle}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-rose-400 peer-checked:to-orange-300"></div>
                        </label>
                    </div>
                </div>

                {/* 계정 정보 */}
                <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/50" data-gtm="settings-section-account">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">계정 정보</h3>
                    <div className="bg-white/50 rounded-2xl p-4 mb-4">
                        <span className="text-sm text-slate-600">로그인된 이메일</span>
                        <p className="text-base font-semibold text-slate-800 mt-1">
                            {user?.email || '게스트'}
                        </p>
                    </div>

                    {/* 로그인/로그아웃 버튼 */}
                    {user && user.id !== 0 ? (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/80 border border-rose-200 rounded-2xl text-rose-500 font-bold hover:bg-rose-50 active:scale-95 transition-all shadow-sm"
                            data-gtm="btn-logout"
                        >
                            <FaSignOutAlt className="text-xl" />
                            로그아웃
                        </button>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-tr from-rose-400 to-orange-300 rounded-2xl text-white font-bold hover:shadow-xl active:scale-95 transition-all shadow-lg shadow-rose-200/50"
                            data-gtm="btn-login"
                        >
                            <FaSignInAlt className="text-xl" />
                            로그인
                        </button>
                    )}
                </div>

                {/* 앱 정보 */}
                <div className="text-center pt-4 pb-2">
                    <p className="text-xs text-slate-400">공감일기 v1.0.0</p>
                    <p className="text-xs text-slate-400 mt-1">© 2026 CodeStory</p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
