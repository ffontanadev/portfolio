import type { CSSProperties } from 'react';

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
    /** Architecture, not copy - assigned where the card data is assembled. */
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
    /** Architecture breakdown - one row per engine subsystem. */
    systems?: ProjectSystem[];
    migration?: MigrationDossier;
    /** GitHub repo as "owner/name"; enables the latest-commit badge/detail. */
    repo?: string;
    /** Public URL of a playable/browsable build - a deploy or a GitHub Page. */
    demoUrl?: string;
    /** Public paths to ambient showcase clips, e.g. '/videos/efengine/clip.mp4'. */
    showcaseVideos?: string[];
    /**
     * Brand hex that tints the card's hero, e.g. '#001391'. Deliberately
     * separate from `color`: that one is a Tailwind class consumed by
     * the archive rows, while this is a raw hex fed to inline
     * styles - Tailwind v4 cannot generate utilities from dynamic values.
     */
    brandColor?: string;
    /**
     * `background-position` of the brand halo, default '50% 35%'. Exists so two
     * cards sharing one brand hex (the pair of BBVA engagements) still read as
     * distinct compositions.
     */
    brandHaloAt?: string;
}

// Accent color is derived from category - coral for professional work, teal for personal.
// The human-readable category label lives in the i18n locale files (`work.categories.*`),
// keyed by category; use `categoryLabelKey` to resolve it via `t()`.
export const categoryLabelKey = (category?: ProjectCategory): string =>
    `work.categories.${(category ?? 'personal') === 'personal' ? 'personal' : 'professional'}`;

// Brand tint layers, now scoped to VideoShowcaseHero alone: footage needs a
// translucent tint, not an opaque field. The static banner is a solid block -
// see `blockTokens` below. Alphas are 8-digit hex suffixes so one `brandColor`
// string drives every layer; the conversion is alpha = round(percent * 255):
//
//    5% 0D | 10% 1A | 15% 26 | 20% 33 | 25% 40 | 30% 4D
//   35% 59 | 40% 66 | 45% 73 | 50% 80 | 60% 99 | 70% B3
//
// The ceiling is contrast, not taste: the video overlay keeps dark-900 type over
// a cream scrim, and its faintest line (the tech stack, at dark-900/50) is what
// gives out first. Past ~45% on the halo that line stops being comfortably
// legible over the middle of the frame.
const BRAND_ALPHA = {
    /** Radial halo behind the identity block. */
    halo: '66',
    /** Flat veil that gives the whole frame its temperature. */
    veil: '24',
} as const;

export const DEFAULT_BRAND_HALO_AT = '50% 35%';

/**
 * The brand-tinted layer painted over the video hero: a radial halo behind the
 * identity block, plus a flat veil across the frame. Returns undefined for
 * projects with no brand, which then render over the bare cream scrim.
 */
export const heroBrandBackground = (brandColor?: string, haloAt?: string): string | undefined =>
    brandColor
        ? `radial-gradient(ellipse 65% 85% at ${haloAt ?? DEFAULT_BRAND_HALO_AT}, ${brandColor}${BRAND_ALPHA.halo}, transparent 72%), linear-gradient(${brandColor}${BRAND_ALPHA.veil}, ${brandColor}${BRAND_ALPHA.veil})`
        : undefined;

// ---------------------------------------------------------------------------
// The brand block
//
// The static banner stopped tinting a cream field and became the brand hex
// itself, at full strength, with the type knocked out of it. Two rules carry
// it, and both are measured here rather than chosen by eye.
// ---------------------------------------------------------------------------

/** The only two type colours the block ever uses: cream-50 and dark-900. */
const BLOCK_CREAM = '#FFF8F3';
const BLOCK_INK = '#1A1A1A';

/** Field for a project with no `brandColor` - cream-100, as the hero was before. */
const BLOCK_FALLBACK_FIELD = '#FFE8D6';

/** One 0-255 channel of a `#rrggbb` string, normalised. */
const channel = (hex: string, at: number): number => parseInt(hex.slice(at, at + 2), 16) / 255;

/** WCAG 2.x relative luminance. Expects `#rrggbb`; shorthand is not supported. */
const relativeLuminance = (hex: string): number => {
    const linear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return (
        0.2126 * linear(channel(hex, 1)) +
        0.7152 * linear(channel(hex, 3)) +
        0.0722 * linear(channel(hex, 5))
    );
};

/** WCAG 2.x contrast ratio between two opaque `#rrggbb` colours, 1 to 21. */
export const contrastRatio = (a: string, b: string): number => {
    const [high, low] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
    return (high + 0.05) / (low + 0.05);
};

export type BlockPolarity = 'cream' | 'ink';

/**
 * Which type colour survives on `field`. Whichever reaches the higher ratio
 * wins - there is no per-brand table to keep in sync, so a new `brandColor`
 * resolves on its own.
 *
 * The brands on file land at cream 13.3 (#001391), 9.1 (#1d418f), 5.9 (#00703C)
 * and ink 8.6 (#f5a623), 4.7 (#F82790). All clear the 4.5 AA floor, which is
 * what lets `blockTokens` refuse to soften type at all.
 */
export const blockPolarity = (field: string): BlockPolarity =>
    contrastRatio(BLOCK_CREAM, field) >= contrastRatio(BLOCK_INK, field) ? 'cream' : 'ink';

/**
 * The block's token set, applied as inline custom properties on the banner.
 *
 * `--block-type` is used at full strength everywhere type appears: at 74%
 * opacity the 9px tech-stack line measures 3.98 on #00703C and 3.53 on #F82790,
 * both under AA. Hierarchy comes from size and weight instead. The two faded
 * tokens are for the index digit and the section mark only - both are
 * aria-hidden, so the contrast floor does not reach them.
 */
export const blockTokens = (brandColor?: string): CSSProperties => {
    const field = brandColor ?? BLOCK_FALLBACK_FIELD;
    const cream = blockPolarity(field) === 'cream';
    return {
        '--block-brand': field,
        '--block-type': cream ? BLOCK_CREAM : BLOCK_INK,
        '--block-type-quiet': cream ? 'rgba(255, 248, 243, 0.5)' : 'rgba(26, 26, 26, 0.5)',
        '--block-type-faint': cream ? 'rgba(255, 248, 243, 0.1)' : 'rgba(26, 26, 26, 0.14)',
        '--block-lift': cream ? 'rgba(255, 248, 243, 0.15)' : 'rgba(26, 26, 26, 0.08)',
    } as CSSProperties;
};

/** Radial that lifts the top of the field, in whichever direction reads there. */
export const BLOCK_LIFT_BG =
    'radial-gradient(ellipse 70% 90% at 50% 24%, var(--block-lift), transparent 70%)';

export const accentForCategory = (category?: ProjectCategory) => {
    const isPersonal = (category ?? 'personal') === 'personal';
    return {
        isPersonal,
        text: isPersonal ? 'text-teal-700' : 'text-coral-700',
        hairlineSoft: isPersonal ? 'bg-teal-700/40' : 'bg-coral-500/40',
        hoverText: isPersonal ? 'group-hover:text-teal-700' : 'group-hover:text-coral-700',
    };
};
