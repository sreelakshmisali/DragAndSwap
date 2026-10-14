# DragAndSwap

DragAndSwap is a mobile-browser-first picture puzzle game where players reconstruct a complete picture by dragging one square tile onto another tile to swap their positions.

## Current Project Status

- **Phase:** Phase 0 (Project Foundation and Skeleton)
- **Status:** Initial project skeleton completed and verified.
- **Scope Note:** Gameplay features (puzzle boards, tile swapping, image loading, timers, moves) are not yet implemented. Phase 0 establishes only the core tooling, baseline architecture, and development workflow.

## Technology Stack

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vite.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Package Manager:** [npm](https://www.npmjs.com/)
- **Linter:** [ESLint](https://eslint.org/) (flat configuration)
- **Formatter:** [Prettier](https://prettier.io/)

## Repository

- **GitHub Repository:** `https://github.com/sreelakshmisali/DragAndSwap.git`

## Prerequisites

- **Node.js:** v20.x or later (tested on v24.15.0)
- **npm:** v10.x or later (tested on v11.13.0)

## Installation

Clone the repository and install dependencies using npm:

```bash
git clone https://github.com/sreelakshmisali/DragAndSwap.git
cd DragAndSwap
npm install
```

## Available Scripts

The following npm scripts are configured in `package.json`:

| Command                | Purpose                                                                 |
| :--------------------- | :---------------------------------------------------------------------- |
| `npm run dev`          | Starts the Vite local development server                                |
| `npm run build`        | Compiles TypeScript and builds the production bundle                    |
| `npm run preview`      | Previews the production build locally                                   |
| `npm run lint`         | Runs ESLint across project files                                        |
| `npm run type-check`   | Runs TypeScript compiler checks without emitting files (`tsc --noEmit`) |
| `npm run format:check` | Verifies code formatting with Prettier                                  |
| `npm run format`       | Formats project files with Prettier                                     |

## Scope Boundaries (Phase 0)

### What Is Implemented

- React + Vite + TypeScript project structure with strict type-checking.
- ESLint and Prettier configurations.
- Minimal, neutral application shell with mobile viewport meta tag and overflow safety.
- Project documentation and Git repository foundation.

### What Is NOT Implemented

- Puzzle board or grid rendering.
- Tile splitting, scrambling, or dragging/swapping mechanics.
- Image selection or asset decoding.
- Difficulty levels or game modes.
- Timers, move counters, or scoring.
- Hints, preview thumbnails, or completion screens.
- Backend services, user accounts, or persistent storage.
