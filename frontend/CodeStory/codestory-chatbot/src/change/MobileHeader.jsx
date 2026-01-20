import React, { useState } from 'react';
import MainRoom from './MainRoom';
import BottomSheet from './BottomSheet';

const MobileDashboard = () => {
    // 1. 상태 관리
    const [latestLog, setLatestLog] = useState(''); // 방금 쓴 글 (MainRoom 부유 효과용)
    const [aiResponse, setAiResponse] = useState(''); // 현재 AI의 한마디 (MainRoom 구름용)
    const [isAiThinking, setIsAiThinking] = useState(false); // 로딩 상태
    
    // 2. 일기 데이터 (초기값은 더미, 나중에 API로 교체)
    const [diaries, setDiaries] = useState([
        { date: '2026-01-19', emoji: '☁️', content: '비도 오고 그냥 아무것도 하기 싫다.', aiComment: '그래, 가끔은 정적이 최고의 휴식이지.' },
        { date: '2026-01-18', emoji: '🔥', content: '진짜 너무 화가 나는데 어디 말할 곳도 없고...', aiComment: '그런 날은 매운 거 먹고 확 풀어버리자!' },
    ]);

    // 3. 일기 작성 핸들러 (핵심 로직)
    const handleWrite = async (text) => {
        // (1) UI 즉시 반영: 글자가 둥둥 떠오름
        setLatestLog(text);
        setIsAiThinking(true);
        setAiResponse(''); 

        try {
            // (2) TODO: 여기에 실제 AI API 호출 코드 작성
            // const response = await api.post('/diary', { content: text });
            // const aiResult = response.data.reply;
            
            // [API 시뮬레이션] 2초 뒤에 AI가 응답한다고 가정
            setTimeout(() => {
                const mockAiReply = "무슨 마음인지 알 것 같아. 내가 곁에 있어줄게.";
                
                // (3) 상태 업데이트
                setAiResponse(mockAiReply); // 몽글이가 말함
                setIsAiThinking(false);

                // (4) 일기장에 저장
                const newDiary = {
                    date: new Date().toISOString(),
                    emoji: '✨', // 감정 분석 결과에 따라 변경 가능
                    content: text,
                    aiComment: mockAiReply
                };
                setDiaries([newDiary, ...diaries]); // 최신 글이 위로 오게 추가

            }, 2000);

        } catch (error) {
            console.error("AI 응답 실패:", error);
            setIsAiThinking(false);
            setAiResponse("잠시 연결이 불안정한가 봐요. 다시 이야기해줄래요?");
        }
    };

    return (
        <div className="relative h-screen bg-[#F5E6D3] flex justify-center overflow-hidden">
            <div className="w-full max-w-md h-full bg-white relative flex flex-col shadow-2xl overflow-hidden">
                
                {/* 상단: 시각적 피드백 영역 */}
                <MainRoom 
                    latestLog={latestLog} 
                    aiResponse={aiResponse}
                    isAiThinking={isAiThinking}
                />

                {/* 하단: 입력 및 기록 영역 */}
                <BottomSheet 
                    onWrite={handleWrite} 
                    diaries={diaries} 
                    streakDays={3}
                />
                
            </div>
        </div>
    );
};

export default MobileDashboard;