/**
 * Central Configuration & Game Tuning Parameters
 * Single Source of Truth as specified in docs/gdd/05_parameters.md
 */
export const GAME_CONFIG = {
  // 1. Gameplay & Kinematik
  roadWidth: 14.0,
  roadLength: 140.0,
  playerSpeed: 18.0,
  playerDamping: 12.0,
  playerMaxTilt: 0.35, // ~20 degrees
  baseObstacleSpeed: 24.0,
  speedIncreasePerMin: 4.0,
  maxObstacleSpeed: 55.0,

  // 2. Spawner & Hindernisse
  spawnDistanceZ: 85.0,
  despawnDistanceZ: -10.0,
  initialSpawnIntervalMs: 900,
  minSpawnIntervalMs: 380,
  obstacleWidth: 2.6,
  obstacleHeight: 2.2,
  obstacleDepth: 1.5,
  laneCount: 5,

  // 3. Player Dimensions
  playerWidth: 2.0,
  playerHeight: 0.8,
  playerDepth: 2.2,

  // 4. Visuals & Ästhetik
  colors: {
    primaryCyan: '#00f0ff',
    accentMagenta: '#ff0055',
    accentYellow: '#ffe600',
    bgVoid: '#080710',
    gridSubtle: 'rgba(0, 240, 255, 0.4)',
  },
  glowIntensity: 0.85,

  // 5. Game Feel & Juice
  shakeDurationMs: 250,
  shakeMagnitude: 0.45,
  nearMissDistance: 1.2,
  particleCountCrash: 40,
} as const;
