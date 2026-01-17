import CodeBlock from './CodeBlock'

// ✅ 반복되는 태그 자동화: gtmId 인자를 추가하여 각 태그에 고유 속성을 부여합니다.
const csTag = (Tag, className, gtmId) => ({ children }) => (
    <Tag className={className} data-gtm={`md-${gtmId}`}>
        {children}
    </Tag>
)

const markdownComponents = {
    code: CodeBlock,
    table: ({ children }) => (
        <div className='overflow-x-auto' data-gtm="md-table-wrapper">
            <table className='min-w-full border-collapse border border-zinc-700'>{children}</table>
        </div>
    ),
    blockquote: ({ children }) => (
        <blockquote 
            className='border-l-4 border-blue-500 pl-4 italic text-zinc-300 bg-zinc-800/50 p-2 pb-1 rounded-r-lg mb-3'
            data-gtm="md-blockquote"
        >
            {children}
        </blockquote>
    ),
    hr: () => <hr className='border-zinc-700 my-4' data-gtm="md-hr" />,
    
    // ✅ 각 요소에 고유한 md- 접두사 아이디 부여
    th: csTag('th', 'border border-zinc-700 bg-zinc-800 px-4 py-2 text-left font-semibold', 'th'),
    td: csTag('td', 'border border-zinc-700 px-4 py-2', 'td'),

    h1: csTag('h1', 'text-2xl font-bold text-white mb-3', 'h1'),
    h2: csTag('h2', 'text-2xl font-semibold text-white mb-2', 'h2'),
    h3: csTag('h3', 'text-2xl font-semibold text-white mb-2', 'h3'),
    h4: csTag('h4', 'text-2xl font-semibold text-white mb-2', 'h4'),

    p: csTag('p', 'mb-3 text-zinc-200', 'p'),

    ul: csTag('ul', 'list-disc list-inside space-y-1 mb-3', 'ul'),
    ol: csTag('ol', 'list-decimal list-inside space-y-1 mb-3', 'ol'),

    li: csTag('li', 'text-zinc-200', 'li'),
}

export default markdownComponents