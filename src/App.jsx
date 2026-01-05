import { useEffect, useState, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, query } from 'firebase/firestore';

import { API_URL, fallbackHeaders, MAX_FILE_CHARS } from './constants/api';
import { MODELS, NOVA_FILE_MODEL_ID, VISION_MODEL_IDS } from './constants/models';

import AssistantResponse from './components/AssistantResponse';
import ErrorBanner from './components/ErrorBanner';
import Header from './components/Header';
import PromptForm from './components/PromptForm';
import QuickActions from './components/QuickActions';
import Login from './components/Login';
import CalendarSidebar from './components/CalendarSidebar';

// AI 페르소나 및 시스템 프롬프트 정의
const SYSTEM_PROMPT = `
너는 사용자의 하루 일기를 듣고 따뜻하게 공감해 주는 '감성 AI 파트너'야.
지침:
1. 감정을 깊이 이해하고 위로하거나 축하해 줘.
2. 부드러운 말투 사용 ("해요"체).
3. 해결책보다 공감 우선.
4. 끝에는 짧은 명언이나 시 구절 선물.
`;

function App() {
    // -------------------------------------------------------------------------
    // 1. 상태 관리 (State Management)
    
    // 사용자 인증 및 UI 모드 관련 상태
    const [user, setUser] = useState(null); // Firebase 사용자 객체
    const [isGuestMode, setIsGuestMode] = useState(false); // 게스트 모드 활성화 여부
    const [initLoading, setInitLoading] = useState(true); // 앱 초기 로딩 상태
    const [isCalendarOpen, setIsCalendarOpen] = useState(false); // 사이드바(달력) 열림 상태

    // 일기 데이터 및 날짜 관련 상태
    const [selectedDate, setSelectedDate] = useState(new Date()); // 현재 선택된 날짜
    const [writtenDates, setWrittenDates] = useState([]); // 일기가 작성된 날짜 목록 (달력 표시용)

    // 채팅 및 AI 응답 관련 상태
    const [selectedModel, setSelectedModel] = useState(MODELS[0]); // 사용 중인 AI 모델
    const [prompt, setPrompt] = useState(''); // 사용자 입력 텍스트
    const [answer, setAnswer] = useState(''); // AI 전체 응답 텍스트
    const [displayedAnswer, setDisplayedAnswer] = useState(''); // 타자 효과로 보여줄 텍스트
    const [imageData, setImageData] = useState(null); // 업로드된 이미지 데이터 (Base64)
    const [fileAttachment, setFileAttachment] = useState(null); // 업로드된 텍스트 파일
    const [loading, setLoading] = useState(false); // API 요청 로딩 상태
    const [error, setError] = useState(''); // 에러 메시지

    // 파일 입력을 제어하기 위한 Ref
    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);

    // -------------------------------------------------------------------------
    // 2. Side Effects (useEffect)

    // Firebase 인증 상태 변경 감지 리스너
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // 로그인 시: 게스트 모드 해제 및 사용자 데이터 불러오기
                setIsGuestMode(false);
                fetchWrittenDates(currentUser.uid);
                loadDiary(currentUser.uid, new Date());
            } else {
                // 로그아웃 시: 민감한 데이터 초기화
                setPrompt('');
                setAnswer('');
                setDisplayedAnswer('');
                setIsCalendarOpen(false);
            }
            setInitLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // 날짜가 변경되거나 사용자가 변경되면 해당 일기 데이터 로드
    useEffect(() => {
        if (user) loadDiary(user.uid, selectedDate);
    }, [selectedDate, user]);

    // AI 답변 타자 효과 구현
    useEffect(() => {
        if (!answer) { setDisplayedAnswer(''); return; }
        let i = 0;
        const id = setInterval(() => {
            i += 1;
            setDisplayedAnswer(answer.slice(0, i));
            if (i >= answer.length) clearInterval(id);
        }, 15);
        return () => clearInterval(id);
    }, [answer]);

    // -------------------------------------------------------------------------
    // 3. 핸들러: 인증 (Authentication Handlers)

    // 구글 로그인 처리
    const handleLogin = async () => {
        try { await signInWithPopup(auth, googleProvider); }
        catch (error) { console.error(error); setError("로그인 실패"); }
    };

    // 게스트 모드 진입 처리
    const handleGuestLogin = () => {
        setIsGuestMode(true);
    };

    // 로그인 화면에서 취소(배경 클릭) 시 게스트 모드로 복귀
    const handleLoginCancel = () => {
        setIsGuestMode(true);
    };

    // 로그아웃 처리
    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);

        // 로그아웃 후 즉시 게스트 모드(메인 화면)로 전환
        setIsGuestMode(true);

        // 데이터 초기화
        setAnswer('');
        setPrompt('');
        setDisplayedAnswer('');
        setImageData(null);
        setFileAttachment(null);
        setIsCalendarOpen(false);
    };

    // 게스트 모드에서 로그인 버튼 클릭 시 (로그인 화면 표시)
    const handleLoginRedirect = () => {
        setIsGuestMode(false);
        setUser(null);
    };

    // -------------------------------------------------------------------------
    // 4. 핸들러: Firestore 데이터베이스 (Database Handlers)

    // 작성된 일기 날짜 목록 가져오기 (달력 마커 표시용)
    const fetchWrittenDates = async (uid) => {
        try {
            const q = query(collection(db, "users", uid, "diaries"));
            const querySnapshot = await getDocs(q);
            setWrittenDates(querySnapshot.docs.map(doc => doc.id));
        } catch (err) { console.error(err); }
    };

    // 특정 날짜의 일기 데이터 불러오기
    const loadDiary = async (uid, date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        setLoading(true);
        setAnswer('');
        setPrompt('');
        try {
            const docRef = doc(db, "users", uid, "diaries", dateStr);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setPrompt(data.userPrompt || '');
                setAnswer(data.aiResponse || '');
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    // 일기 데이터 Firestore에 저장
    const saveDiaryToFireStore = async (userPrompt, aiResponse) => {
        if (!user) return; // 게스트 모드에서는 저장하지 않음
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        try {
            await setDoc(doc(db, "users", user.uid, "diaries", dateStr), {
                date: dateStr,
                userPrompt,
                aiResponse,
                timestamp: new Date()
            });
            // 새로운 날짜에 작성했다면 목록 갱신
            if (!writtenDates.includes(dateStr)) setWrittenDates(prev => [...prev, dateStr]);
        } catch (err) { console.error(err); setError("저장 실패"); }
    };

    // -------------------------------------------------------------------------
    // 5. 핸들러: API 요청 및 폼 제출 (API & Form Handlers)

    // API 헤더 설정 (API 키 포함)
    const apiHeaders = useMemo(() => {
        const key = import.meta.env.VITE_OPENAI_API_KEY;
        return { ...fallbackHeaders, ...(key ? { Authorization: `Bearer ${key}` } : {}) };
    }, []);

    // 현재 모델 기능 확인 (비전/파일 지원 여부)
    const isVisionModel = useMemo(() => VISION_MODEL_IDS.has(selectedModel.id), [selectedModel.id]);
    const isNovaFileModel = true;

    // 입력 필드 및 파일 초기화 헬퍼 함수들
    const clearImage = () => { setImageData(null); if (imageInputRef.current) imageInputRef.current.value = ''; };
    const clearFile = () => { setFileAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ''; };
    const clearAll = () => { clearImage(); clearFile(); setPrompt(''); };

    // 파일 변경 핸들러
    const handleImageChange = (e) => { const file = e.target.files?.[0]; if (file) { const r = new FileReader(); r.onloadend = () => setImageData(r.result); r.readAsDataURL(file); } };
    const handleFileChange = (e) => { }; // 파일 처리 로직 필요 시 구현

    // 메시지 전송 및 AI 요청 처리
    const handleSubmit = async (event) => {
        event.preventDefault();

        // 비로그인 사용자 경고 (저장되지 않음 알림)
        if (!user) {
            const confirmGuest = window.confirm("로그인을 하지 않으면 글이 저장되지 않습니다.\n그래도 계속하시겠습니까?");
            if (!confirmGuest) return;
        }

        // 과거 날짜 수정 시 경고
        const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
        if (user && !isToday && answer) {
            if (!window.confirm("과거의 일기를 다시 작성하시겠습니까? 덮어씌워집니다.")) return;
        }

        // 유효성 검사
        const hasText = !!prompt.trim();
        const hasImage = !!imageData;
        const hasFile = !!fileAttachment?.content;
        if (loading || (!hasText && !hasImage && !hasFile)) return;

        // 상태 초기화 및 로딩 시작
        setError(''); setAnswer(''); setDisplayedAnswer('');
        if (!apiHeaders.Authorization) { setError('API 키 필요'); return; }

        setLoading(true);
        const currentPrompt = prompt;

        try {
            // 메시지 페이로드 구성
            const userContentParts = [];
            const fallbackText = !hasText && (hasImage || hasFile) ? '파일 분석 요청' : '';
            if (hasText || fallbackText) userContentParts.push({ type: 'text', text: hasText ? prompt.trim() : fallbackText });
            if (isVisionModel && hasImage) userContentParts.push({ type: 'image_url', image_url: { url: imageData }, });
            if (hasFile) userContentParts.push({ type: 'text', text: `\n\n[파일: ${fileAttachment.name}]\n${fileAttachment.content}`, });

            const messages = [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userContentParts }];

            // API 호출
            const response = await fetch(API_URL, {
                method: 'POST', headers: apiHeaders,
                body: JSON.stringify({ model: selectedModel.id, messages, temperature: 0.7, stream: false })
            });

            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            const reply = data?.choices?.[0]?.message?.content;
            if (!reply) throw new Error('No response');

            // 응답 처리 및 저장
            setAnswer(reply);
            await saveDiaryToFireStore(currentPrompt, reply);
            clearImage(); clearFile();
        } catch (err) { console.error(err); setError(err?.message); } finally { setLoading(false); }
    };

    const handleModelChange = (id) => { const m = MODELS.find(m => m.id === id); if (m) setSelectedModel(m); };
    const handleQuickActionSelect = (text) => setPrompt(text);

    // -------------------------------------------------------------------------
    // 6. 화면 렌더링 (Render)

    // 초기 로딩 화면
    if (initLoading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">로딩 중...</div>;

    // 로그인 화면 표시 (로그인되지 않았고, 게스트 모드도 아닐 때)
    if (!user && !isGuestMode) {
        return (
            <Login
                onLogin={handleLogin}
                onGuestLogin={handleGuestLogin}
                onClose={handleLoginCancel}
            />
        );
    }

    const dateKey = format(selectedDate, 'yyyy-MM-dd');

    // 메인 애플리케이션 레이아웃
    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-pink-500/30 flex flex-col">
            <Header
                selectedModel={selectedModel}
                user={user}
                onToggleCalendar={() => setIsCalendarOpen(true)}
                onLogout={handleLogout}
                onLoginRedirect={handleLoginRedirect}
            />

            <CalendarSidebar
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                writtenDates={writtenDates}
            />

            <main className={`flex-1 flex flex-col w-full max-w-3xl mx-auto px-4 pb-6 transition-all duration-500
                ${!answer ? 'justify-center items-center pt-0' : 'justify-start pt-24'}`}>

                <div key={dateKey} className="w-full flex flex-col gap-6 animate-fade-in-up">
                    <ErrorBanner message={error} />

                    {/* 안내 문구 (답변이 없을 때만 표시) */}
                    {!answer && !loading && !error && (
                        <div className="text-center space-y-4 mb-4">
                            <div className="inline-block px-3 py-1 bg-zinc-800/50 rounded-full text-xs text-zinc-400 mb-2 border border-zinc-700/50">
                                {format(selectedDate, 'yyyy년 M월 d일')}
                            </div>
                            <h2 className="text-3xl font-bold bg-linear-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                                오늘 하루는 어땠나요?
                            </h2>
                            <p className="text-zinc-500 text-sm">
                                {format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                                    ? "사소한 이야기라도 좋아요. 당신의 이야기를 들려주세요."
                                    : "과거의 기록을 확인하고 있습니다."}
                            </p>
                        </div>
                    )}

                    {/* AI 답변 영역 */}
                    {answer && (
                        <div className="flex-1 min-h-[50vh]">
                            <AssistantResponse answer={answer} displayedAnswer={displayedAnswer} selectedModel={selectedModel} />
                        </div>
                    )}

                    {/* 퀵 액션 버튼 */}
                    {!answer && !loading && <QuickActions onSelect={handleQuickActionSelect} />}

                    {/* 입력 폼 (하단 고정 또는 중앙 배치) */}
                    <div className={`${answer ? 'sticky bottom-4 z-30' : 'w-full'}`}>
                        <PromptForm
                            prompt={prompt} onPromptChange={setPrompt} onSubmit={handleSubmit} onClearAll={clearAll}
                            models={MODELS} selectedModel={selectedModel} onModelChange={handleModelChange}
                            isVisionModel={isVisionModel} isNovaFileModel={isNovaFileModel}
                            onImageChange={handleImageChange} onFileChange={handleFileChange}
                            imageData={imageData} fileAttachment={fileAttachment}
                            clearImage={clearImage} clearFile={clearFile}
                            loading={loading} imageInputRef={imageInputRef} fileInputRef={fileInputRef}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;