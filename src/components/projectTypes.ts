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
    phases?: ProjectPhase[];
    /** GitHub repo as "owner/name"; enables the latest-commit badge/detail. */
    repo?: string;
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
