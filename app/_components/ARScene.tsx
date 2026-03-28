import { useCallback, useEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-native';
import {
  ViroARPlane,
  ViroARScene,
  ViroImage,
  ViroMaterials,
  ViroNode,
  ViroQuad,
  ViroSphere,
} from '@viro-community/react-viro';
import { type Painting } from '../../data/paintings';

ViroMaterials.createMaterials({
  greenSolid: {
    diffuseColor: '#00E664',
    lightingModel: 'Constant',
  },
  greenTransparent: {
    diffuseColor: '#00E66459',
    lightingModel: 'Constant',
  },
  invisible: {
    diffuseColor: '#00000000',
    lightingModel: 'Constant',
  },
  crosshairWhite: {
    diffuseColor: '#FFFFFFCC',
    lightingModel: 'Constant',
  },
  crosshairCyan: {
    diffuseColor: '#83FFF5CC',
    lightingModel: 'Constant',
  },
  crosshairPurple: {
    diffuseColor: '#A381FACC',
    lightingModel: 'Constant',
  },
});

export interface ARDebugState {
  position: [number, number, number];
  crosshairPos: [number, number, number];
  crosshairLocked: boolean;
  wallAnchor: boolean;
  cameraPos: [number, number, number];
  forward: [number, number, number];
  distance: number;
}

interface ARSceneProps {
  sceneNavigator: {
    viroAppProps: {
      selectedPainting: Painting | null;
      detectingWall: boolean;
      requestPlace: boolean;
      resetTrigger?: number;
      onWallFound: () => void;
      onWallPlaced: () => void;
      onDebugState?: (state: ARDebugState) => void;
      onDistanceUpdate?: (distance: number | null) => void;
    };
  };
}

type WallAnchor = {
  position: [number, number, number];
  rotation: [number, number, number];
  alignment: 'Horizontal' | 'Vertical';
};

function getWallNormal(anchor: WallAnchor | null): [number, number, number] {
  if (!anchor) return [0, 0, 1];
  if (anchor.alignment === 'Horizontal') return [0, 1, 0];
  const ry = (anchor.rotation[1] * Math.PI) / 180;
  return [Math.sin(ry), 0, Math.cos(ry)];
}

function projectOntoPlane(
  p: [number, number, number],
  planePoint: [number, number, number],
  normal: [number, number, number],
): [number, number, number] {
  const dist = (p[0] - planePoint[0]) * normal[0] + (p[1] - planePoint[1]) * normal[1] + (p[2] - planePoint[2]) * normal[2];
  return [p[0] - dist * normal[0], p[1] - dist * normal[1], p[2] - dist * normal[2]];
}

export function ARScene({ sceneNavigator }: ARSceneProps) {
  const { selectedPainting, detectingWall, requestPlace, resetTrigger = 0, onWallFound, onWallPlaced, onDebugState, onDistanceUpdate } =
    sceneNavigator.viroAppProps ?? {};

  const [position, setPosition] = useState<[number, number, number]>([0, 0, -2]);
  const [scale, setScale] = useState<[number, number, number]>([1, 1, 1]);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [wallAnchor, setWallAnchor] = useState<{
    position: [number, number, number];
    rotation: [number, number, number];
    w: number;
    h: number;
  } | null>(null);

  const [crosshairPos, setCrosshairPos] = useState<[number, number, number]>([0, 0, -2]);
  const [crosshairRot, setCrosshairRot] = useState<[number, number, number]>([0, 0, 0]);
  const crosshairRotStart = useRef(0);
  const crosshairPosRef = useRef<[number, number, number]>([0, 0, -2]);
  const crosshairRotRef = useRef<[number, number, number]>([0, 0, 0]);

  const wallAnchorRef = useRef<WallAnchor | null>(null);
  const lastPaintingRef = useRef(selectedPainting);
  if (selectedPainting) lastPaintingRef.current = selectedPainting;

  const wallFoundRef = useRef<(() => void) | undefined>(undefined);
  const detectingWallRef = useRef(detectingWall);
  const onDistanceUpdateRef = useRef(onDistanceUpdate);
  const activeRef = useRef(false);
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scaleAtPinchStart = useRef(1);
  const rotationAtStart = useRef(0);
  // Ref mirrors the state so handleCameraTransform (Viro callback) reads the current value
  // without closing over stale state.
  const crosshairLockedRef = useRef(false);
  const [crosshairLocked, setCrosshairLocked] = useState(false);
  const cameraPosRef = useRef<[number, number, number]>([0, 0, 0]);
  const lastLogRef = useRef<number>(0);
  const lastCrosshairUpdateRef = useRef<number>(0);
  const [cameraDebug, setCameraDebug] = useState<{ cameraPos: [number, number, number]; forward: [number, number, number]; distance: number }>({
    cameraPos: [0, 0, 0],
    forward: [0, 0, 0],
    distance: 0,
  });

  wallFoundRef.current = onWallFound;
  detectingWallRef.current = detectingWall;
  onDistanceUpdateRef.current = onDistanceUpdate;
  // Refs are updated in handleCameraTransform, onDrag, handleCrosshairRotate, resetAll.
  // Do NOT sync from state here – it overwrites with stale state when Place Here is tapped.

  useEffect(() => {
    setPosition([0, 0, -2]);
    setScale([1, 1, 1]);
    setRotation([0, 0, 0]);
  }, [selectedPainting?.id]);

  const resetAll = () => {
    activeRef.current = false;
    crosshairLockedRef.current = false;
    setCrosshairLocked(false);
    scaleAtPinchStart.current = 1;
    rotationAtStart.current = 0;
    crosshairRotStart.current = 0;
    if (fallbackRef.current) {
      clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }
    setPosition([0, 0, -2]);
    setScale([1, 1, 1]);
    setRotation([0, 0, 0]);
    setWallAnchor(null);
    wallAnchorRef.current = null;
    crosshairPosRef.current = [0, 0, -2];
    crosshairRotRef.current = [0, 0, 0];
    setCrosshairPos([0, 0, -2]);
    setCrosshairRot([0, 0, 0]);
  };

  useEffect(() => {
    resetAll();
  }, [resetTrigger]);

  useEffect(() => {
    if (detectingWall) {
      activeRef.current = true;
      crosshairLockedRef.current = false;
      setCrosshairLocked(false);
      setWallAnchor(null);
      crosshairPosRef.current = [0, 0, -2];
      crosshairRotRef.current = [0, 0, 0];
      setCrosshairPos([0, 0, -2]);
      setCrosshairRot([0, 0, 0]);

      // Some devices never fire onAnchorFound; fire onWallFound after 5s so the
      // UI never gets permanently stuck on "Scanning…".
      fallbackRef.current = setTimeout(() => {
        if (activeRef.current) wallFoundRef.current?.();
      }, 5000);
    } else {
      activeRef.current = false;
      crosshairLockedRef.current = false;
      setCrosshairLocked(false);
      setWallAnchor(null);
      crosshairPosRef.current = [0, 0, -2];
      crosshairRotRef.current = [0, 0, 0];
      setCrosshairPos([0, 0, -2]);
      setCrosshairRot([0, 0, 0]);
      if (fallbackRef.current) clearTimeout(fallbackRef.current);
    }
    return () => {
      activeRef.current = false;
      if (fallbackRef.current) clearTimeout(fallbackRef.current);
    };
  }, [detectingWall]);

  useEffect(() => {
    if (requestPlace) handlePlace();
  }, [requestPlace]);

  useEffect(() => {
    if (__DEV__ && onDebugState) {
      onDebugState({
        position,
        crosshairPos,
        crosshairLocked,
        wallAnchor: !!wallAnchor,
        cameraPos: cameraDebug.cameraPos,
        forward: cameraDebug.forward,
        distance: cameraDebug.distance,
      });
    }
  }, [position, crosshairPos, crosshairLocked, wallAnchor, cameraDebug, onDebugState]);

  const handleAnchor = (alignment: 'Horizontal' | 'Vertical') => (anchor: any) => {
    if (!activeRef.current) return;
    const w = anchor.width ?? anchor.xExtent ?? 1;
    const h = anchor.height ?? anchor.yExtent ?? 1;
    const pos: [number, number, number] = anchor.position ?? [0, 0, -2];
    const rot: [number, number, number] = anchor.rotation ?? [0, 0, 0];

    if (__DEV__) {
      const d = cameraPosRef.current
        ? Math.sqrt((pos[0] - cameraPosRef.current[0]) ** 2 + (pos[1] - cameraPosRef.current[1]) ** 2 + (pos[2] - cameraPosRef.current[2]) ** 2)
        : null;
      console.log('[AR] wall anchor', { alignment, position: pos, rotation: rot, width: w, height: h, distanceToCamera: d?.toFixed(2) });
    }
    setWallAnchor({ position: pos, rotation: rot, w, h });
    wallAnchorRef.current = { position: pos, rotation: rot, alignment };

    if (fallbackRef.current) clearTimeout(fallbackRef.current);
    wallFoundRef.current?.();
  };

  const handlePlace = () => {
    if (!selectedPainting) return;
    const pos = crosshairPosRef.current;
    const rot = crosshairRotRef.current;
    setPosition([...pos]);
    setRotation([...rot]);
    setScale([1, 1, 1]);
    const cam = cameraPosRef.current;
    if (onDistanceUpdate) {
      const d = Math.sqrt((pos[0] - cam[0]) ** 2 + (pos[1] - cam[1]) ** 2 + (pos[2] - cam[2]) ** 2);
      onDistanceUpdate(d);
    }
    onWallPlaced?.();
  };

  const handleCrosshairRotate = (rotateState: number, rotationFactor: number) => {
    if (rotateState === 1) {
      crosshairRotStart.current = crosshairRot[2];
    } else if (rotateState === 2) {
      crosshairLockedRef.current = true;
      setCrosshairLocked(true);
      const newRot: [number, number, number] = [0, 0, crosshairRotStart.current + rotationFactor];
      crosshairRotRef.current = newRot;
      setCrosshairRot(newRot);
    }
  };

  const handlePinch = (pinchState: number, scaleFactor: number) => {
    if (pinchState === 1) {
      scaleAtPinchStart.current = scale[0];
    } else if (pinchState === 2) {
      const next = Math.max(0.1, Math.min(3, scaleAtPinchStart.current * scaleFactor));
      setScale([next, next, next]);
    }
  };

  const handleRotate = (rotateState: number, rotationFactor: number) => {
    if (rotateState === 1) {
      rotationAtStart.current = rotation[2];
    } else if (rotateState === 2) {
      setRotation([0, 0, rotationAtStart.current + rotationFactor]);
    }
  };

  const planeMaterial = detectingWall ? 'greenTransparent' : 'invisible';

  const handleCameraTransform = useCallback((update: {
    cameraTransform?: { position?: number[]; rotation?: number[]; forward?: number[] };
    position?: number[];
    pos?: number[];
    forward?: number[];
    rotation?: number[];
    rot?: number[];
  }) => {
    // Stop following the camera once the user has manually dragged or rotated
    // the crosshair so their chosen position isn't overwritten every frame.
    if (!detectingWallRef.current || crosshairLockedRef.current) return;
    const ct = update.cameraTransform ?? update;
    const pos = ct.position ?? ct.pos ?? update.position ?? update.pos;
    const forward = ct.forward ?? update.forward;
    if (!pos || !forward || pos.length < 3 || forward.length < 3) return;
    const [px, py, pz] = pos;
    const [fx, fy, fz] = forward;
    cameraPosRef.current = [px, py, pz];
    // Ray-plane intersection: cast the camera forward ray onto the detected wall plane.
    // Falls back to 2m projection if no anchor yet or ray is parallel to the plane.
    let newPos: [number, number, number];
    const anchor = wallAnchorRef.current;
    if (anchor) {
      const [nx, ny, nz] = getWallNormal(anchor);
      const denom = nx * fx + ny * fy + nz * fz;
      if (Math.abs(denom) > 1e-4) {
        const [wpx, wpy, wpz] = anchor.position;
        const t = ((wpx - px) * nx + (wpy - py) * ny + (wpz - pz) * nz) / denom;
        if (t > 0.1) {
          newPos = [px + fx * t, py + fy * t, pz + fz * t];
        } else {
          newPos = [px + fx * 2, py + fy * 2, pz + fz * 2];
        }
      } else {
        newPos = [px + fx * 2, py + fy * 2, pz + fz * 2];
      }
    } else {
      newPos = [px + fx * 2, py + fy * 2, pz + fz * 2];
    }
    crosshairPosRef.current = newPos;

    const now = Date.now();
    // Throttle React state updates to ~30fps to avoid flooding the render queue.
    // The refs above are always current for logic; state drives visual updates only.
    if (now - lastCrosshairUpdateRef.current > 33) {
      lastCrosshairUpdateRef.current = now;
      // When a wall anchor exists orient the crosshair to face the wall surface.
      // Without an anchor, fall back to camera rotation so the crosshair tracks naturally.
      const wallRot: [number, number, number] | null = anchor
        ? [0, anchor.rotation[1], 0]
        : (() => {
            const rot = ct.rotation ?? ct.rot ?? update.rotation ?? update.rot;
            return rot && rot.length >= 3 ? (rot as [number, number, number]) : null;
          })();
      if (wallRot) crosshairRotRef.current = wallRot;
      const [tx, ty, tz] = newPos;
      const d = Math.sqrt((tx - px) ** 2 + (ty - py) ** 2 + (tz - pz) ** 2);
      const logNow = __DEV__ && now - lastLogRef.current > 500;
      if (logNow) lastLogRef.current = now;
      // Batch all setState calls so Viro's native callback never triggers nested
      // React reconciliations that exceed the max update depth.
      unstable_batchedUpdates(() => {
        setCrosshairPos(newPos);
        if (wallRot) setCrosshairRot(wallRot);
        if (onDistanceUpdateRef.current) onDistanceUpdateRef.current(d);
        if (logNow) setCameraDebug({ cameraPos: [px, py, pz], forward: [fx, fy, fz], distance: d });
      });
    }
  }, []);

  return (
    <ViroARScene onCameraTransformUpdate={handleCameraTransform}>
      {/* Keep plane detectors + crosshair always mounted to avoid Viro unmount crash on Cancel */}
      <ViroNode
        position={crosshairPos}
        rotation={crosshairRot}
        scale={detectingWall ? [1, 1, 1] : [0.001, 0.001, 0.001]}
        dragType="FixedToWorld"
        onDrag={detectingWall ? (pos) => {
          const p = pos as [number, number, number];
          const dragAnchor = wallAnchorRef.current;
          const newPos = dragAnchor
            ? projectOntoPlane(p, dragAnchor.position, getWallNormal(dragAnchor))
            : ([p[0], p[1], crosshairPosRef.current[2]] as [number, number, number]);
          crosshairLockedRef.current = true;
          setCrosshairLocked(true);
          crosshairPosRef.current = newPos;
          setCrosshairPos(newPos);
        } : undefined}
        onRotate={detectingWall ? handleCrosshairRotate : undefined}
      >
        {/* Corner brackets – white */}
        <ViroQuad width={0.07} height={0.002} position={[-0.175, 0.21, 0]} materials={['crosshairWhite']} />
        <ViroQuad width={0.002} height={0.07} position={[-0.21, 0.175, 0]} materials={['crosshairWhite']} />
        <ViroQuad width={0.07} height={0.002} position={[0.175, 0.21, 0]} materials={['crosshairWhite']} />
        <ViroQuad width={0.002} height={0.07} position={[0.21, 0.175, 0]} materials={['crosshairWhite']} />
        <ViroQuad width={0.07} height={0.002} position={[-0.175, -0.21, 0]} materials={['crosshairWhite']} />
        <ViroQuad width={0.002} height={0.07} position={[-0.21, -0.175, 0]} materials={['crosshairWhite']} />
        <ViroQuad width={0.07} height={0.002} position={[0.175, -0.21, 0]} materials={['crosshairWhite']} />
        <ViroQuad width={0.002} height={0.07} position={[0.21, -0.175, 0]} materials={['crosshairWhite']} />
        {/* Inner rectangle outline – cyan */}
        <ViroQuad width={0.273} height={0.002} position={[0, 0.137, 0]} materials={['crosshairCyan']} />
        <ViroQuad width={0.273} height={0.002} position={[0, -0.137, 0]} materials={['crosshairCyan']} />
        <ViroQuad width={0.002} height={0.273} position={[-0.137, 0, 0]} materials={['crosshairCyan']} />
        <ViroQuad width={0.002} height={0.273} position={[0.137, 0, 0]} materials={['crosshairCyan']} />
        {/* Center circle – purple */}
        <ViroSphere radius={0.008} position={[0, 0, 0]} materials={['crosshairPurple']} />
      </ViroNode>

      {/* Two plane detectors: Horizontal catches floors/ceilings, Vertical catches walls.
          onAnchorUpdated reuses handleAnchor so the anchor position stays fresh as
          the device refines its understanding of the surface. */}
      <ViroARPlane
        minHeight={0.2}
        minWidth={0.2}
        alignment="Horizontal"
        onAnchorFound={handleAnchor('Horizontal')}
        onAnchorUpdated={handleAnchor('Horizontal')}
      >
        <ViroQuad
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          width={1}
          height={1}
          materials={[planeMaterial]}
        />
      </ViroARPlane>

      <ViroARPlane
        minHeight={0.2}
        minWidth={0.2}
        alignment="Vertical"
        onAnchorFound={handleAnchor('Vertical')}
        onAnchorUpdated={handleAnchor('Vertical')}
      >
        <ViroQuad
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          width={1}
          height={1}
          materials={[planeMaterial]}
        />
      </ViroARPlane>

      {/* Always mounted to avoid Viro unmount crash; hidden via scale when no painting selected */}
      {lastPaintingRef.current && (
        <ViroNode
          position={position}
          scale={selectedPainting ? scale : [0.001, 0.001, 0.001]}
          rotation={rotation}
          dragType="FixedToWorld"
          onDrag={selectedPainting ? (pos) => {
            const p = pos as [number, number, number];
            const paintAnchor = wallAnchorRef.current;
            const newPos = paintAnchor
              ? projectOntoPlane(p, paintAnchor.position, getWallNormal(paintAnchor))
              : ([p[0], p[1], position[2]] as [number, number, number]);
            setPosition(newPos);
          } : undefined}
          onPinch={selectedPainting ? handlePinch : undefined}
          onRotate={selectedPainting ? handleRotate : undefined}
        >
          <ViroImage
            source={{ uri: lastPaintingRef.current.uri }}
            width={lastPaintingRef.current.width}
            height={lastPaintingRef.current.height}
            resizeMode="ScaleToFill"
          />
        </ViroNode>
      )}
    </ViroARScene>
  );
}
