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
  const [approvedPRsNeedingQA, setApprovedPRsNeedingQA] = useState<PullRequest[]>([]);
  const [approvedPRsNeedingCI, setApprovedPRsNeedingCI] = useState<PullRequest[]>([]);
  const [approvedPRsNeedingMerging, setApprovedPRsNeedingMerging] = useState<PullRequest[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const service = new PullRequestService();

        // Fetch all types of pull requests
        const [noReviewers, reviewed, needingQA, needingCI, needingMerging] = await Promise.all([
          service.getPullRequestsWithNoReviewers(repository, githubToken),
          service.getReviewedNonDraftPullRequests(repository, githubToken),
          service.getApprovedPRsNeedingQA(repository, githubToken),
          service.getApprovedPRsNeedingCIResolution(repository, githubToken),
          service.getApprovedPRsNeedingMerging(repository, githubToken),
        ]);

        setPullRequestsWithNoReviewers(noReviewers);
        setReviewedPullRequests(reviewed);
        setApprovedPRsNeedingQA(needingQA);
        setApprovedPRsNeedingCI(needingCI);
        setApprovedPRsNeedingMerging(needingMerging);
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

      <div className="monitor-section">
        <h3>Approved PRs - Needs QA</h3>
        {approvedPRsNeedingQA.length === 0 ? (
          <p>No pull requests found in this category.</p>
        ) : (
          <ul className="pr-list">
            {approvedPRsNeedingQA.map(pr => (
              <li key={pr.id} className="pr-item">
                <a href={pr.url} target="_blank" rel="noopener noreferrer">
                  #{pr.number}: {pr.title}
                </a>
                <span className="pr-labels">
                  {pr.labels.includes('needs-qa') && (
                    <span className="label needs-qa">needs-qa</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="monitor-section">
        <h3>Approved PRs - Needs CI Resolution</h3>
        {approvedPRsNeedingCI.length === 0 ? (
          <p>No pull requests found in this category.</p>
        ) : (
          <ul className="pr-list">
            {approvedPRsNeedingCI.map(pr => (
              <li key={pr.id} className="pr-item">
                <a href={pr.url} target="_blank" rel="noopener noreferrer">
                  #{pr.number}: {pr.title}
                </a>
                <span className="pr-status">
                  <span className={`ci-status ${pr.ciStatus}`}>CI: {pr.ciStatus}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="monitor-section">
        <h3>Approved PRs - Needs Merging</h3>
        {approvedPRsNeedingMerging.length === 0 ? (
          <p>No pull requests found in this category.</p>
        ) : (
          <ul className="pr-list">
            {approvedPRsNeedingMerging.map(pr => (
              <li key={pr.id} className="pr-item">
                <a href={pr.url} target="_blank" rel="noopener noreferrer">
                  #{pr.number}: {pr.title}
                </a>
                <span className="pr-status">
                  <span className={`ci-status ${pr.ciStatus}`}>CI: {pr.ciStatus}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default PullRequestMonitor;
