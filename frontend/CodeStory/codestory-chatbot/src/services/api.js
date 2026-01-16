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
    }
};

export default api;