import React, { useState } from 'react';
import { FaArrowLeft, FaCamera, FaTimes } from 'react-icons/fa';
import './DiaryEditor.css';

const RECOMMENDED_TAGS = [
    { id: 1, name: '일상기록' }, { id: 2, name: '소확행' }, 
    { id: 3, name: '오운완' }, { id: 4, name: '맛집' },
    { id: 5, name: '개발공부' }, { id: 6, name: '휴식' }
];

const DiaryEditor = ({ selectedDate, onBack, onNext }) => {
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    // [삭제됨] const [isPublic, setIsPublic] = useState(false); // 이제 안 씁니다.

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
        if (!content.trim()) {
            alert('일기 내용을 입력해주세요.');
            return;
        }
        // [수정] isPublic은 항상 false(비공개)로 넘깁니다.
        onNext({ content, tags, imageFile: selectedImage, isPublic: false });
    };

    return (
        <div className="editor-container">
            {/* 상단 헤더 (기존 동일) */}
            <div className="editor-header">
                <button onClick={onBack} className="back-btn"><FaArrowLeft /></button>
                <div className="header-title-area">
                    <span className="date-title">
                        {selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
                    </span>
                    <span className="subtitle">오늘의 하루를 기록해보세요</span>
                </div>
                <button onClick={handleNextClick} className="next-btn">저장하기</button>
            </div>

            <div className="editor-body-split">
                {/* 왼쪽: 이미지 업로드 (기존 동일) */}
                <div className="editor-left-panel">
                    <div className="image-upload-wrapper">
                        <input type="file" accept="image/*" id="image-upload" style={{ display: 'none' }} onChange={handleImageChange} />
                        <label htmlFor="image-upload" className={`image-upload-box ${previewUrl ? 'has-image' : ''}`}>
                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} alt="preview" className="image-preview" />
                                    <button className="remove-img-btn" onClick={(e) => {
                                        e.preventDefault();
                                        setPreviewUrl('');
                                        setSelectedImage(null);
                                    }}><FaTimes /></button>
                                </>
                            ) : (
                                <div className="image-placeholder">
                                    <div className="icon-circle"><FaCamera size={28} color="#6C5CE7" /></div>
                                    <span className="placeholder-text">오늘의 특별한 순간을<br/>사진으로 남겨보세요</span>
                                    <span className="placeholder-sub">클릭하여 업로드</span>
                                </div>
                            )}
                        </label>
                    </div>
                </div>

                {/* 오른쪽: 입력 영역 */}
                <div className="editor-right-panel">
                    
                    {/* [삭제됨] 커뮤니티 공유 스위치 영역 */}

                    {/* [이동됨] 태그 입력 섹션 (위로 올라옴) */}
                    <div className="tag-section" style={{ marginBottom: '20px' }}>
                        <input 
                            type="text" 
                            placeholder="#태그 입력 (Enter로 추가)" 
                            value={tagInput} 
                            onChange={(e) => setTagInput(e.target.value)} 
                            onKeyDown={handleTagKeyDown} 
                            className="tag-input" 
                        />
                        <div className="tags-display">
                            {tags.map(tag => (
                                <span key={tag} className="tag-chip">#{tag} <span onClick={() => removeTag(tag)} className="tag-remove">×</span></span>
                            ))}
                        </div>
                        <div className="recommend-tags">
                            {RECOMMENDED_TAGS.map(tag => (
                                <button key={tag.id} onClick={() => addRecommendedTag(tag.name)} className="recommend-chip">
                                    #{tag.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 내용 입력 (아래로 내려감) */}
                    <div className="text-input-wrapper">
                        <textarea 
                            className="diary-textarea" 
                            placeholder="오늘 하루는 어떠셨나요? 사소한 이야기라도 좋아요." 
                            value={content} 
                            onChange={(e) => setContent(e.target.value)} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiaryEditor;