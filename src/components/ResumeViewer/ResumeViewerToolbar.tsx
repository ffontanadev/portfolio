import { ZoomIn, ZoomOut, Minimize2 } from 'lucide-react';
import { XIcon } from '@/components/ui/x';
import { Maximize2Icon } from '@/components/ui/maximize-2';
import { RotateCWIcon } from '@/components/ui/rotate-cw';
import { DownloadIcon } from '@/components/ui/download';
import { ArrowUpIcon } from '@/components/ui/arrow-up';
import { ArrowDownIcon } from '@/components/ui/arrow-down';
import type { ResumeViewerToolbarProps, ResumeFormat } from './types';

/**
 * ResumeViewerToolbar - Top toolbar with format selector and view controls
 */
const ResumeViewerToolbar = ({
    currentFormat,
    availableFormats,
    onFormatChange,
    viewState,
    onViewStateChange,
    onZoomPreset,
    onDownload,
    onClose,
    onScrollUp,
    onScrollDown,
    supportsRotation,
}: ResumeViewerToolbarProps) => {
    const formatLabels: Record<ResumeFormat, string> = {
        pdf: 'PDF',
        html: 'HTML',
        markdown: 'Markdown',
        typst: 'Typst',
    };

    const handleZoomIn = () => {
        const newZoom = Math.min(viewState.zoom + 0.1, 2.0);
        onViewStateChange({ zoom: newZoom });
    };

    const handleZoomOut = () => {
        const newZoom = Math.max(viewState.zoom - 0.1, 0.5);
        onViewStateChange({ zoom: newZoom });
    };

    const handleRotate = () => {
        const newRotation = (viewState.rotation + 90) % 360;
        onViewStateChange({ rotation: newRotation });
    };

    const handleFullscreen = () => {
        onViewStateChange({ isFullscreen: !viewState.isFullscreen });
    };

    const zoomPercentage = Math.round(viewState.zoom * 100);

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
            {/* Left: Format Selector */}
            <div className="flex items-center gap-3">
                <label htmlFor="format-selector" className="text-sm font-medium text-gray-700">
                    Format:
                </label>
                <select
                    id="format-selector"
                    value={currentFormat}
                    onChange={(e) => onFormatChange(e.target.value as ResumeFormat)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white"
                    aria-label="Select resume format"
                >
                    {availableFormats.map((format) => (
                        <option key={format} value={format}>
                            {formatLabels[format]}
                        </option>
                    ))}
                </select>
            </div>

            {/* Center: View Controls */}
            <div className="flex items-center gap-2">
                {/* Zoom Out */}
                <button
                    onClick={handleZoomOut}
                    disabled={viewState.zoom <= 0.5}
                    className="p-2 text-gray-600 hover:text-dark-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Zoom out"
                    title="Zoom out"
                >
                    <ZoomOut size={18} />
                </button>

                {/* Zoom Percentage */}
                <span className="text-sm font-medium text-gray-700 min-w-[3.5rem] text-center">
                    {zoomPercentage}%
                </span>

                {/* Zoom In */}
                <button
                    onClick={handleZoomIn}
                    disabled={viewState.zoom >= 2.0}
                    className="p-2 text-gray-600 hover:text-dark-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Zoom in"
                    title="Zoom in"
                >
                    <ZoomIn size={18} />
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Fit to Width */}
                <button
                    onClick={() => onZoomPreset('fit-width')}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-dark-900 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Fit to width"
                    title="Fit to width"
                >
                    Fit Width
                </button>

                {/* Fit to Page */}
                <button
                    onClick={() => onZoomPreset('fit-page')}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-dark-900 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Fit to page"
                    title="Fit to page"
                >
                    Fit Page
                </button>

                {/* Actual Size */}
                <button
                    onClick={() => onZoomPreset('actual-size')}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-dark-900 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Actual size"
                    title="Actual size (100%)"
                >
                    100%
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Scroll Up */}
                <button
                    onClick={onScrollUp}
                    className="p-2 text-gray-600 hover:text-dark-900 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Scroll up"
                    title="Scroll up"
                >
                    <ArrowUpIcon size={18} />
                </button>

                {/* Scroll Down */}
                <button
                    onClick={onScrollDown}
                    className="p-2 text-gray-600 hover:text-dark-900 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Scroll down"
                    title="Scroll down"
                >
                    <ArrowDownIcon size={18} />
                </button>

                {/* Rotate (only for PDF and Typst) */}
                {supportsRotation && (
                    <>
                        <div className="w-px h-6 bg-gray-300 mx-1" />
                        <button
                            onClick={handleRotate}
                            className="p-2 text-gray-600 hover:text-dark-900 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Rotate 90 degrees"
                            title="Rotate"
                        >
                            <RotateCWIcon size={18} />
                        </button>
                    </>
                )}

                {/* Fullscreen Toggle */}
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                    onClick={handleFullscreen}
                    className="p-2 text-gray-600 hover:text-dark-900 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label={viewState.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    title={viewState.isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                    {viewState.isFullscreen ? <Minimize2 size={18} /> : <Maximize2Icon size={18} />}
                </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* Download */}
                <button
                    onClick={onDownload}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-dark-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    aria-label="Download resume"
                >
                    <DownloadIcon size={16} />
                    Download
                </button>

                {/* Close */}
                <button
                    onClick={onClose}
                    className="p-2 text-gray-600 hover:text-dark-900 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close viewer"
                    title="Close (Esc)"
                >
                    <XIcon size={20} />
                </button>
            </div>
        </div>
    );
};

export default ResumeViewerToolbar;
