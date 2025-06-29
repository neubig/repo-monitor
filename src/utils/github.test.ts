import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getGithubToken,
  saveGithubToken,
  clearGithubToken,
  hasGithubToken,
  fetchGithubApi,
} from './github';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Mock fetch
const fetchMock = vi.fn();

describe('GitHub Utilities', () => {
  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Setup fetch mock
    Object.defineProperty(window, 'fetch', { value: fetchMock });

    // Clear mocks before each test
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Token Management', () => {
    it('should save and retrieve a token', () => {
      const testToken = 'test-github-token';

      saveGithubToken(testToken);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('github_token', testToken);
      expect(getGithubToken()).toBe(testToken);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('github_token');
    });

    it('should clear a token', () => {
      // First save a token
      saveGithubToken('test-token');

      // Then clear it
      clearGithubToken();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('github_token');
      expect(getGithubToken()).toBeNull();
    });

    it('should check if a token exists', () => {
      // Initially no token
      expect(hasGithubToken()).toBe(false);

      // Save a token
      saveGithubToken('test-token');

      // Now should have a token
      expect(hasGithubToken()).toBe(true);
    });
  });

  describe('API Fetching', () => {
    it('should fetch from GitHub API without a token', async () => {
      const mockResponse = { data: 'test' };
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      fetchMock.mockResolvedValue(mockFetchResponse);

      const result = await fetchGithubApi<typeof mockResponse>('https://api.github.com/test');

      expect(fetchMock).toHaveBeenCalledWith('https://api.github.com/test', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      });

      expect(result).toEqual(mockResponse);
    });

    it('should fetch from GitHub API with a token', async () => {
      const testToken = 'test-github-token';
      const mockResponse = { data: 'test' };
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      // Save a token
      saveGithubToken(testToken);

      fetchMock.mockResolvedValue(mockFetchResponse);

      const result = await fetchGithubApi<typeof mockResponse>('https://api.github.com/test');

      expect(fetchMock).toHaveBeenCalledWith('https://api.github.com/test', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${testToken}`,
        },
      });

      expect(result).toEqual(mockResponse);
    });

    it('should throw an error when the API request fails', async () => {
      const mockFetchResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      };

      fetchMock.mockResolvedValue(mockFetchResponse);

      await expect(fetchGithubApi<unknown>('https://api.github.com/test')).rejects.toThrow(
        'GitHub API error: 401 Unauthorized'
      );
    });
  });
});
