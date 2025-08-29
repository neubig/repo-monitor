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

// GitHub API response types
interface GitHubReviewer {
  login: string;
  id: number;
  type: string;
}

interface GitHubPR {
  id: number;
  number: number;
  title: string;
  html_url: string;
  draft: boolean;
  requested_reviewers: GitHubReviewer[];
  review_comments: number;
}

export class PullRequestService {
  async getApprovedPRsWithLabel(label: string, repository: Repository, token?: string): Promise<PullRequest[]> {
    const prs = await this.getPullRequests(repository, token);
    return prs.filter(pr =>
      pr.labels.some(l => l.name === label) &&
      pr.reviews.some(r => r.state === 'APPROVED')
    );
  }

  async getApprovedPRsWithCIFailing(repository: Repository, token?: string): Promise<PullRequest[]> {
    const prs = await this.getPullRequests(repository, token);
    return prs.filter(pr =>
      pr.reviews.some(r => r.state === 'APPROVED') &&
      pr.ciStatus === 'failure'
    );
  }

  async getApprovedPRsReadyToMerge(repository: Repository, token?: string): Promise<PullRequest[]> {
    const prs = await this.getPullRequests(repository, token);
    return prs.filter(pr =>
      pr.reviews.some(r => r.state === 'APPROVED') &&
      pr.ciStatus === 'success' &&
      !pr.labels.some(l => l.name === 'needs-qa')
    );
  }
  async getApprovedPRsWithLabel(label: string, repository: Repository, token?: string): Promise&lt;PullRequest[]&gt; {
    // Implementation logic here
  }

  async getApprovedPRsWithCIFailing(repository: Repository, token?: string): Promise&lt;PullRequest[]&gt; {
    // Implementation logic here
  }

  async getApprovedPRsReadyToMerge(repository: Repository, token?: string): Promise&lt;PullRequest[]&gt; {
    // Implementation logic here
  }
  async getApprovedPRsWithLabel(label: string, repository: Repository, token?: string): Promise<PullRequest[]> {
    const prs = await this.getPullRequests(repository, token);
    return prs.filter(pr =>
      pr.labels.some(l => l.name === label) &&
      pr.reviews.some(r => r.state === 'APPROVED')
    );
  }

  async getApprovedPRsWithCIFailing(repository: Repository, token?: string): Promise<PullRequest[]> {
    const prs = await this.getPullRequests(repository, token);
    return prs.filter(pr =>
      pr.reviews.some(r => r.state === 'APPROVED') &&
      pr.ciStatus === 'failure'
    );
  }

  async getApprovedPRsReadyToMerge(repository: Repository, token?: string): Promise<PullRequest[]> {
    const prs = await this.getPullRequests(repository, token);
    return prs.filter(pr =>
      pr.reviews.some(r => r.state === 'APPROVED') &&
      pr.ciStatus === 'success' &&
      !pr.labels.some(l => l.name === 'needs-qa')
    );
  }

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

        // If we have a token, we can fetch review data for each PR
        if (token) {
          try {
            const reviewsUrl = `${this.baseUrl}/repos/${repo.owner}/${repo.name}/pulls/${pr.number}/reviews`;
            const reviewsResponse = await fetch(reviewsUrl, { headers });

            if (reviewsResponse.ok) {
              const reviewsData = await reviewsResponse.json();
              hasBeenReviewed = hasBeenReviewed || reviewsData.length > 0;
            }
          } catch (reviewError) {
            console.error(`Error fetching reviews for PR #${pr.number}:`, reviewError);
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
}

export default PullRequestService;
