import axios from 'axios';

// 도메인 제거, 상대 경로 사용 (http/https 자동 호환)
const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// JWT 토큰을 요청 헤더에 자동으로 추가하는 인터셉터
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 401 에러 발생 시 Refresh Token으로 재시도하는 인터셉터 (선택적)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 401 에러이고, 재시도하지 않은 요청인 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    // Refresh Token으로 새 Access Token 요청 (백엔드에 구현 필요)
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken
                    });

                    const { accessToken } = response.data;
                    localStorage.setItem('accessToken', accessToken);

                    // 원래 요청 재시도
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh Token도 만료된 경우 로그아웃 처리
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('diaryUser');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

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