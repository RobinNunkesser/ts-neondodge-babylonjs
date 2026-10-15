import { createScene } from './render/scene';
import { createHighway } from './render/highway';
import { createPlayerMesh } from './render/player';
import { createObstaclePool } from './render/obstacles';
import { checkAABBOverlap, entityToBoundingBox } from './core/collision';
import { PlayerState, ObstacleEntity, InputState } from './types';

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const { engine, scene } = createScene(canvas);
const highway = createHighway(scene, 14, 140);
const playerMesh = createPlayerMesh(scene);
const obstaclePool = createObstaclePool(scene);

// Initial state for Phase 1 (Scaffolding & Core Loop)
const playerState: PlayerState = {
  x: 0,
  targetX: 0,
  y: 0.6,
  z: 0,
  width: 2.0,
  height: 0.8,
  depth: 2.2,
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

// Input handling (Phase 1 basic keyboard)
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
    // 1. Move player
    const moveDir = (inputState.right ? 1 : 0) - (inputState.left ? 1 : 0);
    playerState.targetX += moveDir * 18.0 * deltaTime;
    playerState.targetX = Math.max(-6.0, Math.min(6.0, playerState.targetX));
    playerState.x += (playerState.targetX - playerState.x) * Math.min(1.0, 12.0 * deltaTime);

    // 2. Highway animation
    highway.update(24.0, deltaTime);

    // 3. Spawner
    spawnTimer += deltaTime;
    if (spawnTimer >= 0.9) {
      spawnTimer = 0;
      const laneX = (Math.floor(Math.random() * 5) - 2) * 2.8; // 5 lanes
      obstacles.push({
        id: nextObstacleId++,
        x: laneX,
        y: 1.1,
        z: 85,
        width: 2.6,
        height: 2.2,
        depth: 1.5,
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
      obs.z -= 24.0 * deltaTime;

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

      if (obs.z < -10) {
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
