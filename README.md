# GitHub Repository Monitor

A web application for monitoring GitHub repository pull requests. Track open PRs that need reviewers and reviewed PRs that are ready for action.

🌐 **Live Demo**: [repo-monitor.vercel.app](https://repo-monitor.vercel.app)

## What it does

This tool helps you monitor GitHub repositories by tracking:

- **Open PRs with No Reviewers** - Pull requests that are open, not in draft status, but have no assigned reviewers
- **Reviewed Non-Draft PRs** - Pull requests that have been reviewed and are ready for potential merge

Simply enter any GitHub repository (owner/name) and optionally provide a GitHub token for private repositories or higher API rate limits.

## Features

- 🔍 **Real-time PR monitoring** - Fetch and display current pull request status
- 🔐 **GitHub token support** - Access private repositories and avoid rate limits
- ⚡️ **Fast and responsive** - Built with modern React and TypeScript
- 🎯 **Focused insights** - Shows only the PRs that need attention

## How to Use

1. **Visit the live application**: [repo-monitor.vercel.app](https://repo-monitor.vercel.app)
2. **Enter repository details**: Input the GitHub repository owner and name (e.g., `facebook/react`)
3. **Optional GitHub token**: Add your GitHub personal access token for:
   - Access to private repositories
   - Higher API rate limits (5000 requests/hour vs 60/hour)
4. **Monitor PRs**: View categorized pull requests that need attention

### GitHub Token Setup

To create a GitHub personal access token:

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` scope for private repositories
3. Copy and paste the token into the application

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/neubig/repo-monitor.git
cd repo-monitor
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run lint` - Run ESLint

## Deployment

The application is automatically deployed to Vercel at [repo-monitor.vercel.app](https://repo-monitor.vercel.app). Any changes pushed to the main branch will trigger a new deployment.

## Technologies Used

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest with Testing Library
- **Deployment**: Vercel
- **API**: GitHub REST API v3

## Project Structure

```
src/
├── components/
│   ├── PullRequestMonitor.tsx    # Main PR monitoring component
│   └── GithubTokenManager.tsx    # GitHub token management
├── services/
│   └── PullRequestService.ts     # GitHub API integration
├── utils/
│   └── github.ts                 # GitHub utility functions
├── App.tsx                       # Main application component
└── main.tsx                      # Application entry point
```
