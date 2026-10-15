import { describe, it, expect } from 'vitest';
import { calculateScore } from '../src/core/score';

describe('Score Calculation (docs/gdd/01_concept_and_loop.md)', () => {
  it('returns 0 for zero or negative elapsed seconds', () => {
    expect(calculateScore(0)).toBe(0);
    expect(calculateScore(-5)).toBe(0);
  });

  it('calculates linear passive score in first minute (1.0x multiplier)', () => {
    // 10s * 10 * 1.0 = 100
    expect(calculateScore(10)).toBe(100);
    // 30s * 10 * 1.0 = 300
    expect(calculateScore(30)).toBe(300);
  });

  it('increases multiplier after 60 seconds (1.5x multiplier)', () => {
    // 60s * 10 * 1.5 = 900
    expect(calculateScore(60)).toBe(900);
  });

  it('awards +50 points for each near miss', () => {
    // 10s * 10 + 2 * 50 = 200
    expect(calculateScore(10, 2)).toBe(200);
  });
});
