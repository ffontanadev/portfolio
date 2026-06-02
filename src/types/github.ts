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
