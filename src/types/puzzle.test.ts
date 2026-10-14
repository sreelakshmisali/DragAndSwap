import { describe, expect, it } from 'vitest';
import { DEFAULT_DIFFICULTY, DIFFICULTY_PRESETS } from '@/types/puzzle';

describe('Project Foundation & Configuration', () => {
  it('provides approved difficulty presets for 3x3, 4x4, and 5x5', () => {
    expect(DIFFICULTY_PRESETS.easy).toBe(3);
    expect(DIFFICULTY_PRESETS.medium).toBe(4);
    expect(DIFFICULTY_PRESETS.hard).toBe(5);
  });

  it('defaults to 3x3 difficulty per Phase 1 approved decision', () => {
    expect(DEFAULT_DIFFICULTY).toBe(3);
  });
});
