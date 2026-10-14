/**
 * DragAndSwap — Pure TypeScript Puzzle Engine
 *
 * Implements board generation, randomized derangements, free pairwise tile
 * swapping, solved-state detection, move counting, and single-step undo.
 * Fully decoupled from React and DOM APIs.
 */

import {
  DEFAULT_DIFFICULTY,
  type DifficultyDimension,
  type PuzzleState,
  type PuzzleTile,
} from '@/types/puzzle';

/**
 * Generates a random derangement of indices [0 ... count - 1].
 * A derangement guarantees that no element remains in its original position
 * (p(i) !== i for all i), satisfying the specification requirement that
 * the puzzle cannot start solved or with tiles pre-solved.
 */
export function generateDerangement(
  count: number,
  randomFn: () => number = Math.random
): number[] {
  if (count < 2) {
    throw new Error('Cannot derange a collection with fewer than 2 items');
  }

  const items = Array.from({ length: count }, (_, i) => i);

  // Sattolo's algorithm generates a uniform random cycle containing all items.
  // A cycle of length count has zero fixed points for all count >= 2.
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * i);
    const temp = items[i];
    items[i] = items[j];
    items[j] = temp;
  }

  return items;
}

/**
 * Checks whether the current arrangement of tiles matches the solved state.
 * A board is solved when every tile's originIndex equals its current slot index.
 */
export function isBoardSolved(tiles: readonly PuzzleTile[]): boolean {
  if (tiles.length === 0) return false;
  return tiles.every((tile, index) => tile.originIndex === index);
}

/**
 * Counts how many tiles are currently in their correct (solved) position.
 */
export function getCorrectTileCount(tiles: readonly PuzzleTile[]): number {
  return tiles.reduce(
    (count, tile, index) => (tile.originIndex === index ? count + 1 : count),
    0
  );
}

/**
 * Creates a fully solved set of tiles for a given dimension.
 */
export function createSolvedTiles(
  dimension: DifficultyDimension
): readonly PuzzleTile[] {
  const count = dimension * dimension;
  return Object.freeze(
    Array.from({ length: count }, (_, i) =>
      Object.freeze({
        id: i,
        originIndex: i,
        currentIndex: i,
      })
    )
  );
}

/**
 * Initializes a new puzzle state with scrambled tiles (derangement).
 */
export function createInitialPuzzle(
  dimension: DifficultyDimension = DEFAULT_DIFFICULTY,
  randomFn: () => number = Math.random
): PuzzleState {
  const count = dimension * dimension;
  const derangedOriginIndices = generateDerangement(count, randomFn);

  const tiles: PuzzleTile[] = derangedOriginIndices.map(
    (originIndex, currentSlot) =>
      Object.freeze({
        id: originIndex,
        originIndex,
        currentIndex: currentSlot,
      })
  );

  return Object.freeze({
    dimension,
    tiles: Object.freeze(tiles),
    moves: 0,
    isSolved: false,
    canUndo: false,
    lastSwap: null,
  });
}

/**
 * Creates an explicitly solved puzzle state (useful for test assertions and completion verification).
 */
export function createSolvedPuzzle(
  dimension: DifficultyDimension = DEFAULT_DIFFICULTY
): PuzzleState {
  const tiles = createSolvedTiles(dimension);
  return Object.freeze({
    dimension,
    tiles,
    moves: 0,
    isSolved: true,
    canUndo: false,
    lastSwap: null,
  });
}

/**
 * Creates a puzzle state from an explicit mapping of origin indices.
 * Primarily used for deterministic testing and precise test scenario construction.
 */
export function createPuzzleFromLayout(
  dimension: DifficultyDimension,
  originIndices: readonly number[],
  moves = 0
): PuzzleState {
  const expectedCount = dimension * dimension;
  if (originIndices.length !== expectedCount) {
    throw new Error(
      `Layout length ${originIndices.length} does not match expected tile count ${expectedCount} for dimension ${dimension}`
    );
  }

  const tiles = originIndices.map((originIndex, currentSlot) =>
    Object.freeze({
      id: originIndex,
      originIndex,
      currentIndex: currentSlot,
    })
  );

  const solved = isBoardSolved(tiles);

  return Object.freeze({
    dimension,
    tiles: Object.freeze(tiles),
    moves,
    isSolved: solved,
    canUndo: false,
    lastSwap: null,
  });
}

/**
 * Swaps two distinct tiles at slot indices indexA and indexB.
 *
 * Enforces all game rules:
 * - Rejects swaps if board is already solved (locked state).
 * - Rejects swaps if indexA === indexB (invalid/canceled drop).
 * - Rejects swaps if either index is out of bounds.
 * - Increments move counter by 1.
 * - Detects solved state.
 * - Enables single-step undo if puzzle is not solved.
 */
export function swapTiles(
  state: PuzzleState,
  indexA: number,
  indexB: number
): PuzzleState {
  // If puzzle is already completed/locked, reject mutation
  if (state.isSolved) {
    return state;
  }

  // Same slot drop is treated as a canceled action
  if (indexA === indexB) {
    return state;
  }

  const totalTiles = state.tiles.length;
  if (
    !Number.isInteger(indexA) ||
    !Number.isInteger(indexB) ||
    indexA < 0 ||
    indexA >= totalTiles ||
    indexB < 0 ||
    indexB >= totalTiles
  ) {
    return state;
  }

  const nextTiles = [...state.tiles];
  const tileA = nextTiles[indexA];
  const tileB = nextTiles[indexB];

  nextTiles[indexA] = Object.freeze({
    ...tileB,
    currentIndex: indexA,
  });
  nextTiles[indexB] = Object.freeze({
    ...tileA,
    currentIndex: indexB,
  });

  const nextIsSolved = isBoardSolved(nextTiles);

  return Object.freeze({
    dimension: state.dimension,
    tiles: Object.freeze(nextTiles),
    moves: state.moves + 1,
    isSolved: nextIsSolved,
    canUndo: !nextIsSolved,
    lastSwap: nextIsSolved ? null : Object.freeze({ indexA, indexB }),
  });
}

/**
 * Reverses the single previous swap.
 *
 * Rules:
 * - Only available if canUndo is true and a lastSwap record exists.
 * - Decrements move counter by 1.
 * - Exhausts undo (canUndo becomes false) until another swap occurs.
 * - Cannot be called after puzzle is solved.
 */
export function undoSwap(state: PuzzleState): PuzzleState {
  if (!state.canUndo || !state.lastSwap || state.moves <= 0 || state.isSolved) {
    return state;
  }

  const { indexA, indexB } = state.lastSwap;
  const nextTiles = [...state.tiles];
  const tileA = nextTiles[indexA];
  const tileB = nextTiles[indexB];

  nextTiles[indexA] = Object.freeze({
    ...tileB,
    currentIndex: indexA,
  });
  nextTiles[indexB] = Object.freeze({
    ...tileA,
    currentIndex: indexB,
  });

  return Object.freeze({
    dimension: state.dimension,
    tiles: Object.freeze(nextTiles),
    moves: Math.max(0, state.moves - 1),
    isSolved: false,
    canUndo: false,
    lastSwap: null,
  });
}

/**
 * Restarts the puzzle with a fresh random scramble at the current difficulty.
 * Resets moves to 0 and clears undo state.
 */
export function restartPuzzle(
  state: PuzzleState,
  randomFn: () => number = Math.random
): PuzzleState {
  return createInitialPuzzle(state.dimension, randomFn);
}

/**
 * Changes puzzle difficulty dimension and initializes a fresh scramble.
 * Resets moves to 0 and clears undo state.
 */
export function changeDifficulty(
  _state: PuzzleState,
  dimension: DifficultyDimension,
  randomFn: () => number = Math.random
): PuzzleState {
  return createInitialPuzzle(dimension, randomFn);
}

/**
 * Retrieves a tile at a specific slot index.
 */
export function getTileAt(
  state: PuzzleState,
  index: number
): PuzzleTile | undefined {
  return state.tiles[index];
}
