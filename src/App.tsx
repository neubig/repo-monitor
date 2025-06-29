import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { GithubTokenManager } from './components/GithubTokenManager';
import { hasGithubToken } from './utils/github';

function App() {
  const [count, setCount] = useState(0);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // Check if token exists on initial load
    setHasToken(hasGithubToken());
  }, []);

  const handleTokenChange = (hasToken: boolean) => {
    setHasToken(hasToken);
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>GitHub Repo Monitor</h1>

      <div className="card">
        <h2>GitHub Authentication</h2>
        <GithubTokenManager onTokenChange={handleTokenChange} />
        <p className="token-status-message">
          {hasToken
            ? '✅ GitHub token is set. You can now access GitHub API.'
            : '⚠️ No GitHub token set. Some features may be limited.'}
        </p>
      </div>

      <div className="card">
        <button onClick={() => setCount(count => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  );
}

export default App;
