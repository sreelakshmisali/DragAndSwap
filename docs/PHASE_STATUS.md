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
- **Branch:** Merged into `develop` (`517a44b`)
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

---

## Phase 4: Gameplay Integration and Interactions

- **Status:** Completed & Verified
- **Branch:** `feat/phase-4-gameplay-integration` (cut from updated `develop`)
- **Key Deliverables:**
  1. **Engine to React State Integration ([`src/hooks/usePuzzleGame.ts`](../src/hooks/usePuzzleGame.ts)):**
     - Coordinates pure engine state with interactive React UI lifecycle.
     - Starts timer on first player interaction; pauses when tab is hidden (`document.hidden`); stops on puzzle completion.
     - Single-step undo and restart handlers directly dispatching engine transitions.
     - Zero duplication of game logic in UI components.
  2. **Responsive CSS Background Tile Slicing ([`src/lib/tile-layout.ts`](../src/lib/tile-layout.ts), [`src/lib/images.ts`](../src/lib/images.ts)):**
     - Precise CSS percentage positioning `(col / (N - 1) * 100%) (row / (N - 1) * 100%)` and scaling `N * 100%`.
     - Handcrafted local, artistic SVG images (`warm-sanctuary.svg`, `geometric-dawn.svg`) in `public/images/`.
     - No external network or third-party image dependencies.
  3. **Touchscreen and Mouse Interaction Pipeline ([`src/components/PuzzleBoardFrame.tsx`](../src/components/PuzzleBoardFrame.tsx)):**
     - Pointer capture with a 6px drag threshold cleanly separating taps from intentional drags.
     - Tap-to-select and tap-to-swap precision interaction for mobile.
     - Direct drag-and-drop with real-time translation (`translate3d`), z-index lift, and target hover anticipation.
     - Safe handling of invalid drops, cancellations, and non-primary mouse clicks.
     - Board locks upon completion, stripping tile gaps/borders to reveal the restored image in unbroken form.
  4. **Reference Preview & Completion Overlays:**
     - Reference Preview Modal ([`src/components/ReferencePreviewModal.tsx`](../src/components/ReferencePreviewModal.tsx)) with backdrop blur and artist attribution.
     - Calming Completion Card ([`src/components/CompletionCard.tsx`](../src/components/CompletionCard.tsx)) displaying final moves, elapsed time, "Play Again", and "Try Next Dimension" challenge triggers.
  5. **Controls and HUD Integration ([`src/components/ControlBar.tsx`](../src/components/ControlBar.tsx), [`src/components/GameHud.tsx`](../src/components/GameHud.tsx), [`src/App.tsx`](../src/App.tsx)):**
     - Dynamic moves counter and formatted timer (`MM:SS`).
     - Responsive grid difficulty switching ($3 \times 3$, $4 \times 4$, $5 \times 5$).
     - Single-step undo with active/disabled state binding.
  6. **Comprehensive Test Suite ([`src/components/components.test.tsx`](../src/components/components.test.tsx)):**
     - 28 component and integration tests verifying rendering, tile background calculations, formatted time, preview modal toggles, completion screen metrics, confirmation dialogs, pointer target identification, and layout integration.
     - Entire repository test suite passes with 47 tests across 3 suites.
  7. **Specification Compliance & Review Hardening:**
     - Gentle in-app `ConfirmationModal` guarding restart and difficulty changes when `moves > 0`.
     - Robust target detection via `elementsFromPoint` and `findTargetSlotFromElements` correctly detecting destination tiles beneath dragged tiles.
     - Outside click/tap listener to deselect active tile selection per specification.

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
│       ├── geometric-dawn.svg
│       └── warm-sanctuary.svg
├── README.md
├── src/
│   ├── components/
│   │   ├── CompletionCard.tsx
│   │   ├── components.test.tsx
│   │   ├── ConfirmationModal.tsx
│   │   ├── ControlBar.tsx
│   │   ├── GameHud.tsx
│   │   ├── Header.tsx
│   │   ├── PuzzleBoardFrame.tsx
│   │   └── ReferencePreviewModal.tsx
│   ├── hooks/
│   │   └── usePuzzleGame.ts
│   ├── lib/
│   │   ├── images.ts
│   │   ├── prng.ts
│   │   ├── puzzle-engine.test.ts
│   │   ├── puzzle-engine.ts
│   │   └── tile-layout.ts
│   ├── styles/
│   │   ├── game.css
│   │   ├── index.css
│   │   └── tokens.css
│   ├── types/
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
- **`npm test` (`vitest run`)**: Passed (3 test files, 47 tests passed).
