/**
 * ResumeViewer - A comprehensive resume viewing component
 *
 * Supports multiple formats: PDF, HTML, Markdown, and Typst
 * Features: Zoom, rotation, pagination, keyboard shortcuts, accessibility
 *
 * @example
 * ```tsx
 * import ResumeViewer from '@/components/ResumeViewer';
 *
 * const sources = [
 *   { format: 'pdf', url: '/resume.pdf' },
 *   { format: 'markdown', content: '# My Resume...' }
 * ];
 *
 * <ResumeViewer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   sources={sources}
 *   defaultFormat="pdf"
 * />
 * ```
 */

export { default } from './ResumeViewer';
export * from './types';
