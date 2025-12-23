/**
 * Type definitions for Resume Viewer component
 * Using discriminated unions for type-safe format handling
 */

export type ResumeFormat = 'pdf' | 'html' | 'markdown' | 'typst';

/**
 * Discriminated union for type-safe resume sources
 * Each format has specific required properties
 */
export type ResumeSource =
  | { format: 'pdf'; url: string; label?: string }
  | { format: 'html'; content: string; label?: string }
  | { format: 'markdown'; content: string; label?: string }
  | { format: 'typst'; artifact: Uint8Array; label?: string };

/**
 * View state for controlling zoom, pagination, and display options
 */
export interface ViewState {
  currentPage: number;
  totalPages: number;
  zoom: number; // 0.5 to 2.0 (50% to 200%)
  rotation: number; // 0, 90, 180, 270
  isFullscreen: boolean;
}

/**
 * Zoom preset options
 */
export type ZoomPreset = 'fit-width' | 'fit-page' | 'actual-size';

/**
 * Main props for ResumeViewer component
 */
export interface ResumeViewerProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Resume sources in different formats */
  sources: ResumeSource[];
  /** Default format to display on open */
  defaultFormat?: ResumeFormat;
  /** Optional title for the modal */
  title?: string;
}

/**
 * Common props for all renderer components
 */
export interface BaseRendererProps {
  /** Current view state */
  viewState: ViewState;
  /** Callback to update view state */
  onViewStateChange: (updates: Partial<ViewState>) => void;
  /** Callback when content is loaded */
  onLoad?: () => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Container ref for scroll control */
  containerRef?: React.RefObject<HTMLDivElement>;
}

/**
 * PDF Renderer specific props
 */
export interface PDFRendererProps extends BaseRendererProps {
  source: Extract<ResumeSource, { format: 'pdf' }>;
}

/**
 * HTML Renderer specific props
 */
export interface HTMLRendererProps extends BaseRendererProps {
  source: Extract<ResumeSource, { format: 'html' }>;
}

/**
 * Markdown Renderer specific props
 */
export interface MarkdownRendererProps extends BaseRendererProps {
  source: Extract<ResumeSource, { format: 'markdown' }>;
}

/**
 * Typst Renderer specific props
 */
export interface TypstRendererProps extends BaseRendererProps {
  source: Extract<ResumeSource, { format: 'typst' }>;
}

/**
 * Toolbar props
 */
export interface ResumeViewerToolbarProps {
  /** Current format being displayed */
  currentFormat: ResumeFormat;
  /** Available formats */
  availableFormats: ResumeFormat[];
  /** Callback when format changes */
  onFormatChange: (format: ResumeFormat) => void;
  /** Current view state */
  viewState: ViewState;
  /** Callback to update view state */
  onViewStateChange: (updates: Partial<ViewState>) => void;
  /** Callback to apply zoom preset */
  onZoomPreset: (preset: ZoomPreset) => void;
  /** Callback to download current format */
  onDownload: () => void;
  /** Callback to close modal */
  onClose: () => void;
  /** Callback to scroll up */
  onScrollUp: () => void;
  /** Callback to scroll down */
  onScrollDown: () => void;
  /** Whether the current format supports pagination */
  supportsPagination: boolean;
  /** Whether the current format supports rotation */
  supportsRotation: boolean;
}

/**
 * Controls (navigation/actions) props
 */
export interface ResumeViewerControlsProps {
  /** Current view state */
  viewState: ViewState;
  /** Callback to update view state */
  onViewStateChange: (updates: Partial<ViewState>) => void;
  /** Callback to print */
  onPrint: () => void;
  /** Whether pagination controls should be shown */
  showPagination: boolean;
}
