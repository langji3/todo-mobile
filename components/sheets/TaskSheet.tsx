import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Keyboard,
  Platform,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedKeyboard,
  withTiming,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { Check, Calendar as CalendarIcon, Tag, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useTodoStore } from '@/store/useTodoStore';
import { Todo } from '@/types';
import { formatDate, isPastDate, getRelativeDateLabel } from '@/utils/date';
import DatePickerSheet from './DatePickerSheet';
import CategoryPickerSheet from './CategoryPickerSheet';

const SHEET_HEIGHT = 340;

interface KeyboardAwareSheetProps {
  translateY: SharedValue<number>;
  bottomInset: number;
  children: React.ReactNode;
}

function KeyboardAwareSheet({ translateY, bottomInset, children }: KeyboardAwareSheetProps) {
  const keyboard = useAnimatedKeyboard({
    isStatusBarTranslucentAndroid: false,
    isNavigationBarTranslucentAndroid: false,
  });

  const sheetStyle = useAnimatedStyle(() => {
    const keyboardLift = Platform.OS === 'android' ? keyboard.height.value : 0;

    return {
      transform: [{ translateY: translateY.value - keyboardLift }],
    };
  });

  return (
    <Animated.View style={[styles.sheet, sheetStyle, { paddingBottom: bottomInset + 8 }]}>
      {children}
    </Animated.View>
  );
}

interface TaskSheetProps {
  visible: boolean;
  editingTodo?: Todo | null;
  initialDate?: string;
  initialCategoryId?: string | null;
  onSave: () => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function TaskSheet({
  visible,
  editingTodo,
  initialDate,
  initialCategoryId,
  onSave,
  onDelete,
  onClose,
}: TaskSheetProps) {
  const insets = useSafeAreaInsets();
  const { categories, addTodo, updateTodo } = useTodoStore();
  const isEditing = !!editingTodo;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(formatDate(new Date()));
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [rendered, setRendered] = useState(visible);
  const titleRef = useRef<TextInput>(null);
  const isKeyboardVisible = useRef(false);
  const handleDismissRef = useRef<() => void>(() => {});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const translateY = useSharedValue(SHEET_HEIGHT);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      return;
    }

    if (!rendered) return;

    Keyboard.dismiss();
    isKeyboardVisible.current = false;
    translateY.value = withTiming(SHEET_HEIGHT, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(setRendered)(false);
      }
    });
    overlayOpacity.value = withTiming(0, { duration: 200 });
  }, [visible, rendered, overlayOpacity, translateY]);

  useEffect(() => {
    if (!visible || !rendered) return;

    if (isEditing && editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description);
      setDate(editingTodo.date);
      setCategoryId(editingTodo.categoryId);
    } else {
      setTitle('');
      setDescription('');
      setDate(initialDate || formatDate(new Date()));
      setCategoryId(initialCategoryId || categories[0]?.id || '');
    }

    translateY.value = SHEET_HEIGHT;
    overlayOpacity.value = 0;

    requestAnimationFrame(() => {
      translateY.value = withTiming(0, { duration: 300 });
      overlayOpacity.value = withTiming(1, { duration: 300 });
    });

    const focusTimer = setTimeout(() => titleRef.current?.focus(), 350);
    return () => clearTimeout(focusTimer);
  }, [
    visible,
    rendered,
    isEditing,
    editingTodo,
    initialDate,
    initialCategoryId,
    categories,
    overlayOpacity,
    translateY,
  ]);

  useEffect(() => {
    if (!visible || !rendered) return;

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      isKeyboardVisible.current = true;
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      isKeyboardVisible.current = false;
    });

    const backSub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleDismissRef.current();
      return true;
    });

    return () => {
      showSub.remove();
      hideSub.remove();
      backSub.remove();
    };
  }, [visible, rendered]);

  const handleDismiss = useCallback(() => {
    if (isKeyboardVisible.current) {
      Keyboard.dismiss();
      return;
    }

    if (title.trim() || description.trim()) {
      Alert.alert('是否放弃编辑？', '当前内容尚未保存', [
        { text: '继续编辑', style: 'cancel' },
        { text: '放弃', style: 'destructive', onPress: onClose },
      ]);
    } else {
      onClose();
    }
  }, [title, description, onClose]);

  handleDismissRef.current = handleDismiss;

  const gesture = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        translateY.value = withTiming(SHEET_HEIGHT, { duration: 200 }, () => {
          runOnJS(handleDismiss)();
        });
      } else {
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handleSave = async () => {
    if (!title.trim()) return;

    try {
      if (isEditing && editingTodo) {
        await updateTodo(editingTodo.id, {
          title: title.trim(),
          description: description.trim(),
          date,
          categoryId,
        });
      } else {
        await addTodo({
          title: title.trim(),
          description: description.trim(),
          date,
          categoryId,
          completed: false,
        });
      }

      onSave();
      onClose();
    } catch (e: any) {
      Alert.alert('保存失败', e.message || '请重试');
    }
  };

  const handleDelete = () => {
    Alert.alert('确定删除该任务？', '', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          onDelete?.();
          onClose();
        },
      },
    ]);
  };

  const isDatePast = isPastDate(date);
  const canSave = title.trim().length > 0 && !isDatePast;
  const category = categories.find((c) => c.id === categoryId);

  if (!rendered) return null;

  return (
    <View style={styles.modalRoot} pointerEvents="box-none">
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={styles.overlayPress} onPress={handleDismiss} />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetHost}
        pointerEvents="box-none"
      >
        <GestureDetector gesture={gesture}>
          <KeyboardAwareSheet translateY={translateY} bottomInset={insets.bottom}>
            <View style={styles.handle} />

            {isEditing && (
              <Text style={styles.sheetTitle}>编辑任务</Text>
            )}

            <View style={styles.inputContainer}>
              <TextInput
                ref={titleRef}
                style={[
                  styles.titleInput,
                  title.length === 0 && styles.inputEmpty,
                ]}
                placeholder="标题（必填）"
                placeholderTextColor={Colors.textDisabled}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
              <Text style={styles.charCount}>{title.length}/100</Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.descInput}
                placeholder="描述（可选）"
                placeholderTextColor={Colors.textDisabled}
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={2000}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{description.length}/2000</Text>
            </View>

            {isDatePast && (
              <Text style={styles.pastWarning}>不能为过去日期创建任务</Text>
            )}

            <View style={styles.toolbar}>
              {isEditing && (
                <Pressable style={styles.deleteButton} onPress={handleDelete}>
                  <Trash2 size={20} color={Colors.danger} />
                </Pressable>
              )}

              <Pressable
                style={styles.toolButton}
                onPress={() => setShowDatePicker(true)}
              >
                <CalendarIcon size={14} color={Colors.textSecondary} />
                <Text style={styles.toolButtonText}>
                  {getRelativeDateLabel(date)}
                </Text>
              </Pressable>

              <Pressable
                style={styles.toolButton}
                onPress={() => setShowCategoryPicker(true)}
              >
                <Tag size={14} color={Colors.textSecondary} />
                <Text style={styles.toolButtonText}>
                  {category?.name || '分类'}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.saveButton,
                  !canSave && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={!canSave}
              >
                <Check size={20} color={Colors.white} />
              </Pressable>
            </View>
          </KeyboardAwareSheet>
        </GestureDetector>
      </KeyboardAvoidingView>

      <DatePickerSheet
        visible={showDatePicker}
        selectedDate={date}
        onSelect={setDate}
        onClose={() => setShowDatePicker(false)}
      />

      <CategoryPickerSheet
        visible={showCategoryPicker}
        selectedId={categoryId}
        onSelect={setCategoryId}
        onClose={() => setShowCategoryPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  overlayPress: {
    flex: 1,
  },
  sheetHost: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Theme.borderRadius.card,
    borderTopRightRadius: Theme.borderRadius.card,
    paddingHorizontal: Theme.spacing.page,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.divider,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: Theme.fontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: Theme.spacing.card,
  },
  titleInput: {
    fontSize: Theme.fontSize.taskTitle,
    color: Colors.textPrimary,
    paddingVertical: 10,
  },
  inputEmpty: {
    borderBottomColor: Colors.danger,
  },
  descInput: {
    fontSize: Theme.fontSize.taskDesc,
    color: Colors.textPrimary,
    paddingVertical: 10,
    minHeight: 60,
    maxHeight: 120,
  },
  charCount: {
    position: 'absolute',
    right: 0,
    bottom: -16,
    fontSize: 10,
    color: Colors.textDisabled,
  },
  pastWarning: {
    fontSize: Theme.fontSize.auxiliary,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: 8,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  deleteButton: {
    padding: 8,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.button,
  },
  toolButtonText: {
    fontSize: Theme.fontSize.auxiliary,
    color: Colors.textSecondary,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  saveButtonDisabled: {
    backgroundColor: Colors.textDisabled,
  },
});
