import React, { useState } from 'react';
import { FaUser, FaDatabase, FaUndo, FaEnvelope, FaInfoCircle, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { feedbackApi } from '../../services/api';

/**
 * SettingsView — 설정 페이지 (완전 개편)
 *
 * 메뉴 구조:
 * 1. 프로필 설정 (닉네임)
 * 2. 데이터 관리 (백업/복원, 초기화)
 * 3. 지원 및 정보 (문의, 버전)
 *
 * 디자인: Mongle Pastel Theme + font-cute (Jua)
 */
const SettingsView = ({ user }) => {
    const navigate = useNavigate();

    // 프로필 수정 상태
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [newNickname, setNewNickname] = useState(user?.nickname || '');

    // 피드백 모달 상태
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [feedbackCategory, setFeedbackCategory] = useState('문의');
    const [feedbackEmail, setFeedbackEmail] = useState(user?.email || '');
    const [feedbackContent, setFeedbackContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogout = () => {
        if (window.confirm('정말 로그아웃 하시겠습니까?')) {
            localStorage.removeItem('diaryUser');
            navigate('/login');
        }
    };

    const handleSaveNickname = () => {
        if (newNickname.trim()) {
            // localStorage에서 현재 사용자 가져오기
            const currentUser = JSON.parse(localStorage.getItem('diaryUser') || '{}');

            // 닉네임 업데이트
            const updatedUser = { ...currentUser, nickname: newNickname.trim() };

            // localStorage에 저장
            localStorage.setItem('diaryUser', JSON.stringify(updatedUser));

            alert(`닉네임이 "${newNickname.trim()}"(으)로 변경되었습니다!`);
            setIsEditingNickname(false);

            // 페이지 새로고침으로 변경사항 반영 (Dashboard에서 user prop 재로드)
            window.location.reload();
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
        setIsFeedbackModalOpen(true);
    };

    const handleSubmitFeedback = async () => {
        if (!feedbackContent.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }

        if (!feedbackEmail.trim()) {
            alert('이메일 주소를 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            await feedbackApi.submitFeedback(
                user?.id,
                feedbackEmail.trim(),
                feedbackCategory,
                feedbackContent.trim()
            );

            // 성공 메시지
            alert('소중한 의견 감사합니다! 빠른 시일 내에 답변드리겠습니다.');

            // 모달 닫기 및 초기화
            setIsFeedbackModalOpen(false);
            setFeedbackContent('');
            setFeedbackCategory('문의');
        } catch (error) {
            console.error('피드백 전송 실패:', error);
            alert('전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
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
                    <h1 className="text-4xl font-bold text-[#C8A882] mb-2 font-cute">설정</h1>
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
                    </div>
                </div>

                {/* 2. 데이터 관리 */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-[#B8B8B8] mb-3 px-2 uppercase tracking-wider font-cute">
                        데이터 관리
                    </h3>
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-lg border-2 border-[#FFB5C2]/20">
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
                                className="ml-0 sm:ml-14 w-full sm:max-w-xs px-4 py-2.5 bg-white border-2 border-[#FF6B6B] text-[#FF6B6B] font-bold rounded-xl shadow-sm hover:bg-[#FF6B6B] hover:text-white hover:shadow-lg transition-all duration-200 font-cute whitespace-nowrap"
                                data-gtm="settings-data-reset"
                            >
                                모든 데이터 삭제
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
                        Made with by Logam Team
                    </p>
                </div>
            </div>

            {/* 피드백 모달 */}
            {isFeedbackModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsFeedbackModalOpen(false)}
                    data-gtm="feedback-modal-overlay"
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        data-gtm="feedback-modal"
                    >
                        {/* 모달 헤더 */}
                        <div className="bg-gradient-to-r from-[#FFB5C2] to-[#FF9AAB] px-6 py-4 flex items-center justify-between">
                            <h3 className="text-white font-bold text-xl font-cute">문의하기 / 건의하기</h3>
                            <button
                                onClick={() => setIsFeedbackModalOpen(false)}
                                className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
                                data-gtm="feedback-modal-close"
                            >
                                <FaTimes className="text-lg" />
                            </button>
                        </div>

                        {/* 모달 본문 */}
                        <div className="p-6 space-y-4">
                            {/* 카테고리 선택 */}
                            <div>
                                <label className="block text-sm font-bold text-[#4A4A4A] mb-2 font-cute">
                                    분류
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFeedbackCategory('문의')}
                                        className={`flex-1 px-4 py-2 rounded-xl font-bold font-cute transition-all ${
                                            feedbackCategory === '문의'
                                                ? 'bg-gradient-to-r from-[#FFB5C2] to-[#FF9AAB] text-white shadow-md'
                                                : 'bg-[#F8F6F4] text-[#8B8B8B] hover:bg-[#FFD4DC]/30'
                                        }`}
                                        data-gtm="feedback-category-inquiry"
                                    >
                                        문의
                                    </button>
                                    <button
                                        onClick={() => setFeedbackCategory('건의')}
                                        className={`flex-1 px-4 py-2 rounded-xl font-bold font-cute transition-all ${
                                            feedbackCategory === '건의'
                                                ? 'bg-gradient-to-r from-[#FFB5C2] to-[#FF9AAB] text-white shadow-md'
                                                : 'bg-[#F8F6F4] text-[#8B8B8B] hover:bg-[#FFD4DC]/30'
                                        }`}
                                        data-gtm="feedback-category-suggestion"
                                    >
                                        건의
                                    </button>
                                    <button
                                        onClick={() => setFeedbackCategory('버그 제보')}
                                        className={`flex-1 px-4 py-2 rounded-xl font-bold font-cute transition-all ${
                                            feedbackCategory === '버그 제보'
                                                ? 'bg-gradient-to-r from-[#FFB5C2] to-[#FF9AAB] text-white shadow-md'
                                                : 'bg-[#F8F6F4] text-[#8B8B8B] hover:bg-[#FFD4DC]/30'
                                        }`}
                                        data-gtm="feedback-category-bug"
                                    >
                                        버그 제보
                                    </button>
                                </div>
                            </div>

                            {/* 이메일 */}
                            <div>
                                <label className="block text-sm font-bold text-[#4A4A4A] mb-2 font-cute">
                                    이메일
                                </label>
                                <input
                                    type="email"
                                    value={feedbackEmail}
                                    onChange={(e) => setFeedbackEmail(e.target.value)}
                                    placeholder="답변 받으실 이메일을 입력하세요"
                                    className="w-full px-4 py-2.5 bg-[#FFF8F3] border-2 border-[#FFD4DC]/40 rounded-xl focus:outline-none focus:border-[#FFB5C2] focus:ring-2 focus:ring-[#FFB5C2]/20 font-cute text-[#4A4A4A] placeholder:text-[#B8B8B8]"
                                    data-gtm="feedback-email-input"
                                />
                            </div>

                            {/* 내용 */}
                            <div>
                                <label className="block text-sm font-bold text-[#4A4A4A] mb-2 font-cute">
                                    내용
                                </label>
                                <textarea
                                    value={feedbackContent}
                                    onChange={(e) => setFeedbackContent(e.target.value)}
                                    placeholder="문의하실 내용이나 건의사항을 상세히 적어주세요"
                                    rows={5}
                                    className="w-full px-4 py-3 bg-[#FFF8F3] border-2 border-[#FFD4DC]/40 rounded-xl focus:outline-none focus:border-[#FFB5C2] focus:ring-2 focus:ring-[#FFB5C2]/20 font-cute text-[#4A4A4A] placeholder:text-[#B8B8B8] resize-none"
                                    data-gtm="feedback-content-textarea"
                                />
                            </div>

                            {/* 제출 버튼 */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setIsFeedbackModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-[#F8F6F4] text-[#8B8B8B] font-bold rounded-xl hover:bg-[#FFD4DC]/30 transition-all duration-200 font-cute"
                                    data-gtm="feedback-cancel"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSubmitFeedback}
                                    disabled={isSubmitting}
                                    className={`flex-1 px-4 py-3 bg-gradient-to-r from-[#FFB5C2] to-[#FF9AAB] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-cute ${
                                        isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                                    }`}
                                    data-gtm="feedback-submit"
                                >
                                    {isSubmitting ? '전송 중...' : '제출하기'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsView;
