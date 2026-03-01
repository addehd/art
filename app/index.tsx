import '../global.css';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ViroARSceneNavigator } from '@viro-community/react-viro';
import { ARScene } from './components/ARScene';
import { Gallery } from './components/Gallery';
import { PAINTINGS, type Painting } from '../data/paintings';

export default function Index() {
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [detectingWall, setDetectingWall] = useState(false);

  return (
    <View className="flex-1 bg-black">
      <ViroARSceneNavigator
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialScene={{ scene: ARScene as any }}
        viroAppProps={{
          selectedPainting,
          detectingWall,
          onWallPlaced: () => setDetectingWall(false),
        }}
        style={StyleSheet.absoluteFill}
      />

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
            <Pressable
              className="bg-white/20 border border-white/40 px-7 py-3.5 rounded-full"
              onPress={() => setDetectingWall(false)}
            >
              <Text className="text-base font-bold text-white">Cancel</Text>
            </Pressable>
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
        {detectingWall && (
          <Text className="text-white/70 text-[13px]">Point at a wall, then tap the green outline</Text>
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
