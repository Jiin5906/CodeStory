// OpenAI 공식 API 주소로 변경
export const API_URL = 'https://api.openai.com/v1/chat/completions';

export const fallbackHeaders = {
    'Content-Type': 'application/json',
};

// GPT 모델이 처리할 수 있는 파일 글자 수 제한 (약간 여유 있게 설정)
export const MAX_FILE_CHARS = 100000;