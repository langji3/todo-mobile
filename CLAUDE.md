# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npx expo start            # Start dev server
npx expo start --android  # Android
npx expo start --ios      # iOS
npx expo start --web      # Web
```

No test runner or linter is configured.

## Architecture

Expo Router (file-based routing) app using React Native 0.83 with the new architecture enabled (`newArchEnabled: true`). Expo SDK ~55, React 19.2.

### Routing

- `app/_layout.tsx` — Root layout. Wraps in `SafeAreaProvider`, `GestureHandlerRootView`, and `TaskSheetProvider`. Calls `initMockData()` on both stores on mount.
- `app/(tabs)/_layout.tsx` — Tab navigator with 3 icon-only tabs (列表/日历/设置) plus a floating action button (FAB, hidden on settings tab). Includes `TaskSheet` for create/edit.
- `app/(tabs)/index.tsx` — Today's task list with category filtering via side drawer.
- `app/(tabs)/calendar.tsx` — Calendar view with date-based task filtering.
- `app/(tabs)/settings.tsx` — User profile, notifications toggle, dark mode toggle, logout.

### State Management

Zustand stores persisted to AsyncStorage via `persist` middleware with `partialize` (only data fields are serialized, not actions):
- `store/useTodoStore.ts` — Todos and categories. Mock data auto-initializes once (`initialized` flag), then updates mock todo dates to today on subsequent loads. Storage key: `todo-storage`.
- `store/useUserStore.ts` — User profile and app settings. Storage key: `user-storage`.

### Context

- `contexts/TaskSheetContext.tsx` — Controls the task create/edit bottom sheet. Use via `useTaskSheet()` hook. Provides `openNewTask(date?, categoryId?)`, `openEditTask(todo)`, `closeTaskSheet()`.

### Cross-Screen Communication

`utils/global.ts` exports a mutable `globalState` object (e.g. `calendarDate`) used to pass data between screens without navigation params. This is **not reactive** — consumers read it imperatively.

### Types

`types/index.ts` — `Todo` (date as YYYY-MM-DD string), `Category` (name + color hex), `User`, `AppSettings`.

## Key Conventions

- Path alias: `@/*` maps to project root.
- Styles: `StyleSheet.create()` at the bottom of each file. Use `Colors` from `@/constants/colors` and `Theme` from `@/constants/theme` for all values — never hardcode colors, spacing, or font sizes.
- Icons: `lucide-react-native` throughout.
- Components organized by domain: `components/ui/`, `components/sheets/`, `components/calendar/`, `components/drawers/`.
- Bottom sheets use custom Modal + `react-native-reanimated` animations and `react-native-gesture-handler` for swipe-to-dismiss (not `@gorhom/bottom-sheet`).
- All user-facing strings are in Chinese (中文). Keep new UI text in Chinese.
- Dark mode toggle exists in settings but `Colors` only defines a light palette — no dark theme colors are implemented yet.
