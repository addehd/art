# Maria - AR Wall Art Viewer

Mobile AR app that lets users visualize paintings on walls in real-time using React Native and Expo.

## Commands

```bash
# Development
npm run start          # Start Expo dev server
npm run ios            # Start iOS simulator
npm run android        # Start Android emulator

# Testing
npm run test           # Run Vitest tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
npm run test:e2e       # Playwright E2E tests

# Code Quality
npm run lint           # ESLint + Prettier check
npm run format         # Auto-fix lint + format
```

## Architecture

- **Framework**: React Native 0.81 + Expo 54 with expo-router
- **AR**: ViroAR (`@viro-community/react-viro`)
- **Styling**: NativeWind (Tailwind CSS)
- **State**: TanStack Query for server state
- **Backend**: Supabase (auth + database)
- **Testing**: Vitest (unit), Playwright (E2E)

## Project Structure

```
app/                    # Expo Router pages
  _components/          # Shared components (ARScene, Gallery)
  auth/                 # Auth screens
  profile/              # User profile
lib/
  api/                  # Supabase client
  query/                # React Query hooks
data/                   # Static data (paintings.ts)
```

## Conventions

- TypeScript strict mode enabled
- Path alias: `@/*` maps to project root
- Components use PascalCase filenames
- Use NativeWind className for styling (not StyleSheet)
- Prefer functional components with hooks

## Key Files

- `app/index.tsx` - Home/AR screen
- `app/_components/ARScene.tsx` - Core AR rendering logic
- `app/_components/Gallery.tsx` - Painting selection modal
- `lib/api/supabaseClient.ts` - Supabase configuration
