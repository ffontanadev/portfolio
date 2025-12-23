import { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ResumeViewerToolbar from './ResumeViewerToolbar';
import ResumeViewerControls from './ResumeViewerControls';
import type { ResumeViewerProps, ResumeFormat, ViewState, ZoomPreset, ResumeSource } from './types';

// Lazy load renderers for code splitting
const PDFRenderer = lazy(() => import('./renderers/PDFRenderer'));
const HTMLRenderer = lazy(() => import('./renderers/HTMLRenderer'));
const MarkdownRenderer = lazy(() => import('./renderers/MarkdownRenderer'));
const TypstRenderer = lazy(() => import('./renderers/TypstRenderer'));

/**
 * ResumeViewer - Main modal component for viewing resumes in multiple formats
 * Supports PDF, HTML, Markdown, and Typst formats with zoom, rotation, and pagination
 */
const ResumeViewer = ({ isOpen, onClose, sources, defaultFormat, title = 'Resume' }: ResumeViewerProps) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [currentFormat, setCurrentFormat] = useState<ResumeFormat>(
        defaultFormat || sources[0]?.format || 'pdf'
    );
    const [viewState, setViewState] = useState<ViewState>({
        currentPage: 1,
        totalPages: 1,
        zoom: 1.0,
        rotation: 0,
        isFullscreen: false,
    });

    // Get current source based on selected format
    const currentSource = sources.find((s) => s.format === currentFormat);
    const availableFormats = sources.map((s) => s.format);

    // Determine format capabilities
    const supportsPagination = currentFormat === 'pdf';
    const supportsRotation = currentFormat === 'pdf' || currentFormat === 'typst';

    /**
     * Update view state
     */
    const updateViewState = useCallback((updates: Partial<ViewState>) => {
        setViewState((prev) => ({ ...prev, ...updates }));
    }, []);

    /**
     * Handle zoom presets
     */
    const handleZoomPreset = useCallback((preset: ZoomPreset) => {
        switch (preset) {
            case 'fit-width':
                setViewState((prev) => ({ ...prev, zoom: 1.2 })); // Approximate fit-width
                break;
            case 'fit-page':
                setViewState((prev) => ({ ...prev, zoom: 0.9 })); // Approximate fit-page
                break;
            case 'actual-size':
                setViewState((prev) => ({ ...prev, zoom: 1.0 }));
                break;
        }
    }, []);

    /**
     * Handle zoom in
     */
    const handleZoomIn = useCallback(() => {
        setViewState((prev) => {
            const newZoom = Math.min(prev.zoom + 0.1, 2.0);
            return { ...prev, zoom: newZoom };
        });
    }, []);

    /**
     * Handle zoom out
     */
    const handleZoomOut = useCallback(() => {
        setViewState((prev) => {
            const newZoom = Math.max(prev.zoom - 0.1, 0.5);
            return { ...prev, zoom: newZoom };
        });
    }, []);

    /**
     * Handle smooth scroll up
     */
    const handleScrollUp = useCallback(() => {
        if (contentRef.current) {
            contentRef.current.scrollBy({
                top: -300,
                behavior: 'smooth'
            });
        }
    }, []);

    /**
     * Handle smooth scroll down
     */
    const handleScrollDown = useCallback(() => {
        if (contentRef.current) {
            contentRef.current.scrollBy({
                top: 300,
                behavior: 'smooth'
            });
        }
    }, []);

    /**
     * Handle body scroll lock and focus management
     */
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Focus trap will be handled by keyboard listeners
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    /**
     * Handle keyboard shortcuts
     */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    if (supportsPagination && viewState.currentPage > 1) {
                        updateViewState({ currentPage: viewState.currentPage - 1 });
                    }
                    break;
                case 'ArrowRight':
                    if (supportsPagination && viewState.currentPage < viewState.totalPages) {
                        updateViewState({ currentPage: viewState.currentPage + 1 });
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    handleScrollUp();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    handleScrollDown();
                    break;
                case '+':
                case '=':
                    e.preventDefault();
                    handleZoomIn();
                    break;
                case '-':
                case '_':
                    e.preventDefault();
                    handleZoomOut();
                    break;
                case 'f':
                case 'F':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        updateViewState({ isFullscreen: !viewState.isFullscreen });
                    }
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, viewState, supportsPagination, updateViewState, handleZoomIn, handleZoomOut, handleScrollUp, handleScrollDown]);

    /**
     * Handle format change - reset view state
     */
    const handleFormatChange = (format: ResumeFormat) => {
        setCurrentFormat(format);
        setViewState({
            currentPage: 1,
            totalPages: 1,
            zoom: 1.0,
            rotation: 0,
            isFullscreen: viewState.isFullscreen,
        });
    };

    /**
     * Handle download
     */
    const handleDownload = () => {
        if (!currentSource) return;

        switch (currentSource.format) {
            case 'pdf': {
                // Open PDF in new tab for download
                window.open(currentSource.url, '_blank');
                break;
            }
            case 'html':
            case 'markdown': {
                // Create blob and download
                const blob = new Blob([currentSource.content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `resume.${currentSource.format === 'html' ? 'html' : 'md'}`;
                a.click();
                URL.revokeObjectURL(url);
                break;
            }
            case 'typst': {
                // Typst artifact download - create new Uint8Array from buffer to ensure ArrayBuffer type
                const typstArray = new Uint8Array(currentSource.artifact);
                const typstBlob = new Blob([typstArray], { type: 'application/octet-stream' });
                const typstUrl = URL.createObjectURL(typstBlob);
                const typstLink = document.createElement('a');
                typstLink.href = typstUrl;
                typstLink.download = 'resume.typ';
                typstLink.click();
                URL.revokeObjectURL(typstUrl);
                break;
            }
        }
    };

    /**
     * Handle print
     */
    const handlePrint = () => {
        window.print();
    };

    /**
     * Render the appropriate format renderer
     */
    const renderContent = () => {
        if (!currentSource) {
            return (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-600">No resume available in this format</p>
                </div>
            );
        }

        const rendererProps = {
            viewState,
            onViewStateChange: updateViewState,
            onLoad: () => console.log(`${currentFormat} loaded`),
            onError: (error: Error) => console.error(`${currentFormat} error:`, error),
        };

        return (
            <Suspense
                fallback={
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-900 mx-auto"></div>
                            <p className="text-sm text-gray-600">Loading renderer...</p>
                        </div>
                    </div>
                }
            >
                {currentFormat === 'pdf' && <PDFRenderer source={currentSource as Extract<ResumeSource, { format: 'pdf' }>} {...rendererProps} />}
                {currentFormat === 'html' && <HTMLRenderer source={currentSource as Extract<ResumeSource, { format: 'html' }>} {...rendererProps} />}
                {currentFormat === 'markdown' && <MarkdownRenderer source={currentSource as Extract<ResumeSource, { format: 'markdown' }>} {...rendererProps} />}
                {currentFormat === 'typst' && <TypstRenderer source={currentSource as Extract<ResumeSource, { format: 'typst' }>} {...rendererProps} />}
            </Suspense>
        );
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none">
                        <motion.div
                            ref={modalRef}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className={`relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col ${
                                viewState.isFullscreen
                                    ? 'max-w-full max-h-full h-full'
                                    : 'max-w-6xl max-h-[90vh]'
                            }`}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="resume-viewer-title"
                        >
                            {/* Hidden title for screen readers */}
                            <h2 id="resume-viewer-title" className="sr-only">
                                {title} - {currentFormat.toUpperCase()} Viewer
                            </h2>

                            {/* Toolbar */}
                            <ResumeViewerToolbar
                                currentFormat={currentFormat}
                                availableFormats={availableFormats}
                                onFormatChange={handleFormatChange}
                                viewState={viewState}
                                onViewStateChange={updateViewState}
                                onZoomPreset={handleZoomPreset}
                                onDownload={handleDownload}
                                onClose={onClose}
                                onScrollUp={handleScrollUp}
                                onScrollDown={handleScrollDown}
                                supportsPagination={supportsPagination}
                                supportsRotation={supportsRotation}
                            />

                            {/* Content Area */}
                            <div ref={contentRef} className="flex-1 overflow-hidden bg-gray-100">
                                {renderContent()}
                            </div>

                            {/* Controls */}
                            <ResumeViewerControls
                                viewState={viewState}
                                onViewStateChange={updateViewState}
                                onPrint={handlePrint}
                                showPagination={supportsPagination}
                            />
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ResumeViewer;
