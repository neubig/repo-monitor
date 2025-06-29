/**
 * PullRequestService.ts
 * Service to monitor pull requests on GitHub repositories
 */

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  url: string;
  isDraft: boolean;
  hasReviewers: boolean;
  hasBeenReviewed: boolean;
}

export interface Repository {
  owner: string;
  name: string;
}

interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  html_url: string;
  draft: boolean;
  requested_reviewers: unknown[];
  reviews?: unknown[];
}

export class PullRequestService {
  private baseUrl = 'https://api.github.com';

  /**
   * Fetches pull requests from a GitHub repository
   * @param repo Repository information (owner and name)
   * @param token Optional GitHub token for authentication
   * @returns Promise with array of pull requests
   */
  async fetchPullRequests(repo: Repository, token?: string): Promise<PullRequest[]> {
    const url = `${this.baseUrl}/repos/${repo.owner}/${repo.name}/pulls?state=open`;
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    try {
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Transform the data into our PullRequest interface
      return data.map((pr: GitHubPullRequest) => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        url: pr.html_url,
        isDraft: pr.draft,
        hasReviewers: pr.requested_reviewers?.length > 0,
        hasBeenReviewed: pr.review_comments > 0 || pr.reviews_count > 0,
      }));
    } catch (error) {
      console.error('Error fetching pull requests:', error);
      throw error;
    }
  }

  /**
   * Gets pull requests that are open, not in draft status, but have no assigned reviewers
   * @param repo Repository information
   * @param token Optional GitHub token
   * @returns Promise with filtered pull requests
   */
  async getPullRequestsWithNoReviewers(repo: Repository, token?: string): Promise<PullRequest[]> {
    const pullRequests = await this.fetchPullRequests(repo, token);
    return pullRequests.filter(pr => !pr.isDraft && !pr.hasReviewers);
  }

  /**
   * Gets pull requests that have been reviewed but are not in draft status
   * @param repo Repository information
   * @param token Optional GitHub token
   * @returns Promise with filtered pull requests
   */
  async getReviewedNonDraftPullRequests(repo: Repository, token?: string): Promise<PullRequest[]> {
    const pullRequests = await this.fetchPullRequests(repo, token);
    return pullRequests.filter(pr => !pr.isDraft && pr.hasBeenReviewed);
  }
}

export default PullRequestService;
