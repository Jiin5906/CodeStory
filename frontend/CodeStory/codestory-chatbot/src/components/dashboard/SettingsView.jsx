import React, { useState } from 'react';
import { FaUser, FaPaw, FaDatabase, FaUndo, FaEnvelope, FaInfoCircle, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

/**
 * SettingsView — 설정 페이지 (완전 개편)
 *
 * 메뉴 구조:
 * 1. 프로필 설정 (닉네임, 몽글이 이름)
 * 2. 데이터 관리 (백업/복원, 초기화)
 * 3. 지원 및 정보 (문의, 버전)
 *
 * 디자인: Mongle Pastel Theme + font-cute (Jua)
 */
const SettingsView = ({ user }) => {
    const navigate = useNavigate();

    // 프로필 수정 상태
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [isEditingPetName, setIsEditingPetName] = useState(false);
    const [newNickname, setNewNickname] = useState(user?.nickname || '');
    const [newPetName, setNewPetName] = useState('몽글이'); // TODO: PetContext에서 가져오기

    const handleLogout = () => {
        if (window.confirm('정말 로그아웃 하시겠습니까?')) {
            localStorage.removeItem('diaryUser');
            navigate('/login');
        }
    };

    const handleSaveNickname = () => {
        if (newNickname.trim()) {
            // TODO: API 호출로 닉네임 변경
            alert(`닉네임이 "${newNickname}"(으)로 변경되었습니다!`);
            setIsEditingNickname(false);
        }
    };

    const handleSavePetName = () => {
        if (newPetName.trim()) {
            // TODO: PetContext API 호출로 몽글이 이름 변경
            alert(`몽글이 이름이 "${newPetName}"(으)로 변경되었습니다!`);
            setIsEditingPetName(false);
        }
    };

    const handleBackup = () => {
        alert('데이터 백업 기능은 곧 출시될 예정이에요! 📦');
    };

    const handleRestore = () => {
        alert('데이터 복원 기능은 곧 출시될 예정이에요! 📂');
    };

    const handleReset = () => {
        if (window.confirm('⚠️ 모든 데이터가 삭제됩니다. 정말 초기화하시겠습니까?')) {
            if (window.confirm('정말로 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                // TODO: 데이터 초기화 API 호출
                alert('데이터 초기화 기능은 곧 출시될 예정이에요!');
            }
        }
    };

    const handleContact = () => {
        alert('문의하기 기능은 곧 출시될 예정이에요! 💌\n\n현재는 이메일로 문의해주세요:\ncontact@codestory.app');
    };

    return (
        <div
            className="w-full h-full overflow-y-auto bg-gradient-to-b from-[#FFF8F3] to-[#FFE8F0]"
            style={{ paddingBottom: '5rem', fontFamily: "'Jua', 'Noto Sans KR', sans-serif" }}
            data-gtm="view-settings"
        >
            <div className="px-6 py-8 max-w-2xl mx-auto">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-[#C8A882] mb-2 font-cute">⚙️ 설정</h1>
                    <p className="text-[#8B8B8B] text-base font-cute">
                        나만의 공감일기를 꾸며보세요
                    </p>
                </div>

                {/* 1. 프로필 설정 */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-[#B8B8B8] mb-3 px-2 uppercase tracking-wider font-cute">
                        프로필 설정
                    </h3>
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-lg border-2 border-[#FFB5C2]/20">
                        {/* 닉네임 수정 */}
                        <div className="mb-4 pb-4 border-b border-[#FFD4DC]/40" data-gtm="settings-nickname-section">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-11 h-11 bg-gradient-to-br from-[#FFB5C2] to-[#FF9AAB] rounded-2xl flex items-center justify-center shadow-md">
                                    <FaUser className="text-white text-lg" />
                                </div>
                                <span className="text-[#4A4A4A] font-bold text-lg font-cute">
                                    닉네임
                                </span>
                            </div>

                            {isEditingNickname ? (
                                <div className="flex gap-2 ml-14">
                                    <input
                                        type="text"
                                        value={newNickname}
                                        onChange={(e) => setNewNickname(e.target.value)}
                                        className="flex-1 px-4 py-2 bg-[#FFF8F3] border-2 border-[#FFB5C2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9AAB] font-cute text-[#4A4A4A]"
                                        placeholder="새 닉네임을 입력하세요"
                                        maxLength={20}
                                        data-gtm="settings-nickname-input"
                                    />
                                    <button
                                        onClick={handleSaveNickname}
                                        className="px-5 py-2 bg-gradient-to-r from-[#FFB5C2] to-[#FF9AAB] text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 font-cute"
                                        data-gtm="settings-nickname-save"
                                    >
                                        저장
                                    </button>
                                    <button
                                        onClick={() => {
                                            setNewNickname(user?.nickname || '');
                                            setIsEditingNickname(false);
                                        }}
                                        className="px-4 py-2 bg-[#F8F6F4] text-[#8B8B8B] font-bold rounded-xl hover:bg-[#FFD4DC]/30 transition-all duration-200 font-cute"
                                        data-gtm="settings-nickname-cancel"
                                    >
                                        취소
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between ml-14">
                                    <span className="text-[#8B8B8B] text-base font-cute">
                                        {user?.nickname || '게스트'}
                                    </span>
                                    <button
                                        onClick={() => setIsEditingNickname(true)}
                                        className="px-4 py-1.5 bg-[#FFD4DC]/50 text-[#FFB5C2] text-sm font-bold rounded-lg hover:bg-[#FFD4DC] transition-all duration-200 font-cute"
                                        data-gtm="settings-nickname-edit"
                                    >
                                        변경
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 몽글이 이름 수정 */}
                        <div data-gtm="settings-petname-section">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-11 h-11 bg-gradient-to-br from-[#C8A882] to-[#A89070] rounded-2xl flex items-center justify-center shadow-md">
                                    <FaPaw className="text-white text-lg" />
                                </div>
                                <span className="text-[#4A4A4A] font-bold text-lg font-cute">
                                    몽글이 이름
                                </span>
                            </div>

                            {isEditingPetName ? (
                                <div className="flex gap-2 ml-14">
                                    <input
                                        type="text"
                                        value={newPetName}
                                        onChange={(e) => setNewPetName(e.target.value)}
                                        className="flex-1 px-4 py-2 bg-[#FFF8F3] border-2 border-[#C8A882] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A89070] font-cute text-[#4A4A4A]"
                                        placeholder="몽글이의 새 이름을 입력하세요"
                                        maxLength={15}
                                        data-gtm="settings-petname-input"
                                    />
                                    <button
                                        onClick={handleSavePetName}
                                        className="px-5 py-2 bg-gradient-to-r from-[#C8A882] to-[#A89070] text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 font-cute"
                                        data-gtm="settings-petname-save"
                                    >
                                        저장
                                    </button>
                                    <button
                                        onClick={() => {
                                            setNewPetName('몽글이');
                                            setIsEditingPetName(false);
                                        }}
                                        className="px-4 py-2 bg-[#F8F6F4] text-[#8B8B8B] font-bold rounded-xl hover:bg-[#FFD4DC]/30 transition-all duration-200 font-cute"
                                        data-gtm="settings-petname-cancel"
                                    >
                                        취소
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between ml-14">
                                    <span className="text-[#8B8B8B] text-base font-cute">
                                        {newPetName}
                                    </span>
                                    <button
                                        onClick={() => setIsEditingPetName(true)}
                                        className="px-4 py-1.5 bg-[#F5E6D3]/60 text-[#C8A882] text-sm font-bold rounded-lg hover:bg-[#F5E6D3] transition-all duration-200 font-cute"
                                        data-gtm="settings-petname-edit"
                                    >
                                        변경
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. 데이터 관리 */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-[#B8B8B8] mb-3 px-2 uppercase tracking-wider font-cute">
                        데이터 관리
                    </h3>
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-lg border-2 border-[#FFB5C2]/20">
                        {/* 백업/복원 */}
                        <div className="mb-4 pb-4 border-b border-[#FFD4DC]/40">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-11 h-11 bg-gradient-to-br from-[#87CEEB] to-[#6BB6D6] rounded-2xl flex items-center justify-center shadow-md">
                                    <FaDatabase className="text-white text-lg" />
                                </div>
                                <span className="text-[#4A4A4A] font-bold text-lg font-cute">
                                    앱 데이터 백업 / 복원
                                </span>
                            </div>
                            <div className="flex gap-2 ml-14">
                                <button
                                    onClick={handleBackup}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#87CEEB] to-[#6BB6D6] text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 font-cute"
                                    data-gtm="settings-data-backup"
                                >
                                    📦 백업하기
                                </button>
                                <button
                                    onClick={handleRestore}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#90EE90] to-[#76D476] text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 font-cute"
                                    data-gtm="settings-data-restore"
                                >
                                    📂 복원하기
                                </button>
                            </div>
                        </div>

                        {/* 초기화 */}
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-11 h-11 bg-gradient-to-br from-[#FF6B6B] to-[#EE5A52] rounded-2xl flex items-center justify-center shadow-md">
                                    <FaUndo className="text-white text-lg" />
                                </div>
                                <span className="text-[#4A4A4A] font-bold text-lg font-cute">
                                    초기화
                                </span>
                            </div>
                            <button
                                onClick={handleReset}
                                className="ml-14 w-full max-w-xs px-4 py-2.5 bg-white border-2 border-[#FF6B6B] text-[#FF6B6B] font-bold rounded-xl shadow-sm hover:bg-[#FF6B6B] hover:text-white hover:shadow-lg transition-all duration-200 font-cute"
                                data-gtm="settings-data-reset"
                            >
                                ⚠️ 모든 데이터 삭제
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. 지원 및 정보 */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-[#B8B8B8] mb-3 px-2 uppercase tracking-wider font-cute">
                        지원 및 정보
                    </h3>
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-lg border-2 border-[#FFB5C2]/20">
                        {/* 문의하기 */}
                        <button
                            onClick={handleContact}
                            className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-[#FFB5C2]/10 transition-all duration-200 mb-3"
                            data-gtm="settings-contact"
                        >
                            <div className="w-11 h-11 bg-gradient-to-br from-[#D4A5F5] to-[#C48EE5] rounded-2xl flex items-center justify-center shadow-md">
                                <FaEnvelope className="text-white text-lg" />
                            </div>
                            <span className="text-[#4A4A4A] font-bold text-lg font-cute">
                                문의하기 / 건의하기
                            </span>
                        </button>

                        {/* 앱 버전 정보 */}
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#F8F6F4]/60">
                            <div className="w-11 h-11 bg-gradient-to-br from-[#FFB5C2] to-[#FF9AAB] rounded-2xl flex items-center justify-center shadow-md">
                                <FaInfoCircle className="text-white text-lg" />
                            </div>
                            <div className="flex-1">
                                <div className="text-[#4A4A4A] font-bold text-lg font-cute">앱 버전 정보</div>
                                <div className="text-[#8B8B8B] text-sm mt-0.5 font-cute">공감일기 v1.0.0</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 로그아웃 버튼 */}
                <div className="mt-8">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border-2 border-red-200 hover:bg-red-50 hover:border-red-300 hover:shadow-xl transition-all duration-200 active:scale-98 font-cute"
                        data-gtm="settings-logout"
                    >
                        <FaSignOutAlt className="text-red-500 text-xl" />
                        <span className="text-red-500 font-bold text-lg">로그아웃</span>
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-10 text-center opacity-60">
                    <p className="text-sm text-[#8B8B8B] font-cute">
                        Made with 💝 by CodeStory Team
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
