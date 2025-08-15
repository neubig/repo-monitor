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
  isApproved: boolean;
  labels: string[];
  ciStatus: 'pending' | 'success' | 'failure' | 'error' | 'unknown';
}

export interface Repository {
  owner: string;
  name: string;
}

// GitHub API response types
interface GitHubReviewer {
  login: string;
  id: number;
  type: string;
}

interface GitHubLabel {
  name: string;
  color: string;
}

interface GitHubReview {
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED';
}

interface GitHubCommitStatus {
  state: 'pending' | 'success' | 'failure' | 'error';
  statuses: Array<{
    state: 'pending' | 'success' | 'failure' | 'error';
    context: string;
  }>;
}

interface GitHubPR {
  id: number;
  number: number;
  title: string;
  html_url: string;
  draft: boolean;
  requested_reviewers: GitHubReviewer[];
  review_comments: number;
  labels: GitHubLabel[];
  head: {
    sha: string;
  };
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
      const pullRequests: PullRequest[] = [];

      // Process each pull request
      for (const pr of data as GitHubPR[]) {
        // For each PR, check if it has reviews
        let hasBeenReviewed = pr.review_comments > 0;
        let isApproved = false;
        let ciStatus: 'pending' | 'success' | 'failure' | 'error' | 'unknown' = 'unknown';

        // If we have a token, we can fetch additional data for each PR
        if (token) {
          try {
            // Fetch review data
            const reviewsUrl = `${this.baseUrl}/repos/${repo.owner}/${repo.name}/pulls/${pr.number}/reviews`;
            const reviewsResponse = await fetch(reviewsUrl, { headers });

            if (reviewsResponse.ok) {
              const reviewsData = (await reviewsResponse.json()) as GitHubReview[];
              hasBeenReviewed = hasBeenReviewed || reviewsData.length > 0;

              // Check if PR is approved (has at least one APPROVED review)
              isApproved = reviewsData.some(review => review.state === 'APPROVED');
            }

            // Fetch CI status
            const statusUrl = `${this.baseUrl}/repos/${repo.owner}/${repo.name}/commits/${pr.head.sha}/status`;
            const statusResponse = await fetch(statusUrl, { headers });

            if (statusResponse.ok) {
              const statusData = (await statusResponse.json()) as GitHubCommitStatus;
              ciStatus = statusData.state;
            }
          } catch (error) {
            console.error(`Error fetching additional data for PR #${pr.number}:`, error);
          }
        }

        pullRequests.push({
          id: pr.id,
          number: pr.number,
          title: pr.title,
          url: pr.html_url,
          isDraft: pr.draft,
          hasReviewers: pr.requested_reviewers?.length > 0,
          hasBeenReviewed,
          isApproved,
          labels: pr.labels?.map(label => label.name) || [],
          ciStatus,
        });
      }

      return pullRequests;
    } catch (error) {
      console.error('Error fetching pull requests:', error);
      throw error;
    }
  }

  /**
   * Gets pull requests that are open, not in draft status, have no assigned reviewers, and have not been reviewed
   * @param repo Repository information
   * @param token Optional GitHub token
   * @returns Promise with filtered pull requests
   */
  async getPullRequestsWithNoReviewers(repo: Repository, token?: string): Promise<PullRequest[]> {
    const pullRequests = await this.fetchPullRequests(repo, token);
    return pullRequests.filter(pr => !pr.isDraft && !pr.hasReviewers && !pr.hasBeenReviewed);
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

  /**
   * Gets approved PRs that have the "needs-qa" label
   * @param repo Repository information
   * @param token Optional GitHub token
   * @returns Promise with filtered pull requests
   */
  async getApprovedPRsNeedingQA(repo: Repository, token?: string): Promise<PullRequest[]> {
    const pullRequests = await this.fetchPullRequests(repo, token);
    return pullRequests.filter(
      pr => !pr.isDraft && pr.isApproved && pr.labels.includes('needs-qa')
    );
  }

  /**
   * Gets approved PRs that have failing CI actions
   * @param repo Repository information
   * @param token Optional GitHub token
   * @returns Promise with filtered pull requests
   */
  async getApprovedPRsNeedingCIResolution(
    repo: Repository,
    token?: string
  ): Promise<PullRequest[]> {
    const pullRequests = await this.fetchPullRequests(repo, token);
    return pullRequests.filter(
      pr => !pr.isDraft && pr.isApproved && (pr.ciStatus === 'failure' || pr.ciStatus === 'error')
    );
  }

  /**
   * Gets approved PRs that are ready for merging (all CI passing, no needs-qa label)
   * @param repo Repository information
   * @param token Optional GitHub token
   * @returns Promise with filtered pull requests
   */
  async getApprovedPRsNeedingMerging(repo: Repository, token?: string): Promise<PullRequest[]> {
    const pullRequests = await this.fetchPullRequests(repo, token);
    return pullRequests.filter(
      pr =>
        !pr.isDraft && pr.isApproved && pr.ciStatus === 'success' && !pr.labels.includes('needs-qa')
    );
  }
}

export default PullRequestService;
