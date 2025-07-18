/**
 * GitHub API utilities
 */

import type { Repository } from '../services/PullRequestService';

const GITHUB_TOKEN_KEY = 'github_token';
const LAST_REPO_KEY = 'last_repository';

/**
 * Get the GitHub token from local storage
 */
export const getGithubToken = (): string | null => {
  return localStorage.getItem(GITHUB_TOKEN_KEY);
};

/**
 * Save the GitHub token to local storage
 */
export const saveGithubToken = (token: string): void => {
  localStorage.setItem(GITHUB_TOKEN_KEY, token);
};

/**
 * Clear the GitHub token from local storage
 */
export const clearGithubToken = (): void => {
  localStorage.removeItem(GITHUB_TOKEN_KEY);
};

/**
 * Check if a GitHub token is stored
 */
export const hasGithubToken = (): boolean => {
  return !!getGithubToken();
};

/**
 * Fetch data from GitHub API with authentication
 */
export const fetchGithubApi = async <T>(url: string): Promise<T> => {
  const token = getGithubToken();
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

/**
 * Get the last accessed repository from local storage
 */
export const getLastRepository = (): Repository | null => {
  const repoData = localStorage.getItem(LAST_REPO_KEY);
  if (!repoData) {
    return null;
  }

  try {
    return JSON.parse(repoData) as Repository;
  } catch (error) {
    console.error('Error parsing stored repository data:', error);
    return null;
  }
};

/**
 * Save the last accessed repository to local storage
 */
export const saveLastRepository = (repository: Repository): void => {
  localStorage.setItem(LAST_REPO_KEY, JSON.stringify(repository));
};

/**
 * Clear the last accessed repository from local storage
 */
export const clearLastRepository = (): void => {
  localStorage.removeItem(LAST_REPO_KEY);
};

/**
 * Check if a last accessed repository is stored
 */
export const hasLastRepository = (): boolean => {
  return !!getLastRepository();
};

/**
 * Convert a repository object to a GitHub URL string
 */
export const repositoryToUrl = (repository: Repository): string => {
  return `https://github.com/${repository.owner}/${repository.name}`;
};
