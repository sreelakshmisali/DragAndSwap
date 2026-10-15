import type { DifficultyDimension } from '@/types/puzzle';

export interface TileBackgroundPosition {
  readonly xPercent: number;
  readonly yPercent: number;
  readonly backgroundSize: string;
  readonly backgroundPosition: string;
}

/**
 * Calculates CSS background-size and background-position percentages
 * for an image slice corresponding to originIndex on an N x N grid.
 */
export function getTileBackgroundPosition(
  originIndex: number,
  dimension: DifficultyDimension
): TileBackgroundPosition {
  const row = Math.floor(originIndex / dimension);
  const col = originIndex % dimension;
  const denominator = dimension > 1 ? dimension - 1 : 1;

  const xPercent = (col / denominator) * 100;
  const yPercent = (row / denominator) * 100;

  return {
    xPercent,
    yPercent,
    backgroundSize: `${dimension * 100}% ${dimension * 100}%`,
    backgroundPosition: `${xPercent}% ${yPercent}%`,
  };
}
