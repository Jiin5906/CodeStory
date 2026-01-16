
import CodeBlock from './CodeBlock'

//반복되는 태그 자동화
const csTag = (Tag, className) => ({ children }) => <Tag className={className}>{children}</Tag>

const markdownComponents = {
    code: CodeBlock,
    table: ({ children }) => (
        <div className='overflow-x-auto'>
            <table className='min-w-full border-collapse border border-zinc-700'>{children}</table>
        </div>
    ),
    blockquote: ({ children }) => (
        <blockquote className='border-l-4 border-blue-500 pl-4 italic text-zinc-300 bg-zinc-800/50
        p-2 pb-1 rounded-r-lg mb-3'>
            {children}
        </blockquote>
    ),
    hr: () => <hr className='border-zinc-700 my-4' />,
    th: csTag('th', 'border border-zinc-700 bg-zinc-800 px-4 py-2 text-left font-semibold'),
    td: csTag('td', 'border border-zinc-700 px-4 py-2'),

    h1: csTag('h1', 'text-2xl font-bold text-white mb-3'),
    h2: csTag('h2', 'text-2xl font-semibold text-white mb-2'),
    h3: csTag('h3', 'text-2xl font-semibold text-white mb-2'),
    h4: csTag('h4', 'text-2xl font-semibold text-white mb-2'),

    p: csTag('p', 'mb-3 text-zinc-200'),

    ul: csTag('ul', 'list-disc list-inside space-y-1 mb-3'),
    ol: csTag('ol', 'list-decimal list-inside space-y-1 mb-3'),

    li: csTag('li', 'text-zinc-200'),
}

export default markdownComponents
