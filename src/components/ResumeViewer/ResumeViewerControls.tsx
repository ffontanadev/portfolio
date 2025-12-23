import { Printer } from 'lucide-react';
import { ChevronLeftIcon } from '@/components/ui/chevron-left';
import { ChevronRightIcon } from '@/components/ui/chevron-right';
import { useState, useRef } from 'react';
import type { ResumeViewerControlsProps } from './types';

/**
 * ResumeViewerControls - Bottom controls for pagination and actions
 */
const ResumeViewerControls = ({
    viewState,
    onViewStateChange,
    onPrint,
    showPagination,
}: ResumeViewerControlsProps) => {
    // Use viewState.currentPage directly, only maintain local state during input
    const [inputValue, setInputValue] = useState<string>('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const displayValue = isFocused ? inputValue : viewState.currentPage.toString();

    const handlePreviousPage = () => {
        if (viewState.currentPage > 1) {
            onViewStateChange({ currentPage: viewState.currentPage - 1 });
        }
    };

    const handleNextPage = () => {
        if (viewState.currentPage < viewState.totalPages) {
            onViewStateChange({ currentPage: viewState.currentPage + 1 });
        }
    };

    const handleJumpToPage = (e: React.FormEvent) => {
        e.preventDefault();
        const pageNum = parseInt(inputValue || viewState.currentPage.toString(), 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= viewState.totalPages) {
            onViewStateChange({ currentPage: pageNum });
            setInputValue('');
            inputRef.current?.blur();
        } else {
            // Reset input if invalid
            setInputValue('');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputFocus = () => {
        setIsFocused(true);
        setInputValue(viewState.currentPage.toString());
        inputRef.current?.select();
    };

    const handleInputBlur = () => {
        setIsFocused(false);
        setInputValue('');
    };

    return (
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
            {/* Left: Pagination Controls */}
            <div className="flex items-center gap-3">
                {showPagination ? (
                    <>
                        {/* Previous Page */}
                        <button
                            onClick={handlePreviousPage}
                            disabled={viewState.currentPage <= 1}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-dark-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Previous page"
                        >
                            <ChevronLeftIcon size={16} />
                            Previous
                        </button>

                        {/* Page Indicator with Jump Input */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Page</span>
                            <form onSubmit={handleJumpToPage} className="inline-block">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={displayValue}
                                    onChange={handleInputChange}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                    className="w-12 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                                    aria-label="Current page number"
                                />
                            </form>
                            <span className="text-sm text-gray-600">
                                of {viewState.totalPages}
                            </span>
                        </div>

                        {/* Next Page */}
                        <button
                            onClick={handleNextPage}
                            disabled={viewState.currentPage >= viewState.totalPages}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-dark-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Next page"
                        >
                            Next
                            <ChevronRightIcon size={16} />
                        </button>
                    </>
                ) : (
                    <div className="text-sm text-gray-500">
                        {/* Placeholder when pagination is not available */}
                    </div>
                )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* Print */}
                <button
                    onClick={onPrint}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-dark-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    aria-label="Print resume"
                >
                    <Printer size={16} />
                    Print
                </button>
            </div>
        </div>
    );
};

export default ResumeViewerControls;
