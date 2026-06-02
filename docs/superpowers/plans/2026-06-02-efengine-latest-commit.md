# EFENGINE Latest Commit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show efengine's latest GitHub commit as a "live" badge on the flagship card and a detail block in the project modal of the portfolio's FeaturedWorks section.

**Architecture:** Pure client-side polling of the public GitHub commits API, cached in `localStorage` (5-min TTL) and surfaced through a layered type → service → hook → component stack, mirroring the existing blog feature. React Query (already configured globally) manages in-session state.

**Tech Stack:** React 19, TypeScript, Vite, @tanstack/react-query (already wired), date-fns (already a dependency), Tailwind CSS v4, custom i18n (`@/i18n`).

---

## Testing note (read first)

This repo has **no test runner** (no vitest/jest in `package.json`), and the spec explicitly leaves adding one out of scope. So this plan is **not** TDD. Each task's verification is:

- **Type check:** `npx tsc -b` → expected: no errors.
- **Lint:** `npm run lint` → expected: no errors.

Functional verification is a single **manual browser pass** in the final task. Run commands from the repo root `d:/@ffontana/portfolio-main`.

The work happens on the existing branch `feature/efengine-webhook`. Commit after each task.

---

## File structure

**New files:**
- `src/types/github.ts` — `LatestCommit` type (the shape the UI consumes).
- `src/services/github.ts` — fetch + localStorage cache; maps GitHub's response to `LatestCommit`.
- `src/hooks/useLatestCommit.ts` — React Query wrapper, mirrors `useBlog.ts`.
- `src/utils/relativeTime.ts` — maps the active i18n locale to a date-fns locale and formats relative time.
- `src/components/LatestCommit.tsx` — one component, `variant: 'badge' | 'detail'`.

**Modified files:**
- `src/components/projectTypes.ts` — add optional `repo?: string` to `Project`.
- `src/components/FeaturedWorks.tsx` — set `repo` on efengine; render the badge in the flagship band.
- `src/components/ProjectPreviewModal.tsx` — render the detail block beside the roadmap.
- `src/i18n/locales/{en,es,pt,zh}.json` — add `work.featured.latestCommit` keys.

---

## Task 1: Commit type + GitHub service

**Files:**
- Create: `src/types/github.ts`
- Create: `src/services/github.ts`

- [ ] **Step 1: Create the `LatestCommit` type**

Create `src/types/github.ts`:

```ts
/** Normalized shape of a repo's most recent commit, as consumed by the UI. */
export interface LatestCommit {
  /** Full commit SHA. */
  sha: string;
  /** First 7 chars of the SHA, for display. */
  shortSha: string;
  /** First line of the commit message. */
  message: string;
  /** Commit author's display name. */
  authorName: string;
  /** Author date in ISO 8601. */
  date: string;
  /** Link to the commit on GitHub. */
  htmlUrl: string;
}
```

- [ ] **Step 2: Create the service with localStorage caching**

Create `src/services/github.ts`:

```ts
import type { LatestCommit } from '@/types/github';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cacheKey = (repo: string) => `github:latest-commit:${repo}`;

interface CacheEntry {
  data: LatestCommit;
  fetchedAt: number;
}

/** Shape of the fields we read from GitHub's `GET /repos/{repo}/commits` response. */
interface GithubCommitResponse {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name: string; date: string } | null;
  };
}

function readCache(repo: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(cacheKey(repo));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (!parsed?.data || typeof parsed.fetchedAt !== 'number') return null;
    return parsed;
  } catch {
    return null; // Corrupt/unavailable storage — treat as a miss.
  }
}

function writeCache(repo: string, data: LatestCommit): void {
  try {
    localStorage.setItem(cacheKey(repo), JSON.stringify({ data, fetchedAt: Date.now() }));
  } catch {
    // Quota exceeded or storage disabled — caching is best-effort.
  }
}

/**
 * Returns the latest commit on `repo` (format: "owner/name") from GitHub's
 * public API. Serves a fresh localStorage entry without a network call; on a
 * failed fetch, falls back to stale cache if present, otherwise rethrows.
 */
export async function getLatestCommit(repo: string): Promise<LatestCommit> {
  const cached = readCache(repo);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);

    const json = (await res.json()) as GithubCommitResponse[];
    const head = json[0];
    if (!head) throw new Error('No commits returned');

    const data: LatestCommit = {
      sha: head.sha,
      shortSha: head.sha.slice(0, 7),
      message: head.commit.message.split('\n')[0],
      authorName: head.commit.author?.name ?? 'unknown',
      date: head.commit.author?.date ?? new Date().toISOString(),
      htmlUrl: head.html_url,
    };
    writeCache(repo, data);
    return data;
  } catch (err) {
    if (cached) return cached.data; // Stale-but-present beats nothing.
    throw err;
  }
}

export const githubService = { getLatestCommit };
```

- [ ] **Step 3: Type check**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/types/github.ts src/services/github.ts
git commit -m "feat: GitHub latest-commit service with localStorage cache

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: i18n keys for all four locales

**Files:**
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/es.json`
- Modify: `src/i18n/locales/pt.json`
- Modify: `src/i18n/locales/zh.json`

> The `Messages = typeof en` shape is enforced across locales by a `satisfies` check (`src/i18n/config.ts`), so **all four** files must gain the same keys or the build fails. In each file, find the `"flagshipTag": ...` line inside `work.featured` and insert the `latestCommit` block immediately after it (before `"projects"`). Mind the trailing comma after the `flagshipTag` line.

- [ ] **Step 1: en.json**

In `src/i18n/locales/en.json`, after the `"flagshipTag": "§ Flagship · C++ Engine",` line, insert:

```json
      "latestCommit": {
        "label": "Latest commit",
        "viewOnGithub": "View on GitHub",
        "by": "by {author}"
      },
```

- [ ] **Step 2: es.json**

In `src/i18n/locales/es.json`, after the `work.featured` `"flagshipTag"` line, insert:

```json
      "latestCommit": {
        "label": "Último commit",
        "viewOnGithub": "Ver en GitHub",
        "by": "por {author}"
      },
```

- [ ] **Step 3: pt.json**

In `src/i18n/locales/pt.json`, after the `work.featured` `"flagshipTag"` line, insert:

```json
      "latestCommit": {
        "label": "Último commit",
        "viewOnGithub": "Ver no GitHub",
        "by": "por {author}"
      },
```

- [ ] **Step 4: zh.json**

In `src/i18n/locales/zh.json`, after the `work.featured` `"flagshipTag"` line, insert:

```json
      "latestCommit": {
        "label": "最新提交",
        "viewOnGithub": "在 GitHub 上查看",
        "by": "作者 {author}"
      },
```

- [ ] **Step 5: Type check**

Run: `npx tsc -b`
Expected: no errors (the `satisfies Record<string, Messages>` check in `config.ts` passes → all four locales share the new shape).

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/i18n/locales/en.json src/i18n/locales/es.json src/i18n/locales/pt.json src/i18n/locales/zh.json
git commit -m "i18n: add work.featured.latestCommit keys (en/es/pt/zh)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Relative-time helper

**Files:**
- Create: `src/utils/relativeTime.ts`

- [ ] **Step 1: Create the helper**

Create `src/utils/relativeTime.ts`:

```ts
import { formatDistanceToNow } from 'date-fns';
import { enUS, es, ptBR, zhCN } from 'date-fns/locale';
import type { Locale } from '@/i18n/config';

/** i18n locale code → date-fns locale object. */
const LOCALE_MAP: Record<Locale, typeof enUS> = {
  en: enUS,
  es,
  pt: ptBR,
  zh: zhCN,
};

/**
 * Formats an ISO date as locale-aware relative time, e.g. "2 days ago"
 * / "hace 2 días". Falls back to English if the locale is unknown.
 */
export const formatRelativeTime = (iso: string, locale: Locale): string =>
  formatDistanceToNow(new Date(iso), {
    addSuffix: true,
    locale: LOCALE_MAP[locale] ?? enUS,
  });
```

- [ ] **Step 2: Type check**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/utils/relativeTime.ts
git commit -m "feat: locale-aware relative time helper

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: `useLatestCommit` hook

**Files:**
- Create: `src/hooks/useLatestCommit.ts`

- [ ] **Step 1: Create the hook**

Create `src/hooks/useLatestCommit.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import { githubService } from '@/services/github';

/**
 * Fetches the latest commit for `repo` ("owner/name"). Disabled until a repo is
 * provided. Relies on the global React Query config (5-min staleTime,
 * refetchOnWindowFocus: false) plus the service's localStorage cache.
 */
export function useLatestCommit(repo?: string) {
  return useQuery({
    queryKey: ['github', 'latest-commit', repo],
    queryFn: () => githubService.getLatestCommit(repo!),
    enabled: !!repo,
  });
}
```

- [ ] **Step 2: Type check**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors. (If the config flags the `repo!` non-null assertion, replace it with `repo as string` — the `enabled` guard ensures the query only runs with a defined repo.)

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useLatestCommit.ts
git commit -m "feat: useLatestCommit React Query hook

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: `LatestCommit` component (both variants)

**Files:**
- Create: `src/components/LatestCommit.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/LatestCommit.tsx`:

```tsx
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
```

- [ ] **Step 2: Type check**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/LatestCommit.tsx
git commit -m "feat: LatestCommit component (badge + detail variants)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Add `repo` to the Project type and wire the flagship badge

**Files:**
- Modify: `src/components/projectTypes.ts`
- Modify: `src/components/FeaturedWorks.tsx`

- [ ] **Step 1: Add `repo` to the `Project` interface**

In `src/components/projectTypes.ts`, inside the `Project` interface, add the field after `phases?: ProjectPhase[];` (the last field, line ~45):

```ts
    phases?: ProjectPhase[];
    /** GitHub repo as "owner/name"; enables the latest-commit badge/detail. */
    repo?: string;
```

> No change needed to `ProjectStructural` in FeaturedWorks: it is `Omit<Project, ...>` without omitting `repo`, so the field is inherited automatically.

- [ ] **Step 2: Set `repo` on efengine's structural data**

In `src/components/FeaturedWorks.tsx`, in the `projectData` array, the `efengine` entry currently ends with:

```ts
    category: 'personal',
    featured: true,
  },
```

Change it to:

```ts
    category: 'personal',
    featured: true,
    repo: 'elFonTii/efengine',
  },
```

- [ ] **Step 3: Import the component**

In `src/components/FeaturedWorks.tsx`, add the import next to the other component imports (after the `ProjectPreviewModal` import near the top):

```ts
import LatestCommit from './LatestCommit';
```

- [ ] **Step 4: Render the badge in the flagship band**

In `src/components/FeaturedWorks.tsx`, inside the flagship `<article>`, locate the tech-stack chips block that ends with:

```tsx
              <div className="mt-5 flex flex-wrap gap-2">
                {featuredProject.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="font-mono text-[10px] tracking-widest uppercase text-dark-900/55 border border-dark-900/15 rounded-full px-3 py-1"
                  >
                    {tech}
                  </span>
                ))}
              </div>
```

Immediately after that closing `</div>` (still inside the `<div className="mt-7 max-w-3xl">` wrapper), add:

```tsx
              {featuredProject.repo && (
                <LatestCommit repo={featuredProject.repo} variant="badge" />
              )}
```

- [ ] **Step 5: Type check**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/projectTypes.ts src/components/FeaturedWorks.tsx
git commit -m "feat: render latest-commit badge on efengine flagship card

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Wire the detail block into the modal

**Files:**
- Modify: `src/components/ProjectPreviewModal.tsx`

- [ ] **Step 1: Import the component**

In `src/components/ProjectPreviewModal.tsx`, add near the top imports:

```ts
import LatestCommit from './LatestCommit';
```

- [ ] **Step 2: Render the detail block beside the roadmap**

In `src/components/ProjectPreviewModal.tsx`, find the right-column ternary (around line 448-461). The phases branch currently reads:

```tsx
                                    ) : project.phases?.length ? (
                                        <DevelopmentRoadmap project={project} />
                                    ) : (
```

Replace that phases branch with:

```tsx
                                    ) : project.phases?.length ? (
                                        <div className="space-y-8">
                                            <DevelopmentRoadmap project={project} />
                                            {project.repo && (
                                                <LatestCommit repo={project.repo} variant="detail" />
                                            )}
                                        </div>
                                    ) : (
```

- [ ] **Step 3: Type check**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProjectPreviewModal.tsx
git commit -m "feat: render latest-commit detail in efengine modal

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Full build + manual verification

**Files:** none (verification only)

- [ ] **Step 1: Full production build**

Run: `npm run build`
Expected: `tsc -b` passes and `vite build` completes with no errors.

- [ ] **Step 2: Start the dev server**

Run: `npm run dev`
Expected: Vite serves on a local URL (e.g. `http://localhost:5173`).

- [ ] **Step 3: Verify the flagship badge (real data)**

In the browser, scroll to the "Selected Work" section. On the efengine flagship card, confirm:
- a pulsing teal dot + "Latest commit" label + the commit's first line + relative time appear under the tech-stack chips;
- clicking the badge opens the commit on GitHub in a new tab **and does not** open the project modal (the `stopPropagation` guard).

- [ ] **Step 4: Verify the modal detail block**

Click the efengine flagship card to open the modal. Confirm the right column shows the Development Roadmap **and** below it a bordered "Latest commit" block with the short SHA, the message, "by &lt;author&gt;", relative time, and a "View on GitHub" link.

- [ ] **Step 5: Verify caching**

Open DevTools → Network, filter for `api.github.com`. Reload the page within 5 minutes and confirm **no** new request to `api.github.com/repos/elFonTii/efengine/commits` is made (served from localStorage). Inspect Application → Local Storage for the `github:latest-commit:elFonTii/efengine` entry.

- [ ] **Step 6: Verify graceful failure**

In DevTools, clear the `github:latest-commit:elFonTii/efengine` localStorage entry, set Network to "Offline", and reload. Confirm the badge and modal block simply **do not render** — no error UI, no layout break. Restore Network when done.

- [ ] **Step 7: Verify localization**

Switch the language (flag switcher) to Español and Português; confirm the label reads "Último commit", the relative time is localized (e.g. "hace 2 días"), and the modal link reads "Ver en GitHub" / "Ver no GitHub".

- [ ] **Step 8: Final confirmation**

All checks pass → the feature is complete. No commit needed (verification-only task). If any check fails, fix the relevant task's code and re-commit before declaring done.

---

## Notes for the implementer

- **Path alias:** `@/` resolves to `src/` (used throughout, e.g. `@/i18n`, `@/components/projectTypes`).
- **Do not** stage or commit the untracked `src/content/` directory — it is unrelated to this feature.
- **No new dependencies** are introduced: `@tanstack/react-query` and `date-fns` are already in `package.json`.
- The `repo` field is generic — any future project can set `repo: 'owner/name'` to get the same badge/detail treatment for free.
