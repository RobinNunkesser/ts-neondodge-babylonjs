import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Mesh,
} from '@babylonjs/core';
import { ObstacleEntity } from '../types';

export interface ObstaclePoolContext {
  updateMeshes: (entities: ObstacleEntity[]) => void;
  disposeAll: () => void;
}

export function createObstaclePool(scene: Scene): ObstaclePoolContext {
  const meshMap = new Map<number, Mesh>();

  const mat = new StandardMaterial('obstacleMat', scene);
  mat.diffuseColor = new Color3(0.1, 0.0, 0.05);
  mat.emissiveColor = new Color3(1.0, 0.0, 0.35); // Hot Magenta
  mat.specularColor = new Color3(1, 0.5, 0.7);

  const getOrCreateMesh = (entity: ObstacleEntity): Mesh => {
    let mesh = meshMap.get(entity.id);
    if (!mesh) {
      mesh = MeshBuilder.CreateBox(
        `obstacle_${entity.id}`,
        { width: entity.width, height: entity.height, depth: entity.depth },
        scene
      );
      mesh.material = mat;
      meshMap.set(entity.id, mesh);
    }
    return mesh;
  };

  return {
    updateMeshes: (entities: ObstacleEntity[]) => {
      const activeIds = new Set(entities.filter((e) => e.active).map((e) => e.id));

      // Remove inactive or despawned meshes
      for (const [id, mesh] of meshMap.entries()) {
        if (!activeIds.has(id)) {
          mesh.dispose();
          meshMap.delete(id);
        }
      }

      // Update positions of active meshes
      for (const entity of entities) {
        if (entity.active) {
          const mesh = getOrCreateMesh(entity);
          mesh.position.set(entity.x, entity.y, entity.z);
        }
      }
    },
    disposeAll: () => {
      for (const mesh of meshMap.values()) {
        mesh.dispose();
      }
      meshMap.clear();
    },
  };
}
