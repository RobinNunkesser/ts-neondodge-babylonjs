import {
  Scene,
  Vector3,
  Color4,
  ParticleSystem,
  Texture,
  UniversalCamera,
} from '@babylonjs/core';
import { GAME_CONFIG } from '../config';

export interface JuiceContext {
  triggerScreenShake: () => void;
  triggerCrashParticles: (position: Vector3) => void;
  update: (deltaTime: number) => void;
}

export function createJuice(scene: Scene, camera: UniversalCamera): JuiceContext {
  let shakeTimeRemaining = 0;
  const initialCameraPos = camera.position.clone();

  // Create Neon Crash Particle System
  const particleSystem = new ParticleSystem('crashParticles', GAME_CONFIG.particleCountCrash, scene);
  // Procedural 16x16 spark texture
  particleSystem.particleTexture = new Texture(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVR42mNk+M9QzwAEjAwMDAwMSDEgNlEGI378H4kYRk1AxAOGVAP+ow4k0QB2kAwAiicX4iUuQWcAAAAASUVORK5CYII=',
    scene
  );

  particleSystem.emitter = new Vector3(0, 0, 0);
  particleSystem.minSize = 0.2;
  particleSystem.maxSize = 0.6;
  particleSystem.minLifeTime = 0.3;
  particleSystem.maxLifeTime = 0.8;
  particleSystem.emitRate = 300;
  particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;
  particleSystem.gravity = new Vector3(0, -9.81, 0);
  particleSystem.direction1 = new Vector3(-2, 3, -2);
  particleSystem.direction2 = new Vector3(2, 4, 2);
  particleSystem.color1 = Color4.FromHexString(GAME_CONFIG.colors.accentMagenta + 'ff');
  particleSystem.color2 = Color4.FromHexString(GAME_CONFIG.colors.primaryCyan + 'ff');
  particleSystem.colorDead = new Color4(0, 0, 0, 0);

  return {
    triggerScreenShake: () => {
      shakeTimeRemaining = GAME_CONFIG.shakeDurationMs / 1000;
    },

    triggerCrashParticles: (position: Vector3) => {
      particleSystem.emitter = position;
      particleSystem.manualEmitCount = GAME_CONFIG.particleCountCrash;
      particleSystem.start();
    },

    update: (deltaTime: number) => {
      if (shakeTimeRemaining > 0) {
        shakeTimeRemaining -= deltaTime;
        const progress = Math.max(0, shakeTimeRemaining / (GAME_CONFIG.shakeDurationMs / 1000));
        const currentMagnitude = GAME_CONFIG.shakeMagnitude * progress;

        camera.position.x = initialCameraPos.x + (Math.random() - 0.5) * currentMagnitude * 2;
        camera.position.y = initialCameraPos.y + (Math.random() - 0.5) * currentMagnitude * 2;
      } else {
        camera.position.x = initialCameraPos.x;
        camera.position.y = initialCameraPos.y;
      }
    },
  };
}
