export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export interface ObstacleEntity {
  id: number;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  active: boolean;
}

export interface PlayerState {
  x: number;
  targetX: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  tilt: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  touchActive: boolean;
  touchNormalizedX: number;
}
