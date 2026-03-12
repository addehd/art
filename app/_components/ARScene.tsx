/**
 * AR Scene – placement verification notes (Phase 1)
 *
 * 1. Crosshair locked: handleCameraTransform returns early when crosshairLockedRef.current
 *    (L184). Lock set in handleCrosshairRotate (L154) and onDrag (L209); cleared in resetAll
 *    and when detectingWall becomes true.
 * 2. wallAnchor unused for placement: handlePlace (L139-146) uses only crosshairPosRef and
 *    crosshairRotRef. wallAnchor is never passed to setPosition/setRotation.
 * 3. Initial state: position defaults to [0,0,-2] (L45); reset on selectedPainting change (L71-75).
 *    Image appears at default until "Place Here" copies crosshair position.
 */
import { useEffect, useRef, useState } from 'react';
import {
  ViroARPlane,
  ViroARScene,
  ViroImage,
  ViroMaterials,
  ViroNode,
  ViroQuad,
} from '@viro-community/react-viro';
import { type Painting } from '../../data/paintings';

ViroMaterials.createMaterials({
  greenSolid: {
    diffuseColor: '#00E664',
    lightingModel: 'Constant',
  },
  greenTransparent: {
    diffuseColor: '#00E664',
    lightingModel: 'Constant',
    opacity: 0.35,
  },
  invisible: {
    diffuseColor: '#000000',
    lightingModel: 'Constant',
    opacity: 0,
  },
});

export interface ARDebugState {
  position: [number, number, number];
  crosshairPos: [number, number, number];
  crosshairLocked: boolean;
  wallAnchor: boolean;
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
    };
  };
}

export function ARScene({ sceneNavigator }: ARSceneProps) {
  const { selectedPainting, detectingWall, requestPlace, resetTrigger = 0, onWallFound, onWallPlaced, onDebugState } =
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

  const wallFoundRef = useRef<(() => void) | undefined>(undefined);
  const activeRef = useRef(false);
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scaleAtPinchStart = useRef(1);
  const rotationAtStart = useRef(0);
  const crosshairLockedRef = useRef(false);
  const [crosshairLocked, setCrosshairLocked] = useState(false);

  wallFoundRef.current = onWallFound;
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
      });
    }
  }, [position, crosshairPos, crosshairLocked, wallAnchor, onDebugState]);

  const handleAnchor = (anchor: any) => {
    if (!activeRef.current) return;
    const w = anchor.width ?? anchor.xExtent ?? 1;
    const h = anchor.height ?? anchor.yExtent ?? 1;
    const pos: [number, number, number] = anchor.position ?? [0, 0, -2];
    const rot: [number, number, number] = anchor.rotation ?? [0, 0, 0];

    setWallAnchor({ position: pos, rotation: rot, w, h });

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
  const crosshairMaterial = detectingWall ? 'greenSolid' : 'invisible';

  const handleCameraTransform = (update: {
    cameraTransform?: { position?: number[]; rotation?: number[]; forward?: number[] };
    position?: number[];
    pos?: number[];
    forward?: number[];
    rotation?: number[];
    rot?: number[];
  }) => {
    if (!detectingWall || crosshairLockedRef.current) return;
    const ct = update.cameraTransform ?? update;
    const pos = ct.position ?? ct.pos ?? update.position ?? update.pos;
    const forward = ct.forward ?? update.forward;
    if (!pos || !forward || pos.length < 3 || forward.length < 3) return;
    const [px, py, pz] = pos;
    const [fx, fy, fz] = forward;
    const dist = 2;
    const newPos: [number, number, number] = [px + fx * dist, py + fy * dist, pz + fz * dist];
    crosshairPosRef.current = newPos;
    setCrosshairPos(newPos);
    const rot = ct.rotation ?? ct.rot ?? update.rotation ?? update.rot;
    if (rot && rot.length >= 3) {
      const newRot = rot as [number, number, number];
      crosshairRotRef.current = newRot;
      setCrosshairRot(newRot);
    }
  };

  return (
    <ViroARScene onCameraTransformUpdate={handleCameraTransform}>
      {/* Keep plane detectors + crosshair always mounted to avoid Viro unmount crash on Cancel */}
      <ViroNode
        position={crosshairPos}
        rotation={crosshairRot}
        scale={detectingWall ? [1, 1, 1] : [0.001, 0.001, 0.001]}
        dragType="FixedToWorld"
        onDrag={detectingWall ? (pos) => {
          crosshairLockedRef.current = true;
          setCrosshairLocked(true);
          const p = pos as [number, number, number];
          const newPos: [number, number, number] = [p[0], p[1], crosshairPosRef.current[2]];
          crosshairPosRef.current = newPos;
          setCrosshairPos(newPos);
        } : undefined}
        onRotate={detectingWall ? handleCrosshairRotate : undefined}
      >
        <ViroQuad
          width={0.6}
          height={0.005}
          position={[0, 0, 0]}
          materials={[crosshairMaterial]}
        />
        <ViroQuad
          width={0.005}
          height={0.6}
          position={[0, 0, 0]}
          materials={[crosshairMaterial]}
        />
      </ViroNode>

      <ViroARPlane
        minHeight={0.2}
        minWidth={0.2}
        alignment="Horizontal"
        onAnchorFound={handleAnchor}
        onAnchorUpdated={handleAnchor}
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
        onAnchorFound={handleAnchor}
        onAnchorUpdated={handleAnchor}
      >
        <ViroQuad
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          width={1}
          height={1}
          materials={[planeMaterial]}
        />
      </ViroARPlane>

      {selectedPainting && (
        <ViroNode
          position={position}
          scale={scale}
          rotation={rotation}
          dragType="FixedToWorld"
          onDrag={(pos) => {
            const p = pos as [number, number, number];
            setPosition([p[0], p[1], position[2]]);
          }}
          onPinch={handlePinch}
          onRotate={handleRotate}
        >
          <ViroImage
            source={{ uri: selectedPainting.uri }}
            width={selectedPainting.width}
            height={selectedPainting.height}
            resizeMode="ScaleToFill"
          />
        </ViroNode>
      )}
    </ViroARScene>
  );
}
