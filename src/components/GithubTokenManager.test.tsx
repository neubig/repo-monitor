import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GithubTokenManager } from './GithubTokenManager';
import * as githubUtils from '../utils/github';

// Mock the GitHub utilities
vi.mock('../utils/github', () => ({
  getGithubToken: vi.fn(),
  saveGithubToken: vi.fn(),
  clearGithubToken: vi.fn(),
  hasGithubToken: vi.fn(),
}));

describe('GithubTokenManager', () => {
  const onTokenChangeMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render input field when no token is present', () => {
    vi.mocked(githubUtils.hasGithubToken).mockReturnValue(false);
    
    render(<GithubTokenManager onTokenChange={onTokenChangeMock} />);
    
    expect(screen.getByPlaceholderText('Enter GitHub token')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Token' })).toBeInTheDocument();
    expect(onTokenChangeMock).toHaveBeenCalledWith(false);
  });

  it('should render token status when token is present', () => {
    vi.mocked(githubUtils.hasGithubToken).mockReturnValue(true);
    
    render(<GithubTokenManager onTokenChange={onTokenChangeMock} />);
    
    expect(screen.getByText('GitHub token is set')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change Token' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear Token' })).toBeInTheDocument();
    expect(onTokenChangeMock).toHaveBeenCalledWith(true);
  });

  it('should save token when Save Token button is clicked', () => {
    vi.mocked(githubUtils.hasGithubToken).mockReturnValue(false);
    
    render(<GithubTokenManager onTokenChange={onTokenChangeMock} />);
    
    const input = screen.getByPlaceholderText('Enter GitHub token');
    const saveButton = screen.getByRole('button', { name: 'Save Token' });
    
    fireEvent.change(input, { target: { value: 'test-token' } });
    fireEvent.click(saveButton);
    
    expect(githubUtils.saveGithubToken).toHaveBeenCalledWith('test-token');
    expect(onTokenChangeMock).toHaveBeenCalledWith(true);
  });

  it('should clear token when Clear Token button is clicked', () => {
    vi.mocked(githubUtils.hasGithubToken).mockReturnValue(true);
    
    render(<GithubTokenManager onTokenChange={onTokenChangeMock} />);
    
    const clearButton = screen.getByRole('button', { name: 'Clear Token' });
    
    fireEvent.click(clearButton);
    
    expect(githubUtils.clearGithubToken).toHaveBeenCalled();
    expect(onTokenChangeMock).toHaveBeenCalledWith(false);
  });

  it('should switch to edit mode when Change Token button is clicked', () => {
    vi.mocked(githubUtils.hasGithubToken).mockReturnValue(true);
    
    render(<GithubTokenManager onTokenChange={onTokenChangeMock} />);
    
    const changeButton = screen.getByRole('button', { name: 'Change Token' });
    
    fireEvent.click(changeButton);
    
    expect(screen.getByPlaceholderText('Enter GitHub token')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Token' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should cancel editing when Cancel button is clicked', () => {
    vi.mocked(githubUtils.hasGithubToken).mockReturnValue(true);
    
    render(<GithubTokenManager onTokenChange={onTokenChangeMock} />);
    
    // First click Change Token to enter edit mode
    fireEvent.click(screen.getByRole('button', { name: 'Change Token' }));
    
    // Then click Cancel
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    
    // Should be back to token status view
    expect(screen.getByText('GitHub token is set')).toBeInTheDocument();
  });
});