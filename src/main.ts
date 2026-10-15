import { Vector3 } from '@babylonjs/core';
import { createScene } from './render/scene';
import { createHighway } from './render/highway';
import { createPlayerMesh } from './render/player';
import { createObstaclePool } from './render/obstacles';
import { createJuice } from './render/juice';
import { checkAABBOverlap, entityToBoundingBox } from './core/collision';
import { GameStateMachine } from './core/state';
import { calculateScore, getStoredHighscore, saveHighscore } from './core/score';
import { PlayerState, ObstacleEntity, InputState } from './types';
import { GAME_CONFIG } from './config';

// 1. Elements & DOM Bindings
const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const hud = document.getElementById('hud') as HTMLElement;
const scoreDisplay = document.getElementById('score-display') as HTMLElement;
const speedDisplay = document.getElementById('speed-display') as HTMLElement;
const highscoreDisplay = document.getElementById('highscore-display') as HTMLElement;

const menuOverlay = document.getElementById('menu-overlay') as HTMLElement;
const pauseOverlay = document.getElementById('pause-overlay') as HTMLElement;
const gameoverOverlay = document.getElementById('gameover-overlay') as HTMLElement;
const finalScore = document.getElementById('final-score') as HTMLElement;
const finalBest = document.getElementById('final-best') as HTMLElement;

const btnStart = document.getElementById('btn-start') as HTMLButtonElement;
const btnResume = document.getElementById('btn-resume') as HTMLButtonElement;
const btnRestart = document.getElementById('btn-restart') as HTMLButtonElement;

// 2. Engine & Scene Setup
const { engine, scene, camera } = createScene(canvas);
const highway = createHighway(scene);
const playerMesh = createPlayerMesh(scene);
const obstaclePool = createObstaclePool(scene);
const juice = createJuice(scene, camera);

// 3. State & Logic Setup
const fsm = new GameStateMachine('MENU');
let elapsedGameTime = 0;
let nearMissCount = 0;
let currentScore = 0;
let currentSpeed: number = GAME_CONFIG.baseObstacleSpeed;
let highscore = getStoredHighscore();
highscoreDisplay.textContent = highscore.toString();

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

const maxPlayerX = GAME_CONFIG.roadWidth / 2 - GAME_CONFIG.playerWidth / 2;

// 4. UI Transition Helper
function updateUIOverlays(): void {
  const state = fsm.getState();
  menuOverlay.classList.toggle('active', state === 'MENU');
  menuOverlay.classList.toggle('hidden', state !== 'MENU');

  pauseOverlay.classList.toggle('active', state === 'PAUSED');
  pauseOverlay.classList.toggle('hidden', state !== 'PAUSED');

  gameoverOverlay.classList.toggle('active', state === 'GAME_OVER');
  gameoverOverlay.classList.toggle('hidden', state !== 'GAME_OVER');

  hud.classList.toggle('hidden', state === 'MENU');

  if (state === 'GAME_OVER') {
    finalScore.textContent = currentScore.toString();
    finalBest.textContent = highscore.toString();
  }
}

function startOrRestartGame(): void {
  elapsedGameTime = 0;
  nearMissCount = 0;
  currentScore = 0;
  currentSpeed = GAME_CONFIG.baseObstacleSpeed;
  spawnTimer = 0;
  obstacles = [];
  obstaclePool.disposeAll();

  playerState.x = 0;
  playerState.targetX = 0;
  playerState.tilt = 0;

  fsm.transition('START');
  updateUIOverlays();
}

btnStart.addEventListener('click', startOrRestartGame);
btnRestart.addEventListener('click', startOrRestartGame);
btnResume.addEventListener('click', () => {
  fsm.transition('TOGGLE_PAUSE');
  updateUIOverlays();
});

// 5. Input Handling: Desktop Keyboard
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') inputState.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inputState.right = true;

  if (e.key === ' ' || e.code === 'Space') {
    if (fsm.getState() === 'MENU' || fsm.getState() === 'GAME_OVER') {
      startOrRestartGame();
    }
  }

  if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
    if (fsm.getState() === 'PLAYING' || fsm.getState() === 'PAUSED') {
      fsm.transition('TOGGLE_PAUSE');
      updateUIOverlays();
    }
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') inputState.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inputState.right = false;
});

// 6. Input Handling: Mobile Pointer / Touch Drag (Dual-Target)
canvas.addEventListener('pointerdown', (e) => {
  if (fsm.getState() === 'PLAYING') {
    inputState.touchActive = true;
    updateTouchTarget(e.clientX);
  }
});

window.addEventListener('pointermove', (e) => {
  if (inputState.touchActive && fsm.getState() === 'PLAYING') {
    updateTouchTarget(e.clientX);
  }
});

window.addEventListener('pointerup', () => {
  inputState.touchActive = false;
});

function updateTouchTarget(clientX: number): void {
  const rect = canvas.getBoundingClientRect();
  const normalizedX = ((clientX - rect.left) / rect.width) * 2 - 1; // [-1, +1]
  playerState.targetX = normalizedX * maxPlayerX;
}

// Initial UI
updateUIOverlays();

// 7. Game Loop
engine.runRenderLoop(() => {
  const deltaTime = engine.getDeltaTime() / 1000;
  const currentState = fsm.getState();

  juice.update(deltaTime);

  if (currentState === 'PLAYING') {
    elapsedGameTime += deltaTime;

    // Speed progression
    const speedProgress = Math.min(
      GAME_CONFIG.maxObstacleSpeed,
      GAME_CONFIG.baseObstacleSpeed + (elapsedGameTime / 60) * GAME_CONFIG.speedIncreasePerMin
    );
    currentSpeed = speedProgress;

    // Scoring
    currentScore = calculateScore(elapsedGameTime, nearMissCount);
    scoreDisplay.textContent = currentScore.toString();
    speedDisplay.textContent = Math.round(currentSpeed).toString();

    // 1. Move player with smooth damping & banking tilt (Juice)
    if (!inputState.touchActive) {
      const moveDir = (inputState.right ? 1 : 0) - (inputState.left ? 1 : 0);
      playerState.targetX += moveDir * GAME_CONFIG.playerSpeed * deltaTime;
    }
    playerState.targetX = Math.max(-maxPlayerX, Math.min(maxPlayerX, playerState.targetX));
    const deltaX = playerState.targetX - playerState.x;
    playerState.x += deltaX * Math.min(1.0, GAME_CONFIG.playerDamping * deltaTime);

    // Dynamic Banking Tilt
    const targetTilt = -Math.max(-1, Math.min(1, deltaX * 1.5)) * GAME_CONFIG.playerMaxTilt;
    playerState.tilt += (targetTilt - playerState.tilt) * Math.min(1.0, 10.0 * deltaTime);

    // 2. Highway animation
    highway.update(currentSpeed, deltaTime);

    // 3. Spawner
    spawnTimer += deltaTime * 1000;
    const currentSpawnInterval = Math.max(
      GAME_CONFIG.minSpawnIntervalMs,
      GAME_CONFIG.initialSpawnIntervalMs - (elapsedGameTime / 60) * 120
    );

    if (spawnTimer >= currentSpawnInterval) {
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
      obs.z -= currentSpeed * deltaTime;

      const obsBox = entityToBoundingBox(
        obs.x,
        obs.y,
        obs.z,
        obs.width,
        obs.height,
        obs.depth
      );

      // Collision detection with Screen Shake & Particles
      if (checkAABBOverlap(playerBox, obsBox)) {
        fsm.transition('COLLISION');
        juice.triggerScreenShake();
        juice.triggerCrashParticles(new Vector3(playerState.x, playerState.y, playerState.z));

        if (saveHighscore(currentScore)) {
          highscore = currentScore;
          highscoreDisplay.textContent = highscore.toString();
        }
        updateUIOverlays();
        break;
      }

      // Near Miss bonus check
      if (Math.abs(obs.z - playerState.z) < 1.0 && Math.abs(obs.x - playerState.x) < GAME_CONFIG.obstacleWidth) {
        nearMissCount++;
      }

      if (obs.z < GAME_CONFIG.despawnDistanceZ) {
        obs.active = false;
      }
    }

    // Clean up inactive obstacles
    obstacles = obstacles.filter((obs) => obs.active);
  } else if (currentState === 'MENU') {
    // Idle background effect
    highway.update(10.0, deltaTime);
    playerState.y = 0.6 + Math.sin(Date.now() * 0.003) * 0.1;
    playerState.tilt = Math.sin(Date.now() * 0.002) * 0.05;
  }

  // Update renderers
  playerMesh.update(playerState);
  obstaclePool.updateMeshes(obstacles);

  scene.render();
});
