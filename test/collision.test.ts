import { describe, it, expect } from 'vitest';
import { checkAABBOverlap, entityToBoundingBox } from '../src/core/collision';

describe('AABB Collision Math (docs/gdd/03_architecture.md)', () => {
  it('detects overlapping bounding boxes', () => {
    const boxA = entityToBoundingBox(0, 0, 0, 2, 2, 2);
    const boxB = entityToBoundingBox(1, 0, 0, 2, 2, 2);
    expect(checkAABBOverlap(boxA, boxB)).toBe(true);
  });

  it('detects disjoint bounding boxes (no collision)', () => {
    const boxA = entityToBoundingBox(0, 0, 0, 2, 2, 2);
    const boxB = entityToBoundingBox(5, 0, 0, 2, 2, 2);
    expect(checkAABBOverlap(boxA, boxB)).toBe(false);
  });

  it('detects contact at boundaries', () => {
    const boxA = entityToBoundingBox(0, 0, 0, 2, 2, 2); // X from -1 to 1
    const boxB = entityToBoundingBox(2, 0, 0, 2, 2, 2); // X from 1 to 3
    expect(checkAABBOverlap(boxA, boxB)).toBe(true);
  });
});
