import {
  Engine,
  Scene,
  Vector3,
  Color3,
  Color4,
  HemisphericLight,
  UniversalCamera,
  GlowLayer,
} from '@babylonjs/core';
import { GAME_CONFIG } from '../config';

export interface SceneContext {
  engine: Engine;
  scene: Scene;
  camera: UniversalCamera;
  glow: GlowLayer;
}

export function createScene(canvas: HTMLCanvasElement): SceneContext {
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
  const scene = new Scene(engine);
  scene.clearColor = Color4.FromHexString(GAME_CONFIG.colors.bgVoid + 'ff');

  // Camera looking down the highway (+Z)
  const camera = new UniversalCamera('chaseCamera', new Vector3(0, 3.5, -8), scene);
  camera.setTarget(new Vector3(0, 1.0, 10));

  // Lighting
  const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0.6;
  hemiLight.diffuse = new Color3(0.8, 0.9, 1.0);
  hemiLight.groundColor = new Color3(0.1, 0.05, 0.15);

  // Glow Layer for Cyberpunk Neon Bloom
  const glow = new GlowLayer('glow', scene, {
    blurKernelSize: 32,
  });
  glow.intensity = GAME_CONFIG.glowIntensity;

  window.addEventListener('resize', () => {
    engine.resize();
  });

  return { engine, scene, camera, glow };
}
