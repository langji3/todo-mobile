import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { formatDate, isPastDate } from '@/utils/date';

interface DatePickerSheetProps {
  visible: boolean;
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

export default function DatePickerSheet({
  visible,
  selectedDate,
  onSelect,
  onClose,
}: DatePickerSheetProps) {
  const [tempDate, setTempDate] = useState(selectedDate);
  const today = formatDate(new Date());

  const handleDayPress = (day: { dateString: string }) => {
    if (isPastDate(day.dateString)) return;
    setTempDate(day.dateString);
  };

  const handleConfirm = () => {
    onSelect(tempDate);
    onClose();
  };

  const markedDates: Record<string, any> = {};
  markedDates[today] = {
    selected: today === tempDate,
    selectedColor: Colors.primary,
    customStyles: {
      container: { backgroundColor: today === tempDate ? Colors.primary : 'transparent' },
      text: { color: today === tempDate ? Colors.white : Colors.primary, fontWeight: 'bold' },
    },
  };
  if (tempDate !== today) {
    markedDates[tempDate] = {
      selected: true,
      selectedColor: Colors.primary,
    };
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container} pointerEvents="box-none">
          <View style={styles.sheet}>
            <Calendar
              current={tempDate}
              onDayPress={handleDayPress}
              markedDates={markedDates}
              markingType="custom"
              minDate={today}
              theme={{
                todayTextColor: Colors.primary,
                selectedDayBackgroundColor: Colors.primary,
                selectedDayTextColor: Colors.white,
                arrowColor: Colors.primary,
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 13,
              }}
              disabledByDefault={false}
            />
            <View style={styles.footer}>
              <Pressable onPress={onClose}>
                <Text style={styles.cancel}>取消</Text>
              </Pressable>
              <Pressable onPress={handleConfirm}>
                <Text style={styles.confirm}>确定</Text>
              </Pressable>
            </View>
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
    marginTop: Theme.spacing.page,
  },
  cancel: {
    fontSize: Theme.fontSize.body,
    color: Colors.textSecondary,
    paddingVertical: 8,
  },
  confirm: {
    fontSize: Theme.fontSize.body,
    color: Colors.primary,
    fontWeight: Theme.fontWeight.semibold,
    paddingVertical: 8,
  },
});
