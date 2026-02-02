import React, { useState } from 'react';
import { FaPlus, FaMicrophone } from 'react-icons/fa';

/**
 * ChatInputBar — 고정형 채팅 입력창
 *
 * 탭바 바로 위에 위치하는 독립적인 입력창
 * 공감냥 앱 스타일의 다크 디자인
 */
const ChatInputBar = ({ onSubmit }) => {
    const [input, setInput] = useState('');

    const handleSubmit = () => {
        if (!input.trim()) return;
        onSubmit(input);
        setInput('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div
            className="fixed w-full z-[55] px-4"
            style={{
                bottom: '5.5rem', // 탭바(80px) + 여백
                maxWidth: '430px',
                left: '50%',
                transform: 'translateX(-50%)'
            }}
            data-gtm="chat-input-bar"
        >
            <div className="flex items-center gap-2 bg-[#2C2C2E] rounded-full px-4 py-3 shadow-lg">
                {/* 왼쪽 + 버튼 */}
                <button
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    onClick={() => alert('추가 기능은 준비 중이에요!')}
                    data-gtm="chat-input-plus-button"
                >
                    <FaPlus className="text-lg" />
                </button>

                {/* 입력 필드 */}
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="메시지를 입력해주세요"
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-gray-500 text-sm"
                    data-gtm="chat-input-field"
                />

                {/* 오른쪽 마이크 버튼 */}
                <button
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    onClick={() => alert('음성 입력은 준비 중이에요!')}
                    data-gtm="chat-input-mic-button"
                >
                    <FaMicrophone className="text-lg" />
                </button>
            </div>
        </div>
    );
};

export default ChatInputBar;
