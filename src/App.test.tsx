import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import * as githubUtils from './utils/github';

// Mock the GitHub utilities
vi.mock('./utils/github', () => ({
  hasGithubToken: vi.fn(),
  getGithubToken: vi.fn(),
  saveGithubToken: vi.fn(),
  clearGithubToken: vi.fn(),
  getLastRepository: vi.fn(),
  saveLastRepository: vi.fn(),
  clearLastRepository: vi.fn(),
  hasLastRepository: vi.fn(),
  repositoryToUrl: vi.fn(),
}));

// Mock the PullRequestMonitor component
vi.mock('./components/PullRequestMonitor', () => ({
  default: vi.fn(() => <div data-testid="mock-pr-monitor">Mock PR Monitor</div>),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the OpenHands Repo Monitor heading', () => {
    render(<App />);
    expect(screen.getByText('Repo Monitor')).toBeInTheDocument();
    expect(screen.getByText('Monitor Your Repository')).toBeInTheDocument();
  });

  it('renders the OpenHands logo', () => {
    render(<App />);
    expect(screen.getByAltText('OpenHands logo')).toBeInTheDocument();
  });

  it('renders GitHub Authentication section', () => {
    render(<App />);
    expect(screen.getByText('GitHub Authentication')).toBeInTheDocument();
  });

  it('shows token not set message when no token exists', () => {
    vi.mocked(githubUtils.hasGithubToken).mockReturnValue(false);
    render(<App />);
    expect(
      screen.getByText('⚠️ No GitHub token set. Some features may be limited.')
    ).toBeInTheDocument();
  });

  it('shows token set message when token exists', () => {
    vi.mocked(githubUtils.hasGithubToken).mockReturnValue(true);
    render(<App />);
    expect(
      screen.getByText('✅ GitHub token is set. You can now access GitHub API.')
    ).toBeInTheDocument();
  });

  it('renders the repository input field', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/Enter repository URL/i)).toBeInTheDocument();
  });

  it('renders the Start Monitoring button initially', () => {
    render(<App />);
    expect(screen.getByText('Start Monitoring')).toBeInTheDocument();
  });

  it('shows monitoring status when Start Monitoring is clicked with a URL', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Enter repository URL/i);
    const button = screen.getByText('Start Monitoring');

    fireEvent.change(input, { target: { value: 'https://github.com/test/repo' } });
    fireEvent.click(button);

    expect(screen.getByText('Monitoring Active')).toBeInTheDocument();
    expect(screen.getByText('Stop Monitoring')).toBeInTheDocument();
  });

  it('does not start monitoring when URL is empty', () => {
    render(<App />);
    const button = screen.getByText('Start Monitoring');

    fireEvent.click(button);

    expect(screen.queryByText('Monitoring Active')).not.toBeInTheDocument();
    expect(screen.getByText('Start Monitoring')).toBeInTheDocument();
  });

  it('stops monitoring when Stop Monitoring is clicked', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Enter repository URL/i);
    const startButton = screen.getByText('Start Monitoring');

    // Start monitoring
    fireEvent.change(input, { target: { value: 'https://github.com/test/repo' } });
    fireEvent.click(startButton);

    // Stop monitoring
    const stopButton = screen.getByText('Stop Monitoring');
    fireEvent.click(stopButton);

    expect(screen.queryByText('Monitoring Active')).not.toBeInTheDocument();
    expect(screen.getByText('Start Monitoring')).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    render(<App />);
    expect(screen.getByText('Real-time Updates')).toBeInTheDocument();
    expect(screen.getByText('AI-Powered Insights')).toBeInTheDocument();
    expect(screen.getByText('Easy Integration')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<App />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Docs')).toBeInTheDocument();
  });

  it('renders footer with OpenHands link', () => {
    render(<App />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveTextContent('Powered by OpenHands');
  });

  describe('Repository Storage', () => {
    it('loads last repository on initial render', () => {
      const mockRepository = { owner: 'testowner', name: 'testrepo' };
      const mockUrl = 'https://github.com/testowner/testrepo';

      vi.mocked(githubUtils.getLastRepository).mockReturnValue(mockRepository);
      vi.mocked(githubUtils.repositoryToUrl).mockReturnValue(mockUrl);
      vi.mocked(githubUtils.hasGithubToken).mockReturnValue(false);

      render(<App />);

      expect(githubUtils.getLastRepository).toHaveBeenCalled();
      expect(githubUtils.repositoryToUrl).toHaveBeenCalledWith(mockRepository);

      const input = screen.getByPlaceholderText(/Enter repository URL/i) as HTMLInputElement;
      expect(input.value).toBe(mockUrl);
    });

    it('does not populate input when no last repository exists', () => {
      vi.mocked(githubUtils.getLastRepository).mockReturnValue(null);
      vi.mocked(githubUtils.hasGithubToken).mockReturnValue(false);

      render(<App />);

      expect(githubUtils.getLastRepository).toHaveBeenCalled();

      const input = screen.getByPlaceholderText(/Enter repository URL/i) as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('saves repository when monitoring starts', () => {
      vi.mocked(githubUtils.getLastRepository).mockReturnValue(null);
      vi.mocked(githubUtils.hasGithubToken).mockReturnValue(false);

      render(<App />);

      const input = screen.getByPlaceholderText(/Enter repository URL/i);
      const button = screen.getByText('Start Monitoring');

      fireEvent.change(input, { target: { value: 'https://github.com/test/repo' } });
      fireEvent.click(button);

      expect(githubUtils.saveLastRepository).toHaveBeenCalledWith({
        owner: 'test',
        name: 'repo',
      });
    });

    it('saves repository with simple owner/repo format', () => {
      vi.mocked(githubUtils.getLastRepository).mockReturnValue(null);
      vi.mocked(githubUtils.hasGithubToken).mockReturnValue(false);

      render(<App />);

      const input = screen.getByPlaceholderText(/Enter repository URL/i);
      const button = screen.getByText('Start Monitoring');

      fireEvent.change(input, { target: { value: 'test/repo' } });
      fireEvent.click(button);

      expect(githubUtils.saveLastRepository).toHaveBeenCalledWith({
        owner: 'test',
        name: 'repo',
      });
    });

    it('does not save repository when URL is invalid', () => {
      vi.mocked(githubUtils.getLastRepository).mockReturnValue(null);
      vi.mocked(githubUtils.hasGithubToken).mockReturnValue(false);

      render(<App />);

      const input = screen.getByPlaceholderText(/Enter repository URL/i);
      const button = screen.getByText('Start Monitoring');

      fireEvent.change(input, { target: { value: 'invalid-url' } });
      fireEvent.click(button);

      expect(githubUtils.saveLastRepository).not.toHaveBeenCalled();
      expect(screen.getByText(/Invalid repository URL format/)).toBeInTheDocument();
    });
  });
});
