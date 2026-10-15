import { createScene } from './render/scene';
import { createHighway } from './render/highway';
import { createPlayerMesh } from './render/player';
import { createObstaclePool } from './render/obstacles';
import { checkAABBOverlap, entityToBoundingBox } from './core/collision';
import { PlayerState, ObstacleEntity, InputState } from './types';
import { GAME_CONFIG } from './config';

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const { engine, scene } = createScene(canvas);
const highway = createHighway(scene);
const playerMesh = createPlayerMesh(scene);
const obstaclePool = createObstaclePool(scene);

// State driven completely by GAME_CONFIG (Phase 2 - Parameter Isolation)
const playerState: PlayerState = {
  x: 0,
  targetX: 0,
  y: 0.6,
  z: 0,
  width: GAME_CONFIG.playerWidth,
  height: GAME_CONFIG.playerHeight,
  depth: GAME_CONFIG.playerDepth,
  tilt: 0,
};

const inputState: InputState = {
  left: false,
  right: false,
  touchActive: false,
  touchNormalizedX: 0,
};

let obstacles: ObstacleEntity[] = [];
let nextObstacleId = 1;
let spawnTimer = 0;
let isGameOver = false;

const maxPlayerX = GAME_CONFIG.roadWidth / 2 - GAME_CONFIG.playerWidth / 2;

// Input handling
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') inputState.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inputState.right = true;
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') inputState.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inputState.right = false;
});

// Game Loop
engine.runRenderLoop(() => {
  const deltaTime = engine.getDeltaTime() / 1000;

  if (!isGameOver) {
    // 1. Move player with smooth damping
    const moveDir = (inputState.right ? 1 : 0) - (inputState.left ? 1 : 0);
    playerState.targetX += moveDir * GAME_CONFIG.playerSpeed * deltaTime;
    playerState.targetX = Math.max(-maxPlayerX, Math.min(maxPlayerX, playerState.targetX));
    playerState.x += (playerState.targetX - playerState.x) * Math.min(1.0, GAME_CONFIG.playerDamping * deltaTime);

    // 2. Highway animation
    highway.update(GAME_CONFIG.baseObstacleSpeed, deltaTime);

    // 3. Spawner using configured interval
    spawnTimer += deltaTime * 1000;
    if (spawnTimer >= GAME_CONFIG.initialSpawnIntervalMs) {
      spawnTimer = 0;
      const laneStep = GAME_CONFIG.roadWidth / GAME_CONFIG.laneCount;
      const laneIndex = Math.floor(Math.random() * GAME_CONFIG.laneCount) - Math.floor(GAME_CONFIG.laneCount / 2);
      const laneX = laneIndex * laneStep;

      obstacles.push({
        id: nextObstacleId++,
        x: laneX,
        y: GAME_CONFIG.obstacleHeight / 2,
        z: GAME_CONFIG.spawnDistanceZ,
        width: GAME_CONFIG.obstacleWidth,
        height: GAME_CONFIG.obstacleHeight,
        depth: GAME_CONFIG.obstacleDepth,
        active: true,
      });
    }

    // 4. Update obstacles & check collisions
    const playerBox = entityToBoundingBox(
      playerState.x,
      playerState.y,
      playerState.z,
      playerState.width,
      playerState.height,
      playerState.depth
    );

    for (const obs of obstacles) {
      if (!obs.active) continue;
      obs.z -= GAME_CONFIG.baseObstacleSpeed * deltaTime;

      const obsBox = entityToBoundingBox(
        obs.x,
        obs.y,
        obs.z,
        obs.width,
        obs.height,
        obs.depth
      );

      if (checkAABBOverlap(playerBox, obsBox)) {
        isGameOver = true;
        console.warn('CRASH! Collision detected with obstacle', obs.id);
        break;
      }

      if (obs.z < GAME_CONFIG.despawnDistanceZ) {
        obs.active = false;
      }
    }

    // Clean up inactive obstacles
    obstacles = obstacles.filter((obs) => obs.active);
  }

  // Update renderers
  playerMesh.update(playerState);
  obstaclePool.updateMeshes(obstacles);

  scene.render();
});
