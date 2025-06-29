import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

describe('Linting Configuration', () => {
  it('should have a valid ESLint configuration', () => {
    // This test will fail if the ESLint configuration is invalid
    const result = execSync('npx eslint --print-config ./src/main.tsx').toString();
    expect(JSON.parse(result)).toHaveProperty('rules');
  });

  it('should have a valid Prettier configuration', () => {
    // This test will fail if the Prettier configuration is invalid
    const result = execSync(
      'npx prettier --config-precedence file-override --find-config-path ./src/main.tsx'
    ).toString();
    expect(result.trim()).toContain('.prettierrc');
  });
});
