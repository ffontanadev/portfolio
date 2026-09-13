import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ProjectPreviewModal from './ProjectPreviewModal';
import type { Project } from './projectTypes';
import { archiveProjects, type ArchiveEntry } from './archiveProjects';
import { useTranslation } from '@/i18n';

/**
 * Section 03 is an index, not a second portfolio.
 *
 * It used to be the same composition as section 02 - a grid of image cards -
 * which made the older work read as more of the featured work rather than as
 * the archive behind it. The hierarchy now comes from form: a dated, ordered
 * list, with the thumbnail demoted to a preview that only appears on pointer
 * or keyboard focus, and only on screens wide enough to have room for it.
 */

/** Query param that deep-links one entry's preview modal, e.g. `?archive=truqui`. */
const ARCHIVE_PARAM = 'archive';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Width at which the preview panel earns its place. Matches Tailwind's `lg`. */
const PANEL_QUERY = '(min-width: 1024px)';

/**
 * One row: structural data plus the display text merged in from the active
 * locale. Typed as the exact set of copy fields `Project` needs, so a row can
 * be handed straight to the preview modal without a cast.
 */
type ArchiveRowData = ArchiveEntry & Pick<Project, 'title' | 'desc' | 'role' | 'description'>;

/**
 * Whether the viewport currently matches `query`.
 *
 * The preview panel is mounted through this rather than hidden with
 * `lg:block`, because `display: none` is not a promise that the browser skips
 * the download - on a phone the four thumbnails would still be fetched for a
 * panel that can never be seen. Reading `matchMedia` is not a layout read, so
 * it costs no reflow. There is no SSR pass in this app, so the initial value
 * can be read straight from `window`.
 */
function useMediaQuery(query: string): boolean {
    const mql = useMemo(() => window.matchMedia(query), [query]);
    const subscribe = useCallback(
        (onChange: () => void) => {
            mql.addEventListener('change', onChange);
            return () => mql.removeEventListener('change', onChange);
        },
        [mql],
    );
    // useSyncExternalStore rather than state plus an effect: matchMedia is an
    // external store, and reading it this way means there is no first render
    // at the wrong breakpoint for an effect to correct.
    return useSyncExternalStore(subscribe, () => mql.matches, () => false);
}

/** Year as a number for sorting. Falls back to 0 so a malformed date sinks. */
const yearOf = (date: string) => Number.parseInt(date, 10) || 0;

interface ArchiveRowProps {
    entry: ArchiveRowData;
    index: number;
    viewLabel: string;
    demoLabel: string;
    onOpen: (id: string) => void;
    onActivate: (id: string) => void;
}

const ArchiveRow = ({ entry, index, viewLabel, demoLabel, onOpen, onActivate }: ArchiveRowProps) => {
    const reduceMotion = useReducedMotion();

    const reveal = reduceMotion
        ? {}
        : {
              initial: { opacity: 0, y: 16 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, margin: '-80px' },
              transition: { delay: index * 0.06, duration: 0.6, ease: EASE },
          };

    return (
        <motion.li {...reveal} className="border-b border-dark-900/10 last:border-b-0">
            {/*
              The row carries two interactive elements, and they are siblings
              rather than nested: the title button stretches over the whole row
              with an absolutely positioned ::after, and the demo link sits
              above it on the z axis. That is what lets the entire row be
              clickable without an anchor inside a button, and without the
              stopPropagation patch the card version needed.
            */}
            <article
                onMouseEnter={() => onActivate(entry.id)}
                onFocusCapture={() => onActivate(entry.id)}
                className="group relative grid grid-cols-1 items-start gap-x-8 gap-y-3 rounded-xl px-4 py-8 transition-colors duration-300 hover:bg-dark-900/[0.02] has-[:focus-visible]:bg-dark-900/[0.03] md:-mx-4 md:grid-cols-[4.5rem_minmax(0,1fr)_auto]"
            >
                <time
                    dateTime={entry.date}
                    className="font-mono text-xs uppercase tracking-[0.18em] text-ink-quiet tabular-nums md:pt-2"
                >
                    {entry.date}
                </time>

                <div className="min-w-0">
                    <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-dark-900 transition-colors duration-300 text-pretty group-hover:text-coral-700 md:text-2xl">
                        <button
                            type="button"
                            onClick={() => onOpen(entry.id)}
                            className="touch-manipulation rounded-sm text-left outline-none after:absolute after:inset-0 after:content-[''] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-coral-700"
                        >
                            {entry.title}
                            {/* Gives the button an accessible name that says what it does,
                                without printing "View" beside every title. */}
                            <span className="sr-only">{`, ${viewLabel}`}</span>
                        </button>
                    </h3>

                    <p className="mt-2 max-w-prose text-sm font-light leading-relaxed text-ink-muted text-pretty md:text-base">
                        {entry.desc}
                    </p>

                    <ul className="mt-4 flex flex-wrap gap-2">
                        {entry.techStack.map((tech) => (
                            <li
                                key={tech}
                                translate="no"
                                className="rounded-full border border-dark-900/15 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-quiet"
                            >
                                {tech}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="md:justify-self-end md:pt-2">
                    {entry.demoUrl && (
                        <a
                            href={entry.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="relative z-10 inline-flex touch-manipulation items-center gap-1.5 rounded-sm font-mono text-[10px] uppercase tracking-widest text-ink-quiet outline-none transition-colors duration-300 hover:text-coral-700 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-coral-700"
                        >
                            {demoLabel}
                            <ArrowUpRight size={12} aria-hidden="true" />
                        </a>
                    )}
                </div>
            </article>
        </motion.li>
    );
};

const OlderWorks = () => {
    const { t, messages } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const showPanel = useMediaQuery(PANEL_QUERY);
    const reduceMotion = useReducedMotion();

    // Newest first. An archive read oldest-first buries the most recent thing
    // in it; authoring order in `archiveProjects` is deliberately ignored.
    const entries = useMemo<ArchiveRowData[]>(() => {
        const copy = messages.work.older.projects;
        return archiveProjects
            .map((entry) => ({
                ...entry,
                ...copy[entry.id as keyof typeof copy],
            }))
            .sort((a, b) => yearOf(b.date) - yearOf(a.date));
    }, [messages]);

    const [activeId, setActiveId] = useState<string | null>(null);
    const active = entries.find((entry) => entry.id === activeId) ?? entries[0];

    // The open entry lives in the URL, so a preview is shareable and the back
    // button closes it.
    const openId = searchParams.get(ARCHIVE_PARAM);
    const selected = useMemo(
        () => entries.find((entry) => entry.id === openId) ?? null,
        [entries, openId],
    );

    const openEntry = useCallback(
        (id: string) => {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    next.set(ARCHIVE_PARAM, id);
                    return next;
                },
                { preventScrollReset: true },
            );
        },
        [setSearchParams],
    );

    const closeEntry = useCallback(() => {
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                next.delete(ARCHIVE_PARAM);
                return next;
            },
            // Replace, so opening and closing a few previews does not fill the
            // history with entries that all render the same page.
            { replace: true, preventScrollReset: true },
        );
    }, [setSearchParams]);

    // `selected` drops to null the instant the URL changes, but the modal still
    // has an exit animation to play. Holding the last one keeps it rendering
    // real content on the way out instead of blanking mid-fade. Adjusted during
    // render rather than in an effect, so the modal never paints a frame
    // without it.
    const [lingering, setLingering] = useState<Project | null>(null);
    if (selected && selected !== lingering) setLingering(selected);

    if (entries.length === 0) return null;

    return (
        <>
            <section
                id="archive"
                aria-labelledby="archive-heading"
                className="relative scroll-mt-24 overflow-hidden bg-cream-50 px-6 py-24 md:px-20 md:py-32"
            >
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/4 top-1/2 h-[40rem] w-[40rem] -translate-y-1/2 rounded-full bg-purple-500/4 blur-3xl"
                />

                <div className="relative mx-auto max-w-[1440px]">
                    <header className="mb-14 max-w-2xl">
                        <div className="mb-6 flex items-center gap-4">
                            <span className="text-eyebrow text-ink-quiet">{t('work.older.eyebrow')}</span>
                            <span aria-hidden="true" className="h-px max-w-[120px] flex-1 bg-dark-900/15" />
                        </div>
                        <h2
                            id="archive-heading"
                            className="font-display text-[1.75rem] font-bold leading-tight tracking-[-0.02em] text-dark-900 text-balance md:text-[2.25rem] lg:text-[2.75rem]"
                        >
                            {t('work.older.headingBefore')}{' '}
                            <span className="font-display-italic text-coral-700" style={{ fontStyle: 'italic' }}>
                                {t('work.older.headingEmphasis')}
                            </span>
                        </h2>
                        <p className="mt-4 font-light leading-relaxed text-ink-muted text-pretty">
                            {t('work.older.description')}
                        </p>
                    </header>

                    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
                        <ol className="border-t border-dark-900/10">
                            {entries.map((entry, index) => (
                                <ArchiveRow
                                    key={entry.id}
                                    entry={entry}
                                    index={index}
                                    viewLabel={t('work.older.view')}
                                    demoLabel={t('work.liveDemo')}
                                    onOpen={openEntry}
                                    onActivate={setActiveId}
                                />
                            ))}
                        </ol>

                        {/*
                          Redundant by design: every word in here is already in
                          the list beside it, so the panel is hidden from
                          assistive tech and its images are decorative. All four
                          are stacked and cross-faded rather than swapped on one
                          <img>, which would flash a blank frame on every change.
                        */}
                        {showPanel && (
                            <aside aria-hidden="true" className="hidden lg:block">
                                <div className="sticky top-32">
                                    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-dark-900/10 bg-cream-100">
                                        {entries.map((entry) =>
                                            entry.image ? (
                                                <img
                                                    key={entry.id}
                                                    src={entry.image}
                                                    width={entry.imageWidth}
                                                    height={entry.imageHeight}
                                                    alt=""
                                                    loading="lazy"
                                                    decoding="async"
                                                    className={[
                                                        'absolute inset-0 h-full w-full object-cover',
                                                        reduceMotion ? '' : 'transition-opacity duration-500 ease-out',
                                                        entry.id === active.id ? 'opacity-100' : 'opacity-0',
                                                    ].join(' ')}
                                                />
                                            ) : null,
                                        )}
                                    </div>
                                    <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-quiet">
                                        {active.title}
                                    </p>
                                </div>
                            </aside>
                        )}
                    </div>
                </div>
            </section>

            <ProjectPreviewModal
                project={selected ?? lingering}
                isOpen={Boolean(selected)}
                onClose={closeEntry}
            />
        </>
    );
};

export default OlderWorks;
