import { FaImage, FaFileAlt, FaTrash, FaPaperPlane, FaRobot, FaTimes } from 'react-icons/fa';

const OpenAIIcon = ({ className }) => (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.0462 6.0462 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.453l-.142.0805L8.704 5.4599a.7948.7948 0 0 0-.3927.6813zm1.0916-4.3665l3.2002-1.8542 3.2002 1.8542v3.7084l-3.2002 1.8542-3.2002-1.8542z" />
    </svg>
);

const UploadButton = ({ Icon, inputRef, accept, onChange, title, iconClass, }) => (
    <label className="inline-flex items-center gap-2 px-3 py-2 bg-zinc-900/80
    border border-zinc-700 text-sm text-zinc-200 shadow-inner cursor-pointer shrink-0 self-start" title={title}>
        <Icon className={`w-4 h-4 ${iconClass || ''}`} />
        <input type="file" ref={inputRef} accept={accept} onChange={onChange} className="hidden" />
        <span className="sr-only">{title}</span>
    </label>
);

const RemoveButton = ({ onClick }) => (
    <button className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-300" type='button'
        onClick={onClick}>
        <FaTimes className='w-3 h-3' />
    </button>
)

const PromptForm = ({
    prompt,
    onPromptChange,
    onSubmit,
    onClearAll,
    models,
    selectedModel,
    onModelChange,
    isVisionModel,
    isNovaFileModel,
    onImageChange,
    onFileChange,
    imageData,
    fileAttachment,
    clearImage,
    clearFile,
    loading,
    imageInputRef,
    fileInputRef,
}) => {
    const disableSubmit = (!prompt.trim() && !(isVisionModel && imageData) && !fileAttachment) || loading;
    const disableClear = !prompt.trim() && !imageData && !fileAttachment;

    return (
        <div className="bg-linear-to-br from-zinc-900/90 to-zinc-800/90 border border-zinc-700/50
        rounded-2xl p-4 backdrop-blur-sm shadow-2xl sm:p-6">
            <form onSubmit={onSubmit}>
                <div className="relative">
                    <textarea value={prompt}
                        onChange={(e) => onPromptChange(e.target.value)}
                        placeholder="오늘 하루 어떤 일이 있었나요? 편하게 털어놓아 보세요..."
                        className="w-full bg-transparent border-none 
                    outline-none text-zinc-200 placeholder-zinc-500 resize-none text-sm
                    leading-relaxed min-h-15 max-h-27.5 focus:placeholder-zinc-600 transition-colors sm:text-base sm:min-h-20"
                        onKeyDown={(e) => e.key === 'Enter' && (e.metaKey || e.ctrlKey) && onSubmit(e)}>
                    </textarea>
                    <div className="mt-3 mb-2 flex flex-row items-center gap-3 flex-wrap">
                        {isVisionModel && (
                            <UploadButton
                                Icon={FaImage}
                                inputRef={imageInputRef}
                                accept="image/*"
                                onChange={onImageChange}
                                title="이미지 첨부"
                                iconClass="text-blue-300"
                            />
                        )}

                        {isNovaFileModel && (
                            <UploadButton
                                Icon={FaFileAlt}
                                inputRef={fileInputRef}
                                accept=".txt,.md,.markdown,.json,.csv,.log,.yaml,.yml,.xml"
                                onChange={onFileChange}
                                title="파일 첨부"
                                iconClass="text-amber-300"
                            />
                        )}
                        {imageData && (
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900">
                                    <img
                                        src={imageData}
                                        alt="Upload preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <RemoveButton onClick={clearImage} />
                            </div>
                        )}

                        {fileAttachment && (
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs 
                                text-zinc-300 max-w-50 truncate">
                                    {fileAttachment.name}
                                </div>
                                <RemoveButton onClick={clearFile} />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col justify-between pt-4 border-t border-zinc-700/50 gap-3 sm:flex-row sm:items-center sm:gap-0">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                            <label className="flex items-center gap-2 px-3 py-2 bg-zinc-900/80 border border-zinc-700/50
                            rounded-xl text-sm text-zinc-200 shadow-inner w-full sm:w-auto">
                                <OpenAIIcon className="w-3.5 h-3.5 shrink-0 sm:w-4 sm:h-4" />
                                <select
                                    value={selectedModel.id}
                                    onChange={(e) => onModelChange(e.target.value)}
                                    className="bg-transparent border-none focus:outline-none text-sm text-zinc-200 pr-2
                                    cursor-pointer flex-1 min-w-0">
                                    {models.map((model) => (
                                        <option value={model.id} key={model.id} className="bg-zinc-900 text-zinc-200">
                                            {model.shortLabel}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <div className="text-xs text-zinc-500 hidden sm:block">
                                <kbd className="px-1.5 py-0 bg-zinc-800 border border-zinc-700 rounded 
                                text-zinc-400">Ctrl</kbd> + <kbd className="px-1.5 py-0 bg-zinc-800 border 
                                border-zinc-700 rounded text-zinc-400">Enter</kbd> 로 전송
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={onClearAll}
                                disabled={disableClear}
                                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700
                                disabled:bg-zinc-800 disabled:opacity-50 border border-zinc-700
                                rounded-xl text-zinc-400 hover:text-zinc-200 transition-all 
                                duration-200 disabled:cursor-not-allowed font-medium sm:flex-none sm:px-6"
                                title="초기화">
                                <div className="flex items-center justify-center gap-2">
                                    <FaTrash className="w-4 h-4" />
                                    <span className="hidden sm:inline">지우기</span>
                                </div>
                            </button>
                            <button
                                type="submit"
                                disabled={disableSubmit}
                                className="flex-1 px-4 py-2 bg-linear-to-r
                                from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500
                                disabled:from-zinc-700 disabled:to-zinc-800 disabled:opacity-50
                                border border-zinc-700 disabled:border-zinc-700
                                rounded-xl text-white font-medium transition-all duration-200
                                shadow-lg hover:shadow-xl disabled:cursor-not-allowed">
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <FaRobot className="w-4 h-4 animate-spin" />
                                        <span className="hidden sm:inline">생각 중...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <FaPaperPlane className="w-4 h-4" />
                                        <span>전송</span>
                                    </div>
                                )}
                            </button>

                        </div>
                    </div>
                </div>
            </form>
        </div>
    )

}

export default PromptForm;