import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Texture,
  Mesh,
  DynamicTexture,
} from '@babylonjs/core';
import { GAME_CONFIG } from '../config';

export interface HighwayContext {
  ground: Mesh;
  update: (speed: number, deltaTime: number) => void;
}

export function createHighway(scene: Scene): HighwayContext {
  const roadWidth = GAME_CONFIG.roadWidth;
  const roadLength = GAME_CONFIG.roadLength;

  const ground = MeshBuilder.CreateGround(
    'highway',
    { width: roadWidth, height: roadLength, subdivisions: 2 },
    scene
  );
  ground.position.z = roadLength / 2 - 10;
  ground.position.y = 0;

  // Create procedural grid texture for retro cyberpunk look
  const textureSize = 512;
  const dynTexture = new DynamicTexture('highwayGrid', textureSize, scene, false);
  const ctx = dynTexture.getContext();

  ctx.fillStyle = '#0a0914';
  ctx.fillRect(0, 0, textureSize, textureSize);

  // Road borders
  ctx.strokeStyle = GAME_CONFIG.colors.primaryCyan;
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 0, textureSize - 14, textureSize);

  // Center dashed neon stripes
  ctx.strokeStyle = GAME_CONFIG.colors.accentMagenta;
  ctx.lineWidth = 8;
  ctx.setLineDash([40, 30]);
  ctx.beginPath();
  ctx.moveTo(textureSize / 2, 0);
  ctx.lineTo(textureSize / 2, textureSize);
  ctx.stroke();

  // Lateral lanes
  ctx.strokeStyle = GAME_CONFIG.colors.gridSubtle;
  ctx.lineWidth = 4;
  ctx.setLineDash([20, 20]);
  ctx.beginPath();
  ctx.moveTo(textureSize / 4, 0);
  ctx.lineTo(textureSize / 4, textureSize);
  ctx.moveTo((3 * textureSize) / 4, 0);
  ctx.lineTo((3 * textureSize) / 4, textureSize);
  ctx.stroke();

  dynTexture.update();
  dynTexture.wrapU = Texture.WRAP_ADDRESSMODE;
  dynTexture.wrapV = Texture.WRAP_ADDRESSMODE;
  dynTexture.uScale = 1;
  dynTexture.vScale = 16;

  const mat = new StandardMaterial('highwayMat', scene);
  mat.diffuseTexture = dynTexture;
  mat.emissiveColor = new Color3(0.1, 0.1, 0.2);
  mat.specularColor = new Color3(0.2, 0.2, 0.4);
  ground.material = mat;

  let offsetV = 0;
  return {
    ground,
    update: (speed: number, deltaTime: number) => {
      offsetV += (speed / roadLength) * deltaTime;
      dynTexture.vOffset = offsetV; // Positive offset streams texture towards the player (forward optical flow)
    },
  };
}
