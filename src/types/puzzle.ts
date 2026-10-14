/**
 * DragAndSwap — Core Puzzle Type Definitions
 * Derived from Phase 1 Approved Product Specification
 */

export type DifficultyDimension = 3 | 4 | 5;

export interface PuzzleTile {
  readonly id: number;
  readonly originIndex: number;
  readonly currentIndex: number;
}

export interface PuzzleImage {
  readonly id: string;
  readonly title: string;
  readonly filename: string;
  readonly artist?: string;
  readonly attribution?: string;
}

export interface SwapRecord {
  readonly indexA: number;
  readonly indexB: number;
}

export interface PuzzleState {
  readonly dimension: DifficultyDimension;
  readonly tiles: readonly PuzzleTile[];
  readonly moves: number;
  readonly isSolved: boolean;
  readonly canUndo: boolean;
  readonly lastSwap: SwapRecord | null;
}

export const DIFFICULTY_PRESETS: Record<
  'easy' | 'medium' | 'hard',
  DifficultyDimension
> = {
  easy: 3,
  medium: 4,
  hard: 5,
};

export const DEFAULT_DIFFICULTY: DifficultyDimension = 3;
