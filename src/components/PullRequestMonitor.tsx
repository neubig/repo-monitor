import { useState, useEffect } from 'react';
import PullRequestService from '../services/PullRequestService';
import type { PullRequest, Repository } from '../services/PullRequestService';

interface PullRequestMonitorProps {
  repository: Repository;
  githubToken?: string;
}

export function PullRequestMonitor({ repository, githubToken }: PullRequestMonitorProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pullRequestsWithNoReviewers, setPullRequestsWithNoReviewers] = useState<PullRequest[]>([]);
  const [reviewedPullRequests, setReviewedPullRequests] = useState<PullRequest[]>([]);

  const service = new PullRequestService();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both types of pull requests
        const [noReviewers, reviewed] = await Promise.all([
          service.getPullRequestsWithNoReviewers(repository, githubToken),
          service.getReviewedNonDraftPullRequests(repository, githubToken),
        ]);

        setPullRequestsWithNoReviewers(noReviewers);
        setReviewedPullRequests(reviewed);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [repository, githubToken]);

  if (loading) {
    return <div>Loading pull request data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="pull-request-monitor">
      <h2>
        Pull Request Monitor for {repository.owner}/{repository.name}
      </h2>

      <div className="monitor-section">
        <h3>Open PRs with No Reviewers</h3>
        {pullRequestsWithNoReviewers.length === 0 ? (
          <p>No pull requests found in this category.</p>
        ) : (
          <ul className="pr-list">
            {pullRequestsWithNoReviewers.map(pr => (
              <li key={pr.id} className="pr-item">
                <a href={pr.url} target="_blank" rel="noopener noreferrer">
                  #{pr.number}: {pr.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="monitor-section">
        <h3>Reviewed Non-Draft PRs</h3>
        {reviewedPullRequests.length === 0 ? (
          <p>No pull requests found in this category.</p>
        ) : (
          <ul className="pr-list">
            {reviewedPullRequests.map(pr => (
              <li key={pr.id} className="pr-item">
                <a href={pr.url} target="_blank" rel="noopener noreferrer">
                  #{pr.number}: {pr.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default PullRequestMonitor;
