import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Todo, Category } from '@/types';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

interface TaskCardProps {
  todo: Todo;
  category: Category | undefined;
  onToggle: () => void;
  onPress: () => void;
}

export default function TaskCard({ todo, category, onToggle, onPress }: TaskCardProps) {
  const circleScale = useSharedValue(1);

  const circleAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  const handleToggle = () => {
    circleScale.value = withSpring(1.2, { damping: 10, stiffness: 300 }, () => {
      circleScale.value = withTiming(1, { duration: 150 });
    });
    onToggle();
  };

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <Pressable onPress={handleToggle} hitSlop={12}>
          <Animated.View
            style={[
              styles.circle,
              todo.completed && styles.circleCompleted,
              circleAnimStyle,
            ]}
          >
            {todo.completed && <View style={styles.checkmark} />}
          </Animated.View>
        </Pressable>

        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              todo.completed && styles.titleCompleted,
            ]}
            numberOfLines={1}
          >
            {todo.title}
          </Text>

          {category && (
            <View style={styles.metaRow}>
              <View
                style={[styles.dot, { backgroundColor: category.color }]}
              />
              <Text style={styles.categoryText}>{category.name}</Text>
            </View>
          )}

          {todo.description && todo.completed && (
            <Text style={styles.descCompleted}>{todo.description}</Text>
          )}
          {todo.description && !todo.completed && (
            <Text style={styles.desc}>{todo.description}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.card,
    padding: Theme.spacing.page,
    marginBottom: Theme.spacing.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  circle: {
    width: Theme.taskCircle,
    height: Theme.taskCircle,
    borderRadius: Theme.taskCircle / 2,
    borderWidth: 2,
    borderColor: Colors.textDisabled,
    marginRight: Theme.spacing.page,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    width: 10,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: Colors.white,
    transform: [{ rotate: '-45deg' }],
    marginBottom: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: Theme.fontSize.taskTitle,
    fontWeight: Theme.fontWeight.medium,
    lineHeight: Theme.lineHeight.taskTitle,
    color: Colors.textPrimary,
  },
  titleCompleted: {
    color: Colors.textDisabled,
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontSize: Theme.fontSize.auxiliary,
    color: Colors.textSecondary,
  },
  desc: {
    fontSize: Theme.fontSize.taskDesc,
    lineHeight: Theme.lineHeight.taskDesc,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  descCompleted: {
    fontSize: Theme.fontSize.taskDesc,
    lineHeight: Theme.lineHeight.taskDesc,
    color: Colors.textDisabled,
    marginTop: 4,
    textDecorationLine: 'line-through',
  },
});
