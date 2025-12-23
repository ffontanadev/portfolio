import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import type { PDFRendererProps } from '../types';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/**
 * PDFRenderer - Renders PDF documents with pagination support
 * Uses react-pdf (built on pdfjs-dist)
 */
const PDFRenderer = ({ source, viewState, onViewStateChange, onLoad, onError }: PDFRendererProps) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageWidth, setPageWidth] = useState<number>(0);

    /**
     * Called when PDF document loads successfully
     */
    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
        setNumPages(numPages);
        onViewStateChange({
            totalPages: numPages,
            currentPage: 1,
        });
        onLoad?.();
    };

    /**
     * Called when PDF document fails to load
     */
    const onDocumentLoadError = (error: Error): void => {
        onError?.(error);
    };

    /**
     * Calculate page width based on container and zoom
     */
    useEffect(() => {
        const calculatePageWidth = () => {
            const container = document.querySelector('.pdf-container');
            if (container) {
                const containerWidth = container.clientWidth;
                setPageWidth(containerWidth * 0.9); // 90% of container width
            }
        };

        calculatePageWidth();
        window.addEventListener('resize', calculatePageWidth);
        return () => window.removeEventListener('resize', calculatePageWidth);
    }, []);

    // Apply rotation and zoom
    const rotation = viewState.rotation;
    const scale = viewState.zoom;

    return (
        <div className="pdf-container w-full h-full overflow-auto bg-gray-100">
            <div className="flex items-center justify-center min-h-full py-8">
                <Document
                    file={source.url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center space-y-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-900 mx-auto"></div>
                                <p className="text-sm text-gray-600">Loading PDF document...</p>
                            </div>
                        </div>
                    }
                    error={
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center space-y-4 max-w-md">
                                <div className="text-red-500 text-5xl">⚠️</div>
                                <h3 className="text-lg font-bold text-dark-900">Failed to load PDF</h3>
                                <p className="text-sm text-gray-600">
                                    The PDF document could not be loaded. Please check the file URL and try again.
                                </p>
                            </div>
                        </div>
                    }
                    className="flex flex-col items-center gap-4"
                >
                    {numPages > 0 && (
                        <Page
                            pageNumber={viewState.currentPage}
                            width={pageWidth}
                            scale={scale}
                            rotate={rotation}
                            className="shadow-lg"
                            loading={
                                <div className="flex items-center justify-center bg-white" style={{ width: pageWidth, height: pageWidth * 1.414 }}>
                                    <div className="text-sm text-gray-500">Loading page...</div>
                                </div>
                            }
                        />
                    )}
                </Document>
            </div>
        </div>
    );
};

export default PDFRenderer;
