import { useEffect, useRef } from 'react';
import {
    ArrowUpRight,
    Binary,
    Boxes,
    CircuitBoard,
    Cpu,
    HardDrive,
    LayoutDashboard,
    Network,
    Sparkles,
    type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from '@/components/ui/x';
import { CopyIcon } from '@/components/ui/copy';
import { CheckIcon } from '@/components/ui/check';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from 'react';
import BBVALogo from './logos/BBVALogo';
import BancoProvinciaLogo from './logos/BancoProvinciaLogo';
import { accentForCategory } from './projectTypes';
import type {
    Project,
    CodeBlock,
    ProjectLeadMetric,
    ProjectLogo,
    MigrationDossier,
    ProjectSystem,
    ProjectSystemTier,
} from './projectTypes';
import LatestCommit from './LatestCommit';
import { useTranslation } from '@/i18n';

// Re-export the Project type for backwards compatibility with existing importers.
export type { Project } from './projectTypes';

const LOGO_REGISTRY: Record<ProjectLogo, typeof BBVALogo> = {
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

/**
 * Lead-metric type scale (spec §5.1: "the h1 is the largest text at every
 * breakpoint").
 *
 * The h1 steps 36 / 56 / 72px at the 768 and 1024 breakpoints, so the binding
 * width is 767px — the last pixel before it jumps to 56. A `clamp(min, Nvw,
 * max)` stays under the h1 everywhere as long as N ≤ 4.5vw (767 × 0.045 = 34.5)
 * and the max is under 4.5rem. Both the floor and the ceiling matter: the old
 * floors alone (48px) already out-sized the h1 on every phone.
 *
 * Raise nothing here without re-checking 767px and 1023px.
 */
const LEAD_METRIC_SIZE = {
    modal: {
        migration: 'text-[clamp(1.5rem,3.5vw,3rem)]',
        wordmark: 'text-[clamp(1.75rem,4vw,3.5rem)]',
        scale: 'text-[clamp(2rem,4.5vw,4rem)]',
    },
    card: {
        migration: 'text-[clamp(1.25rem,2.5vw,2.25rem)]',
        wordmark: 'text-[clamp(1.5rem,3vw,2.75rem)]',
        scale: 'text-[clamp(1.75rem,3.5vw,3.25rem)]',
    },
} as const;

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
                    LEAD_METRIC_SIZE[isModal ? 'modal' : 'card'].migration
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
                        LEAD_METRIC_SIZE[isModal ? 'modal' : 'card'].wordmark
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
                    LEAD_METRIC_SIZE[isModal ? 'modal' : 'card'].scale
                }`}
            >
                {metric.value}
            </span>
        </div>
    );
};

/** Radial cream wash rendered behind both the static and video heroes. */
export const HERO_RADIAL_BG =
    'radial-gradient(ellipse 60% 80% at 50% 35%, #FFF8F3, transparent 70%)';

/**
 * The centered identity block shared by the static (`TypographicHero`) and
 * video (`VideoShowcaseHero`) heroes: logo/company, lead metric, hairline, and
 * the tech-stack line. Pure presentation, no background of its own.
 */
export const HeroOverlayContent = ({
    project,
    size = 'modal',
}: {
    project: Project;
    size?: 'card' | 'modal';
}) => {
    const isModal = size === 'modal';
    const accent = accentForCategory(project.category);

    return (
        <div className={`relative h-full flex flex-col items-center justify-center ${isModal ? 'px-8 py-14' : 'px-6 py-10'}`}>
            {project.logo ? (
                (() => {
                    const Logo = LOGO_REGISTRY[project.logo];
                    // The Banco Provincia mark is a wide wordmark; height is the
                    // binding constraint, so it needs its own smaller ramp.
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
    );
};

export const TypographicHero = ({ project, size = 'modal' }: { project: Project; size?: 'card' | 'modal' }) => {
    const isModal = size === 'modal';

    return (
        <div
            className={`relative w-full overflow-hidden ${
                isModal ? 'aspect-[21/9] bg-cream-100' : 'h-full bg-cream-100'
            }`}
        >
            <div
                className="absolute inset-0 opacity-60"
                style={{ background: HERO_RADIAL_BG }}
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

            <HeroOverlayContent project={project} size={size} />
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
                {t('work.modal.projectBrief')}
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

const MigrationStatTiles = ({ stats }: { stats: MigrationDossier['scope'] }) => (
    <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
            <div key={i} className="rounded-xl border border-dark-900/10 bg-cream-50/40 px-4 py-3">
                <div className="font-display font-bold text-2xl md:text-3xl tracking-[-0.03em] text-dark-900 leading-none">
                    {s.value}
                </div>
                <div className="mt-1.5 font-mono text-[10px] tracking-[0.18em] uppercase text-dark-900/55">
                    {s.label}
                </div>
            </div>
        ))}
    </div>
);

const MigrationDossierView = ({ dossier }: { dossier: MigrationDossier }) => (
    <div className="space-y-8">
        <MigrationStatTiles stats={dossier.scope} />

        {/* Before -> After */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
            {[dossier.before, dossier.after].map((col, idx) => (
                <div key={idx} className={idx === 0 ? '' : 'col-start-3'}>
                    <h4 className="font-mono text-[10px] tracking-[0.22em] uppercase text-dark-900/55 mb-3">
                        {col.heading}
                    </h4>
                    <ul className="space-y-2">
                        {col.items.map((item, i) => (
                            <li
                                key={i}
                                className={`text-sm leading-snug ${
                                    idx === 0 ? 'text-dark-900/50 line-through decoration-dark-900/20' : 'text-dark-900 font-medium'
                                }`}
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
            <span
                className="col-start-2 row-start-1 self-center font-display-italic text-coral-500 text-3xl font-light pt-6"
                style={{ fontStyle: 'italic' }}
                aria-hidden="true"
            >
                &rarr;
            </span>
        </div>

        {/* Module breakdown */}
        <div>
            <h3 className="font-mono text-[10px] tracking-[0.22em] uppercase text-dark-900/55 mb-4">
                {dossier.modulesHeading}
            </h3>
            <div className="rounded-2xl border border-dark-900/10 divide-y divide-dark-900/[0.07] overflow-hidden bg-cream-50/40">
                {dossier.modules.map((m, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-4 px-5 py-3.5">
                        <div className="min-w-0">
                            <p className="font-display text-base md:text-lg tracking-tight text-dark-900 font-medium">
                                {m.label}
                            </p>
                            <p className="mt-0.5 text-sm text-dark-900/55 leading-snug">{m.role}</p>
                        </div>
                        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-dark-900/55 shrink-0">
                            {m.scale}
                        </span>
                    </div>
                ))}
            </div>
        </div>

        {/* Phases */}
        <div>
            <h3 className="font-mono text-[10px] tracking-[0.22em] uppercase text-dark-900/55 mb-4">
                {dossier.phasesHeading}
            </h3>
            <div className="rounded-2xl border border-dark-900/10 divide-y divide-dark-900/[0.07] overflow-hidden bg-cream-50/40">
                {dossier.phases.map((phase, i) => (
                    <div key={i} className="flex items-start gap-4 px-5 py-4">
                        <span
                            className={`font-mono text-[10px] tracking-[0.2em] uppercase shrink-0 mt-1 ${
                                phase.current ? 'text-coral-500 font-semibold' : 'text-dark-900/45'
                            }`}
                        >
                            {phase.label}
                        </span>
                        <div className="min-w-0">
                            <p
                                className={`font-display text-lg tracking-tight ${
                                    phase.current ? 'text-coral-500 font-semibold' : 'text-dark-900 font-medium'
                                }`}
                            >
                                {phase.title}
                            </p>
                            <p className="mt-1 text-sm text-dark-900/55 leading-relaxed">{phase.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

/**
 * The demo URL as the reader would say it out loud — no scheme, no trailing
 * slash — so a GitHub Page keeps the path that identifies it
 * (`elfontii.github.io/efengine`, not the bare host).
 */
const demoLabel = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/+$/, '');

const LiveDemo = ({ url }: { url: string }) => {
    const { t } = useTranslation();
    return (
        <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                {t('work.liveDemo')}
            </h3>
            <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="group/demo inline-flex items-center gap-1.5 text-sm font-medium text-dark-900 hover:text-coral-500 transition-colors"
            >
                <span className="font-mono break-all">{demoLabel(url)}</span>
                <ArrowUpRight
                    size={14}
                    className="shrink-0 transition-transform duration-300 group-hover/demo:-translate-y-0.5 group-hover/demo:translate-x-0.5"
                    aria-hidden="true"
                />
            </a>
        </div>
    );
};

type SystemStyle = {
    Icon: LucideIcon;
    text: string;
    border: string;
    bg: string;
    chip: string;
    /** Spans the whole runtime row instead of sharing it with a sibling. */
    wide?: boolean;
    /** Position within the runtime tier; the wide cards bracket the pair. */
    rank?: number;
};

/**
 * One hue and one glyph per module. Keyed by the bare module name, which is a
 * repo identifier and therefore identical in every locale — `efecom · RHI`
 * resolves on `efecom`.
 */
const SYSTEM_STYLES: Record<string, SystemStyle> = {
    efecom: { Icon: Cpu, text: 'text-teal-700', border: 'border-teal-700/35', bg: 'bg-teal-700/[0.06]', chip: 'bg-teal-700/10' },
    renderer: { Icon: Sparkles, text: 'text-amber-700', border: 'border-amber-700/30', bg: 'bg-amber-700/[0.05]', chip: 'bg-amber-700/10', rank: 0 },
    scene: { Icon: Network, text: 'text-sky-700', border: 'border-sky-700/30', bg: 'bg-sky-700/[0.05]', chip: 'bg-sky-700/10', rank: 1 },
    resources: { Icon: HardDrive, text: 'text-emerald-700', border: 'border-emerald-700/30', bg: 'bg-emerald-700/[0.05]', chip: 'bg-emerald-700/10', rank: 2 },
    serialization: { Icon: Binary, text: 'text-rose-700', border: 'border-rose-700/30', bg: 'bg-rose-700/[0.05]', chip: 'bg-rose-700/10', rank: 3 },
    sandbox: { Icon: LayoutDashboard, text: 'text-violet-700', border: 'border-violet-700/30', bg: 'bg-violet-700/[0.05]', chip: 'bg-violet-700/10' },
};

const FALLBACK_SYSTEM_STYLE: SystemStyle = {
    Icon: Boxes,
    text: 'text-dark-900/75',
    border: 'border-dark-900/10',
    bg: 'bg-cream-50/70',
    chip: 'bg-dark-900/[0.06]',
};

const styleForSystem = (label: string): SystemStyle =>
    SYSTEM_STYLES[label.split('·')[0].trim().toLowerCase()] ?? FALLBACK_SYSTEM_STYLE;

const SystemCard = ({ system, emphasis }: { system: ProjectSystem; emphasis?: boolean }) => {
    const { Icon, text, border, bg, chip, wide } = styleForSystem(system.label);
    return (
        <div
            className={`flex gap-3 rounded-xl border px-4 py-3 ${border} ${bg} ${
                emphasis ? 'shadow-sm' : ''
            } ${wide ? 'sm:col-span-2' : ''}`}
        >
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${chip}`}>
                <Icon className={`h-3.5 w-3.5 ${text}`} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <p className={`font-mono text-[11px] tracking-[0.12em] font-semibold ${text}`}>
                    {system.label}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-dark-900/55">{system.role}</p>
            </div>
        </div>
    );
};

/** Vertical rule between tiers, with an optional caption riding on it. */
const TierLink = ({ caption }: { caption?: string }) => (
    <div className="flex flex-col items-center gap-1 py-1.5" aria-hidden="true">
        <span className="h-4 w-px bg-dark-900/15" />
        {caption && (
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-dark-900/35">
                {caption}
            </span>
        )}
        <span className="h-4 w-px bg-dark-900/15" />
    </div>
);

// Draws how the engine is stacked — the editor drives the runtime, the runtime
// goes through the RHI, and only the RHI reaches the GPU.
const EngineSystems = ({ project }: { project: Project }) => {
    const { t } = useTranslation();
    const systems = project.systems;
    if (!systems?.length) return null;

    const inTier = (tier: ProjectSystemTier) => systems.filter((s) => (s.tier ?? 'runtime') === tier);
    const editor = inTier('editor');
    // Ranked so the two full-width cards bracket the paired half-width ones,
    // leaving no hole in the two-column grid.
    const runtime = inTier('runtime').sort(
        (a, b) => (styleForSystem(a.label).rank ?? 0) - (styleForSystem(b.label).rank ?? 0),
    );
    const rhi = inTier('rhi');

    return (
        <div>
            <h3 className="font-mono text-[10px] tracking-[0.22em] uppercase text-dark-900/55 mb-4">
                {t('work.modal.engineSystems')}
            </h3>
            <div className="rounded-2xl border border-dark-900/10 bg-cream-50/40 px-4 py-5 sm:px-5">
                {editor.map((system, i) => (
                    <SystemCard key={`editor-${i}`} system={system} />
                ))}

                {editor.length > 0 && runtime.length > 0 && <TierLink />}

                {runtime.length > 0 && (
                    <div className="relative rounded-xl border border-dashed border-dark-900/15 px-3 pt-6 pb-3">
                        <span className="absolute -top-2 left-4 bg-cream-50 px-1.5 font-mono text-[9px] tracking-[0.18em] uppercase text-dark-900/40">
                            efengine
                        </span>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {runtime.map((system, i) => (
                                <SystemCard key={`runtime-${i}`} system={system} />
                            ))}
                        </div>
                    </div>
                )}

                {rhi.length > 0 && (
                    <>
                        {(runtime.length > 0 || editor.length > 0) && (
                            <TierLink caption={t('work.modal.gpuBoundary')} />
                        )}
                        {rhi.map((system, i) => (
                            <SystemCard key={`rhi-${i}`} system={system} emphasis />
                        ))}
                        <div className="flex flex-col items-center gap-1 pt-1.5" aria-hidden="true">
                            <span className="h-4 w-px bg-teal-700/30" />
                            <span className="text-[9px] leading-none text-teal-700/50">▼</span>
                        </div>
                        <div className="flex justify-center pt-1.5">
                            <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-dark-900/20 px-3.5 py-1.5 font-mono text-[10px] tracking-[0.16em] uppercase text-dark-900/45">
                                <CircuitBoard className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
                                GPU · OpenGL 4.5
                            </span>
                        </div>
                    </>
                )}
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
                                            <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-line">
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

                                            {project.demoUrl && <LiveDemo url={project.demoUrl} />}
                                        </div>
                                    </div>

                                    {/* Right Column — Migration Brief, Metric Brief, Latest Commit, or Code Blocks */}
                                    {project.migration ? (
                                        <MigrationDossierView dossier={project.migration} />
                                    ) : project.category === 'professional' && project.metrics?.length ? (
                                        <MetricBrief project={project} />
                                    ) : project.repo ? (
                                        <LatestCommit repo={project.repo} variant="detail" />
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

                                    {/* Architecture diagram — spans both columns, its own sheet. */}
                                    {project.systems?.length ? (
                                        <div className="lg:col-span-2">
                                            <EngineSystems project={project} />
                                        </div>
                                    ) : null}
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
