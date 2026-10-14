import { describe, expect, it } from 'vitest';
import { createSeededRandom } from '@/lib/prng';
import {
  changeDifficulty,
  createInitialPuzzle,
  createPuzzleFromLayout,
  createSolvedPuzzle,
  generateDerangement,
  getCorrectTileCount,
  getTileAt,
  isBoardSolved,
  restartPuzzle,
  swapTiles,
  undoSwap,
} from '@/lib/puzzle-engine';

describe('Puzzle Engine: Scrambling & Derangements', () => {
  it('throws when attempting to derange fewer than 2 items', () => {
    expect(() => generateDerangement(1)).toThrow();
    expect(() => generateDerangement(0)).toThrow();
  });

  it('guarantees that no tile starts in its solved position for 3x3, 4x4, and 5x5', () => {
    for (const dim of [3, 4, 5] as const) {
      const state = createInitialPuzzle(dim);
      expect(state.tiles).toHaveLength(dim * dim);
      expect(state.isSolved).toBe(false);
      expect(state.moves).toBe(0);
      expect(state.canUndo).toBe(false);

      // Verify every tile is strictly in an unsolved position (derangement)
      for (let i = 0; i < state.tiles.length; i++) {
        expect(state.tiles[i].originIndex).not.toBe(i);
        expect(state.tiles[i].currentIndex).toBe(i);
      }
      expect(getCorrectTileCount(state.tiles)).toBe(0);
    }
  });

  it('generates deterministic scrambles with a seeded PRNG', () => {
    const prng1 = createSeededRandom(12345);
    const prng2 = createSeededRandom(12345);

    const puzzle1 = createInitialPuzzle(3, prng1);
    const puzzle2 = createInitialPuzzle(3, prng2);

    expect(puzzle1.tiles.map((t) => t.originIndex)).toEqual(
      puzzle2.tiles.map((t) => t.originIndex)
    );
  });
});

describe('Puzzle Engine: Solved State Detection', () => {
  it('correctly identifies a solved board', () => {
    const solved = createSolvedPuzzle(3);
    expect(solved.isSolved).toBe(true);
    expect(isBoardSolved(solved.tiles)).toBe(true);
    expect(getCorrectTileCount(solved.tiles)).toBe(9);
  });

  it('detects when an almost-solved board becomes solved after a swap', () => {
    // Construct board where only tiles at slot 0 and 1 are swapped
    const layout = [1, 0, 2, 3, 4, 5, 6, 7, 8];
    const initial = createPuzzleFromLayout(3, layout);
    expect(initial.isSolved).toBe(false);
    expect(getCorrectTileCount(initial.tiles)).toBe(7);

    // Swap slots 0 and 1 into correct positions
    const resolved = swapTiles(initial, 0, 1);
    expect(resolved.isSolved).toBe(true);
    expect(resolved.moves).toBe(1);
    expect(getCorrectTileCount(resolved.tiles)).toBe(9);
  });

  it('locks board mutations once the puzzle is solved', () => {
    const solved = createSolvedPuzzle(3);
    const attemptSwap = swapTiles(solved, 0, 1);

    // Board remains unchanged because input is locked
    expect(attemptSwap).toBe(solved);
    expect(attemptSwap.moves).toBe(0);
    expect(attemptSwap.isSolved).toBe(true);
  });
});

describe('Puzzle Engine: Free Pairwise Swapping', () => {
  it('swaps two non-adjacent tiles across the board and updates currentIndex', () => {
    // Start with an unsolved layout (slot 7 and 8 swapped)
    const state = createPuzzleFromLayout(3, [0, 1, 2, 3, 4, 5, 6, 8, 7]);
    const swapped = swapTiles(state, 0, 7); // Swap slot 0 and slot 7

    expect(swapped.moves).toBe(1);
    expect(swapped.tiles[0].originIndex).toBe(8);
    expect(swapped.tiles[0].currentIndex).toBe(0);
    expect(swapped.tiles[7].originIndex).toBe(0);
    expect(swapped.tiles[7].currentIndex).toBe(7);

    // Other tiles remain untouched
    expect(swapped.tiles[1].originIndex).toBe(1);
    expect(swapped.tiles[8].originIndex).toBe(7);
  });

  it('handles invalid same-index swap gracefully with zero move increment', () => {
    const state = createInitialPuzzle(3);
    const result = swapTiles(state, 4, 4);

    expect(result).toBe(state);
    expect(result.moves).toBe(0);
    expect(result.canUndo).toBe(false);
  });

  it('handles out of bounds indices safely without mutating state', () => {
    const state = createInitialPuzzle(3);

    expect(swapTiles(state, -1, 4)).toBe(state);
    expect(swapTiles(state, 0, 9)).toBe(state);
    expect(swapTiles(state, 10, 12)).toBe(state);
    expect(swapTiles(state, 1.5, 2)).toBe(state);
  });

  it('allows safe inspection via getTileAt', () => {
    const state = createSolvedPuzzle(3);
    expect(getTileAt(state, 0)?.originIndex).toBe(0);
    expect(getTileAt(state, 8)?.originIndex).toBe(8);
    expect(getTileAt(state, 99)).toBeUndefined();
  });
});

describe('Puzzle Engine: Single-Step Undo Mechanics', () => {
  it('enables undo after a valid swap and reverses the swap with decremented moves', () => {
    const initial = createPuzzleFromLayout(3, [1, 2, 0, 3, 4, 5, 6, 7, 8]);
    expect(initial.canUndo).toBe(false);

    const step1 = swapTiles(initial, 0, 1);
    expect(step1.moves).toBe(1);
    expect(step1.canUndo).toBe(true);
    expect(step1.lastSwap).toEqual({ indexA: 0, indexB: 1 });
    expect(step1.tiles[0].originIndex).toBe(2);
    expect(step1.tiles[1].originIndex).toBe(1);

    const undone = undoSwap(step1);
    expect(undone.moves).toBe(0);
    expect(undone.canUndo).toBe(false);
    expect(undone.lastSwap).toBeNull();
    expect(undone.tiles[0].originIndex).toBe(1);
    expect(undone.tiles[1].originIndex).toBe(2);
  });

  it('exhausts undo so double-undo cannot be performed', () => {
    const initial = createPuzzleFromLayout(3, [1, 2, 0, 3, 4, 5, 6, 7, 8]);
    const step1 = swapTiles(initial, 0, 1);
    const undoneOnce = undoSwap(step1);
    expect(undoneOnce.canUndo).toBe(false);

    // Second undo is a no-op
    const undoneTwice = undoSwap(undoneOnce);
    expect(undoneTwice).toBe(undoneOnce);
    expect(undoneTwice.moves).toBe(0);
  });

  it('disables undo when the swap results in winning the game', () => {
    // Board where swapping 0 and 1 solves the puzzle
    const layout = [1, 0, 2, 3, 4, 5, 6, 7, 8];
    const initial = createPuzzleFromLayout(3, layout);
    const winningSwap = swapTiles(initial, 0, 1);

    expect(winningSwap.isSolved).toBe(true);
    expect(winningSwap.canUndo).toBe(false);
    expect(winningSwap.lastSwap).toBeNull();

    // Calling undo on solved state does nothing
    expect(undoSwap(winningSwap)).toBe(winningSwap);
  });

  it('does nothing when attempting to undo with zero moves', () => {
    const initial = createInitialPuzzle(3);
    expect(undoSwap(initial)).toBe(initial);
  });
});

describe('Puzzle Engine: Restart and Difficulty Switching', () => {
  it('restartPuzzle creates a fresh scramble and resets state', () => {
    const prng = createSeededRandom(42);
    const initial = createInitialPuzzle(3, prng);
    const played = swapTiles(initial, 0, 1);
    expect(played.moves).toBe(1);

    const restarted = restartPuzzle(played, prng);
    expect(restarted.moves).toBe(0);
    expect(restarted.canUndo).toBe(false);
    expect(restarted.lastSwap).toBeNull();
    expect(restarted.isSolved).toBe(false);
  });

  it('changeDifficulty reinitializes the board with the new dimension', () => {
    const initial3x3 = createInitialPuzzle(3);
    const state4x4 = changeDifficulty(initial3x3, 4);
    expect(state4x4.dimension).toBe(4);
    expect(state4x4.tiles).toHaveLength(16);
    expect(state4x4.moves).toBe(0);
    expect(state4x4.canUndo).toBe(false);

    const state5x5 = changeDifficulty(state4x4, 5);
    expect(state5x5.dimension).toBe(5);
    expect(state5x5.tiles).toHaveLength(25);
    expect(state5x5.moves).toBe(0);
  });
});

describe('Puzzle Engine: Deterministic Walkthrough to Solution', () => {
  it('solves a scrambled puzzle through sequential pairwise swaps', () => {
    // Seeded PRNG generates deterministic derangement
    const prng = createSeededRandom(999);
    let state = createInitialPuzzle(3, prng);
    expect(state.isSolved).toBe(false);

    // Iteratively swap tiles into their target positions
    for (let targetIndex = 0; targetIndex < 9; targetIndex++) {
      if (state.tiles[targetIndex].originIndex !== targetIndex) {
        // Find where the tile belonging to targetIndex currently resides
        const currentSlotOfTile = state.tiles.findIndex(
          (t) => t.originIndex === targetIndex
        );
        expect(currentSlotOfTile).toBeGreaterThanOrEqual(0);

        state = swapTiles(state, targetIndex, currentSlotOfTile);
      }
    }

    expect(state.isSolved).toBe(true);
    expect(getCorrectTileCount(state.tiles)).toBe(9);
    expect(state.canUndo).toBe(false);
    expect(state.moves).toBeGreaterThan(0);
  });
});
