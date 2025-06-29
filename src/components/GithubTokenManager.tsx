import { useState, useEffect } from 'react';
import { saveGithubToken, clearGithubToken, hasGithubToken } from '../utils/github';

interface GithubTokenManagerProps {
  onTokenChange?: (hasToken: boolean) => void;
}

export function GithubTokenManager({ onTokenChange }: GithubTokenManagerProps) {
  const [token, setToken] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Check if token exists in local storage
    const tokenExists = hasGithubToken();
    setHasToken(tokenExists);
    
    // Notify parent component if callback is provided
    if (onTokenChange) {
      onTokenChange(tokenExists);
    }
  }, [onTokenChange]);

  const handleSaveToken = () => {
    if (token.trim()) {
      saveGithubToken(token.trim());
      setHasToken(true);
      setIsEditing(false);
      
      // Notify parent component if callback is provided
      if (onTokenChange) {
        onTokenChange(true);
      }
    }
  };

  const handleClearToken = () => {
    clearGithubToken();
    setToken('');
    setHasToken(false);
    
    // Notify parent component if callback is provided
    if (onTokenChange) {
      onTokenChange(false);
    }
  };

  return (
    <div className="github-token-manager">
      {!hasToken || isEditing ? (
        <div className="token-input">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter GitHub token"
            aria-label="GitHub token"
          />
          <button onClick={handleSaveToken}>Save Token</button>
          {isEditing && (
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          )}
        </div>
      ) : (
        <div className="token-status">
          <span>GitHub token is set</span>
          <button onClick={() => setIsEditing(true)}>Change Token</button>
          <button onClick={handleClearToken}>Clear Token</button>
        </div>
      )}
    </div>
  );
}