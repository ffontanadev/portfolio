export type ProjectLogo = 'banco-provincia' | 'bbva';

export interface CodeBlock {
    language: string;
    code: string;
    label?: string;
}

export interface ProjectMetric {
    label: string;
    value: string;
    accent?: boolean;
}

export interface ProjectPhase {
    label: string;
    title: string;
    desc: string;
    current?: boolean;
}

/**
 * Dependency tier a module sits in, top to bottom: the editor drives the
 * runtime, the runtime goes through the RHI, and only the RHI talks to the GPU.
 */
export type ProjectSystemTier = 'editor' | 'runtime' | 'rhi';

export interface ProjectSystem {
    /** Module name as it appears in the repo, e.g. "efecom · RHI". */
    label: string;
    role: string;
    /** Architecture, not copy — assigned where the card data is assembled. */
    tier?: ProjectSystemTier;
}

export interface MetricStat {
    value: string;
    label: string;
}

export interface MigrationBeforeAfter {
    heading: string;
    items: string[];
}

export interface MigrationModule {
    label: string;
    role: string;
    scale: string;
}

export interface MigrationDossier {
    scope: MetricStat[];
    before: MigrationBeforeAfter;
    after: MigrationBeforeAfter;
    modulesHeading: string;
    modules: MigrationModule[];
    phasesHeading: string;
    phases: ProjectPhase[];
}

export type ProjectLeadMetric =
    | { kind: 'migration'; from: string; to: string }
    | { kind: 'scale'; superscript?: string; value: string }
    | { kind: 'wordmark'; value: string; sub?: string };

export type ProjectCategory = 'personal' | 'professional';

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
    category?: ProjectCategory;
    company?: string;
    logo?: ProjectLogo;
    leadMetric?: ProjectLeadMetric;
    metrics?: ProjectMetric[];
    featured?: boolean;
    /** Architecture breakdown — one row per engine subsystem. */
    systems?: ProjectSystem[];
    migration?: MigrationDossier;
    /** GitHub repo as "owner/name"; enables the latest-commit badge/detail. */
    repo?: string;
    /** Public URL of a playable/browsable build — a deploy or a GitHub Page. */
    demoUrl?: string;
    /** Public paths to ambient showcase clips, e.g. '/videos/efengine/clip.mp4'. */
    showcaseVideos?: string[];
}

// Accent color is derived from category — coral for professional work, teal for personal.
// The human-readable category label lives in the i18n locale files (`work.categories.*`),
// keyed by category; use `categoryLabelKey` to resolve it via `t()`.
export const categoryLabelKey = (category?: ProjectCategory): string =>
    `work.categories.${(category ?? 'personal') === 'personal' ? 'personal' : 'professional'}`;

export const accentForCategory = (category?: ProjectCategory) => {
    const isPersonal = (category ?? 'personal') === 'personal';
    return {
        isPersonal,
        text: isPersonal ? 'text-teal-700' : 'text-coral-500',
        hairlineSoft: isPersonal ? 'bg-teal-700/40' : 'bg-coral-500/40',
        hoverText: isPersonal ? 'group-hover:text-teal-700' : 'group-hover:text-coral-500',
        washIdle: isPersonal ? 'bg-teal-700/0' : 'bg-coral-500/0',
        washHover: isPersonal ? 'group-hover:bg-teal-700/[0.06]' : 'group-hover:bg-coral-500/[0.06]',
    };
};
