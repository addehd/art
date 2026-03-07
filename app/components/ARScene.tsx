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

  const wallFoundRef = useRef<(() => void) | undefined>(undefined);
  const activeRef = useRef(false);
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scaleAtPinchStart = useRef(1);
  const rotationAtStart = useRef(0);
  const crosshairLockedRef = useRef(false);

  wallFoundRef.current = onWallFound;

  useEffect(() => {
    setPosition([0, 0, -2]);
    setScale([1, 1, 1]);
    setRotation([0, 0, 0]);
  }, [selectedPainting?.id]);

  useEffect(() => {
    if (detectingWall) {
      activeRef.current = true;
      crosshairLockedRef.current = false;
      setWallAnchor(null);
      setCrosshairPos([0, 0, -2]);
      setCrosshairRot([0, 0, 0]);

      fallbackRef.current = setTimeout(() => {
        if (activeRef.current) wallFoundRef.current?.();
      }, 5000);
    } else {
      activeRef.current = false;
      setWallAnchor(null);
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
    setPosition(crosshairPos);
    setRotation(crosshairRot);
    setScale([1, 1, 1]);
    onWallPlaced?.();
  };

  const handleCrosshairRotate = (rotateState: number, rotationFactor: number) => {
    if (rotateState === 1) {
      crosshairRotStart.current = crosshairRot[2];
    } else if (rotateState === 2) {
      crosshairLockedRef.current = true;
      setCrosshairRot([0, 0, crosshairRotStart.current + rotationFactor]);
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
    setCrosshairPos([px + fx * dist, py + fy * dist, pz + fz * dist]);
    const rot = ct.rotation ?? ct.rot ?? update.rotation ?? update.rot;
    if (rot && rot.length >= 3) setCrosshairRot(rot as [number, number, number]);
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
          const p = pos as [number, number, number];
          setCrosshairPos([p[0], p[1], crosshairPos[2]]);
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
