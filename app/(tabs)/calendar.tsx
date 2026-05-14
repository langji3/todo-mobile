import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useTodoStore } from '@/store/useTodoStore';
import { useTaskSheet } from '@/contexts/TaskSheetContext';
import { formatDate, isPastDate, getRelativeDateLabel } from '@/utils/date';
import { globalState } from '@/utils/global';
import MonthCalendar from '@/components/calendar/MonthCalendar';
import TaskCard from '@/components/ui/TaskCard';
import EmptyState from '@/components/ui/EmptyState';
import SwipeableRow from '@/components/ui/SwipeableRow';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { todos, getCategoryById, toggleComplete, deleteTodo } = useTodoStore();
  const { openEditTask, openNewTask } = useTaskSheet();
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    globalState.calendarDate = date;
  };

  const dayTodos = todos.filter((t) => t.date === selectedDate);

  const renderItem = ({ item }: { item: typeof dayTodos[0] }) => (
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

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }} />
      <MonthCalendar
        selectedDate={selectedDate}
        todos={todos}
        onSelectDate={handleSelectDate}
      />

      <View style={styles.divider} />

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>
          {getRelativeDateLabel(selectedDate)}
        </Text>
      </View>

      <FlatList
        data={dayTodos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: Theme.spacing.page,
  },
  listHeader: {
    paddingHorizontal: Theme.spacing.page,
    paddingVertical: 12,
  },
  listHeaderText: {
    fontSize: Theme.fontSize.pageTitle,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: Theme.spacing.page,
    paddingBottom: 100,
  },
});
