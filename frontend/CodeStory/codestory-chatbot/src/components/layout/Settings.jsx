import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext'; // 테마 훅 가져오기
import './Settings.css';

const Settings = ({ user, onNicknameChange }) => {
    // 1. 테마 관련 정보 가져오기
    const { currentTheme, changeTheme, themes } = useTheme();

    // 2. 닉네임 변경을 위한 로컬 상태
    const [nickname, setNickname] = useState('');

    // 컴포넌트가 열릴 때 현재 유저 닉네임으로 채워넣기
    useEffect(() => {
        if (user && user.nickname) {
            setNickname(user.nickname);
        }
    }, [user]);

    const handleNicknameSave = () => {
        if (nickname.trim() && onNicknameChange) {
            onNicknameChange(nickname);
            alert('닉네임이 변경되었습니다! 🎉');
        }
    };

    return (
        <div className="settings-container">
            <h2 className="settings-title">환경 설정</h2>

            {/* --- 섹션 1: 테마 변경 --- */}
            <div className="settings-section">
                <h3>🎨 테마 변경</h3>
                <p className="settings-desc">나만의 감성에 맞는 분위기를 선택해보세요.</p>
                
                <div className="theme-grid">
                    {Object.values(themes).map((theme) => (
                        <button
                            key={theme.id}
                            className={`theme-card ${currentTheme.id === theme.id ? 'active' : ''}`}
                            onClick={() => changeTheme(theme.id)}
                        >
                            {/* 테마 미리보기 원 (색상) */}
                            <div 
                                className="theme-preview" 
                                style={{ background: theme.bgColor }}
                            >
                                {/* 현재 선택된 테마라면 체크 표시 */}
                                {currentTheme.id === theme.id && <span className="check-mark">✔</span>}
                            </div>
                            <span className="theme-name">{theme.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* --- 섹션 2: 프로필 설정 --- */}
            <div className="settings-section">
                <h3>👤 프로필 설정</h3>
                <div className="input-group">
                    <label>닉네임</label>
                    <div className="nickname-row">
                        <input 
                            type="text" 
                            value={nickname} 
                            onChange={(e) => setNickname(e.target.value)}
                            className="settings-input"
                        />
                        <button onClick={handleNicknameSave} className="save-btn">변경</button>
                    </div>
                </div>
            </div>

            {/* --- 섹션 3: 알림 설정 (UI만 구현) --- */}
            <div className="settings-section">
                <h3>🔔 알림 설정</h3>
                <div className="toggle-row">
                    <span>일기 작성 알림 받기</span>
                    <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>
            
             {/* --- 섹션 4: 계정 정보 --- */}
             <div className="settings-section">
                <h3>계정 정보</h3>
                <p className="email-info">로그인된 이메일: <strong>{user?.email || '게스트'}</strong></p>
            </div>
        </div>
    );
};

export default Settings;