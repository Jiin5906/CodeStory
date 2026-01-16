import axios from 'axios';

const API_BASE_URL = '/api';

// [수정] 기본 headers 설정을 삭제했습니다.
// Axios가 데이터를 보고 알아서 Content-Type을 결정하도록 맡깁니다.
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

        // 1. JSON 데이터 포장
        // 백엔드가 @RequestPart("diary")로 받으므로 이름과 타입을 정확히 명시합니다.
        const jsonBlob = new Blob([JSON.stringify(diaryData)], { type: "application/json" });
        formData.append("diary", jsonBlob);

        // 2. 이미지 파일 포장 (있을 경우만)
        if (imageFile) {
            formData.append("image", imageFile);
        }

        // 3. 전송
        // headers 설정을 아예 하지 않습니다. 
        // FormData를 넣으면 Axios가 자동으로 'multipart/form-data; boundary=...' 헤더를 만들어줍니다.
        const response = await api.post('/diaries/write', formData);
        
        return response.data;
    },
};

export default api;