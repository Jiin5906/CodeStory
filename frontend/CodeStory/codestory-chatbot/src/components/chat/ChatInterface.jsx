import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import { chatApi } from '../../services/api';
import Lottie from 'lottie-react';
import mongleAnimation from '../../assets/mongleIDLE.json';

const ChatInterface = ({ user }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // 자동 스크롤 (새 메시지가 추가될 때마다)
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 채팅 히스토리 로드
    useEffect(() => {
        const loadHistory = async () => {
            if (!user?.id) return;

            try {
                const history = await chatApi.getChatHistory(user.id);
                setMessages(history);
            } catch (error) {
                console.error('Failed to load chat history:', error);
            }
        };

        loadHistory();
    }, [user]);

    // 메시지 전송 핸들러
    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setIsLoading(true);

        // 사용자 메시지를 즉시 UI에 표시
        const newUserMessage = {
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newUserMessage]);

        try {
            // AI 응답 요청
            const response = await chatApi.sendMessage(user.id, userMessage);

            // AI 응답을 UI에 표시
            const aiMessage = {
                role: 'assistant',
                content: response.response,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);

            // 에러 메시지 표시
            const errorMessage = {
                role: 'assistant',
                content: '메시지 전송에 실패했어요. 다시 시도해주세요.',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Enter 키 입력 핸들러
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div
            className="flex flex-col h-screen"
            style={{ backgroundColor: 'var(--bg-color)' }}
            data-gtm="chat-interface"
        >
            {/* Header */}
            <div
                className="px-6 py-4 shadow-sm border-b flex items-center gap-4"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                }}
            >
                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                    <Lottie animationData={mongleAnimation} loop={true} autoplay={true} style={{ width: 40, height: 40 }} />
                </div>
                <div>
                    <h2
                        className="text-xl font-bold"
                        style={{ color: 'var(--text-color)' }}
                    >
                        몽글이와 대화하기
                    </h2>
                    <p
                        className="text-sm"
                        style={{ color: 'var(--sub-text-color)' }}
                    >
                        일기에 없는 내용도 편하게 물어보세요!
                    </p>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-60">
                        <div className="w-32 h-32 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                            <Lottie animationData={mongleAnimation} loop={true} autoplay={true} style={{ width: 100, height: 100 }} />
                        </div>
                        <p
                            className="font-medium text-lg text-center"
                            style={{ color: 'var(--sub-text-color)' }}
                        >
                            안녕하세요, {user?.nickname || '게스트'}님!<br />
                            무엇이든 편하게 물어보세요.
                        </p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            data-gtm={`chat-message-${msg.role}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <FaRobot className="text-[#7C71F5]" size={16} />
                                </div>
                            )}
                            <div
                                className={`max-w-[70%] px-4 py-3 rounded-2xl whitespace-pre-line ${
                                    msg.role === 'user'
                                        ? 'bg-[#7C71F5] text-white'
                                        : ''
                                }`}
                                style={msg.role === 'assistant' ? {
                                    backgroundColor: 'var(--card-bg)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-color)'
                                } : {}}
                            >
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                    <FaUser className="text-gray-600" size={14} />
                                </div>
                            )}
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaRobot className="text-[#7C71F5]" size={16} />
                        </div>
                        <div
                            className="px-4 py-3 rounded-2xl"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-[#7C71F5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-[#7C71F5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-[#7C71F5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
                className="px-6 py-4 border-t"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                }}
            >
                <div className="flex gap-3 items-end max-w-4xl mx-auto">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
                        rows={1}
                        className="flex-1 px-4 py-3 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#7C71F5] transition-all"
                        style={{
                            backgroundColor: 'var(--bg-color)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-color)',
                            maxHeight: '120px'
                        }}
                        disabled={isLoading}
                        data-gtm="chat-input-textarea"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="px-5 py-3 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
                        style={{
                            backgroundColor: '#7C71F5',
                            color: 'white'
                        }}
                        data-gtm="chat-send-button"
                    >
                        <FaPaperPlane size={16} />
                        전송
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
