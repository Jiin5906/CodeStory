export const MODELS = [
  {
    id: 'gpt-4o',
    label: 'GPT-4o (Smart & Vision)',
    shortLabel: 'GPT-4o',
  },
  {
    id: 'gpt-3.5-turbo',
    label: 'GPT-3.5 Turbo (Fast)',
    shortLabel: 'GPT-3.5',
  },
];

// GPT-4o는 이미지 인식이 가능하므로 여기에 포함
export const VISION_MODEL_IDS = new Set(['gpt-4o']);

// 파일 내용을 텍스트로 읽어 보낼 모델 (둘 다 가능하게 설정)
export const NOVA_FILE_MODEL_ID = 'gpt-4o';