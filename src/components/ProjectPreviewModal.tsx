import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from '@/components/ui/x';
import { CopyIcon } from '@/components/ui/copy';
import { CheckIcon } from '@/components/ui/check';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from 'react';
import BancoProvinciaLogo from './logos/BancoProvinciaLogo';
import BBVALogo from './logos/BBVALogo';
import { accentForCategory } from './projectTypes';
import type { Project, CodeBlock, ProjectLeadMetric, ProjectLogo } from './projectTypes';
import LatestCommit from './LatestCommit';
import { useTranslation } from '@/i18n';

// Re-export the Project type for backwards compatibility with existing importers.
export type { Project } from './projectTypes';

const LOGO_REGISTRY: Record<ProjectLogo, typeof BancoProvinciaLogo> = {
    'banco-provincia': BancoProvinciaLogo,
    bbva: BBVALogo,
};

interface ProjectPreviewModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
}

const CodeBlockComponent = ({ block }: { block: CodeBlock }) => {
    const [copied, setCopied] = useState(false);
    const { t } = useTranslation();

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
                    aria-label={t('work.modal.copyCode')}
                >
                    {copied ? (
                        <>
                            <CheckIcon size={14} />
                            <span>{t('work.modal.copied')}</span>
                        </>
                    ) : (
                        <>
                            <CopyIcon size={14} />
                            <span>{t('work.modal.copy')}</span>
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

export const LeadMetricDisplay = ({
    metric,
    size = 'card',
}: {
    metric: ProjectLeadMetric;
    size?: 'card' | 'modal';
}) => {
    const isModal = size === 'modal';

    if (metric.kind === 'migration') {
        return (
            <div
                className={`flex items-baseline justify-center gap-3 font-display font-bold tracking-[-0.04em] leading-none text-dark-900 ${
                    isModal ? 'text-[clamp(2.75rem,6vw,5rem)]' : 'text-[clamp(1.75rem,4.5vw,3rem)]'
                }`}
            >
                <span>{metric.from}</span>
                <span
                    className="text-coral-500 font-display-italic font-light"
                    style={{ fontStyle: 'italic' }}
                    aria-hidden="true"
                >
                    →
                </span>
                <span>{metric.to}</span>
            </div>
        );
    }

    if (metric.kind === 'wordmark') {
        return (
            <div className="flex flex-col items-center">
                <span
                    className={`font-display font-bold tracking-[-0.04em] leading-none text-dark-900 ${
                        isModal ? 'text-[clamp(3rem,8vw,6rem)]' : 'text-[clamp(2.25rem,6vw,3.75rem)]'
                    }`}
                >
                    {metric.value}
                </span>
                {metric.sub && (
                    <span
                        className={`font-display font-display-italic font-light tracking-tight text-dark-900/55 mt-2 ${
                            isModal ? 'text-2xl' : 'text-lg'
                        }`}
                        style={{ fontStyle: 'italic' }}
                    >
                        {metric.sub}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center">
            {metric.superscript && (
                <span
                    className={`font-display font-display-italic font-light tracking-tight text-dark-900/55 mb-1 ${
                        isModal ? 'text-3xl' : 'text-xl'
                    }`}
                    style={{ fontStyle: 'italic' }}
                >
                    {metric.superscript}
                </span>
            )}
            <span
                className={`font-display font-bold tracking-[-0.04em] leading-none text-dark-900 ${
                    isModal ? 'text-[clamp(4rem,10vw,7rem)]' : 'text-[clamp(3rem,7vw,4.5rem)]'
                }`}
            >
                {metric.value}
            </span>
        </div>
    );
};

export const TypographicHero = ({ project, size = 'modal' }: { project: Project; size?: 'card' | 'modal' }) => {
    const isModal = size === 'modal';
    const accent = accentForCategory(project.category);

    return (
        <div
            className={`relative w-full overflow-hidden ${
                isModal ? 'aspect-[21/9] bg-cream-100' : 'h-full bg-cream-100'
            }`}
        >
            <div
                className="absolute inset-0 opacity-60"
                style={{
                    background:
                        'radial-gradient(ellipse 60% 80% at 50% 35%, #FFF8F3, transparent 70%)',
                }}
                aria-hidden="true"
            />
            <div
                className="absolute inset-x-5 top-5 flex items-center justify-between text-dark-900/45"
                aria-hidden="true"
            >
                <span className="font-display italic text-sm" style={{ fontStyle: 'italic' }}>
                    §
                </span>
            </div>

            <div className={`relative h-full flex flex-col items-center justify-center ${isModal ? 'px-8 py-14' : 'px-6 py-10'}`}>
                {project.logo ? (
                    (() => {
                        const Logo = LOGO_REGISTRY[project.logo];
                        const isWide = project.logo === 'banco-provincia';
                        const sizeClasses = isWide
                            ? isModal
                                ? 'h-4 mb-7 text-dark-900/85'
                                : 'h-5 mb-5 text-dark-900/85'
                            : isModal
                              ? 'h-9 mb-7 text-dark-900/85'
                              : 'h-6 mb-5 text-dark-900/85';
                        return <Logo className={`${sizeClasses} w-auto`} />;
                    })()
                ) : (
                    project.company && (
                        <span
                            className={`font-display font-display-italic text-dark-900/60 tracking-tight mb-3 ${
                                isModal ? 'text-2xl' : 'text-lg'
                            }`}
                            style={{ fontStyle: 'italic' }}
                        >
                            {project.company}
                        </span>
                    )
                )}
                {project.leadMetric && <LeadMetricDisplay metric={project.leadMetric} size={size} />}
                <div className={`${isModal ? 'mt-8' : 'mt-5'} h-px w-12 ${accent.hairlineSoft}`} aria-hidden="true" />
                <p className={`mt-3 font-mono tracking-[0.22em] uppercase text-dark-900/50 text-center ${isModal ? 'text-[11px]' : 'text-[9px]'}`}>
                    {project.techStack.slice(0, isModal ? 5 : 3).join(' · ')}
                </p>
            </div>
        </div>
    );
};

// Backwards-compatible alias — existing imports keep working.
export const EnterpriseHero = TypographicHero;

const MetricBrief = ({ project }: { project: Project }) => {
    const { t } = useTranslation();
    if (!project.metrics?.length) return null;
    return (
        <div>
            <h3 className="font-mono text-[10px] tracking-[0.22em] uppercase text-dark-900/55 mb-4">
                {t('work.modal.migrationBrief')}
            </h3>
            <div className="rounded-2xl border border-dark-900/10 divide-y divide-dark-900/[0.07] overflow-hidden bg-cream-50/40">
                {project.metrics.map((m, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-4 px-5 py-4">
                        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-dark-900/55 shrink-0">
                            {m.label}
                        </span>
                        <span
                            className={`font-display text-lg md:text-xl tracking-tight text-right ${
                                m.accent
                                    ? 'text-coral-500 font-semibold'
                                    : 'text-dark-900 font-medium'
                            }`}
                        >
                            {m.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DevelopmentRoadmap = ({ project }: { project: Project }) => {
    const { t } = useTranslation();
    if (!project.phases?.length) return null;
    return (
        <div>
            <h3 className="font-mono text-[10px] tracking-[0.22em] uppercase text-dark-900/55 mb-4">
                {t('work.modal.developmentRoadmap')}
            </h3>
            <div className="rounded-2xl border border-dark-900/10 divide-y divide-dark-900/[0.07] overflow-hidden bg-cream-50/40">
                {project.phases.map((phase, i) => (
                    <div key={i} className="flex items-start gap-4 px-5 py-4">
                        <span
                            className={`font-mono text-[10px] tracking-[0.2em] uppercase shrink-0 mt-1 ${
                                phase.current ? 'text-teal-700 font-semibold' : 'text-dark-900/45'
                            }`}
                        >
                            {phase.label}
                        </span>
                        <div className="min-w-0">
                            <p
                                className={`font-display text-lg md:text-xl tracking-tight ${
                                    phase.current ? 'text-teal-700 font-semibold' : 'text-dark-900 font-medium'
                                }`}
                            >
                                {phase.title}
                            </p>
                            <p className="mt-1 text-sm text-dark-900/55 leading-relaxed">
                                {phase.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProjectPreviewModal = ({ project, isOpen, onClose }: ProjectPreviewModalProps) => {
    const { t } = useTranslation();
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
                                aria-label={t('work.modal.close')}
                            >
                                <XIcon size={24} className="text-dark-900" />
                            </button>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto max-h-[90vh] custom-scrollbar">
                                {/* Hero Section — typographic for every project */}
                                <TypographicHero project={project} size="modal" />

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
                                                    {t('work.modal.techStack')}
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
                                                        {t('work.modal.date')}
                                                    </h3>
                                                    <p className="text-sm text-dark-900 font-medium">{project.date}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                                                        {t('work.modal.role')}
                                                    </h3>
                                                    <p className="text-sm text-dark-900 font-medium">{project.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column — Migration Brief, Development Roadmap, or Code Blocks */}
                                    {project.category === 'professional' && project.metrics?.length ? (
                                        <MetricBrief project={project} />
                                    ) : project.phases?.length ? (
                                        <div className="space-y-8">
                                            <DevelopmentRoadmap project={project} />
                                            {project.repo && (
                                                <LatestCommit repo={project.repo} variant="detail" />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                                                {t('work.modal.keyImplementation')}
                                            </h3>
                                            {project.codeBlocks.map((block, index) => (
                                                <CodeBlockComponent key={index} block={block} />
                                            ))}
                                        </div>
                                    )}
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
