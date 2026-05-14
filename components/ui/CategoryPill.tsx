import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

interface CategoryPillProps {
  categories: { id: string | null; name: string }[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function CategoryPill({ categories, selectedId, onSelect }: CategoryPillProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((cat) => {
        const isActive = cat.id === selectedId;
        return (
          <Pressable
            key={cat.id ?? 'all'}
            onPress={() => onSelect(cat.id)}
            style={[styles.pill, isActive && styles.pillActive]}
          >
            <Text style={[styles.text, isActive && styles.textActive]}>
              {cat.name}
            </Text>
            {isActive && <View style={styles.indicator} />}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.spacing.page,
    paddingBottom: 8,
    gap: 16,
  },
  pill: {
    paddingVertical: 8,
    position: 'relative',
  },
  pillActive: {},
  text: {
    fontSize: Theme.fontSize.body,
    color: Colors.textSecondary,
    fontWeight: Theme.fontWeight.medium,
  },
  textActive: {
    color: Colors.textPrimary,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
});
