import { useEffect, useRef, useState } from 'react';
import {
  ViroARPlane,
  ViroARScene,
  ViroImage,
  ViroNode,
} from '@viro-community/react-viro';
import { type Painting } from '../data/paintings';

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
  const scaleAtPinchStart = useRef(1);
  const rotationAtStart = useRef(0);

  useEffect(() => {
    setPosition([0, 0, -1.5]);
    setScale([1, 1, 1]);
    setRotation([0, 0, 0]);
  }, [selectedPainting?.id]);

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
      <ViroARPlane
        minHeight={0.3}
        minWidth={0.3}
        alignment="Vertical"
      />

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
