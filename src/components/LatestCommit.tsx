import { useTranslation } from '@/i18n';
import { useLatestCommit } from '@/hooks/useLatestCommit';
import { formatRelativeTime } from '@/utils/relativeTime';

interface LatestCommitProps {
  /** GitHub repo as "owner/name". */
  repo: string;
  /** `badge` = compact inline row (flagship card); `detail` = bordered block (modal). */
  variant: 'badge' | 'detail';
}

const PulseDot = () => (
  <span className="relative flex h-2 w-2 shrink-0">
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-700/60" />
    <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-700" />
  </span>
);

/**
 * Renders a repo's latest commit. Returns null while loading with no cached
 * data and on error with no cached data, so it never breaks the layout.
 */
const LatestCommit = ({ repo, variant }: LatestCommitProps) => {
  const { t, locale } = useTranslation();
  const { data: commit } = useLatestCommit(repo);

  if (!commit) return null;

  const relative = formatRelativeTime(commit.date, locale);

  if (variant === 'badge') {
    return (
      <a
        href={commit.htmlUrl}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="mt-5 inline-flex items-center gap-2.5 max-w-full group/commit"
      >
        <PulseDot />
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-teal-700 shrink-0">
          {t('work.featured.latestCommit.label')}
        </span>
        <span className="truncate text-sm text-dark-900/60 font-light transition-colors group-hover/commit:text-dark-900">
          {commit.message}
        </span>
        <span className="font-mono text-[10px] text-dark-900/40 tracking-widest shrink-0">
          {relative}
        </span>
      </a>
    );
  }

  return (
    <div>
      <h3 className="font-mono text-[10px] tracking-[0.22em] uppercase text-dark-900/55 mb-4">
        {t('work.featured.latestCommit.label')}
      </h3>
      <a
        href={commit.htmlUrl}
        target="_blank"
        rel="noreferrer"
        className="block rounded-2xl border border-dark-900/10 bg-cream-50/40 px-5 py-4 transition-colors hover:border-teal-700/30 group/commit"
      >
        <div className="flex items-center gap-3 mb-2">
          <PulseDot />
          <span className="font-mono text-[10px] text-teal-700 tracking-widest">{commit.shortSha}</span>
          <span className="h-px flex-1 bg-dark-900/10" />
          <span className="font-mono text-[10px] text-dark-900/40 tracking-widest">{relative}</span>
        </div>
        <p className="font-display text-base md:text-lg tracking-tight text-dark-900 leading-snug transition-colors group-hover/commit:text-teal-700">
          {commit.message}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-xs text-dark-900/55">
            {t('work.featured.latestCommit.by', { author: commit.authorName })}
          </span>
          <span className="font-mono text-[10px] tracking-widest uppercase text-teal-700/80">
            {t('work.featured.latestCommit.viewOnGithub')} →
          </span>
        </div>
      </a>
    </div>
  );
};

export default LatestCommit;
