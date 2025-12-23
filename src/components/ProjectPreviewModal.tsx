import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from '@/components/ui/x';
import { CopyIcon } from '@/components/ui/copy';
import { CheckIcon } from '@/components/ui/check';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from 'react';

export interface CodeBlock {
    language: string;
    code: string;
    label?: string;
}

export interface Project {
    title: string;
    desc: string;
    color: string;
    image?: string;
    techStack: string[];
    date: string;
    role: string;
    description: string;
    codeBlocks: CodeBlock[];
}

interface ProjectPreviewModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
}

const CodeBlockComponent = ({ block }: { block: CodeBlock }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(block.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {block.label || block.language}
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-dark-900 transition-colors rounded-lg hover:bg-gray-100"
                    aria-label="Copy code"
                >
                    {copied ? (
                        <>
                            <CheckIcon size={14} />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <CopyIcon size={14} />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <SyntaxHighlighter
                    language={block.language}
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        fontSize: '0.875rem',
                        lineHeight: '1.6',
                        backgroundColor: '#1e1e1e',
                    }}
                    showLineNumbers={true}
                >
                    {block.code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

const ProjectPreviewModal = ({ project, isOpen, onClose }: ProjectPreviewModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            closeButtonRef.current?.focus();
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        const handleTabKey = (e: KeyboardEvent) => {
            if (!isOpen || !modalRef.current) return;

            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement?.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement?.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('keydown', handleTabKey);

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('keydown', handleTabKey);
        };
    }, [isOpen, onClose]);

    if (!project) return null;

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
                            className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="modal-title"
                        >
                            {/* Close Button */}
                            <button
                                ref={closeButtonRef}
                                onClick={onClose}
                                className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-md"
                                aria-label="Close modal"
                            >
                                <XIcon size={24} className="text-dark-900" />
                            </button>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto max-h-[90vh] custom-scrollbar">
                                {/* Hero Image Section */}
                                {project.image && (
                                    <div className="w-full aspect-[21/9] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                )}

                                {/* Content Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 md:p-12">
                                    {/* Left Column - Project Info */}
                                    <div className="space-y-6">
                                        <div>
                                            <h2
                                                id="modal-title"
                                                className="text-3xl md:text-4xl font-display font-bold mb-3 text-dark-900"
                                            >
                                                {project.title}
                                            </h2>
                                            <p className="text-lg text-gray-600 leading-relaxed">
                                                {project.description}
                                            </p>
                                        </div>

                                        {/* Metadata */}
                                        <div className="space-y-4 pt-4 border-t border-gray-200">
                                            <div>
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                                    Tech Stack
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {project.techStack.map((tech, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                                                        Date
                                                    </h3>
                                                    <p className="text-sm text-dark-900 font-medium">{project.date}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                                                        Role
                                                    </h3>
                                                    <p className="text-sm text-dark-900 font-medium">{project.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Code Blocks */}
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                                            Key Implementation
                                        </h3>
                                        {project.codeBlocks.map((block, index) => (
                                            <CodeBlockComponent key={index} block={block} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ProjectPreviewModal;
