import { FlatList, Image, Modal, Pressable, Text, View } from 'react-native';
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
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <View className="bg-[#1a1a1a] rounded-t-3xl pb-10 max-h-[70%]">
        <View className="w-10 h-1 bg-[#555] rounded-full self-center mt-3 mb-1" />
        <Text className="text-white text-[17px] font-semibold text-center py-3">
          Choose a Painting
        </Text>
        <FlatList
          data={paintings}
          keyExtractor={(p) => p.id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 12 }}
          renderItem={({ item }) => (
            <Pressable
              className={`flex-1 m-1.5 rounded-xl bg-[#2a2a2a] overflow-hidden border-2 ${
                selectedId === item.id ? 'border-white' : 'border-transparent'
              }`}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            >
              <Image
                source={{ uri: item.uri }}
                className="w-full h-[120px] bg-[#333]"
                resizeMode="cover"
              />
              <Text className="text-white text-[13px] font-semibold px-2 pt-1.5" numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="text-[#aaa] text-[11px] px-2 pb-2" numberOfLines={1}>
                {item.artist}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}
