import axios from 'axios';

// [핵심] 도메인(http://...)을 제거하고 상대 경로 '/api'만 사용합니다.
// 이렇게 하면 http://logam.click 이든 https://logam.click 이든 알아서 따라갑니다.
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
    getDiaries: async (userId) => {
        const response = await api.get(`/diaries?userId=${userId}`);
        return response.data;
    },

    saveDiary: async (diaryData, imageFile) => {
        const formData = new FormData();

        formData.append('userId', diaryData.userId);
        formData.append('date', diaryData.date);
        formData.append('content', diaryData.content);
        formData.append('mood', diaryData.mood);
        formData.append('tension', diaryData.tension);
        formData.append('fun', diaryData.fun);
        formData.append('emoji', diaryData.emoji);
        formData.append('isPublic', diaryData.isPublic);
        
        if (diaryData.tags) {
            diaryData.tags.forEach(tag => formData.append('tags', tag));
        }

        if (imageFile) {
            formData.append("image", imageFile);
        }

        const response = await api.post('/diary', formData);
        return response.data;
    },

    // [수정] 공유 상태 변경 (MainDashboard에서 직접 fetch 쓰던 것을 여기로 통합)
    toggleShare: async (id) => {
        const response = await api.post(`/diary/${id}/status`);
        return response.data;
    },

    // [추가] 일기 삭제 (MainDashboard에서 직접 fetch 쓰던 것을 여기로 통합)
    deleteDiary: async (id) => {
        const response = await api.delete(`/diary/${id}`);
        return response.data;
    }
};

export default api;