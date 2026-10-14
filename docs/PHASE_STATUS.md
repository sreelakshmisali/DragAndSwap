# Phase Status: Project Roadmap & Status Tracking

## Phase 0: Project Foundation and Skeleton

- **Status:** Completed & Verified
- **Branch:** Merged into `main` and `develop`
- **Commit:** `afd2cd2` (Follow-up: `e26f452`)
- **Key Deliverables:** React + Vite + TypeScript setup, ESLint flat config, Prettier, `.editorconfig`, `.gitignore`, baseline structure, zero gameplay code.

---

## Phase 1: Product Specification and Game Rules

- **Status:** Completed & Approved by Product Owner
- **Branch:** Merged into `develop` (`d4252d0`)
- **Approved Product Decisions:**
  1. **Tile Swapping:** Free swap between any two distinct tiles on the board (adjacent or non-adjacent).
  2. **Interaction Model:** Support both direct drag-and-drop and tap-to-select/tap-to-swap concurrently.
  3. **HUD:** Minimal moves counter and timer (`MM:SS`) positioned adjacent to the board.
  4. **Undo:** Single-step undo (reverses the last swap, decrements move count by 1, exhausts until next move).
  5. **Restart:** Generates a fresh random scramble (derangement) for the current image and difficulty tier.
  6. **Difficulty:** Player-selectable $3 \times 3$ (default), $4 \times 4$, and $5 \times 5$ grids.
- **Deliverables:** [`docs/PRODUCT_SPECIFICATION.md`](PRODUCT_SPECIFICATION.md).

---

## Phase 2A: Project Foundation

- **Status:** Completed & Verified
- **Branch:** Merged into `develop` (`0e9ad12`)
- **Key Deliverables:**
  - Design tokens in `src/styles/tokens.css` (warm, clean, minimal, calming, premium palette, typography, spacing, shadows).
  - Global styling and mobile viewport hygiene in `src/styles/index.css`.
  - Path alias `@/*` configured in `vite.config.ts` and `tsconfig.json`.
  - Puzzle data contracts and difficulty presets in `src/types/puzzle.ts`.
  - Testing setup with Vitest and contract verification tests in `src/types/puzzle.test.ts`.

---

## Phase 2B: Static Game Interface

- **Status:** Completed & Verified
- **Branch:** Merged into `develop` (`6fb8802`)
- **Key Deliverables:**
  - Game Header (`src/components/Header.tsx`).
  - Static HUD (`src/components/GameHud.tsx`).
  - Presentational Controls (`src/components/ControlBar.tsx`).
  - Square Puzzle Board Frame (`src/components/PuzzleBoardFrame.tsx`).
  - Responsive Application Assembly (`src/App.tsx`, `src/styles/game.css`).
  - Component Rendering Test Suite (`src/components/components.test.tsx`).

---

## Phase 3: Puzzle Engine

- **Status:** Completed & Verified
- **Branch:** `feat/phase-3-puzzle-engine` (cut from updated `develop`)
- **Key Deliverables:**
  1. **Pure TypeScript Engine Core ([`src/lib/puzzle-engine.ts`](../src/lib/puzzle-engine.ts)):**
     - Pure functional state transitions independent of React and DOM.
     - Board initialization with randomized derangements (Sattolo algorithm) guaranteeing no tile starts in its solved position ($p(i) \neq i$ for all $i$).
     - Solved-state detection (`isBoardSolved`, `getCorrectTileCount`).
     - Free pairwise tile swapping (`swapTiles`) with out-of-bounds guards, same-slot cancellation, and post-win input locking.
     - Move counter tracking monotonic valid moves.
     - Single-step undo mechanics (`undoSwap`) with 1-step memory limit, move decrement, and exhaustion guards.
     - Difficulty switching (`changeDifficulty`) and reset/restart (`restartPuzzle`) for $3 \times 3$, $4 \times 4$, and $5 \times 5$ tiers.
  2. **Deterministic Seeded PRNG ([`src/lib/prng.ts`](../src/lib/prng.ts)):**
     - Mulberry32 pseudorandom generator providing reproducible scrambles for deterministic testing.
  3. **Comprehensive Test Suite ([`src/lib/puzzle-engine.test.ts`](../src/lib/puzzle-engine.test.ts)):**
     - 17 unit tests verifying derangement properties, solved detection, board locking, free pairwise swapping, invalid input handling, single-step undo exhaustion, restarts, difficulty tiers, and a deterministic step-by-step walkthrough to solution.
- **Explicit Confirmation of Scope Boundaries:**
  - **Zero React or DOM coupling:** The engine consists strictly of pure functions and immutable state.
  - **No drag-and-drop, timer behavior, animations, or new UI components were implemented.**
  - **No artwork or unnecessary dependencies added.**

---

## Project Structure Status

```text
DragAndSwap/
├── .editorconfig
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── docs/
│   ├── DEVELOPMENT_SETUP.md
│   ├── PHASE_STATUS.md
│   ├── PRODUCT_SPECIFICATION.md
│   └── PROJECT_OVERVIEW.md
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── public/
│   └── images/
│       └── .gitkeep
├── README.md
├── src/
│   ├── app/
│   │   └── .gitkeep
│   ├── components/
│   │   ├── .gitkeep
│   │   ├── components.test.tsx
│   │   ├── ControlBar.tsx
│   │   ├── GameHud.tsx
│   │   ├── Header.tsx
│   │   └── PuzzleBoardFrame.tsx
│   ├── features/
│   │   └── .gitkeep
│   ├── hooks/
│   │   └── .gitkeep
│   ├── lib/
│   │   ├── .gitkeep
│   │   ├── prng.ts
│   │   ├── puzzle-engine.test.ts
│   │   └── puzzle-engine.ts
│   ├── styles/
│   │   ├── game.css
│   │   ├── index.css
│   │   └── tokens.css
│   ├── types/
│   │   ├── .gitkeep
│   │   ├── puzzle.test.ts
│   │   └── puzzle.ts
│   ├── App.tsx
│   └── main.tsx
├── tsconfig.json
└── vite.config.ts
```

## Validation Status

- **`npm run type-check` (`tsc --noEmit`)**: Passed (0 errors).
- **`npm run lint` (`eslint .`)**: Passed (0 errors, 0 warnings).
- **`npm run format:check` (`prettier --check .`)**: Passed.
- **`npm run build` (`tsc && vite build`)**: Passed.
- **`npm test` (`vitest run`)**: Passed (3 test files, 28 tests passed).
