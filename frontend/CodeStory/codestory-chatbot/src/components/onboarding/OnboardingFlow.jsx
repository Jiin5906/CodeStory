import { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import {
  ArrowLeft, Check, Users, Youtube, Smartphone, Instagram
} from 'lucide-react';
import mongleIDLE from '../../assets/mongleIDLE.json';
import ReactConfetti from 'react-confetti';

// 로티 파일은 mongleIDLE 하나로 통일 (추후 교체 예정)
const mongleHandle = mongleIDLE;

const TOTAL_STEPS = 6;

// ─── 3D 입체 버튼 컴포넌트 ───
function DuoButton({ children, onClick, disabled, variant = 'green', className = '', selected = false, icon = null }) {
  const baseClasses = 'relative w-full rounded-2xl font-bold text-lg transition-all duration-100 select-none';

  const variants = {
    green: disabled
      ? 'bg-gray-200 text-gray-400 border-b-[6px] border-gray-300 cursor-not-allowed'
      : 'bg-[#58CC02] text-white border-b-[6px] border-[#46a302] active:border-b-[2px] active:translate-y-[4px] active:mt-[4px] cursor-pointer hover:bg-[#61d804]',
    option: selected
      ? 'bg-blue-50 text-blue-500 border-2 border-blue-400 border-b-[6px] border-b-blue-400 active:border-b-[2px] active:translate-y-[4px] active:mt-[4px] cursor-pointer'
      : 'bg-white text-gray-700 border-2 border-gray-200 border-b-[6px] border-b-gray-300 active:border-b-[2px] active:translate-y-[4px] active:mt-[4px] cursor-pointer hover:bg-gray-50',
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={{ padding: '14px 24px' }}
    >
      <span className="flex items-center gap-3">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="flex-1 text-left">{children}</span>
      </span>
      {selected && (
        <span className="absolute top-3 right-3">
          <Check size={20} className="text-blue-500" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

// ─── 말풍선 컴포넌트 ───
function SpeechBubble({ text, position = 'center', typingDone }) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    setDisplayText('');
    let idx = 0;
    const timer = setInterval(() => {
      idx++;
      setDisplayText(text.slice(0, idx));
      if (idx >= text.length) {
        clearInterval(timer);
        typingDone?.();
      }
    }, 40);
    return () => clearInterval(timer);
  }, [text, typingDone]);

  return (
    <div className="relative inline-block max-w-[320px]">
      <div className="bg-white border-2 border-gray-200 rounded-2xl px-6 py-4 text-gray-800 text-[17px] font-semibold leading-relaxed whitespace-pre-line shadow-sm">
        {displayText}
        <span className="animate-pulse">|</span>
      </div>
      {position === 'center' ? (
        // 아래쪽 꼬리 — 말풍선 아래에 캐릭터가 있으므로 꼬리가 아래를 향함
        <div className="absolute w-4 h-4 bg-white border-b-2 border-r-2 border-gray-200 left-1/2 -translate-x-1/2 -bottom-[9px] rotate-45" />
      ) : (
        // 왼쪽 꼬리 — 캐릭터가 말풍선 왼쪽에 있으므로 꼬리가 왼쪽을 향함
        <div className="absolute w-4 h-4 bg-white border-b-2 border-l-2 border-gray-200 -left-[9px] top-1/2 -translate-y-1/2 rotate-45" />
      )}
    </div>
  );
}

// ─── 프로그레스 바 ───
function ProgressBar({ step }) {
  const progress = ((step) / TOTAL_STEPS) * 100;
  return (
    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-[#58CC02] rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
}

// ─── 유입 경로 아이콘 컴포넌트 ───
function ChannelIcon({ type }) {
  const iconMap = {
    family: <Users size={24} className="text-orange-500" />,
    google: (
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    naver: (
      <svg width="24" height="24" viewBox="0 0 24 24">
        <rect width="24" height="24" rx="4" fill="#03C75A"/>
        <path d="M8 7h2.8l3.2 5V7H16v10h-2.8L10 12v5H8V7z" fill="white"/>
      </svg>
    ),
    youtube: <Youtube size={24} className="text-red-600" />,
    appstore: <Smartphone size={24} className="text-blue-500" />,
    instagram: <Instagram size={24} className="text-pink-500" />,
  };
  return iconMap[type] || null;
}

// ─── 메인 온보딩 플로우 ───
export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [gender, setGender] = useState(null);
  const [channel, setChannel] = useState(null);
  const [nickname, setNickname] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTypingDone = useCallback(() => {
    setIsTypingDone(true);
  }, []);

  // 다음 버튼 활성화 조건
  const canProceed = () => {
    switch (step) {
      case 1: return isTypingDone;
      case 2: return isTypingDone;
      case 3: return gender !== null;
      case 4: return channel !== null;
      case 5: return nickname.trim().length > 0;
      case 6: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    if (step < TOTAL_STEPS) {
      setIsTypingDone(false);
      setStep(step + 1);
    } else {
      // GTM 이벤트
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'onboarding_complete',
          onboarding_gender: gender,
          onboarding_channel: channel,
          onboarding_nickname: nickname,
        });
      }
      try {
        const u = JSON.parse(localStorage.getItem('diaryUser') || '{}');
        localStorage.setItem(`hasSeenOnboarding_${u.id ?? 'guest'}`, 'true');
        // 성별/유입경로 백엔드 저장
        if (u.id && u.id !== 0) {
          fetch(`/api/member/${u.id}/profile`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gender, channel }),
          }).catch(() => {}); // 저장 실패해도 온보딩은 계속 진행
        }
      } catch {
        localStorage.setItem('hasSeenOnboarding_guest', 'true');
      }
      // exit 애니메이션 실행 후 onComplete 호출
      setIsExiting(true);
      setTimeout(() => {
        onComplete?.({ gender, channel, nickname });
      }, 550);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setIsTypingDone(false);
      setStep(step - 1);
    }
  };

  // 캐릭터 레이아웃 모드 결정
  const isCentered = step <= 2 || step === 6;

  // 스텝별 대사
  const dialogues = {
    1: '안녕하세요! 몽글이에요!',
    2: '간단한 질문 3개만 답변해 주세요!',
    3: '당신의 성별을 알려주세요!',
    4: '공감일기를 어떻게 접하셨나요?',
    5: '제가 사용자님의 아이디를\n알려주세요!',
    6: `좋아요! ${nickname || '사용자'}님\n공감 일기에 오신 것을 환영합니다!\n이제 시작해볼까요?`,
  };

  // 유입 경로 선택지
  const channels = [
    { key: 'family', label: '가족/친구', icon: 'family' },
    { key: 'google', label: 'Google검색', icon: 'google' },
    { key: 'naver', label: '네이버', icon: 'naver' },
    { key: 'youtube', label: 'YouTube', icon: 'youtube' },
    { key: 'appstore', label: '앱스토어', icon: 'appstore' },
    { key: 'instagram', label: 'Instagram', icon: 'instagram' },
  ];

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 bg-[#FAFAFA] z-[200] flex flex-col overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          data-gtm="onboarding-container"
        >
      {/* 폭죽 효과 */}
      {showConfetti && (
        <ReactConfetti
          width={windowSize.w}
          height={windowSize.h}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      {/* 상단 바: 뒤로가기 + 프로그레스 */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2" data-gtm="onboarding-header">
        <button
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
          data-gtm="onboarding-back-btn"
        >
          <ArrowLeft size={24} className="text-gray-400" />
        </button>
        <div className="flex-1">
          <ProgressBar step={step} />
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="flex flex-col items-center h-full"
            data-gtm={`onboarding-step-${step}`}
          >
            {/* 캐릭터 + 말풍선 영역 */}
            {isCentered ? (
              /* 중앙 배치 (Step 1, 2, 6) — 말풍선 위, 캐릭터 아래 */
              <div className="flex flex-col items-center mt-12 gap-0">
                <SpeechBubble
                  text={dialogues[step]}
                  position="center"
                  typingDone={handleTypingDone}
                />
                <motion.div
                  layoutId="mongle-character"
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="mt-4"
                >
                  <Lottie
                    animationData={step === 1 ? mongleHandle : mongleIDLE}
                    loop
                    autoplay
                    style={{ width: 180, height: 180 }}
                  />
                </motion.div>
              </div>
            ) : (
              /* 좌측 상단 배치 (Step 3, 4, 5) */
              <div className="w-full mt-6">
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    layoutId="mongle-character"
                    transition={{ duration: 0.5, type: 'spring' }}
                    className="flex-shrink-0"
                  >
                    <Lottie
                      animationData={mongleIDLE}
                      loop
                      autoplay
                      style={{ width: 80, height: 80 }}
                    />
                  </motion.div>
                  <div className="flex-1">
                    <SpeechBubble
                      text={dialogues[step]}
                      position="left"
                      typingDone={handleTypingDone}
                    />
                  </div>
                </div>

                {/* Step 3: 성별 선택 */}
                {step === 3 && (
                  <div className="flex flex-col gap-3 mt-4">
                    {['남성', '여성', '기타'].map((g) => (
                      <DuoButton
                        key={g}
                        variant="option"
                        selected={gender === g}
                        onClick={() => setGender(g)}
                      >
                        {g}
                      </DuoButton>
                    ))}
                  </div>
                )}

                {/* Step 4: 유입 경로 */}
                {step === 4 && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {channels.map((ch) => (
                      <DuoButton
                        key={ch.key}
                        variant="option"
                        selected={channel === ch.key}
                        onClick={() => setChannel(ch.key)}
                        icon={<ChannelIcon type={ch.icon} />}
                      >
                        {ch.label}
                      </DuoButton>
                    ))}
                  </div>
                )}

                {/* Step 5: 아이디 입력 */}
                {step === 5 && (
                  <div className="mt-4">
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="아이디를 입력해 주세요"
                      className="w-full px-5 py-4 text-lg font-semibold rounded-2xl border-[3px] border-gray-200 focus:border-blue-400 focus:ring-0 outline-none transition-colors bg-white placeholder:text-gray-300"
                      maxLength={20}
                      autoFocus
                      data-gtm="onboarding-nickname-input"
                    />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="px-6 pb-8 pt-3 bg-[#FAFAFA]" data-gtm="onboarding-bottom-bar">
        <DuoButton
          variant="green"
          disabled={!canProceed()}
          onClick={handleNext}
          className="py-4 text-[18px]"
        >
          {step === TOTAL_STEPS ? '시작하기' : '계속하기'}
        </DuoButton>
        </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
