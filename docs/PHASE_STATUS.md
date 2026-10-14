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
- **Branch:** `feat/phase-2b-static-game-ui` (cut from updated `develop`)
- **Key Deliverables:**
  1. **Game Header (`src/components/Header.tsx`):**
     - Clean, quiet typography displaying title `DragAndSwap` and subtle tagline.
  2. **Static HUD (`src/components/GameHud.tsx`):**
     - Displays moves (`Moves: 0`) and timer (`00:00`) in pill-shaped minimal surface container.
  3. **Presentational Controls (`src/components/ControlBar.tsx`):**
     - Action buttons: Undo (disabled), Restart (disabled), and Reference Preview (disabled).
     - Difficulty segmented control: $3 \times 3$ (selected by default), $4 \times 4$, and $5 \times 5$ grid pills.
     - Marked explicitly as presentational preview to avoid appearing functional prior to gameplay integration.
  4. **Square Puzzle Board Frame (`src/components/PuzzleBoardFrame.tsx`):**
     - Fixed 1:1 aspect ratio container with soft borders and warm shadows.
     - CSS Grid rendering placeholder tiles with tactile slot numbers ($1 \dots N^2$).
  5. **Responsive Application Assembly (`src/App.tsx`, `src/styles/game.css`):**
     - Composes the header, HUD, board, controls, and subtle status notice in a mobile-first container (`max-width: 520px`).
     - Fully responsive across mobile screens ($320\text{px}\text{--}480\text{px}$) and desktop with zero horizontal overflow.
  6. **Component Rendering Test Suite (`src/components/components.test.tsx`):**
     - Comprehensive unit tests verifying static rendering of all components and default prop behavior using Vitest.
- **Explicit Confirmation of Scope Boundaries:**
  - **Zero gameplay logic implemented:** No tile swapping, drag-and-drop, shuffling, timer ticks, undo state, or game-state management.
  - Controls are purely presentational.
  - No artwork or external assets added.

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
│   │   └── .gitkeep
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
- **`npm test` (`vitest run`)**: Passed (2 test files, 9 tests passed).
