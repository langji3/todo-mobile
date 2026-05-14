import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Tabs, usePathname } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Settings,
  Plus,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useTaskSheet } from '@/contexts/TaskSheetContext';
import TaskSheet from '@/components/sheets/TaskSheet';
import { formatDate } from '@/utils/date';
import { globalState } from '@/utils/global';

const TAB_ICONS: Record<string, React.FC<{ color: string; size: number }>> = {
  index: LayoutDashboard,
  calendar: CalendarIcon,
  settings: Settings,
};

const TAB_LABELS: Record<string, string> = {
  index: '列表',
  calendar: '日历',
  settings: '设置',
};

export default function TabsLayout() {
  const pathname = usePathname();
  const { visible, editingTodo, initialDate, initialCategoryId, openNewTask, closeTaskSheet } = useTaskSheet();

  const fabScale = useSharedValue(1);
  const fabOpacity = useSharedValue(1);
  const showFab = !pathname.includes('settings');

  const fabStyle = useAnimatedStyle(() => ({
    opacity: showFab ? fabOpacity.value : 0,
    transform: [{ scale: showFab ? fabScale.value : 0.8 }],
  }));

  const handleFabPress = () => {
    if (pathname.includes('calendar')) {
      openNewTask(globalState.calendarDate);
    } else {
      openNewTask(formatDate(new Date()));
    }
  };

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabItem,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size }) => {
            const Icon = TAB_ICONS[route.name];
            return <Icon color={color} size={size} />;
          },
        })}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="calendar" />
        <Tabs.Screen name="settings" />
      </Tabs>

      <Animated.View style={[styles.fabContainer, fabStyle]}>
        <Pressable
          style={styles.fab}
          onPress={handleFabPress}
          android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: true }}
        >
          <Plus size={24} color={Colors.white} />
        </Pressable>
      </Animated.View>

      <TaskSheet
        visible={visible}
        editingTodo={editingTodo}
        initialDate={initialDate}
        initialCategoryId={initialCategoryId}
        onSave={() => {}}
        onClose={closeTaskSheet}
        onDelete={editingTodo ? () => {
          const { useTodoStore } = require('@/store/useTodoStore');
          useTodoStore.getState().deleteTodo(editingTodo.id);
        } : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    height: 64,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: Theme.fontWeight.medium,
    marginTop: 2,
  },
  fabContainer: {
    position: 'absolute',
    right: Theme.spacing.large,
    bottom: 70,
    zIndex: 100,
  },
  fab: {
    width: Theme.fabSize,
    height: Theme.fabSize,
    borderRadius: Theme.fabSize / 2,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
