# DragAndSwap

DragAndSwap is a mobile-browser-first picture puzzle game where players reconstruct a complete picture by dragging one square tile onto another tile to swap their positions.

## Current Project Status

- **Phase:** Phase 2A (Project Foundation)
- **Status:** Project foundation, styling tokens, path aliases, contracts, and testing setup completed and verified.
- **Scope Note:** Gameplay features (puzzle boards, tile swapping, image loading, timers, moves) are not yet implemented. Phase 2A establishes design tokens, application framing, path aliases, data contracts, and test tooling.

## Technology Stack

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vite.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Package Manager:** [npm](https://www.npmjs.com/)
- **Linter:** [ESLint](https://eslint.org/) (flat configuration)
- **Formatter:** [Prettier](https://prettier.io/)
- **Test Runner:** [Vitest](https://vitest.dev/)

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
| `npm test`             | Runs unit and configuration tests using Vitest                          |

## Scope Boundaries

### What Is Implemented

- React + Vite + TypeScript project structure with strict type-checking.
- Path aliases (`@/*` pointing to `./src/*`).
- Reusable CSS design tokens adhering to the approved warm, minimal visual direction.
- Core data contracts and difficulty presets in `src/types/puzzle.ts`.
- Basic unit testing setup with Vitest.
- ESLint and Prettier configurations.
- Minimal, neutral application shell with mobile viewport meta tag and overflow safety.
- Project documentation and Git workflow.

### What Is NOT Implemented

- Puzzle board or grid rendering.
- Tile splitting, scrambling, or dragging/swapping mechanics.
- Image selection or asset decoding.
- Interactive gameplay timers, move counters, or scoring.
- Hints, preview thumbnails, or completion screens.
- Backend services, user accounts, or persistent storage.
