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
