import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useTodoStore } from '@/store/useTodoStore';
import { useTaskSheet } from '@/contexts/TaskSheetContext';
import { formatDate } from '@/utils/date';
import TaskCard from '@/components/ui/TaskCard';
import EmptyState from '@/components/ui/EmptyState';
import SwipeableRow from '@/components/ui/SwipeableRow';
import CategoryDrawer from '@/components/drawers/CategoryDrawer';

export default function TodayListScreen() {
  const today = formatDate(new Date());
  const insets = useSafeAreaInsets();
  const { todos, categories, getCategoryById, toggleComplete, deleteTodo, fetchTodos } = useTodoStore();
  const { openEditTask } = useTaskSheet();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filteredTodos = todos.filter(
    (t) => t.date === today && (selectedCategory ? t.categoryId === selectedCategory : true)
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTodos();
    setRefreshing(false);
  }, [fetchTodos]);

  const handleDrawerSelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const renderItem = ({ item }: { item: typeof filteredTodos[0] }) => (
    <SwipeableRow
      onComplete={() => toggleComplete(item.id)}
      onDelete={() => deleteTodo(item.id)}
    >
      <TaskCard
        todo={item}
        category={getCategoryById(item.categoryId)}
        onToggle={() => toggleComplete(item.id)}
        onPress={() => openEditTask(item)}
      />
    </SwipeableRow>
  );

  const selectedCategoryName = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)?.name
    : undefined;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => setDrawerVisible(true)} hitSlop={8}>
          <Menu size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>今天</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTodos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={<EmptyState categoryName={selectedCategoryName} />}
      />

      {/* Category Drawer */}
      <CategoryDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onSelectCategory={handleDrawerSelect}
        onNavigateToSettings={() => setDrawerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.page,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: Theme.fontSize.pageTitle,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  headerRight: {
    width: 24,
  },
  listContent: {
    paddingHorizontal: Theme.spacing.page,
    paddingBottom: 100,
  },
});
