import {
  Animated,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { type Painting } from '../data/paintings';

interface Props {
  paintings: Painting[];
  selectedId: string | null;
  onSelect: (painting: Painting) => void;
  onClose: () => void;
}

export function Gallery({ paintings, selectedId, onSelect, onClose }: Props) {
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.heading}>Choose a Painting</Text>
        <FlatList
          data={paintings}
          keyExtractor={(p) => p.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.card, selectedId === item.id && styles.cardSelected]}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            >
              <Image source={{ uri: item.uri }} style={styles.thumb} resizeMode="cover" />
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#555',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  heading: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 12,
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: '#fff',
  },
  thumb: {
    width: '100%',
    height: 120,
    backgroundColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  artist: {
    color: '#aaa',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
});
