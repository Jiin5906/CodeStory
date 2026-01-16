// 아이콘과 함께 오류 메시지를 표시하는 오류 배너 구성 요소

import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorBanner = ({ message }) =>
    !message ? null : (
        <div
            className="rounded-2xl border border-red-500/30 bg-linear-to-r
            from-red-500/10 to-rose-500/10 px-4 py-3 text-red-200
            backdrop-blur-sm shadow-xl sm:px-6 sm:py-4">
            <div className="flex items-start gap-2 sm:gap-3">
                {/* 경고 아이콘*/}
                <FaExclamationTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mt-0.5 shrink-0"/>
                <div>
                    {/* 에러 타이틀 */}
                    <p className="font-medium text-red-300 mb-1 text-sm sm:text-base">Error</p>
                    {/* 에러 메시지 내용 */}
                    <p className="text-xs leading-relaxed sm:text-sm">{message}</p>
                </div>
            </div>
        </div>
    );

export default ErrorBanner;
