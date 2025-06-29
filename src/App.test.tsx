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
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders GitHub Repo Monitor heading', () => {
    render(<App />);
    expect(screen.getByText('GitHub Repo Monitor')).toBeInTheDocument();
  });

  it('renders count button with initial value', () => {
    render(<App />);
    expect(screen.getByText('count is 0')).toBeInTheDocument();
  });

  it('increments count when button is clicked', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /count is/i });

    fireEvent.click(button);
    expect(screen.getByText('count is 1')).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByText('count is 2')).toBeInTheDocument();
  });

  it('renders Vite and React logos', () => {
    render(<App />);
    expect(screen.getByAltText('Vite logo')).toBeInTheDocument();
    expect(screen.getByAltText('React logo')).toBeInTheDocument();
  });

  it('renders edit instruction text', () => {
    render(<App />);
    expect(
      screen.getByText((_, element) => {
        return element?.textContent === 'Edit src/App.tsx and save to test HMR';
      })
    ).toBeInTheDocument();
  });

  it('renders GitHub token manager component', () => {
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
});
