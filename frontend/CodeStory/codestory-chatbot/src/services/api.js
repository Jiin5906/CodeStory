import axios from 'axios';

// 도메인 제거, 상대 경로 사용 (http/https 자동 호환)
const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const authApi = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
    signup: async (email, password, nickname) => {
        const response = await api.post('/auth/signup', { email, password, nickname });
        return response.data;
    }
};

export const diaryApi = {
    // 1. 내 일기 목록 가져오기
    getDiaries: async (userId) => {
        const response = await api.get(`/diaries?userId=${userId}`);
        return response.data;
    },

    // 2. 일기 저장하기
    saveDiary: async (diaryData, imageFile) => {
        const formData = new FormData();

        // Create diary object (excluding imageFile)
        const diaryDto = {
            userId: diaryData.userId,
            date: diaryData.date,
            title: diaryData.title || '',
            content: diaryData.content,
            mood: diaryData.mood,
            tension: diaryData.tension,
            fun: diaryData.fun,
            emoji: diaryData.emoji,
            isPublic: diaryData.isPublic,
            isAnonymous: diaryData.isAnonymous || false,
            tags: diaryData.tags || []
        };

        // Append diary as JSON blob
        formData.append('diary', new Blob([JSON.stringify(diaryDto)], { type: 'application/json' }));

        // Append image if exists
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const response = await api.post('/diaries/write', formData);
        return response.data;
    },

    // 3. [복구됨] 공유된 피드 목록 가져오기 (이게 없어서 에러가 났습니다!)
    getFeed: async () => {
        const response = await api.get('/feed');
        return response.data;
    },

    // 4. 공유 상태 변경 (토글)
    toggleShare: async (id) => {
        const response = await api.post(`/diary/${id}/status`);
        return response.data;
    },

    // 5. 일기 삭제
    deleteDiary: async (id) => {
        const response = await api.delete(`/diary/${id}`);
        return response.data;
    },

    // 6. 특정 일기 상세 조회
    getDiaryDetail: async (id) => {
        const response = await api.get(`/diary/${id}`);
        return response.data;
    },

    // 7. 댓글 작성
    addComment: async (id, content, author) => {
        const response = await api.post(`/diary/${id}/comment`, { content, author });
        return response.data;
    },

    // 8. 좋아요 토글
    toggleLike: async (id) => {
        const response = await api.post(`/diary/${id}/like`);
        return response.data;
    }
};

export default api;