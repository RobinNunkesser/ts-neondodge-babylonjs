import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Mesh,
  Vector3,
} from '@babylonjs/core';
import { PlayerState } from '../types';

export interface PlayerMeshContext {
  root: Mesh;
  update: (state: PlayerState) => void;
}

export function createPlayerMesh(scene: Scene): PlayerMeshContext {
  const root = new Mesh('playerRoot', scene);
  root.position = new Vector3(0, 0.6, 0);

  // Main fuselage (slanted cylinder/prism)
  const body = MeshBuilder.CreateCylinder(
    'playerBody',
    { height: 2.2, diameterTop: 0.2, diameterBottom: 1.4, tessellation: 4 },
    scene
  );
  body.rotation.x = Math.PI / 2;
  body.parent = root;

  const bodyMat = new StandardMaterial('playerBodyMat', scene);
  bodyMat.diffuseColor = new Color3(0.05, 0.05, 0.1);
  bodyMat.emissiveColor = new Color3(0.0, 0.8, 1.0); // Cyan glow
  bodyMat.specularColor = new Color3(1, 1, 1);
  body.material = bodyMat;

  // Wings
  const wings = MeshBuilder.CreateBox(
    'playerWings',
    { width: 2.4, height: 0.12, depth: 0.8 },
    scene
  );
  wings.position.z = -0.3;
  wings.parent = root;

  const wingMat = new StandardMaterial('playerWingMat', scene);
  wingMat.emissiveColor = new Color3(0.8, 0.0, 0.4); // Magenta accent
  wings.material = wingMat;

  // Thruster glow
  const thruster = MeshBuilder.CreateSphere(
    'thruster',
    { diameter: 0.4, segments: 8 },
    scene
  );
  thruster.position.z = -1.1;
  thruster.position.y = 0.05;
  thruster.parent = root;

  const thrusterMat = new StandardMaterial('thrusterMat', scene);
  thrusterMat.emissiveColor = new Color3(1.0, 0.9, 0.1); // Golden yellow
  thruster.material = thrusterMat;

  return {
    root,
    update: (state: PlayerState) => {
      root.position.x = state.x;
      root.position.y = state.y;
      root.position.z = state.z;
      root.rotation.z = state.tilt;
    },
  };
}
