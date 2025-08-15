import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PullRequestMonitor from './PullRequestMonitor';
import PullRequestService from '../services/PullRequestService';

// Mock the PullRequestService
vi.mock('../services/PullRequestService', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      getPullRequestsWithNoReviewers: vi.fn(),
      getReviewedNonDraftPullRequests: vi.fn(),
      getApprovedPRsNeedingQA: vi.fn(),
      getApprovedPRsNeedingCIResolution: vi.fn(),
      getApprovedPRsNeedingMerging: vi.fn(),
    })),
    // Export the interface types
    __esModule: true,
  };
});

describe('PullRequestMonitor', () => {
  const mockRepository = { owner: 'testowner', name: 'testrepo' };
  let mockService: {
    getPullRequestsWithNoReviewers: ReturnType<typeof vi.fn>;
    getReviewedNonDraftPullRequests: ReturnType<typeof vi.fn>;
    getApprovedPRsNeedingQA: ReturnType<typeof vi.fn>;
    getApprovedPRsNeedingCIResolution: ReturnType<typeof vi.fn>;
    getApprovedPRsNeedingMerging: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    // Setup the mock service instance
    mockService = {
      getPullRequestsWithNoReviewers: vi.fn(),
      getReviewedNonDraftPullRequests: vi.fn(),
      getApprovedPRsNeedingQA: vi.fn(),
      getApprovedPRsNeedingCIResolution: vi.fn(),
      getApprovedPRsNeedingMerging: vi.fn(),
    };

    (PullRequestService as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => mockService
    );
  });

  it('should display loading state initially', () => {
    // Setup mock to return a promise that doesn't resolve immediately
    mockService.getPullRequestsWithNoReviewers.mockReturnValue(new Promise(() => {}));
    mockService.getReviewedNonDraftPullRequests.mockReturnValue(new Promise(() => {}));
    mockService.getApprovedPRsNeedingQA.mockReturnValue(new Promise(() => {}));
    mockService.getApprovedPRsNeedingCIResolution.mockReturnValue(new Promise(() => {}));
    mockService.getApprovedPRsNeedingMerging.mockReturnValue(new Promise(() => {}));

    render(<PullRequestMonitor repository={mockRepository} />);

    expect(screen.getByText('Loading pull request data...')).toBeInTheDocument();
  });

  it('should display error message when API call fails', async () => {
    // Setup mock to reject with an error
    const errorMessage = 'API error occurred';
    mockService.getPullRequestsWithNoReviewers.mockRejectedValue(new Error(errorMessage));
    mockService.getReviewedNonDraftPullRequests.mockRejectedValue(new Error(errorMessage));
    mockService.getApprovedPRsNeedingQA.mockRejectedValue(new Error(errorMessage));
    mockService.getApprovedPRsNeedingCIResolution.mockRejectedValue(new Error(errorMessage));
    mockService.getApprovedPRsNeedingMerging.mockRejectedValue(new Error(errorMessage));

    render(<PullRequestMonitor repository={mockRepository} />);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('should display pull requests with no reviewers', async () => {
    // Mock data
    const mockPRs = [
      {
        id: 1,
        number: 101,
        title: 'PR 1',
        url: 'https://github.com/test/pr/101',
        isDraft: false,
        hasReviewers: false,
        hasBeenReviewed: false,
        isApproved: false,
        labels: [],
        ciStatus: 'unknown' as const,
      },
      {
        id: 2,
        number: 102,
        title: 'PR 2',
        url: 'https://github.com/test/pr/102',
        isDraft: false,
        hasReviewers: false,
        hasBeenReviewed: false,
        isApproved: false,
        labels: [],
        ciStatus: 'unknown' as const,
      },
    ];

    // Setup mocks to resolve with data
    mockService.getPullRequestsWithNoReviewers.mockResolvedValue(mockPRs);
    mockService.getReviewedNonDraftPullRequests.mockResolvedValue([]);
    mockService.getApprovedPRsNeedingQA.mockResolvedValue([]);
    mockService.getApprovedPRsNeedingCIResolution.mockResolvedValue([]);
    mockService.getApprovedPRsNeedingMerging.mockResolvedValue([]);

    render(<PullRequestMonitor repository={mockRepository} />);

    await waitFor(() => {
      expect(screen.getByText('Pull Request Monitor for testowner/testrepo')).toBeInTheDocument();
      expect(screen.getByText('Open PRs with No Reviewers')).toBeInTheDocument();
      expect(screen.getByText('#101: PR 1')).toBeInTheDocument();
      expect(screen.getByText('#102: PR 2')).toBeInTheDocument();
      expect(screen.getAllByText('No pull requests found in this category.')).toHaveLength(4); // For reviewed PRs and the 3 new categories
    });
  });

  it('should display reviewed non-draft pull requests', async () => {
    // Mock data
    const mockReviewedPRs = [
      {
        id: 3,
        number: 103,
        title: 'Reviewed PR',
        url: 'https://github.com/test/pr/103',
        isDraft: false,
        hasReviewers: true,
        hasBeenReviewed: true,
        isApproved: false,
        labels: [],
        ciStatus: 'unknown' as const,
      },
    ];

    // Setup mocks to resolve with data
    mockService.getPullRequestsWithNoReviewers.mockResolvedValue([]);
    mockService.getReviewedNonDraftPullRequests.mockResolvedValue(mockReviewedPRs);
    mockService.getApprovedPRsNeedingQA.mockResolvedValue([]);
    mockService.getApprovedPRsNeedingCIResolution.mockResolvedValue([]);
    mockService.getApprovedPRsNeedingMerging.mockResolvedValue([]);

    render(<PullRequestMonitor repository={mockRepository} />);

    await waitFor(() => {
      expect(screen.getByText('Pull Request Monitor for testowner/testrepo')).toBeInTheDocument();
      expect(screen.getByText('Reviewed Non-Draft PRs')).toBeInTheDocument();
      expect(screen.getByText('#103: Reviewed PR')).toBeInTheDocument();
      expect(screen.getAllByText('No pull requests found in this category.')).toHaveLength(4); // For PRs with no reviewers and the 3 new categories
    });
  });

  it('should pass the GitHub token to the service when provided', async () => {
    // Setup mocks to resolve with empty arrays
    mockService.getPullRequestsWithNoReviewers.mockResolvedValue([]);
    mockService.getReviewedNonDraftPullRequests.mockResolvedValue([]);
    mockService.getApprovedPRsNeedingQA.mockResolvedValue([]);
    mockService.getApprovedPRsNeedingCIResolution.mockResolvedValue([]);
    mockService.getApprovedPRsNeedingMerging.mockResolvedValue([]);

    const token = 'test-github-token';
    render(<PullRequestMonitor repository={mockRepository} githubToken={token} />);

    await waitFor(() => {
      expect(mockService.getPullRequestsWithNoReviewers).toHaveBeenCalledWith(
        mockRepository,
        token
      );
      expect(mockService.getReviewedNonDraftPullRequests).toHaveBeenCalledWith(
        mockRepository,
        token
      );
      expect(mockService.getApprovedPRsNeedingQA).toHaveBeenCalledWith(mockRepository, token);
      expect(mockService.getApprovedPRsNeedingCIResolution).toHaveBeenCalledWith(
        mockRepository,
        token
      );
      expect(mockService.getApprovedPRsNeedingMerging).toHaveBeenCalledWith(mockRepository, token);
    });
  });

  it('should display approved PRs needing QA', async () => {
    // Mock data
    const mockApprovedPRsNeedingQA = [
      {
        id: 4,
        number: 104,
        title: 'Approved PR needing QA',
        url: 'https://github.com/test/pr/104',
        isDraft: false,
        hasReviewers: true,
        hasBeenReviewed: true,
        isApproved: true,
        labels: ['needs-qa'],
        ciStatus: 'success' as const,
      },
    ];

    // Setup mocks to resolve with data
    mockService.getPullRequestsWithNoReviewers.mockResolvedValue([]);
    mockService.getReviewedNonDraftPullRequests.mockResolvedValue([]);
    mockService.getApprovedPRsNeedingQA.mockResolvedValue(mockApprovedPRsNeedingQA);
    mockService.getApprovedPRsNeedingCIResolution.mockResolvedValue([]);
    mockService.getApprovedPRsNeedingMerging.mockResolvedValue([]);

    render(<PullRequestMonitor repository={mockRepository} />);

    await waitFor(() => {
      expect(screen.getByText('Approved PRs - Needs QA')).toBeInTheDocument();
      expect(screen.getByText('#104: Approved PR needing QA')).toBeInTheDocument();
      expect(screen.getByText('needs-qa')).toBeInTheDocument();
    });
  });

  it('should display approved PRs needing CI resolution', async () => {
    // Mock data
    const mockApprovedPRsNeedingCI = [
      {
        id: 5,
        number: 105,
        title: 'Approved PR with failing CI',
        url: 'https://github.com/test/pr/105',
        isDraft: false,
        hasReviewers: true,
        hasBeenReviewed: true,
        isApproved: true,
        labels: [],
        ciStatus: 'failure' as const,
      },
    ];

    // Setup mocks to resolve with data
    mockService.getPullRequestsWithNoReviewers.mockResolvedValue([]);
    mockService.getReviewedNonDraftPullRequests.mockResolvedValue([]);
    mockService.getApprovedPRsNeedingQA.mockResolvedValue([]);
    mockService.getApprovedPRsNeedingCIResolution.mockResolvedValue(mockApprovedPRsNeedingCI);
    mockService.getApprovedPRsNeedingMerging.mockResolvedValue([]);

    render(<PullRequestMonitor repository={mockRepository} />);

    await waitFor(() => {
      expect(screen.getByText('Approved PRs - Needs CI Resolution')).toBeInTheDocument();
      expect(screen.getByText('#105: Approved PR with failing CI')).toBeInTheDocument();
      expect(screen.getByText('CI: failure')).toBeInTheDocument();
    });
  });

  it('should display approved PRs needing merging', async () => {
    // Mock data
    const mockApprovedPRsNeedingMerging = [
      {
        id: 6,
        number: 106,
        title: 'Approved PR ready for merging',
        url: 'https://github.com/test/pr/106',
        isDraft: false,
        hasReviewers: true,
        hasBeenReviewed: true,
        isApproved: true,
        labels: [],
        ciStatus: 'success' as const,
      },
    ];

    // Setup mocks to resolve with data
    mockService.getPullRequestsWithNoReviewers.mockResolvedValue([]);
    mockService.getReviewedNonDraftPullRequests.mockResolvedValue([]);
    mockService.getApprovedPRsNeedingQA.mockResolvedValue([]);
    mockService.getApprovedPRsNeedingCIResolution.mockResolvedValue([]);
    mockService.getApprovedPRsNeedingMerging.mockResolvedValue(mockApprovedPRsNeedingMerging);

    render(<PullRequestMonitor repository={mockRepository} />);

    await waitFor(() => {
      expect(screen.getByText('Approved PRs - Needs Merging')).toBeInTheDocument();
      expect(screen.getByText('#106: Approved PR ready for merging')).toBeInTheDocument();
      expect(screen.getByText('CI: success')).toBeInTheDocument();
    });
  });
});
