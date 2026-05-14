import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { Check, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

const ACTION_WIDTH = 80;
const SWIPE_THRESHOLD = -ACTION_WIDTH;

interface SwipeableRowProps {
  children: React.ReactNode;
  onComplete: () => void;
  onDelete: () => void;
}

export default function SwipeableRow({ children, onComplete, onDelete }: SwipeableRowProps) {
  const translateX = useSharedValue(0);

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -ACTION_WIDTH * 2);
      } else {
        translateX.value = 0;
      }
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withSpring(-ACTION_WIDTH * 2);
      } else if (translateX.value < -20) {
        translateX.value = withSpring(-ACTION_WIDTH);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleComplete = () => {
    translateX.value = withSpring(0);
    onComplete();
  };

  const handleDelete = () => {
    translateX.value = withSpring(0);
    onDelete();
  };

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <Pressable
          style={[styles.action, styles.completeAction]}
          onPress={handleComplete}
        >
          <Check size={24} color={Colors.white} />
        </Pressable>
        <Pressable
          style={[styles.action, styles.deleteAction]}
          onPress={handleDelete}
        >
          <Trash2 size={24} color={Colors.white} />
        </Pressable>
      </View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.content, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  content: {
    backgroundColor: Colors.background,
  },
  actions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  action: {
    width: ACTION_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeAction: {
    backgroundColor: Colors.success,
  },
  deleteAction: {
    backgroundColor: Colors.danger,
  },
});
