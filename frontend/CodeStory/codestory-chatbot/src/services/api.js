import axios from 'axios';

// 도메인을 명시하지 않고 상대 경로를 사용하여 CORS 및 포트 문제를 방지합니다.
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

        // [수정] Blob을 사용하지 않고 백엔드 @ModelAttribute 구조에 맞게 평면적으로 추가합니다.
        // diaryData 객체 내부의 필드들을 직접 꺼내서 append 해야 백엔드 DTO에 바인딩됩니다.
        formData.append('userId', diaryData.userId);
        formData.append('date', diaryData.date);
        formData.append('content', diaryData.content);
        formData.append('mood', diaryData.mood);
        formData.append('tension', diaryData.tension);
        formData.append('fun', diaryData.fun);
        formData.append('emoji', diaryData.emoji);
        formData.append('isPublic', diaryData.isPublic);
        
        if (diaryData.tags) {
            // 태그 배열 처리
            diaryData.tags.forEach(tag => formData.append('tags', tag));
        }

        if (imageFile) {
            formData.append("image", imageFile);
        }

        // 백엔드 엔드포인트 /diary (Controller 확인 결과)
        const response = await api.post('/diary', formData);
        
        return response.data;
    },
    toggleShare: async (id) => {
        const response = await api.post(`/diary/${id}/status`);
        return response.data;
    },
};

export default api;