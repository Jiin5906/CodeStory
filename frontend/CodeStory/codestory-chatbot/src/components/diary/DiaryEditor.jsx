import React, { useState } from 'react';
import { FaArrowLeft, FaCamera, FaTimes } from 'react-icons/fa';
import './DiaryEditor.css';

const RECOMMENDED_TAGS = [
    { id: 1, name: '일상기록' }, { id: 2, name: '소확행' }, 
    { id: 3, name: '오운완' }, { id: 4, name: '맛집' },
    { id: 5, name: '개발공부' }, { id: 6, name: '휴식' }
];

const DiaryEditor = ({ selectedDate, onBack, onNext }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    // Load anonymous setting from localStorage (set in Settings page)
    const getAnonymousDefault = () => {
        const savedPreference = localStorage.getItem('anonymousDefault');
        return savedPreference === 'true';
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const addRecommendedTag = (tagName) => {
        if (!tags.includes(tagName)) setTags([...tags, tagName]);
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleNextClick = () => {
        if (!title.trim()) {
            alert('일기 제목을 입력해주세요.');
            return;
        }
        if (!content.trim()) {
            alert('일기 내용을 입력해주세요.');
            return;
        }
        // Use the default anonymous setting from Settings page
        onNext({ title, content, tags, imageFile: selectedImage, isPublic: false, isAnonymous: getAnonymousDefault() });
    };

    return (
        <div className="editor-container" data-gtm="view-diary-editor">
            {/* 상단 헤더 */}
            <div className="editor-header">
                <button 
                    onClick={onBack} 
                    className="back-btn"
                    data-gtm="editor-back-button"
                >
                    <FaArrowLeft />
                </button>
                <div className="header-title-area">
                    <span className="date-title">
                        {selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
                    </span>
                    <span className="subtitle">오늘의 하루를 기록해보세요</span>
                </div>
                <button 
                    onClick={handleNextClick} 
                    className="next-btn"
                    data-gtm="editor-save-button"
                >
                    저장하기
                </button>
            </div>

            <div className="editor-body-split">
                {/* 왼쪽: 이미지 업로드 */}
                <div className="editor-left-panel">
                    <div className="image-upload-wrapper">
                        <input 
                            type="file" 
                            accept="image/*" 
                            id="image-upload" 
                            style={{ display: 'none' }} 
                            onChange={handleImageChange} 
                        />
                        <label 
                            htmlFor="image-upload" 
                            className={`image-upload-box ${previewUrl ? 'has-image' : ''}`}
                            data-gtm="editor-image-upload-label"
                            data-gtm-has-image={previewUrl ? "true" : "false"}
                        >
                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} alt="preview" className="image-preview" />
                                    <button 
                                        className="remove-img-btn" 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setPreviewUrl('');
                                            setSelectedImage(null);
                                        }}
                                        data-gtm="editor-image-remove-button"
                                    >
                                        <FaTimes />
                                    </button>
                                </>
                            ) : (
                                <div className="image-placeholder">
                                    <div className="icon-circle"><FaCamera size={28} className="camera-icon" /></div>
                                    <span className="placeholder-text">오늘의 특별한 순간을<br/>사진으로 남겨보세요</span>
                                    <span className="placeholder-sub">클릭하여 업로드</span>
                                </div>
                            )}
                        </label>
                    </div>
                </div>

                {/* 오른쪽: 입력 영역 */}
                <div className="editor-right-panel">
                    {/* 제목 입력 섹션 */}
                    <div className="title-section" style={{ marginBottom: '20px' }} data-gtm="editor-title-section">
                        <input
                            type="text"
                            placeholder="제목을 입력하세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="title-input"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: '20px',
                                fontWeight: '600',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                background: 'var(--card-bg)',
                                color: 'var(--text-color)',
                                outline: 'none'
                            }}
                            data-gtm="editor-title-input-field"
                        />
                    </div>

                    {/* 태그 입력 섹션 */}
                    <div className="tag-section" style={{ marginBottom: '20px' }} data-gtm="editor-tag-section">
                        <input 
                            type="text" 
                            placeholder="#태그 입력 (Enter로 추가)" 
                            value={tagInput} 
                            onChange={(e) => setTagInput(e.target.value)} 
                            onKeyDown={handleTagKeyDown} 
                            className="tag-input" 
                            data-gtm="editor-tag-input-field"
                        />
                        <div className="tags-display">
                            {tags.map(tag => (
                                <span key={tag} className="tag-chip" data-gtm="editor-added-tag-chip">
                                    #{tag} 
                                    <span 
                                        onClick={() => removeTag(tag)} 
                                        className="tag-remove"
                                        data-gtm="editor-tag-remove-x"
                                    >×</span>
                                </span>
                            ))}
                        </div>
                        <div className="recommend-tags">
                            {RECOMMENDED_TAGS.map(tag => (
                                <button 
                                    key={tag.id} 
                                    onClick={() => addRecommendedTag(tag.name)} 
                                    className="recommend-chip"
                                    data-gtm="editor-recommend-tag-button"
                                    data-gtm-tag-name={tag.name}
                                >
                                    #{tag.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 내용 입력 */}
                    <div className="text-input-wrapper">
                        <textarea 
                            className="diary-textarea" 
                            placeholder="오늘 하루는 어떠셨나요? 사소한 이야기라도 좋아요." 
                            value={content} 
                            onChange={(e) => setContent(e.target.value)} 
                            data-gtm="editor-content-textarea"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiaryEditor;