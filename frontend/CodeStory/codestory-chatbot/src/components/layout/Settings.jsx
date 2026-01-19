import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext'; // 테마 훅 가져오기
import { FaSun, FaMoon } from 'react-icons/fa'; // 테마 아이콘
import './Settings.css';

const Settings = ({ user, onNicknameChange }) => {
    const { currentTheme, changeTheme, themes } = useTheme();
    const [nickname, setNickname] = useState('');
    const [isAnonymousDefault, setIsAnonymousDefault] = useState(false);

    useEffect(() => {
        if (user && user.nickname) {
            setNickname(user.nickname);
        }
        // Load anonymous preference from localStorage
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

        // Optional: Show confirmation
        if (newValue) {
            console.log('✅ 익명 모드 활성화: 앞으로 일기는 기본적으로 익명으로 공유됩니다.');
        } else {
            console.log('✅ 익명 모드 비활성화: 앞으로 일기는 기본적으로 닉네임과 함께 공유됩니다.');
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

            {/* --- 섹션 3: 익명 설정 --- */}
            <div className="settings-section" data-gtm="settings-section-anonymous">
                <h3>🎭 일기 업로드 방식 설정</h3>
                <p className="settings-desc">일기 공유 시 기본적으로 익명으로 올릴지 선택하세요.</p>
                <div className="toggle-row">
                    <div>
                        <span style={{ fontWeight: 600 }}>익명으로 올리기</span>
                        <p style={{ fontSize: '13px', color: 'var(--sub-text-color)', marginTop: '4px' }}>
                            {isAnonymousDefault
                                ? '✅ 일기가 기본적으로 익명으로 공유됩니다'
                                : '✅ 일기가 기본적으로 닉네임과 함께 공유됩니다'}
                        </p>
                    </div>
                    <label className="switch" data-gtm="switch-anonymous-default">
                        <input
                            type="checkbox"
                            checked={isAnonymousDefault}
                            onChange={handleAnonymousToggle}
                        />
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