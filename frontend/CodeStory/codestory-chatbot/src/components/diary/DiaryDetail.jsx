import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHeart, FaRegHeart } from 'react-icons/fa';
import api from '../../services/api';

const DiaryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [diary, setDiary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentContent, setCommentContent] = useState('');
    const [liked, setLiked] = useState(false);

    // localStorage에서 사용자 정보 가져오기
    const user = JSON.parse(localStorage.getItem('diaryUser') || '{}');
    const userNickname = user?.nickname || '익명';

    const fetchDiaryDetail = useCallback(async () => {
        try {
            const response = await api.get(`/diary/${id}`);
            setDiary(response.data);
            setLoading(false);
        } catch (error) {
            console.error('일기 불러오기 실패:', error);
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDiaryDetail();
    }, [fetchDiaryDetail]);

    const handleLikeToggle = async () => {
        try {
            const response = await api.post(`/diary/${id}/like`);
            setLiked(response.data.liked);
            fetchDiaryDetail(); // 좋아요 개수 갱신
        } catch (error) {
            console.error('좋아요 토글 실패:', error);
        }
    };

    const handleCommentSubmit = async () => {
        if (!commentContent.trim()) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        try {
            await api.post(`/diary/${id}/comment`, {
                content: commentContent,
                author: userNickname
            });
            setCommentContent('');
            fetchDiaryDetail(); // 댓글 목록 갱신
        } catch (error) {
            console.error('댓글 작성 실패:', error);
            alert('댓글 작성에 실패했습니다.');
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: 'var(--text-color)'
            }} data-gtm="diary-detail-loading">
                로딩 중...
            </div>
        );
    }

    if (!diary) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: 'var(--text-color)'
            }} data-gtm="diary-detail-not-found">
                일기를 찾을 수 없습니다.
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '40px 20px',
            color: 'var(--text-color)'
        }} data-gtm="view-diary-detail">
            {/* 뒤로가기 버튼 */}
            <button
                onClick={() => navigate(-1)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    marginBottom: '20px',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-color)',
                    cursor: 'pointer',
                    fontSize: '14px'
                }}
                data-gtm="diary-detail-back-button"
            >
                <FaArrowLeft /> 뒤로가기
            </button>

            {/* 일기 카드 */}
            <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '32px',
                marginBottom: '24px'
            }} data-gtm="diary-detail-card">
                {/* 제목 */}
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    marginBottom: '16px',
                    color: 'var(--text-color)'
                }} data-gtm="diary-detail-title">
                    {diary.title}
                </h1>

                {/* 메타 정보 */}
                <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '24px',
                    fontSize: '14px',
                    color: 'var(--sub-text-color)'
                }} data-gtm="diary-detail-meta">
                    <span>{new Date(diary.date).toLocaleDateString('ko-KR')}</span>
                    <span>•</span>
                    <span>{diary.nickname}</span>
                    {diary.emoji && <span style={{ fontSize: '20px' }}>{diary.emoji}</span>}
                </div>

                {/* 이미지 */}
                {diary.imageUrl && (
                    <img
                        src={diary.imageUrl}
                        alt="diary"
                        style={{
                            width: '100%',
                            maxHeight: '400px',
                            objectFit: 'cover',
                            borderRadius: '12px',
                            marginBottom: '24px'
                        }}
                        data-gtm="diary-detail-image"
                    />
                )}

                {/* 본문 */}
                <div style={{
                    fontSize: '16px',
                    lineHeight: '1.8',
                    whiteSpace: 'pre-wrap',
                    marginBottom: '24px',
                    color: 'var(--text-color)'
                }} data-gtm="diary-detail-content">
                    {diary.content}
                </div>

                {/* 태그 */}
                {diary.tags && diary.tags.length > 0 && (
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        marginBottom: '24px'
                    }} data-gtm="diary-detail-tags">
                        {diary.tags.map((tag, index) => (
                            <span key={index} style={{
                                padding: '4px 12px',
                                background: 'var(--accent-color)',
                                color: 'white',
                                borderRadius: '12px',
                                fontSize: '12px'
                            }} data-gtm="diary-detail-tag-chip">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* 좋아요 버튼 */}
                <button
                    onClick={handleLikeToggle}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        background: liked ? 'var(--accent-color)' : 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: liked ? 'white' : 'var(--text-color)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                    data-gtm="diary-detail-like-button"
                    data-gtm-liked={liked ? "true" : "false"}
                >
                    {liked ? <FaHeart /> : <FaRegHeart />}
                    좋아요 {diary.likeCount || 0}
                </button>
            </div>

            {/* 댓글 섹션 */}
            <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '24px'
            }} data-gtm="diary-detail-comment-section">
                <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '16px',
                    color: 'var(--text-color)'
                }} data-gtm="diary-detail-comment-header">
                    댓글 {diary.comments?.length || 0}
                </h3>

                {/* 댓글 입력 */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginBottom: '24px'
                }} data-gtm="diary-detail-comment-form">
                    {/* 현재 사용자 닉네임 표시 */}
                    <div style={{
                        fontSize: '13px',
                        color: 'var(--sub-text-color)',
                        marginBottom: '4px'
                    }}>
                        <strong>{userNickname}</strong>님으로 댓글 작성
                    </div>
                    <textarea
                        placeholder="댓글을 입력하세요..."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        style={{
                            padding: '10px 14px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            background: 'var(--bg-color)',
                            color: 'var(--text-color)',
                            fontSize: '14px',
                            minHeight: '80px',
                            resize: 'vertical',
                            outline: 'none'
                        }}
                        data-gtm="diary-detail-comment-content-textarea"
                    />
                    <button
                        onClick={handleCommentSubmit}
                        style={{
                            padding: '10px 20px',
                            background: 'var(--accent-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            alignSelf: 'flex-end'
                        }}
                        data-gtm="diary-detail-comment-submit-button"
                    >
                        댓글 작성
                    </button>
                </div>

                {/* 댓글 목록 */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }} data-gtm="diary-detail-comment-list">
                    {diary.comments && diary.comments.length > 0 ? (
                        diary.comments.map((comment) => (
                            <div key={comment.id} style={{
                                padding: '16px',
                                background: 'var(--bg-color)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px'
                            }} data-gtm="diary-detail-comment-item">
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '8px',
                                    fontSize: '13px',
                                    color: 'var(--sub-text-color)'
                                }}>
                                    <span style={{ fontWeight: '600' }}>{comment.author}</span>
                                    <span>{new Date(comment.createdAt).toLocaleString('ko-KR')}</span>
                                </div>
                                <p style={{
                                    fontSize: '14px',
                                    lineHeight: '1.6',
                                    color: 'var(--text-color)',
                                    margin: 0
                                }}>
                                    {comment.content}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p style={{
                            textAlign: 'center',
                            color: 'var(--sub-text-color)',
                            fontSize: '14px'
                        }} data-gtm="diary-detail-no-comments">
                            첫 번째 댓글을 남겨보세요!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiaryDetail;
