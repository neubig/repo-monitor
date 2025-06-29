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
        reviews_count: 0,
      },
      {
        id: 2,
        number: 102,
        title: 'Test PR 2',
        html_url: 'https://github.com/testowner/testrepo/pull/102',
        draft: true,
        requested_reviewers: [{ login: 'reviewer1' }],
        review_comments: 0,
        reviews_count: 0,
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
      },
      {
        id: 2,
        number: 102,
        title: 'Test PR 2',
        url: 'https://github.com/testowner/testrepo/pull/102',
        isDraft: true,
        hasReviewers: true,
        hasBeenReviewed: false,
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
        reviews_count: 0,
      },
      {
        id: 2,
        number: 102,
        title: 'PR with reviewers',
        html_url: 'https://github.com/testowner/testrepo/pull/102',
        draft: false,
        requested_reviewers: [{ login: 'reviewer1' }],
        review_comments: 0,
        reviews_count: 0,
      },
      {
        id: 3,
        number: 103,
        title: 'Draft PR with no reviewers',
        html_url: 'https://github.com/testowner/testrepo/pull/103',
        draft: true,
        requested_reviewers: [],
        review_comments: 0,
        reviews_count: 0,
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
        reviews_count: 1,
      },
      {
        id: 2,
        number: 102,
        title: 'Non-reviewed non-draft PR',
        html_url: 'https://github.com/testowner/testrepo/pull/102',
        draft: false,
        requested_reviewers: [{ login: 'reviewer1' }],
        review_comments: 0,
        reviews_count: 0,
      },
      {
        id: 3,
        number: 103,
        title: 'Reviewed draft PR',
        html_url: 'https://github.com/testowner/testrepo/pull/103',
        draft: true,
        requested_reviewers: [],
        review_comments: 3,
        reviews_count: 1,
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
});
