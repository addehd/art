# WallArt AR Viewer 

##  Goal
A mobile app (React Native / Expo) where users point their camera at a wall, select a painting, and see it overlaid on the wall in real-time.

---

## Stack
- **react-viro** — AR scene, plane detection, and 3D rendering
- **expo-image-picker** — user uploads their own art
- **react-native-gesture-handler** — drag & pinch to move/resize

---

## Screens

| Screen | Description |
|---|---|
| Camera View | Full-screen AR scene via ViroARSceneNavigator |
| Art Gallery | Bottom sheet with paintings to choose from |
| Placed Art | Painting shown on wall; drag/pinch to adjust |

---

## Core Features (MVP)

1. **AR scene** — ViroARSceneNavigator with live camera passthrough
2. **Wall detection** — ViroARPlaneSelector detects flat vertical surfaces
3. **Place painting** — ViroImage anchored to detected wall plane
4. **Drag to move** — ViroNode drag interaction to reposition
5. **Pinch to resize** — Pinch gesture to scale the ViroImage
6. **Sample gallery** — 10 public domain paintings built-in
7. **Upload own image** — expo-image-picker → ViroImage source
8. **Save screenshot** — expo-media-library

---

## Wall Detection (how it works)
1. ViroARPlane detects flat surfaces via ARKit/ARCore
2. Filter for vertical planes (walls)
3. Anchor ViroImage to the selected plane
4. User can reposition/resize after placement

---

## What's Out of Scope (v1)
- Manual Canny edge heuristic wall detection
- User accounts / cloud saves
- Frames / decorative borders
- Social sharing
