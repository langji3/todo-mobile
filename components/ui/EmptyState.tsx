import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

interface EmptyStateProps {
  categoryName?: string;
}

export default function EmptyState({ categoryName }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {categoryName
          ? `今天还没有「${categoryName}」类的安排`
          : '今天还没有安排\n点击右下角按钮添加今日计划'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  text: {
    fontSize: Theme.fontSize.body,
    color: Colors.textDisabled,
    textAlign: 'center',
    lineHeight: 22,
  },
});
