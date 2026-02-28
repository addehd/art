import { View, Text } from 'react-native';
import { ViroARScene, ViroARSceneNavigator, ViroText } from '@viro-community/react-viro';

function ARScene() {
  return (
    <ViroARScene>
      <ViroText text="Hello World" />
    </ViroARScene>
  );
}

export default function Index() {
  return (
    <ViroARSceneNavigator
      initialScene={{ scene: ARScene }}
      style={{ flex: 1 }}
    />
  );
}
