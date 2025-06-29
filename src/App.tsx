import { useState, useEffect } from 'react';
import openHandsLogo from './assets/all-hands-logo.svg';
import './App.css';
import { GithubTokenManager } from './components/GithubTokenManager';
import { hasGithubToken, getGithubToken } from './utils/github';
import PullRequestMonitor from './components/PullRequestMonitor';
import type { Repository } from './services/PullRequestService';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [repository, setRepository] = useState<Repository | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if token exists on initial load
    setHasToken(hasGithubToken());
  }, []);

  // Parse GitHub repository URL to extract owner and name
  const parseRepoUrl = (url: string): Repository | null => {
    try {
      // Handle URLs like https://github.com/owner/repo or github.com/owner/repo
      const githubRegex = /github\.com\/([^/]+)\/([^/]+)/;
      const match = url.match(githubRegex);

      if (match && match.length >= 3) {
        return {
          owner: match[1],
          name: match[2].replace('.git', ''), // Remove .git if present
        };
      }

      // Handle simple owner/repo format
      const simpleRegex = /^([^/]+)\/([^/]+)$/;
      const simpleMatch = url.match(simpleRegex);

      if (simpleMatch && simpleMatch.length >= 3) {
        return {
          owner: simpleMatch[1],
          name: simpleMatch[2].replace('.git', ''),
        };
      }

      return null;
    } catch (err) {
      console.error('Error parsing repository URL:', err);
      return null;
    }
  };

  const handleStartMonitoring = () => {
    if (repoUrl.trim()) {
      setError(null);
      const repo = parseRepoUrl(repoUrl.trim());

      if (repo) {
        setRepository(repo);
        setIsMonitoring(true);
      } else {
        setError('Invalid repository URL format. Please use format: https://github.com/owner/repo');
      }
    }
  };

  const handleStopMonitoring = () => {
    setIsMonitoring(false);
    setRepository(null);
  };

  const handleTokenChange = (hasToken: boolean) => {
    setHasToken(hasToken);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <img src={openHandsLogo} className="logo" alt="OpenHands logo" />
            <h1>Repo Monitor</h1>
          </div>
          <nav className="nav">
            <a
              href="https://github.com/All-Hands-AI/OpenHands"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a href="https://docs.all-hands.dev/" target="_blank" rel="noopener noreferrer">
              Docs
            </a>
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="hero-section">
          <h2>Monitor Your Repository</h2>
          <p>Keep track of your repository activity with OpenHands-powered monitoring</p>
        </div>

        <div className="github-auth-section">
          <div className="auth-card">
            <h3>GitHub Authentication</h3>
            <GithubTokenManager onTokenChange={handleTokenChange} />
            <p className="token-status-message">
              {hasToken
                ? '✅ GitHub token is set. You can now access GitHub API.'
                : '⚠️ No GitHub token set. Some features may be limited.'}
            </p>
          </div>
        </div>

        <div className="monitor-section">
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter repository URL (e.g., https://github.com/user/repo)"
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
              className="repo-input"
            />
            {!isMonitoring ? (
              <button onClick={handleStartMonitoring} className="btn btn-primary">
                Start Monitoring
              </button>
            ) : (
              <button onClick={handleStopMonitoring} className="btn btn-secondary">
                Stop Monitoring
              </button>
            )}
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {isMonitoring && repository && (
            <div className="monitoring-status">
              <div className="status-card">
                <h3>Monitoring Active</h3>
                <p>
                  Repository: {repository.owner}/{repository.name}
                </p>
                <div className="status-indicator">
                  <span className="status-dot"></span>
                  <span>Live monitoring in progress...</span>
                </div>

                {/* Display the actual pull request data */}
                <div className="pull-request-data">
                  <PullRequestMonitor
                    repository={repository}
                    githubToken={(hasToken && getGithubToken()) || undefined}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="features-section">
          <h3>Features</h3>
          <div className="features-grid">
            <div className="feature-card">
              <h4>Real-time Updates</h4>
              <p>Get instant notifications about repository changes and activity</p>
            </div>
            <div className="feature-card">
              <h4>AI-Powered Insights</h4>
              <p>Leverage OpenHands AI to analyze code changes and patterns</p>
            </div>
            <div className="feature-card">
              <h4>Easy Integration</h4>
              <p>Simple setup with your existing GitHub workflow</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>
          Powered by{' '}
          <a href="https://all-hands.dev" target="_blank" rel="noopener noreferrer">
            OpenHands
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
