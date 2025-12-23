import { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import type { HTMLRendererProps } from '../types';

/**
 * HTMLRenderer - Renders sanitized HTML content
 * Uses DOMPurify to prevent XSS attacks
 */
const HTMLRenderer = ({ source, viewState, onViewStateChange, onLoad, onError }: HTMLRendererProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [sanitizedHTML, setSanitizedHTML] = useState<string>('');

    useEffect(() => {
        try {
            // Configure DOMPurify to allow safe HTML elements
            const config = {
                ALLOWED_TAGS: [
                    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'p', 'br', 'hr', 'pre', 'code',
                    'ul', 'ol', 'li',
                    'a', 'strong', 'em', 'u', 's', 'del', 'ins',
                    'table', 'thead', 'tbody', 'tr', 'th', 'td',
                    'div', 'span', 'section', 'article', 'header', 'footer',
                    'img', 'figure', 'figcaption',
                    'blockquote', 'q', 'cite',
                    'abbr', 'address', 'time',
                    'dl', 'dt', 'dd',
                    'sub', 'sup', 'small', 'mark',
                ],
                ALLOWED_ATTR: [
                    'href', 'title', 'alt', 'src',
                    'class', 'id', 'style',
                    'target', 'rel',
                    'width', 'height',
                    'datetime', 'cite',
                    'colspan', 'rowspan',
                ],
                ALLOW_DATA_ATTR: false,
                ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
            };

            // Sanitize the HTML content
            const clean = DOMPurify.sanitize(source.content, config);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSanitizedHTML(clean);

            // HTML doesn't have pagination, set total pages to 1
            if (viewState.totalPages !== 1) {
                onViewStateChange({ totalPages: 1, currentPage: 1 });
            }

            onLoad?.();
        } catch (error) {
            onError?.(error instanceof Error ? error : new Error('Failed to render HTML'));
        }
    }, [source.content, onLoad, onError, viewState.totalPages, onViewStateChange]);

    // Apply zoom transformation
    const transformStyle = {
        transform: `scale(${viewState.zoom})`,
        transformOrigin: 'top center',
        transition: 'transform 0.2s ease-out',
    };

    // Derive loading state from sanitizedHTML
    const isLoading = !sanitizedHTML && !!source.content;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-900 mx-auto"></div>
                    <p className="text-sm text-gray-600">Loading HTML content...</p>
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
                {/* Render sanitized HTML */}
                <div
                    className="prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
                />
            </div>
        </div>
    );
};

export default HTMLRenderer;
