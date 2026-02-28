import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ViroARSceneNavigator } from '@viro-community/react-viro';
import { ARScene } from './components/ARScene';
import { Gallery } from './components/Gallery';
import { PAINTINGS, type Painting } from './data/paintings';

export default function Index() {
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);

  return (
    <View style={styles.root}>
      <ViroARSceneNavigator
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialScene={{ scene: ARScene as any }}
        viroAppProps={{ selectedPainting }}
        style={StyleSheet.absoluteFill}
      />

      {selectedPainting && (
        <View style={styles.activeBadge}>
          <Text style={styles.activeName} numberOfLines={1}>
            {selectedPainting.title}
          </Text>
          <Pressable onPress={() => setSelectedPainting(null)} hitSlop={12}>
            <Text style={styles.clear}>✕</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.bottomBar}>
        <Pressable style={styles.galleryBtn} onPress={() => setGalleryOpen(true)}>
          <Text style={styles.galleryBtnText}>🖼  Gallery</Text>
        </Pressable>
        {!selectedPainting && (
          <Text style={styles.hint}>Select a painting to place on a wall</Text>
        )}
        {selectedPainting && (
          <Text style={styles.hint}>Drag to move · Pinch to resize</Text>
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  activeBadge: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    maxWidth: 220,
  },
  clear: {
    color: '#fff',
    fontSize: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 10,
  },
  galleryBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
  },
  galleryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  hint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
});
