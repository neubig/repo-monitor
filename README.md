# repo-monitor

A modern JavaScript application built with Vite, TypeScript, and React.

## Features

- ⚡️ **Vite** - Fast build tool and development server
- ⚛️ **React 19** - Modern React with latest features
- 🔷 **TypeScript** - Type-safe JavaScript
- 🧪 **Vitest** - Fast unit testing framework
- 🧹 **ESLint** - Code linting and formatting
- 📦 **Modern tooling** - Latest development tools and best practices

## Getting Started

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

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Building

Build the application for production:
```bash
npm run build
```

### Testing

Run tests:
```bash
npm run test        # Run tests in watch mode
npm run test:run    # Run tests once
```

### Linting

Check code quality:
```bash
npm run lint
```

## Project Structure

```
src/
├── App.tsx          # Main application component
├── App.test.tsx     # Tests for App component
├── main.tsx         # Application entry point
├── index.css        # Global styles
├── App.css          # Component styles
├── vite-env.d.ts    # Vite type definitions
├── assets/          # Static assets
└── test/
    └── setup.ts     # Test configuration
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run lint` - Run ESLint

## Technologies Used

- [Vite](https://vite.dev/) - Build tool
- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vitest](https://vitest.dev/) - Testing framework
- [Testing Library](https://testing-library.com/) - Testing utilities
- [ESLint](https://eslint.org/) - Code linting
