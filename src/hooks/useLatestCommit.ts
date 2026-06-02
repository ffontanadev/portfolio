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
