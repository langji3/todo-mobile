import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Colors } from '@/constants/colors';
import { formatDate } from '@/utils/date';
import { Todo } from '@/types';

interface MonthCalendarProps {
  selectedDate: string;
  todos: Todo[];
  onSelectDate: (date: string) => void;
}

export default function MonthCalendar({ selectedDate, todos, onSelectDate }: MonthCalendarProps) {
  const today = formatDate(new Date());

  const todosByDate = todos.reduce<Record<string, Todo[]>>((acc, todo) => {
    if (!acc[todo.date]) acc[todo.date] = [];
    acc[todo.date].push(todo);
    return acc;
  }, {});

  const markedDates: Record<string, any> = {};

  Object.entries(todosByDate).forEach(([date, dayTodos]) => {
    const hasUncompleted = dayTodos.some((t) => !t.completed);
    markedDates[date] = {
      marked: true,
      dotColor: hasUncompleted ? Colors.primary : Colors.textDisabled,
    };
  });

  markedDates[today] = {
    ...(markedDates[today] || {}),
    selected: selectedDate === today,
    selectedColor: Colors.primary,
  };

  if (selectedDate !== today) {
    markedDates[selectedDate] = {
      ...(markedDates[selectedDate] || {}),
      selected: true,
      selectedColor: Colors.primary,
    };
  }

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate}
        onDayPress={(day: { dateString: string }) => onSelectDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          todayTextColor: Colors.primary,
          selectedDayBackgroundColor: Colors.primary,
          selectedDayTextColor: Colors.white,
          arrowColor: Colors.primary,
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 13,
          monthTextColor: Colors.textPrimary,
          textSectionTitleColor: Colors.textSecondary,
          dayTextColor: Colors.textPrimary,
          textDisabledColor: Colors.textDisabled,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
});
