import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PullRequestMonitor from './PullRequestMonitor';
import PullRequestService from '../services/PullRequestService';

// Mock the PullRequestService
vi.mock('../services/PullRequestService', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      getPullRequestsWithNoReviewers: vi.fn(),
      getReviewedNonDraftPullRequests: vi.fn()
    })),
    // Export the interface types
    __esModule: true
  };
});

describe('PullRequestMonitor', () => {
  const mockRepository = { owner: 'testowner', name: 'testrepo' };
  let mockService: any;
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    
    // Setup the mock service instance
    mockService = {
      getPullRequestsWithNoReviewers: vi.fn(),
      getReviewedNonDraftPullRequests: vi.fn()
    };
    
    (PullRequestService as any).mockImplementation(() => mockService);
  });
  
  it('should display loading state initially', () => {
    // Setup mock to return a promise that doesn't resolve immediately
    mockService.getPullRequestsWithNoReviewers.mockReturnValue(new Promise(() => {}));
    mockService.getReviewedNonDraftPullRequests.mockReturnValue(new Promise(() => {}));
    
    render(<PullRequestMonitor repository={mockRepository} />);
    
    expect(screen.getByText('Loading pull request data...')).toBeInTheDocument();
  });
  
  it('should display error message when API call fails', async () => {
    // Setup mock to reject with an error
    const errorMessage = 'API error occurred';
    mockService.getPullRequestsWithNoReviewers.mockRejectedValue(new Error(errorMessage));
    mockService.getReviewedNonDraftPullRequests.mockRejectedValue(new Error(errorMessage));
    
    render(<PullRequestMonitor repository={mockRepository} />);
    
    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });
  
  it('should display pull requests with no reviewers', async () => {
    // Mock data
    const mockPRs = [
      { id: 1, number: 101, title: 'PR 1', url: 'https://github.com/test/pr/101', isDraft: false, hasReviewers: false, hasBeenReviewed: false },
      { id: 2, number: 102, title: 'PR 2', url: 'https://github.com/test/pr/102', isDraft: false, hasReviewers: false, hasBeenReviewed: false }
    ];
    
    // Setup mocks to resolve with data
    mockService.getPullRequestsWithNoReviewers.mockResolvedValue(mockPRs);
    mockService.getReviewedNonDraftPullRequests.mockResolvedValue([]);
    
    render(<PullRequestMonitor repository={mockRepository} />);
    
    await waitFor(() => {
      expect(screen.getByText('Pull Request Monitor for testowner/testrepo')).toBeInTheDocument();
      expect(screen.getByText('Open PRs with No Reviewers')).toBeInTheDocument();
      expect(screen.getByText('#101: PR 1')).toBeInTheDocument();
      expect(screen.getByText('#102: PR 2')).toBeInTheDocument();
      expect(screen.getByText('No pull requests found in this category.')).toBeInTheDocument(); // For reviewed PRs
    });
  });
  
  it('should display reviewed non-draft pull requests', async () => {
    // Mock data
    const mockReviewedPRs = [
      { id: 3, number: 103, title: 'Reviewed PR', url: 'https://github.com/test/pr/103', isDraft: false, hasReviewers: true, hasBeenReviewed: true }
    ];
    
    // Setup mocks to resolve with data
    mockService.getPullRequestsWithNoReviewers.mockResolvedValue([]);
    mockService.getReviewedNonDraftPullRequests.mockResolvedValue(mockReviewedPRs);
    
    render(<PullRequestMonitor repository={mockRepository} />);
    
    await waitFor(() => {
      expect(screen.getByText('Pull Request Monitor for testowner/testrepo')).toBeInTheDocument();
      expect(screen.getByText('Reviewed Non-Draft PRs')).toBeInTheDocument();
      expect(screen.getByText('#103: Reviewed PR')).toBeInTheDocument();
      expect(screen.getByText('No pull requests found in this category.')).toBeInTheDocument(); // For PRs with no reviewers
    });
  });
  
  it('should pass the GitHub token to the service when provided', async () => {
    // Setup mocks to resolve with empty arrays
    mockService.getPullRequestsWithNoReviewers.mockResolvedValue([]);
    mockService.getReviewedNonDraftPullRequests.mockResolvedValue([]);
    
    const token = 'test-github-token';
    render(<PullRequestMonitor repository={mockRepository} githubToken={token} />);
    
    await waitFor(() => {
      expect(mockService.getPullRequestsWithNoReviewers).toHaveBeenCalledWith(mockRepository, token);
      expect(mockService.getReviewedNonDraftPullRequests).toHaveBeenCalledWith(mockRepository, token);
    });
  });
});