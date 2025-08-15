import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PullRequestService } from './PullRequestService';
import type { Repository } from './PullRequestService';

// Mock the fetch function
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('PullRequestService', () => {
  let service: PullRequestService;
  let mockRepo: Repository;

  beforeEach(() => {
    service = new PullRequestService();
    mockRepo = { owner: 'testowner', name: 'testrepo' };

    // Reset the mock before each test
    vi.resetAllMocks();
  });

  it('should fetch pull requests from GitHub API', async () => {
    // Mock response data
    const mockPullRequests = [
      {
        id: 1,
        number: 101,
        title: 'Test PR 1',
        html_url: 'https://github.com/testowner/testrepo/pull/101',
        draft: false,
        requested_reviewers: [],
        review_comments: 0,
        labels: [],
        head: { sha: 'abc123' },
      },
      {
        id: 2,
        number: 102,
        title: 'Test PR 2',
        html_url: 'https://github.com/testowner/testrepo/pull/102',
        draft: true,
        requested_reviewers: [{ login: 'reviewer1' }],
        review_comments: 0,
        labels: [],
        head: { sha: 'def456' },
      },
    ];

    // Setup mock fetch response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPullRequests,
    });

    const result = await service.fetchPullRequests(mockRepo);

    // Verify fetch was called with correct URL
    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/testowner/testrepo/pulls?state=open',
      { headers: { Accept: 'application/vnd.github.v3+json' } }
    );

    // Verify the result is transformed correctly
    expect(result).toEqual([
      {
        id: 1,
        number: 101,
        title: 'Test PR 1',
        url: 'https://github.com/testowner/testrepo/pull/101',
        isDraft: false,
        hasReviewers: false,
        hasBeenReviewed: false,
        isApproved: false,
        labels: [],
        ciStatus: 'unknown',
      },
      {
        id: 2,
        number: 102,
        title: 'Test PR 2',
        url: 'https://github.com/testowner/testrepo/pull/102',
        isDraft: true,
        hasReviewers: true,
        hasBeenReviewed: false,
        isApproved: false,
        labels: [],
        ciStatus: 'unknown',
      },
    ]);
  });

  it('should handle API errors gracefully', async () => {
    // Setup mock fetch to return an error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    // Verify that the service throws an error
    await expect(service.fetchPullRequests(mockRepo)).rejects.toThrow(
      'GitHub API error: 404 Not Found'
    );
  });

  it('should filter pull requests with no reviewers', async () => {
    // Mock response data
    const mockPullRequests = [
      {
        id: 1,
        number: 101,
        title: 'PR with no reviewers',
        html_url: 'https://github.com/testowner/testrepo/pull/101',
        draft: false,
        requested_reviewers: [],
        review_comments: 0,
        labels: [],
        head: { sha: 'abc123' },
      },
      {
        id: 2,
        number: 102,
        title: 'PR with reviewers',
        html_url: 'https://github.com/testowner/testrepo/pull/102',
        draft: false,
        requested_reviewers: [{ login: 'reviewer1' }],
        review_comments: 0,
        labels: [],
        head: { sha: 'def456' },
      },
      {
        id: 3,
        number: 103,
        title: 'Draft PR with no reviewers',
        html_url: 'https://github.com/testowner/testrepo/pull/103',
        draft: true,
        requested_reviewers: [],
        review_comments: 0,
        labels: [],
        head: { sha: 'ghi789' },
      },
    ];

    // Setup mock fetch response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPullRequests,
    });

    const result = await service.getPullRequestsWithNoReviewers(mockRepo);

    // Verify only the non-draft PR with no reviewers is returned
    expect(result.length).toBe(1);
    expect(result[0].number).toBe(101);
    expect(result[0].title).toBe('PR with no reviewers');
  });

  it('should exclude reviewed PRs from no reviewers list', async () => {
    // Mock response data
    const mockPullRequests = [
      {
        id: 1,
        number: 101,
        title: 'Reviewed PR with no current reviewers',
        html_url: 'https://github.com/testowner/testrepo/pull/101',
        draft: false,
        requested_reviewers: [], // No current reviewers
        review_comments: 5, // But has been reviewed
        labels: [],
        head: { sha: 'abc123' },
      },
      {
        id: 2,
        number: 102,
        title: 'Non-reviewed PR with no reviewers',
        html_url: 'https://github.com/testowner/testrepo/pull/102',
        draft: false,
        requested_reviewers: [],
        review_comments: 0, // Not reviewed
        labels: [],
        head: { sha: 'def456' },
      },
      {
        id: 3,
        number: 103,
        title: 'Non-reviewed PR with reviewers',
        html_url: 'https://github.com/testowner/testrepo/pull/103',
        draft: false,
        requested_reviewers: [{ login: 'reviewer1' }],
        review_comments: 0,
        labels: [],
        head: { sha: 'ghi789' },
      },
    ];

    // Setup mock fetch response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPullRequests,
    });

    const result = await service.getPullRequestsWithNoReviewers(mockRepo);

    // Verify only the non-reviewed, non-draft PR with no reviewers is returned
    expect(result.length).toBe(1);
    expect(result[0].number).toBe(102);
    expect(result[0].title).toBe('Non-reviewed PR with no reviewers');
  });

  it('should filter reviewed non-draft pull requests', async () => {
    // Mock response data
    const mockPullRequests = [
      {
        id: 1,
        number: 101,
        title: 'Reviewed non-draft PR',
        html_url: 'https://github.com/testowner/testrepo/pull/101',
        draft: false,
        requested_reviewers: [],
        review_comments: 5,
        labels: [],
        head: { sha: 'abc123' },
      },
      {
        id: 2,
        number: 102,
        title: 'Non-reviewed non-draft PR',
        html_url: 'https://github.com/testowner/testrepo/pull/102',
        draft: false,
        requested_reviewers: [{ login: 'reviewer1' }],
        review_comments: 0,
        labels: [],
        head: { sha: 'def456' },
      },
      {
        id: 3,
        number: 103,
        title: 'Reviewed draft PR',
        html_url: 'https://github.com/testowner/testrepo/pull/103',
        draft: true,
        requested_reviewers: [],
        review_comments: 3,
        labels: [],
        head: { sha: 'ghi789' },
      },
    ];

    // Setup mock fetch response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPullRequests,
    });

    const result = await service.getReviewedNonDraftPullRequests(mockRepo);

    // Verify only the reviewed non-draft PR is returned
    expect(result.length).toBe(1);
    expect(result[0].number).toBe(101);
    expect(result[0].title).toBe('Reviewed non-draft PR');
  });

  it('should use authentication token when provided', async () => {
    // Setup mock fetch response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const token = 'test-token';
    await service.fetchPullRequests(mockRepo, token);

    // Verify fetch was called with the authorization header
    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/testowner/testrepo/pulls?state=open',
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: 'token test-token',
        },
      }
    );
  });

  it('should filter approved PRs needing QA', async () => {
    // Mock response data
    const mockPullRequests = [
      {
        id: 1,
        number: 101,
        title: 'Approved PR needing QA',
        html_url: 'https://github.com/testowner/testrepo/pull/101',
        draft: false,
        requested_reviewers: [],
        review_comments: 0,
        labels: [{ name: 'needs-qa', color: 'yellow' }],
        head: { sha: 'abc123' },
      },
      {
        id: 2,
        number: 102,
        title: 'Approved PR not needing QA',
        html_url: 'https://github.com/testowner/testrepo/pull/102',
        draft: false,
        requested_reviewers: [],
        review_comments: 0,
        labels: [],
        head: { sha: 'def456' },
      },
    ];

    // Setup mock fetch responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPullRequests,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ state: 'APPROVED' }], // Reviews for PR 101
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ state: 'success' }), // CI status for PR 101
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ state: 'APPROVED' }], // Reviews for PR 102
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ state: 'success' }), // CI status for PR 102
      });

    const result = await service.getApprovedPRsNeedingQA(mockRepo, 'test-token');

    // Verify only the PR with needs-qa label is returned
    expect(result.length).toBe(1);
    expect(result[0].number).toBe(101);
    expect(result[0].labels).toContain('needs-qa');
  });

  it('should filter approved PRs needing CI resolution', async () => {
    // Mock response data
    const mockPullRequests = [
      {
        id: 1,
        number: 101,
        title: 'Approved PR with failing CI',
        html_url: 'https://github.com/testowner/testrepo/pull/101',
        draft: false,
        requested_reviewers: [],
        review_comments: 0,
        labels: [],
        head: { sha: 'abc123' },
      },
      {
        id: 2,
        number: 102,
        title: 'Approved PR with passing CI',
        html_url: 'https://github.com/testowner/testrepo/pull/102',
        draft: false,
        requested_reviewers: [],
        review_comments: 0,
        labels: [],
        head: { sha: 'def456' },
      },
    ];

    // Setup mock fetch responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPullRequests,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ state: 'APPROVED' }], // Reviews for PR 101
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ state: 'failure' }), // CI status for PR 101
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ state: 'APPROVED' }], // Reviews for PR 102
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ state: 'success' }), // CI status for PR 102
      });

    const result = await service.getApprovedPRsNeedingCIResolution(mockRepo, 'test-token');

    // Verify only the PR with failing CI is returned
    expect(result.length).toBe(1);
    expect(result[0].number).toBe(101);
    expect(result[0].ciStatus).toBe('failure');
  });

  it('should filter approved PRs needing merging', async () => {
    // Mock response data
    const mockPullRequests = [
      {
        id: 1,
        number: 101,
        title: 'Approved PR ready for merging',
        html_url: 'https://github.com/testowner/testrepo/pull/101',
        draft: false,
        requested_reviewers: [],
        review_comments: 0,
        labels: [],
        head: { sha: 'abc123' },
      },
      {
        id: 2,
        number: 102,
        title: 'Approved PR needing QA',
        html_url: 'https://github.com/testowner/testrepo/pull/102',
        draft: false,
        requested_reviewers: [],
        review_comments: 0,
        labels: [{ name: 'needs-qa', color: 'yellow' }],
        head: { sha: 'def456' },
      },
    ];

    // Setup mock fetch responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPullRequests,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ state: 'APPROVED' }], // Reviews for PR 101
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ state: 'success' }), // CI status for PR 101
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ state: 'APPROVED' }], // Reviews for PR 102
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ state: 'success' }), // CI status for PR 102
      });

    const result = await service.getApprovedPRsNeedingMerging(mockRepo, 'test-token');

    // Verify only the PR ready for merging is returned
    expect(result.length).toBe(1);
    expect(result[0].number).toBe(101);
    expect(result[0].ciStatus).toBe('success');
    expect(result[0].labels).not.toContain('needs-qa');
  });
});
