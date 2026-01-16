//마크다운 렌더링 및 타이핑 애니메이션을 통해 AI 비서의 응답을 표시하는 구성 요소
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FaRobot } from 'react-icons/fa';
import markdownComponents from '../markdown/markdownComponents.jsx';

const AssistantResponse = ({ answer, displayedAnswer, selectedModel }) => {
    // 애니메이션 타이핑 시 표시된 답변 사용, 전체 답변으로 돌아가기
    const content = displayedAnswer || answer;
    if (!content) return null;

    return (
        <div className="bg-linear-to-br from-zinc-900/80 to-zinc-800/80 border border-zinc-700/50
        rounded-2xl p-4 backdrop-blur-sm shadow-2xl sm:p-6">
            {/* 아바타와 아이콘 */}
            <div className="w-7 h-7 bg-linear-to-br from-blue-500 to-purple-600 rounded-full
            flex items-center justify-center shrink-0 shadow-lg sm:w-8 sm:h-8">
                <FaRobot className='w-3 h-3 text-white sm:w-4 sm:h-4' />
            </div>
            <div className="flex-1 min-w-0">
                {/* 어시스턴트 이름과 모델 배지가 있는 헤더 */}
                <div className="flex flex-col gap-1 mb-2 sm:flex-row sm:items-center sm:gap-2 sm:mb-3">
                    <p className="text-sm font-medium text-zinc-300">Codestory</p>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs 
                    rounded-full self-start sm:self-auto">
                        {selectedModel.shortLabel}
                    </span>
                </div>
                {/* 마크다운 방식으로 렌더링된 응답 콘텐츠*/}
                <div className="prose prose-invert prose-sm max-w-none text-zinc-200 leading-relaxed text-sm
                wrap-break-word prose-pre:whitespace-pre-wrap prose-pre:break-words
                prose-pre:overflow-x-auto prose-code:break-words">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {content}
                    </ReactMarkdown>
                </div>


            </div>
        </div>
    );

};

export default AssistantResponse;
