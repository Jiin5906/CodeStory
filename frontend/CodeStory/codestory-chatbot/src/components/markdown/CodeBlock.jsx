// AI가 준 코드 응답을 복사 가능한 깔끔한 코드 블록으로 변환해주는 엔진
import { useState } from "react";

const CodeBlock = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);

  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "text"; // ✅ 언어 정보 추출

  const codeText = Array.isArray(children) ? children.join("") : children;

  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(codeText || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };

  if (!inline && match) {
    return (
      /* ✅ 코드 블록 컨테이너 식별 및 언어 정보 포함 */
      <div 
        className="relative group mb-4" 
        data-gtm="code-block-container"
        data-gtm-lang={language}
      >
        {/* Code block container with horizontal scrolling */}
        <pre
          className="bg-zinc-900/70 border border-zinc-700 rounded-lg p-4 overflow-x-auto"
        >
          <code className={className} {...props}>
            {children}
          </code>
        </pre>

        {/* Copy button - appear on hover */}
        <button
          type="button"
          onClick={handleCopy}
          /* ✅ 복사 버튼 고유 식별 */
          data-gtm={`btn-code-copy-${language}`}
          className="absolute top-2 right-2 px-2 py-1 rounded-md bg-zinc-800/80 border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-700 focus:outline-none shadow-sm transition-opacity opacity-0 group-hover:opacity-100"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    );
  }

  return (
    <code
      className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200"
      {...props}
      /* ✅ 인라인 코드 식별 */
      data-gtm="inline-code-text"
    >
      {children}
    </code>
  );
};

export default CodeBlock;