import '../global.css';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ViroARSceneNavigator } from '@viro-community/react-viro';
import { ARScene, type ARDebugState } from './components/ARScene';
import { Gallery } from './components/Gallery';
import { PAINTINGS, type Painting } from '../data/paintings';

export default function Index() {
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [detectingWall, setDetectingWall] = useState(false);
  const [wallFound, setWallFound] = useState(false);
  const [requestPlace, setRequestPlace] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [debugState, setDebugState] = useState<ARDebugState | null>(null);

  return (
    <View className="flex-1 bg-black">
      <ViroARSceneNavigator
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialScene={{ scene: ARScene as any }}
        viroAppProps={{
          selectedPainting,
          detectingWall,
          requestPlace,
          resetTrigger,
          onWallFound: () => setWallFound(true),
          onWallPlaced: () => { setDetectingWall(false); setWallFound(false); setRequestPlace(false); },
          onDebugState: setDebugState,
        }}
        style={StyleSheet.absoluteFill}
      />

      {__DEV__ && debugState && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              top: 100,
              left: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.75)',
              padding: 8,
              borderRadius: 8,
              maxHeight: 120,
            },
          ]}
          pointerEvents="none"
        >
          <Text style={{ color: '#00e664', fontSize: 11, fontFamily: 'monospace' }}>
            pos: {debugState.position.map((n) => n.toFixed(2)).join(', ')}
          </Text>
          <Text style={{ color: '#00e664', fontSize: 11, fontFamily: 'monospace' }}>
            cross: {debugState.crosshairPos.map((n) => n.toFixed(2)).join(', ')}
          </Text>
          <Text style={{ color: '#00e664', fontSize: 11, fontFamily: 'monospace' }}>
            locked: {debugState.crosshairLocked ? 'yes' : 'no'}
          </Text>
          <Text style={{ color: '#00e664', fontSize: 11, fontFamily: 'monospace' }}>
            wall: {debugState.wallAnchor ? 'set' : 'null'}
          </Text>
        </View>
      )}

      {selectedPainting && (
        <View className="absolute top-[60px] self-center flex-row items-center gap-2.5 bg-black/55 px-4 py-2 rounded-full">
          <Text className="text-white text-[15px] font-semibold max-w-[220px]" numberOfLines={1}>
            {selectedPainting.title}
          </Text>
          <Pressable onPress={() => setSelectedPainting(null)} hitSlop={12}>
            <Text className="text-white text-base">✕</Text>
          </Pressable>
        </View>
      )}

      <View className="absolute bottom-12 left-0 right-0 items-center gap-3">
        <View className="flex-row gap-3">
          {!detectingWall ? (
            <Pressable
              className="bg-[#00e664] px-7 py-3.5 rounded-full"
              onPress={() => setDetectingWall(true)}
            >
              <Text className="text-base font-bold text-black">Detect Wall</Text>
            </Pressable>
          ) : (
            <>
              {!wallFound ? (
                <View className="bg-black/50 border border-white/20 px-7 py-3.5 rounded-full flex-row items-center gap-2.5">
                  <ActivityIndicator size="small" color="#00e664" />
                  <Text className="text-base font-semibold text-white">Scanning…</Text>
                </View>
              ) : (
                <Pressable
                  className="bg-[#00e664] px-7 py-3.5 rounded-full"
                  onPress={() => setRequestPlace(true)}
                  disabled={requestPlace}
                >
                  <Text className="text-base font-bold text-black">Place Here</Text>
                </Pressable>
              )}
              <Pressable
                className="bg-white/20 border border-white/40 px-7 py-3.5 rounded-full"
                onPress={() => {
                  setDetectingWall(false);
                  setWallFound(false);
                  setRequestPlace(false);
                  setSelectedPainting(null);
                  setResetTrigger((t) => t + 1);
                }}
              >
                <Text className="text-base font-bold text-white">Cancel</Text>
              </Pressable>
            </>
          )}

          <Pressable className="bg-white px-7 py-3.5 rounded-full" onPress={() => setGalleryOpen(true)}>
            <Text className="text-base font-bold text-black">🖼  Gallery</Text>
          </Pressable>
        </View>

        {!selectedPainting && !detectingWall && (
          <Text className="text-white/70 text-[13px]">Select a painting to place on a wall</Text>
        )}
        {selectedPainting && !detectingWall && (
          <Text className="text-white/70 text-[13px]">Drag to move · Pinch to resize</Text>
        )}
        {detectingWall && !wallFound && (
          <Text className="text-white/70 text-[13px]">Point at a flat wall and hold steady…</Text>
        )}
        {detectingWall && wallFound && (
          <Text className="text-white/70 text-[13px]">Wall locked · tap Place Here to hang the painting</Text>
        )}
      </View>

      {galleryOpen && (
        <Gallery
          paintings={PAINTINGS}
          selectedId={selectedPainting?.id ?? null}
          onSelect={setSelectedPainting}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </View>
  );
}
