import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext'; // 테마 훅 가져오기
import { FaSun, FaMoon } from 'react-icons/fa'; // 테마 아이콘
import './Settings.css';

const Settings = ({ user, onNicknameChange }) => {
    const { currentTheme, changeTheme, themes } = useTheme();
    const [nickname, setNickname] = useState('');

    useEffect(() => {
        if (user && user.nickname) {
            setNickname(user.nickname);
        }
    }, [user]);

    const handleNicknameSave = () => {
        if (nickname.trim() && onNicknameChange) {
            onNicknameChange(nickname);
            alert('닉네임이 변경되었습니다.');
        }
    };

    return (
        <div className="settings-container" data-gtm="view-settings">
            <h2 className="settings-title">환경 설정</h2>

            {/* --- 섹션 1: 테마 변경 --- */}
            <div className="settings-section" data-gtm="settings-section-theme">
                <h3>테마 변경</h3>
                <p className="settings-desc">나만의 감성에 맞는 분위기를 선택해보세요.</p>

                <div className="theme-grid">
                    {Object.values(themes).map((theme) => {
                        const ThemeIcon = theme.id === 'light' ? FaSun : FaMoon;
                        const iconColor = theme.id === 'light' ? '#F59E0B' : '#A29BFE';

                        return (
                            <button
                                key={theme.id}
                                className={`theme-card ${currentTheme.id === theme.id ? 'active' : ''}`}
                                onClick={() => changeTheme(theme.id)}
                                data-gtm={`theme-select-${theme.id}`}
                            >
                                <div className="theme-preview">
                                    <ThemeIcon
                                        style={{
                                            fontSize: '32px',
                                            color: iconColor,
                                            transition: 'transform 0.3s'
                                        }}
                                    />
                                </div>
                                {currentTheme.id === theme.id && <span className="check-mark">✓</span>}
                                <span className="theme-name">{theme.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* --- 섹션 2: 프로필 설정 --- */}
            <div className="settings-section" data-gtm="settings-section-profile">
                <h3>👤 프로필 설정</h3>
                <div className="input-group">
                    <label>닉네임</label>
                    <div className="nickname-row">
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="settings-input"
                            data-gtm="input-settings-nickname"
                        />
                        <button
                            onClick={handleNicknameSave}
                            className="save-btn"
                            data-gtm="btn-save-nickname"
                        >
                            변경
                        </button>
                    </div>
                </div>
            </div>

            {/* --- 섹션 3: 알림 설정 --- */}
            <div className="settings-section" data-gtm="settings-section-notification">
                <h3>🔔 알림 설정</h3>
                <div className="toggle-row">
                    <span>일기 작성 알림 받기</span>
                    <label className="switch" data-gtm="switch-notification-diary">
                        <input type="checkbox" defaultChecked />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            {/* --- 섹션 4: 계정 정보 --- */}
            <div className="settings-section" data-gtm="settings-section-account">
                <h3>계정 정보</h3>
                <p className="email-info">로그인된 이메일: <strong>{user?.email || '게스트'}</strong></p>
            </div>
        </div>
    );
};

export default Settings;