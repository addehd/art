import { useEffect, useRef, useState } from 'react';
import {
  ViroARPlane,
  ViroARScene,
  ViroImage,
  ViroMaterials,
  ViroNode,
  ViroPolyline,
  ViroQuad,
} from '@viro-community/react-viro';
import { type Painting } from '../data/paintings';

let materialsReady = false;

interface WallAnchor {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
}

function buildGridLines(w: number, h: number): [number, number, number][][] {
  const hw = w / 2;
  const hh = h / 2;
  return [
    // border
    [[-hw, -hh, 0], [hw, -hh, 0], [hw, hh, 0], [-hw, hh, 0], [-hw, -hh, 0]],
    // horizontal thirds
    [[-hw, -hh + h / 3, 0], [hw, -hh + h / 3, 0]],
    [[-hw, -hh + (2 * h) / 3, 0], [hw, -hh + (2 * h) / 3, 0]],
    // vertical thirds
    [[-hw + w / 3, -hh, 0], [-hw + w / 3, hh, 0]],
    [[-hw + (2 * w) / 3, -hh, 0], [-hw + (2 * w) / 3, hh, 0]],
  ];
}

interface ARSceneProps {
  sceneNavigator: {
    viroAppProps: {
      selectedPainting: Painting | null;
    };
  };
}

export function ARScene({ sceneNavigator }: ARSceneProps) {
  const { selectedPainting } = sceneNavigator.viroAppProps ?? {};

  const [position, setPosition] = useState<[number, number, number]>([0, 0, -1.5]);
  const [scale, setScale] = useState<[number, number, number]>([1, 1, 1]);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [wallAnchor, setWallAnchor] = useState<WallAnchor | null>(null);
  const scaleAtPinchStart = useRef(1);
  const rotationAtStart = useRef(0);

  useEffect(() => {

    
    if (!materialsReady) {
      ViroMaterials.createMaterials({
        tapTarget: {
          diffuseColor: 'rgba(0,0,0,0)',
          lightingModel: 'Constant',
        },
        wallLine: {
          diffuseColor: 'rgba(0, 230, 100, 0.7)',
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

  const handleAnchor = (anchor: any) => {
    console.log('anchor data:', JSON.stringify(anchor));
    setWallAnchor({
      position: anchor.position,
      rotation: anchor.rotation,
      width: anchor.width ?? 1,
      height: anchor.height ?? 1,
    });
  };

  const handleWallTap = () => {
    if (!wallAnchor || !selectedPainting) return;
    setPosition(wallAnchor.position);
    setRotation(wallAnchor.rotation);
    setScale([1, 1, 1]);
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

  const w = wallAnchor?.width ?? 1;
  const h = wallAnchor?.height ?? 1;

  return (
    <ViroARScene>
      <ViroARPlane
        minHeight={0.3}
        minWidth={0.3}
        alignment="Vertical"
        onAnchorFound={handleAnchor}
        onAnchorUpdated={handleAnchor}
      >
        {wallAnchor && buildGridLines(w, h).map((points, i) => (
          <ViroPolyline
            key={i}
            points={points}
            thickness={0.003}
            materials={['wallLine']}
          />
        ))}
        {wallAnchor && (
          <ViroQuad
            width={w}
            height={h}
            materials={['tapTarget']}
            onClick={handleWallTap}
          />
        )}
      </ViroARPlane>

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
