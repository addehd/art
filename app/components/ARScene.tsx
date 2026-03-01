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
      onWallPlaced: () => void;
    };
  };
}

export function ARScene({ sceneNavigator }: ARSceneProps) {
  const { selectedPainting, detectingWall, requestPlace, onWallPlaced } = sceneNavigator.viroAppProps ?? {};

  const [position, setPosition] = useState<[number, number, number]>([0, 0, -1.5]);
  const [scale, setScale] = useState<[number, number, number]>([1, 1, 1]);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [planeDims, setPlaneDims] = useState<{ w: number; h: number } | null>(null);
  const anchorRef = useRef<{ position: [number, number, number]; rotation: [number, number, number] } | null>(null);
  const scaleAtPinchStart = useRef(1);
  const rotationAtStart = useRef(0);

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
    }
  }, [detectingWall]);

  useEffect(() => {
    if (requestPlace) handleWallTap();
  }, [requestPlace]);

  const handleAnchor = (anchor: any) => {
    const w = anchor.width ?? anchor.xExtent ?? 1;
    const h = anchor.height ?? anchor.yExtent ?? 1;
    anchorRef.current = {
      position: anchor.position ?? [0, 0, 0],
      rotation: anchor.rotation ?? [0, 0, 0],
    };
    setPlaneDims({ w, h });
  };

  const handleWallTap = () => {
    if (!selectedPainting) return;
    const pos = anchorRef.current?.position ?? [0, 0, -1.5];
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
          {/* Passive plane detector — runs silently, snaps reticle when wall found */}
          <ViroARPlane
            minHeight={0.1}
            minWidth={0.1}
            alignment="Vertical"
            onAnchorFound={handleAnchor}
            onAnchorUpdated={handleAnchor}
          />

          {/* Reticle: always visible immediately, anchored to wall when detected */}
          <ViroNode
            position={anchorRef.current?.position ?? [0, 0, -1.5]}
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
