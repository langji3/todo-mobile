import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import {
  LayoutDashboard,
  BookOpen,
  Briefcase,
  Coffee,
  Circle,
  Plus,
  Pencil,
  ChevronRight,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useTodoStore } from '@/store/useTodoStore';
import { useUserStore } from '@/store/useUserStore';
import Avatar from '@/components/ui/Avatar';
import { Category } from '@/types';
import { formatDate } from '@/utils/date';

const DRAWER_WIDTH = 240;

const ICON_MAP: Record<string, React.ReactNode> = {
  'cat-study': <BookOpen size={20} color={Colors.textSecondary} />,
  'cat-work': <Briefcase size={20} color={Colors.textSecondary} />,
  'cat-life': <Coffee size={20} color={Colors.textSecondary} />,
};

interface CategoryDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSelectCategory: (categoryId: string | null) => void;
  onNavigateToSettings: () => void;
}

export default function CategoryDrawer({
  visible,
  onClose,
  onSelectCategory,
  onNavigateToSettings,
}: CategoryDrawerProps) {
  const { categories, getTodoCountByCategoryAndDate, addCategory, updateCategory, deleteCategory, canDeleteCategory } = useTodoStore();
  const { user } = useUserStore();
  const today = formatDate(new Date());

  const translateX = useSharedValue(-DRAWER_WIDTH);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');

  React.useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, { duration: 300 });
    } else {
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: 250 });
    }
  }, [visible]);

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (event.translationX < -80 || event.velocityX < -500) {
        translateX.value = withTiming(-DRAWER_WIDTH, { duration: 250 }, () => {
          runOnJS(onClose)();
        });
      } else {
        translateX.value = withTiming(0, { duration: 250 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleSelect = (categoryId: string | null) => {
    onSelectCategory(categoryId);
    translateX.value = withTiming(-DRAWER_WIDTH, { duration: 250 }, () => {
      runOnJS(onClose)();
    });
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowAddModal(false);
    }
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setEditName(cat.name);
  };

  const handleSaveEdit = () => {
    if (editingCategory && editName.trim()) {
      updateCategory(editingCategory.id, { name: editName.trim() });
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = (cat: Category) => {
    if (!canDeleteCategory(cat.id)) {
      Alert.alert('提示', '该分类下存在任务，无法删除');
      return;
    }
    Alert.alert('确认删除', `确定删除分类「${cat.name}」？`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => deleteCategory(cat.id) },
    ]);
  };

  const renderCategoryItem = (cat: Category) => {
    const count = getTodoCountByCategoryAndDate(cat.id, today);
    const icon = ICON_MAP[cat.id] || (
      <View style={[styles.customDot, { backgroundColor: cat.color }]} />
    );

    return (
      <Pressable
        key={cat.id}
        style={styles.navItem}
        onPress={() => handleSelect(cat.id)}
        onLongPress={() => handleEditCategory(cat)}
      >
        <View style={styles.navItemLeft}>
          {icon}
          <Text style={styles.navItemText}>{cat.name}</Text>
        </View>
        <View style={styles.navItemRight}>
          <Text style={styles.navItemCount}>{count}</Text>
          <Pressable
            hitSlop={8}
            onPress={() => handleEditCategory(cat)}
          >
            <Pencil size={14} color={Colors.textDisabled} />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <GestureDetector gesture={gesture}>
              <Animated.View style={[styles.drawer, animatedStyle]}>
                <Pressable style={styles.userSection} onPress={onNavigateToSettings}>
                  <Avatar uri={user?.avatar} size={Theme.avatar.medium} />
                  <Text style={styles.userName}>{user?.name || '用户'}</Text>
                  <Text style={styles.userEmail}>{user?.email || ''}</Text>
                </Pressable>

                <View style={styles.divider} />

                <Pressable style={styles.navItem} onPress={() => handleSelect(null)}>
                  <View style={styles.navItemLeft}>
                    <LayoutDashboard size={20} color={Colors.textSecondary} />
                    <Text style={styles.navItemText}>今日任务</Text>
                  </View>
                  <Text style={styles.navItemCount}>
                    {getTodoCountByCategoryAndDate(null, today)}
                  </Text>
                </Pressable>

                <View style={styles.divider} />

                {categories.map(renderCategoryItem)}

                <View style={styles.divider} />

                <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
                  <Plus size={18} color={Colors.primary} />
                  <Text style={styles.addButtonText}>添加分类</Text>
                </Pressable>
              </Animated.View>
            </GestureDetector>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* Add Category Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>添加分类</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="请输入分类名称"
              placeholderTextColor={Colors.textDisabled}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => { setShowAddModal(false); setNewCategoryName(''); }}>
                <Text style={styles.modalCancel}>取消</Text>
              </Pressable>
              <Pressable onPress={handleAddCategory}>
                <Text style={styles.modalConfirm}>确定</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Category Modal */}
      <Modal visible={!!editingCategory} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>管理分类</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="分类名称"
              placeholderTextColor={Colors.textDisabled}
              value={editName}
              onChangeText={setEditName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setEditingCategory(null)}>
                <Text style={styles.modalCancel}>取消</Text>
              </Pressable>
              {editingCategory && (
                <Pressable
                  onPress={() => handleDeleteCategory(editingCategory)}
                  disabled={!canDeleteCategory(editingCategory.id)}
                >
                  <Text style={[
                    styles.modalDelete,
                    !canDeleteCategory(editingCategory.id) && styles.modalDeleteDisabled
                  ]}>删除</Text>
                </Pressable>
              )}
              <Pressable onPress={handleSaveEdit}>
                <Text style={styles.modalConfirm}>保存</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    flexDirection: 'row',
  },
  drawer: {
    width: DRAWER_WIDTH,
    backgroundColor: Colors.background,
    height: '100%',
    paddingTop: 48,
    paddingHorizontal: Theme.spacing.page,
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.medium,
  },
  userName: {
    fontSize: 16,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textPrimary,
    marginTop: 12,
  },
  userEmail: {
    fontSize: Theme.fontSize.auxiliary,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navItemText: {
    fontSize: Theme.fontSize.body,
    color: Colors.textPrimary,
  },
  navItemCount: {
    fontSize: Theme.fontSize.auxiliary,
    color: Colors.textDisabled,
  },
  customDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  addButtonText: {
    fontSize: Theme.fontSize.body,
    color: Colors.primary,
    fontWeight: Theme.fontWeight.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: Theme.borderRadius.card,
    padding: Theme.spacing.page,
    width: '100%',
  },
  modalTitle: {
    fontSize: Theme.fontSize.pageTitle,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.page,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: Theme.borderRadius.button,
    padding: 12,
    fontSize: Theme.fontSize.body,
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.page,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  modalCancel: {
    fontSize: Theme.fontSize.body,
    color: Colors.textSecondary,
  },
  modalConfirm: {
    fontSize: Theme.fontSize.body,
    color: Colors.primary,
    fontWeight: Theme.fontWeight.semibold,
  },
  modalDelete: {
    fontSize: Theme.fontSize.body,
    color: Colors.danger,
    fontWeight: Theme.fontWeight.semibold,
  },
  modalDeleteDisabled: {
    color: Colors.textDisabled,
  },
});
