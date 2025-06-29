/**
 * GitHub API utilities
 */

const GITHUB_TOKEN_KEY = 'github_token';

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
export const fetchGithubApi = async (url: string): Promise<any> => {
  const token = getGithubToken();
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
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