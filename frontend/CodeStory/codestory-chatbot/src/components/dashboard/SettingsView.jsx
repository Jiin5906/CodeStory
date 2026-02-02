import React from 'react';
import { FaUser, FaMoon, FaBell, FaShieldAlt, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

/**
 * SettingsView — 설정 페이지
 *
 * 하단 탭바의 '설정' 탭에서 표시되는 페이지
 */
const SettingsView = ({ user }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('정말 로그아웃 하시겠습니까?')) {
            localStorage.removeItem('diaryUser');
            navigate('/login');
        }
    };

    const settingsSections = [
        {
            title: '계정',
            items: [
                {
                    icon: FaUser,
                    label: '프로필 설정',
                    value: user?.nickname || '게스트',
                    onClick: () => alert('프로필 설정 기능은 준비 중이에요!'),
                    gtm: 'settings-profile'
                }
            ]
        },
        {
            title: '앱 설정',
            items: [
                {
                    icon: FaMoon,
                    label: '다크 모드',
                    value: '준비 중',
                    onClick: () => alert('다크 모드는 곧 출시될 예정이에요!'),
                    gtm: 'settings-dark-mode'
                },
                {
                    icon: FaBell,
                    label: '알림 설정',
                    value: '끄기',
                    onClick: () => alert('알림 설정 기능은 준비 중이에요!'),
                    gtm: 'settings-notifications'
                }
            ]
        },
        {
            title: '보안',
            items: [
                {
                    icon: FaShieldAlt,
                    label: '개인정보 보호',
                    value: null,
                    onClick: () => alert('개인정보 보호 정책은 준비 중이에요!'),
                    gtm: 'settings-privacy'
                }
            ]
        }
    ];

    return (
        <div
            className="w-full h-full overflow-y-auto bg-gradient-to-b from-[#FFF8F3] to-[#FFE8F0]"
            style={{ paddingBottom: '6rem' }} // 하단 탭바 공간 확보
            data-gtm="view-settings"
        >
            <div className="px-6 py-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">⚙️ 설정</h1>
                    <p className="text-gray-500 text-sm">
                        앱을 나에게 맞게 조정해보세요
                    </p>
                </div>

                {/* 설정 섹션들 */}
                <div className="space-y-6">
                    {settingsSections.map((section, idx) => (
                        <div
                            key={idx}
                            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-[#FFB5C2]/15"
                        >
                            <h3 className="text-xs font-bold text-gray-400 mb-3 px-2 uppercase tracking-wider">
                                {section.title}
                            </h3>
                            <div className="space-y-2">
                                {section.items.map((item, itemIdx) => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={itemIdx}
                                            onClick={item.onClick}
                                            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-[#FFB5C2]/10 transition-all duration-200 active:scale-98"
                                            data-gtm={item.gtm}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-[#FFB5C2] to-[#FF9AAB] rounded-full flex items-center justify-center shadow-md">
                                                    <Icon className="text-white text-lg" />
                                                </div>
                                                <span className="text-gray-800 font-medium">
                                                    {item.label}
                                                </span>
                                            </div>
                                            {item.value && (
                                                <span className="text-gray-400 text-sm">
                                                    {item.value}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 로그아웃 버튼 */}
                <div className="mt-8">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 active:scale-98"
                        data-gtm="settings-logout"
                    >
                        <FaSignOutAlt className="text-red-500 text-lg" />
                        <span className="text-red-500 font-bold">로그아웃</span>
                    </button>
                </div>

                {/* 앱 정보 */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        공감일기 v1.0.0
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Made with 💝 by CodeStory Team
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
