import { useRef } from 'react';
import { Animated, FlatList, Image, Modal, PanResponder, Pressable, Text, TouchableWithoutFeedback, View, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { type Painting } from '../../data/paintings';

interface Props {
  paintings: Painting[];
  selectedId: string | null;
  onSelect: (painting: Painting) => void;
  onClose: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = SCREEN_WIDTH * 0.4;
const ITEM_HEIGHT = ITEM_WIDTH * 1.2;

export default function Gallery({ paintings, selectedId, onSelect, onClose }: Props) {
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 0.5) {
          Animated.timing(translateY, { toValue: 600, duration: 200, useNativeDriver: true }).start(onClose);
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1" />
      </TouchableWithoutFeedback>
      <Animated.View style={{ transform: [{ translateY }], backgroundColor: 'rgba(255,255,255,0.7)' }} className="pb-10 overflow-hidden">
        <BlurView intensity={40} tint="systemMaterialLight" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <View className="py-3 items-center" {...panResponder.panHandlers}>
          <View className="w-10 h-1 bg-[#555] rounded-full" />
        </View>
        {/* <Text className="text-white text-[17px] font-semibold text-center py-3">
          Choose a Painting
        </Text> */}
        <FlatList
          data={paintings}
          keyExtractor={(p) => p.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 12 }}
          snapToInterval={ITEM_WIDTH + 12}
          decelerationRate="fast"
          renderItem={({ item }) => (
            <Pressable
              unstable_pressDelay={50}
              style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT }}
              className={`rounded-xl overflow-hidden border-2 ${
                selectedId === item.id ? 'border-white' : 'border-transparent'
              }`}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            >
              <Image
                source={{ uri: item.uri }}
                style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT }}
                className="bg-transparent"
                resizeMode="cover"
              />
              {/* <View className="absolute bottom-0 left-0 right-0 px-2 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
                <Text className="text-black text-[13px] font-semibold" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text className="text-black/70 text-[11px]" numberOfLines={1}>
                  {item.artist}
                </Text>
              </View> */}
            </Pressable>
          )}
        />
      </Animated.View>
    </Modal>
  );
}
