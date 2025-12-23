import { useEffect, useRef, useState } from 'react';
import type { TypstRendererProps } from '../types';

/**
 * TypstRenderer - Renders Typst documents
 * Note: Currently showing placeholder due to typst.react build issues
 * TODO: Fix typst.react CSS import issue for production builds
 */
const TypstRenderer = ({ source, viewState, onViewStateChange, onLoad, onError }: TypstRendererProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        try {
            setIsLoading(true);
            setHasError(false);

            // Validate artifact
            if (!source.artifact || source.artifact.length === 0) {
                throw new Error('Invalid Typst artifact: artifact is empty');
            }

            // Typst documents are typically single-page when rendered as SVG
            // Note: This may need adjustment based on actual Typst output format
            if (viewState.totalPages !== 1) {
                onViewStateChange({ totalPages: 1, currentPage: 1 });
            }

            setIsLoading(false);
            onLoad?.();
        } catch (error) {
            setIsLoading(false);
            setHasError(true);
            onError?.(error instanceof Error ? error : new Error('Failed to render Typst document'));
        }
    }, [source.artifact, onLoad, onError, viewState.totalPages, onViewStateChange]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-900 mx-auto"></div>
                    <p className="text-sm text-gray-600">Loading Typst document...</p>
                </div>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4 max-w-md">
                    <div className="text-red-500 text-5xl">⚠️</div>
                    <h3 className="text-lg font-bold text-dark-900">Failed to load Typst document</h3>
                    <p className="text-sm text-gray-600">
                        The Typst document could not be rendered. Please ensure the artifact is valid.
                    </p>
                </div>
            </div>
        );
    }

    // Temporary placeholder - Typst rendering disabled due to build issues
    return (
        <div className="w-full h-full overflow-auto bg-gray-100" ref={containerRef}>
            <div className="flex items-center justify-center min-h-full py-8">
                <div className="max-w-2xl bg-white p-8 rounded-lg shadow-lg text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-2xl font-bold text-dark-900 mb-3">Typst Document</h3>
                    <p className="text-gray-600 mb-4">
                        Typst rendering is temporarily unavailable due to a build configuration issue.
                    </p>
                    <p className="text-sm text-gray-500">
                        The Typst renderer will be enabled once the library's CSS import issue is resolved.
                        Other formats (PDF, HTML, Markdown) are fully functional.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TypstRenderer;
