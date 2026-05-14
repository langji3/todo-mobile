import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
} from 'react-native';
import { Check, Plus } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useTodoStore } from '@/store/useTodoStore';
import { Category } from '@/types';

interface CategoryPickerSheetProps {
  visible: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function CategoryPickerSheet({
  visible,
  selectedId,
  onSelect,
  onClose,
}: CategoryPickerSheetProps) {
  const { categories, addCategory } = useTodoStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  const handleAdd = () => {
    if (newName.trim()) {
      const cat = addCategory(newName.trim());
      onSelect(cat.id);
      setNewName('');
      setShowAdd(false);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container} pointerEvents="box-none">
          <View style={styles.sheet}>
            {categories.map((cat: Category) => (
              <Pressable
                key={cat.id}
                style={styles.item}
                onPress={() => handleSelect(cat.id)}
              >
                <View style={styles.itemLeft}>
                  <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
                  <Text style={styles.itemText}>{cat.name}</Text>
                </View>
                {cat.id === selectedId && (
                  <Check size={18} color={Colors.primary} />
                )}
              </Pressable>
            ))}

            <View style={styles.divider} />

            {!showAdd ? (
              <Pressable style={styles.addButton} onPress={() => setShowAdd(true)}>
                <Plus size={16} color={Colors.primary} />
                <Text style={styles.addText}>添加新分类</Text>
              </Pressable>
            ) : (
              <View style={styles.addForm}>
                <TextInput
                  style={styles.addInput}
                  placeholder="分类名称"
                  placeholderTextColor={Colors.textDisabled}
                  value={newName}
                  onChangeText={setNewName}
                  autoFocus
                  onSubmitEditing={handleAdd}
                />
                <View style={styles.addActions}>
                  <Pressable onPress={() => { setShowAdd(false); setNewName(''); }}>
                    <Text style={styles.addCancel}>取消</Text>
                  </Pressable>
                  <Pressable onPress={handleAdd}>
                    <Text style={styles.addConfirm}>确定</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Theme.borderRadius.card,
    borderTopRightRadius: Theme.borderRadius.card,
    padding: Theme.spacing.page,
    paddingBottom: 32,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  itemText: {
    fontSize: Theme.fontSize.body,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  addText: {
    fontSize: Theme.fontSize.body,
    color: Colors.primary,
  },
  addForm: {
    paddingVertical: 8,
  },
  addInput: {
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: Theme.borderRadius.button,
    padding: 10,
    fontSize: Theme.fontSize.body,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  addActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  addCancel: {
    fontSize: Theme.fontSize.body,
    color: Colors.textSecondary,
    paddingVertical: 4,
  },
  addConfirm: {
    fontSize: Theme.fontSize.body,
    color: Colors.primary,
    fontWeight: Theme.fontWeight.semibold,
    paddingVertical: 4,
  },
});
