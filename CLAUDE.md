# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npx expo start          # Start dev server
npx expo start --android  # Android
npx expo start --ios      # iOS
npx expo start --web      # Web
```

No test runner or linter is configured.

## Architecture

Expo Router (file-based routing) app using React Native 0.83 with the new architecture enabled (`newArchEnabled: true`). Expo SDK ~55, React 19.2.

### Routing

- `app/_layout.tsx` — Root layout. Wraps in `SafeAreaProvider`, `GestureHandlerRootView`, and `TaskSheetProvider`. Initializes mock data for both stores on mount.
- `app/(tabs)/_layout.tsx` — Tab navigator with 3 icon-only tabs (列表/日历/设置, `tabBarShowLabel: false`) plus a floating action button (FAB) at `bottom: 70`. FAB is hidden on the settings tab. On index tab opens new task with today's date; on calendar tab uses `globalState.calendarDate`. Includes `TaskSheet` for create/edit.
- `app/(tabs)/index.tsx` — Today's task list with category filtering via side drawer.
- `app/(tabs)/calendar.tsx` — Calendar view with date-based task filtering.
- `app/(tabs)/settings.tsx` — User profile, notifications toggle, dark mode toggle, logout.

### State Management

Zustand stores persisted to AsyncStorage:
- `store/useTodoStore.ts` — Todos and categories (CRUD, toggle completion, filter by date/category). Mock data auto-sets dates to today on init. Storage key: `todo-storage`.
- `store/useUserStore.ts` — User profile and app settings (dark mode, notifications, logout). Storage key: `user-storage`.

### Context

- `contexts/TaskSheetContext.tsx` — React context controlling the bottom sheet for creating/editing tasks. Used via `useTaskSheet()` hook. Methods: `openNewTask(date?, categoryId?)`, `openEditTask(todo)`, `closeTaskSheet()`.

### Types

- `types/index.ts` — `Todo` (id, title, description, date as YYYY-MM-DD, categoryId, completed, createdAt), `Category` (id, name, color), `User` (id, name, email, avatar?), `AppSettings` (darkMode, notifications).

### Components

```
components/
├── ui/
│   ├── TaskCard.tsx        — Todo item card with completion checkbox
│   ├── EmptyState.tsx      — Empty list placeholder
│   ├── CategoryPill.tsx    — Horizontal category filter pills
│   ├── Avatar.tsx          — User avatar component
│   └── SwipeableRow.tsx    — Swipe-to-complete/delete wrapper
├── sheets/
│   ├── TaskSheet.tsx       — Main task create/edit bottom sheet (auto-height, auto-focus title)
│   ├── DatePickerSheet.tsx — Calendar date picker
│   └── CategoryPickerSheet.tsx — Category selector with add new
├── calendar/
│   └── MonthCalendar.tsx   — Month calendar view with task dots
└── drawers/
    └── CategoryDrawer.tsx  — Side drawer for category filtering
```

### Utils

- `utils/date.ts` — `formatDate()`, `parseDate()`, `isToday()`, `isPastDate()`, `getMonthData()`, `getRelativeDateLabel()`.
- `utils/global.ts` — `globalState.calendarDate` for sharing selected date between calendar and task sheet.

### UI Language

All user-facing strings are in Chinese (中文). Keep new UI text in Chinese.

### Key Conventions

- Path alias: `@/*` maps to project root (configured in `tsconfig.json`).
- Styles: `StyleSheet.create()` at the bottom of each file. Use `Colors` from `@/constants/colors` and `Theme` from `@/constants/theme` for all values — never hardcode colors, spacing, or font sizes.
- Icons: `lucide-react-native` throughout.
- Components organized by domain: `components/ui/`, `components/sheets/`, `components/calendar/`, `components/drawers/`.
- Bottom sheets use custom Modal + `react-native-reanimated` animations and `react-native-gesture-handler` for swipe-to-dismiss.
