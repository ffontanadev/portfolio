import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { MarkdownRendererProps } from '../types';

/**
 * MarkdownRenderer - Renders Markdown content with GitHub-flavored Markdown support
 * Uses react-markdown with remark-gfm for tables, strikethrough, task lists, etc.
 */
const MarkdownRenderer = ({ source, viewState, onViewStateChange, onLoad, onError }: MarkdownRendererProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        try {
            // Markdown doesn't have pagination, set total pages to 1
            if (viewState.totalPages !== 1) {
                onViewStateChange({ totalPages: 1, currentPage: 1 });
            }

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsReady(true);
            onLoad?.();
        } catch (error) {
            onError?.(error instanceof Error ? error : new Error('Failed to render Markdown'));
        }
    }, [source.content, onLoad, onError, viewState.totalPages, onViewStateChange]);

    // Apply zoom transformation
    const transformStyle = {
        transform: `scale(${viewState.zoom})`,
        transformOrigin: 'top center',
        transition: 'transform 0.2s ease-out',
    };

    if (!isReady) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-900 mx-auto"></div>
                    <p className="text-sm text-gray-600">Loading Markdown content...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-auto" ref={containerRef}>
            <div
                className="max-w-4xl mx-auto p-8 bg-white"
                style={transformStyle}
            >
                {/* Render Markdown with GitHub-flavored Markdown support */}
                <div className="prose prose-slate max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // Custom components for better styling
                            h1: ({ children, ...props }) => (
                                <h1 className="text-4xl font-display font-bold mb-4 text-dark-900" {...props}>
                                    {children}
                                </h1>
                            ),
                            h2: ({ children, ...props }) => (
                                <h2 className="text-3xl font-display font-bold mb-3 text-dark-900 mt-8" {...props}>
                                    {children}
                                </h2>
                            ),
                            h3: ({ children, ...props }) => (
                                <h3 className="text-2xl font-display font-bold mb-2 text-dark-900 mt-6" {...props}>
                                    {children}
                                </h3>
                            ),
                            p: ({ children, ...props }) => (
                                <p className="mb-4 text-gray-700 leading-relaxed" {...props}>
                                    {children}
                                </p>
                            ),
                            a: ({ children, href, ...props }) => (
                                <a
                                    href={href}
                                    className="text-coral-500 hover:text-coral-600 underline transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    {...props}
                                >
                                    {children}
                                </a>
                            ),
                            ul: ({ children, ...props }) => (
                                <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700" {...props}>
                                    {children}
                                </ul>
                            ),
                            ol: ({ children, ...props }) => (
                                <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700" {...props}>
                                    {children}
                                </ol>
                            ),
                            code: ({ children, className, ...props }) => {
                                const isInline = !className;
                                if (isInline) {
                                    return (
                                        <code
                                            className="px-1.5 py-0.5 bg-gray-100 text-coral-600 rounded text-sm font-mono"
                                            {...props}
                                        >
                                            {children}
                                        </code>
                                    );
                                }
                                return (
                                    <code
                                        className="block p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm font-mono"
                                        {...props}
                                    >
                                        {children}
                                    </code>
                                );
                            },
                            table: ({ children, ...props }) => (
                                <div className="overflow-x-auto mb-4">
                                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200" {...props}>
                                        {children}
                                    </table>
                                </div>
                            ),
                            thead: ({ children, ...props }) => (
                                <thead className="bg-gray-50" {...props}>
                                    {children}
                                </thead>
                            ),
                            th: ({ children, ...props }) => (
                                <th className="px-4 py-2 text-left text-xs font-bold text-dark-900 uppercase tracking-wider" {...props}>
                                    {children}
                                </th>
                            ),
                            td: ({ children, ...props }) => (
                                <td className="px-4 py-2 text-sm text-gray-700 border-t border-gray-200" {...props}>
                                    {children}
                                </td>
                            ),
                            blockquote: ({ children, ...props }) => (
                                <blockquote className="border-l-4 border-coral-500 pl-4 py-2 mb-4 italic text-gray-600" {...props}>
                                    {children}
                                </blockquote>
                            ),
                            hr: (props) => <hr className="my-8 border-gray-300" {...props} />,
                        }}
                    >
                        {source.content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default MarkdownRenderer;
