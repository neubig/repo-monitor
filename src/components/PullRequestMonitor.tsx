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
  const [approvedPRsNeedsQA, setApprovedPRsNeedsQA] = useState<PullRequest[]>([]);
  const [approvedPRsFailingCI, setApprovedPRsFailingCI] = useState<PullRequest[]>([]);
  const [approvedPRsReadyToMerge, setApprovedPRsReadyToMerge] = useState<PullRequest[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const service = new PullRequestService();

        // Fetch both types of pull requests
        const [
          noReviewers,
          reviewed,
          needsQaPRs,
          failingCIPRs,
          readyToMergePRs
        ] = await Promise.all([
          service.getPullRequestsWithNoReviewers(repository, githubToken),
          service.getReviewedNonDraftPullRequests(repository, githubToken),
          service.getApprovedPRsWithLabel('needs-qa', repository, githubToken),
          service.getApprovedPRsWithCIFailing(repository, githubToken),
          service.getApprovedPRsReadyToMerge(repository, githubToken)
        ]);

        setPullRequestsWithNoReviewers(noReviewers);
        setReviewedPullRequests(reviewed);
        setApprovedPRsNeedsQA(needsQaPRs);
        setApprovedPRsFailingCI(failingCIPRs);
        setApprovedPRsReadyToMerge(readyToMergePRs);
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

      {/* Approved PR Categories */}
      <div className="monitor-section">
        <h3>Needs QA</h3>
        {approvedPRsNeedsQA.length === 0 ? (
          <p>No pull requests needing QA</p>
        ) : (
          <ul className="pr-list">
            {approvedPRsNeedsQA.map(pr => (
              <li key={pr.id} className="pr-item">
                <a href={pr.url} target="_blank" rel="noopener noreferrer">
                  #{pr.number}: {pr.title}
                </a>
                <span className="pr-label needs-qa">needs-qa</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="monitor-section">
        <h3>Needs CI Resolution</h3>
        {approvedPRsFailingCI.length === 0 ? (
          <p>No pull requests with CI failures</p>
        ) : (
          <ul className="pr-list">
            {approvedPRsFailingCI.map(pr => (
              <li key={pr.id} className="pr-item">
                <a href={pr.url} target="_blank" rel="noopener noreferrer">
                  #{pr.number}: {pr.title}
                </a>
                <span className="ci-status failing">CI: {pr.ciStatus}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="monitor-section">
        <h3>Needs Merging</h3>
        {approvedPRsReadyToMerge.length === 0 ? (
          <p>No pull requests ready to merge</p>
        ) : (
          <ul className="pr-list">
            {approvedPRsReadyToMerge.map(pr => (
              <li key={pr.id} className="pr-item">
                <a href={pr.url} target="_blank" rel="noopener noreferrer">
                  #{pr.number}: {pr.title}
                </a>
                <span className="ci-status passing">CI: {pr.ciStatus}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default PullRequestMonitor;
