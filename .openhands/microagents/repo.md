# Repository Information

This document provides essential information about the repo-monitor repository.

## Building and Linting

Before submitting a pull request, please ensure that your changes pass the building and linting checks. The repository uses a GitHub workflow for continuous integration that checks building, linting, and testing.

To verify that your changes will pass these checks locally:

1. **Install dependencies**:
   ```bash
   npm ci
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Run linting**:
   ```bash
   npm run lint
   ```

4. **Run tests**:
   ```bash
   npm run test:run
   ```

All of these checks must pass before your pull request can be merged. The GitHub workflow will automatically run these checks when you create or update a pull request.

If you encounter any linting errors, you can fix many of them automatically by running:
```bash
npm run lint -- --fix
```

Please make sure all checks pass locally before submitting your pull request to avoid delays in the review process.