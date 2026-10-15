/**
 * Deterministic Score Calculation & Highscore Management
 * Pure TypeScript logic - 100% testable without DOM / Canvas
 */
export function calculateScore(
  elapsedSeconds: number,
  nearMissCount = 0
): number {
  if (elapsedSeconds <= 0) return 0;
  // Multiplier increases every 60 seconds by +0.5
  const minutes = Math.floor(elapsedSeconds / 60);
  const multiplier = 1.0 + minutes * 0.5;

  const timeScore = Math.floor(elapsedSeconds * 10 * multiplier);
  const bonusScore = nearMissCount * 50;
  return timeScore + bonusScore;
}

const STORAGE_KEY = 'neon_dodge_highscore';

export function getStoredHighscore(): number {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(STORAGE_KEY);
      return val ? parseInt(val, 10) || 0 : 0;
    }
  } catch {
    // Ignore in non-browser / restricted environments
  }
  return 0;
}

export function saveHighscore(score: number): boolean {
  try {
    const currentBest = getStoredHighscore();
    if (score > currentBest && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, score.toString());
      return true;
    }
  } catch {
    // Ignore in non-browser / restricted environments
  }
  return false;
}
