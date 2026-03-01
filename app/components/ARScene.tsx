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

let materialsReady = false;

interface ARSceneProps {
  sceneNavigator: {
    viroAppProps: {
      selectedPainting: Painting | null;
      detectingWall: boolean;
      requestPlace: boolean;
      onWallFound: () => void;
      onWallPlaced: () => void;
    };
  };
}

export function ARScene({ sceneNavigator }: ARSceneProps) {
  const { selectedPainting, detectingWall, requestPlace, onWallFound, onWallPlaced } =
    sceneNavigator.viroAppProps ?? {};

  const [position, setPosition] = useState<[number, number, number]>([0, 0, -1.5]);
  const [scale, setScale] = useState<[number, number, number]>([1, 1, 1]);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [planeDims, setPlaneDims] = useState<{ w: number; h: number } | null>(null);
  const anchorRef = useRef<{ position: [number, number, number]; rotation: [number, number, number] } | null>(null);
  const floorYRef = useRef<number | null>(null);
  const ceilingYRef = useRef<number | null>(null);
  const stabilizeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingAnchor = useRef<{ position: [number, number, number]; rotation: [number, number, number]; w: number; h: number } | null>(null);
  const wallFoundRef = useRef<(() => void) | undefined>(undefined);
  const scaleAtPinchStart = useRef(1);
  const rotationAtStart = useRef(0);

  // Keep ref in sync so setTimeout callbacks always call the latest version
  wallFoundRef.current = onWallFound;

  useEffect(() => {
    if (!materialsReady) {
      ViroMaterials.createMaterials({
        wallOverlay: {
          diffuseColor: 'rgba(0, 230, 100, 0.55)',
          lightingModel: 'Constant',
        },
      });
      materialsReady = true;
    }
  }, []);

  useEffect(() => {
    setPosition([0, 0, -1.5]);
    setScale([1, 1, 1]);
    setRotation([0, 0, 0]);
  }, [selectedPainting?.id]);

  useEffect(() => {
    if (detectingWall) {
      setPlaneDims(null);
      anchorRef.current = null;
      floorYRef.current = null;
      ceilingYRef.current = null;
      pendingAnchor.current = null;
      if (stabilizeTimer.current) clearTimeout(stabilizeTimer.current);
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);

      // Fallback: if ARKit never detects a plane after 4s, unlock anyway at default position
      fallbackTimer.current = setTimeout(() => {
        wallFoundRef.current?.();
      }, 4000);
    }
    return () => {
      if (stabilizeTimer.current) clearTimeout(stabilizeTimer.current);
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, [detectingWall]);

  useEffect(() => {
    if (requestPlace) handleWallTap();
  }, [requestPlace]);

  const commitAnchor = () => {
    if (!pendingAnchor.current) return;
    const { position, rotation, w, h } = pendingAnchor.current;
    anchorRef.current = { position, rotation };
    setPlaneDims({ w, h });
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    wallFoundRef.current?.();
  };

  const scheduleCommit = () => {
    if (stabilizeTimer.current) clearTimeout(stabilizeTimer.current);
    stabilizeTimer.current = setTimeout(commitAnchor, 800);
  };

  // Pick the best Y for hanging a painting given what's been detected
  const bestHangingY = (fallback: number): number => {
    if (floorYRef.current !== null) return floorYRef.current + 1.2;
    if (ceilingYRef.current !== null) return ceilingYRef.current - 0.8;
    return fallback;
  };

  // Floor (horizontal upward) detector — most reliable, targets floor-wall junction
  const handleFloorAnchor = (anchor: any) => {
    const floorY: number = anchor.position?.[1] ?? 0;
    floorYRef.current = floorY;

    if (anchorRef.current) return;

    const w = Math.max(anchor.width ?? anchor.xExtent ?? 1, 1.2);
    const h = Math.max(anchor.height ?? anchor.yExtent ?? 1, 1.2);
    const anchorX: number = anchor.position?.[0] ?? 0;
    const anchorZ: number = anchor.position?.[2] ?? -1.5;

    pendingAnchor.current = {
      position: [anchorX, bestHangingY(floorY + 1.2), anchorZ],
      rotation: [0, 0, 0],
      w,
      h,
    };
    scheduleCommit();
  };

  // Ceiling (horizontal downward) detector — secondary reference for hanging height
  const handleCeilingAnchor = (anchor: any) => {
    const ceilingY: number = anchor.position?.[1] ?? 2.4;
    ceilingYRef.current = ceilingY;

    // Only use ceiling if no floor or wall anchor yet found
    if (anchorRef.current || floorYRef.current !== null) return;

    const w = Math.max(anchor.width ?? anchor.xExtent ?? 1, 1.2);
    const h = Math.max(anchor.height ?? anchor.yExtent ?? 1, 1.2);
    const anchorX: number = anchor.position?.[0] ?? 0;
    const anchorZ: number = anchor.position?.[2] ?? -1.5;

    pendingAnchor.current = {
      position: [anchorX, bestHangingY(ceilingY - 0.8), anchorZ],
      rotation: [0, 0, 0],
      w,
      h,
    };
    scheduleCommit();
  };

  // Wall (vertical) detector — more precise when available, overrides floor estimate
  const handleWallAnchor = (anchor: any) => {
    const w = anchor.width ?? anchor.xExtent ?? 1;
    const h = anchor.height ?? anchor.yExtent ?? 1;
    const position = anchor.position ?? [0, 0, 0];
    const rotation = anchor.rotation ?? [0, 0, 0];

    const correctedY = bestHangingY(position[1]);

    pendingAnchor.current = {
      position: [position[0], correctedY, position[2]],
      rotation,
      w,
      h,
    };
    scheduleCommit();
  };

  const handleWallTap = () => {
    if (!selectedPainting) return;
    const defaultY = bestHangingY(0);
    const pos = anchorRef.current?.position ?? [0, defaultY, -1.5];
    const rot = anchorRef.current?.rotation ?? [0, 0, 0];
    setPosition(pos as [number, number, number]);
    setRotation(rot as [number, number, number]);
    setScale([1, 1, 1]);
    onWallPlaced?.();
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

  return (
    <ViroARScene>
      {detectingWall && (
        <>
          <ViroARPlane
            minHeight={0.3}
            minWidth={0.3}
            alignment="HorizontalUpward"
            onAnchorFound={handleFloorAnchor}
            onAnchorUpdated={handleFloorAnchor}
          />
          <ViroARPlane
            minHeight={0.3}
            minWidth={0.3}
            alignment="HorizontalDownward"
            onAnchorFound={handleCeilingAnchor}
            onAnchorUpdated={handleCeilingAnchor}
          />
          <ViroARPlane
            minHeight={0.1}
            minWidth={0.1}
            alignment="Vertical"
            onAnchorFound={handleWallAnchor}
            onAnchorUpdated={handleWallAnchor}
          />

          <ViroNode
            position={anchorRef.current?.position ?? [0, bestHangingY(0), -1.5]}
            rotation={anchorRef.current?.rotation ?? [0, 0, 0]}
          >
            <ViroQuad
              width={planeDims?.w ?? 1.2}
              height={planeDims?.h ?? 1.2}
              materials={['wallOverlay']}
            />
          </ViroNode>
        </>
      )}

      {selectedPainting && (
        <ViroNode
          position={position}
          scale={scale}
          rotation={rotation}
          dragType="FixedToWorld"
          onDrag={(pos) => setPosition(pos as [number, number, number])}
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
