import { BoundingBox } from '../types';

export function checkAABBOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.minX <= b.maxX &&
    a.maxX >= b.minX &&
    a.minY <= b.maxY &&
    a.maxY >= b.minY &&
    a.minZ <= b.maxZ &&
    a.maxZ >= b.minZ
  );
}

export function entityToBoundingBox(
  x: number,
  y: number,
  z: number,
  width: number,
  height: number,
  depth: number
): BoundingBox {
  const halfW = width / 2;
  const halfH = height / 2;
  const halfD = depth / 2;
  return {
    minX: x - halfW,
    maxX: x + halfW,
    minY: y - halfH,
    maxY: y + halfH,
    minZ: z - halfD,
    maxZ: z + halfD,
  };
}
