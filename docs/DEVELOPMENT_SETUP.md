# Development Setup Guide

## Prerequisites

Ensure the following tools are installed in your environment:

- **Node.js**: `v20.x` or later (tested on `v24.15.0`)
- **npm**: `v10.x` or later (tested on `v11.13.0`)
- **Git**: `2.x` or later

Verify installations:

```bash
node -v
npm -v
git --version
```

## Dependency Installation

Install project dependencies using `npm`. Do not use Yarn or pnpm to avoid mixing lockfiles.

```bash
npm install
```

## Local Development

Start the local Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The server runs by default at `http://localhost:5173/`.

## Validation Commands

Run these validation scripts before committing changes:

### 1. TypeScript Type Checking

Runs strict compiler checks without emitting output files:

```bash
npm run type-check
```

_(Alternative alias: `npm run typecheck`)_

### 2. Linting

Runs ESLint with flat config rules across the project:

```bash
npm run lint
```

### 3. Formatting Verification

Checks code formatting against Prettier conventions:

```bash
npm run format:check
```

To automatically format files:

```bash
npm run format
```

## Production Build and Preview

### 1. Build Production Assets

Compiles TypeScript and bundles optimized assets into the `dist/` folder:

```bash
npm run build
```

### 2. Preview Production Build

Locally serves the contents of the `dist/` directory to test production behavior:

```bash
npm run preview
```

## Git Workflow and Branching Strategy

Our repository maintains strict branch discipline:

1. **`main` Branch**:
   - Acts as the production branch.
   - Never merge directly to `main` without explicit product owner approval.

2. **`develop` Branch**:
   - Serves as the primary integration branch for development.
   - All completed and tested features are merged into `develop` upon confirmation.

3. **Feature Branches**:
   - For every new feature or task, cut a dedicated branch from `develop`:
     ```bash
     git checkout develop
     git pull origin develop
     git checkout -b feature/<feature-name>
     ```
   - Keep commits focused, clean, and well-described.
   - Merge back to `develop` only after full testing and verification, with product owner approval.
