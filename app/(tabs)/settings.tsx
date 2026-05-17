import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  Moon,
  Download,
  Info,
  LogOut,
  Camera,
  Image as ImageIcon,
  X,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useUserStore } from '@/store/useUserStore';
import { useAuth } from '@/contexts/AuthContext';
import { uploadAvatar } from '@/services/users';
import Avatar from '@/components/ui/Avatar';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut, updateUser } = useAuth();
  const { settings, toggleDarkMode, toggleNotifications } = useUserStore();
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handlePickImage = async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('提示', '需要相机权限才能拍照');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('提示', '需要相册权限才能选择图片');
          return;
        }
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });

      if (result.canceled || !result.assets?.[0]) return;

      setShowAvatarMenu(false);
      setUploading(true);
      const asset = result.assets[0];
      const avatarUrl = await uploadAvatar(asset.uri, asset.mimeType, asset.fileName);
      if (user) {
        updateUser({ ...user, avatar: avatarUrl });
      }
    } catch (e: any) {
      Alert.alert('上传失败', e.message || '请重试');
    } finally {
      setUploading(false);
    }
  };

  const settingsItems = [
    {
      icon: <Bell size={20} color={Colors.textSecondary} />,
      label: '通知设置',
      action: (
        <Switch
          value={settings.notifications}
          onValueChange={toggleNotifications}
          trackColor={{ false: Colors.divider, true: Colors.primary }}
          thumbColor={Colors.white}
        />
      ),
    },
    {
      icon: <Moon size={20} color={Colors.textSecondary} />,
      label: '深色模式',
      action: (
        <Switch
          value={settings.darkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ false: Colors.divider, true: Colors.primary }}
          thumbColor={Colors.white}
        />
      ),
    },
    {
      icon: <Download size={20} color={Colors.textSecondary} />,
      label: '数据导出',
      action: <Text style={styles.chevron}>▸</Text>,
      onPress: () => Alert.alert('提示', '数据导出功能开发中'),
    },
    {
      icon: <Info size={20} color={Colors.textSecondary} />,
      label: '关于',
      action: <Text style={styles.chevron}>▸</Text>,
      onPress: () => Alert.alert('关于', 'Todo App v1.0.0'),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>设置</Text>
      </View>

      <View style={styles.profileSection}>
        <Pressable onPress={() => setShowAvatarMenu(true)}>
          {uploading ? (
            <View style={[styles.avatarLoading, { width: Theme.avatar.large, height: Theme.avatar.large, borderRadius: Theme.avatar.large / 2 }]}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : (
            <Avatar uri={user?.avatar} size={Theme.avatar.large} />
          )}
        </Pressable>
        <Text style={styles.changeAvatarText}>点击更换头像</Text>
        <Text style={styles.userName}>{user?.name || '用户'}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
      </View>

      <View style={styles.settingsList}>
        {settingsItems.map((item, index) => (
          <Pressable
            key={index}
            style={[
              styles.settingItem,
              index === settingsItems.length - 1 && styles.lastItem,
            ]}
            onPress={item.onPress}
          >
            <View style={styles.settingLeft}>
              {item.icon}
              <Text style={styles.settingLabel}>{item.label}</Text>
            </View>
            {item.action}
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={18} color={Colors.danger} />
        <Text style={styles.logoutText}>退出登录</Text>
      </Pressable>

      {/* Avatar Menu Modal */}
      <Modal visible={showAvatarMenu} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>更换头像</Text>
              <Pressable onPress={() => setShowAvatarMenu(false)}>
                <X size={20} color={Colors.textSecondary} />
              </Pressable>
            </View>
            <Pressable style={styles.modalOption} onPress={() => handlePickImage(true)}>
              <Camera size={20} color={Colors.textPrimary} />
              <Text style={styles.modalOptionText}>拍照</Text>
            </Pressable>
            <Pressable style={styles.modalOption} onPress={() => handlePickImage(false)}>
              <ImageIcon size={20} color={Colors.textPrimary} />
              <Text style={styles.modalOptionText}>从相册选择</Text>
            </Pressable>
            <Pressable style={styles.modalCancel} onPress={() => setShowAvatarMenu(false)}>
              <Text style={styles.modalCancelText}>取消</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Logout Confirm Modal */}
      <Modal visible={showLogoutConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>确认退出登录</Text>
            <Text style={styles.logoutDesc}>确定要退出登录吗？</Text>
            <View style={styles.logoutActions}>
              <Pressable style={styles.logoutCancelBtn} onPress={() => setShowLogoutConfirm(false)}>
                <Text style={styles.logoutCancelText}>取消</Text>
              </Pressable>
              <Pressable style={styles.logoutConfirmBtn} onPress={() => { setShowLogoutConfirm(false); signOut(); }}>
                <Text style={styles.logoutConfirmText}>退出</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Theme.spacing.page,
    paddingBottom: 8,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Theme.fontSize.pageTitle,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.large,
  },
  avatarLoading: {
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeAvatarText: {
    fontSize: Theme.fontSize.auxiliary,
    color: Colors.textSecondary,
    marginTop: 8,
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
  settingsList: {
    marginTop: Theme.spacing.medium,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.page,
    paddingVertical: 14,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: Theme.fontSize.body,
    color: Colors.textPrimary,
  },
  chevron: {
    fontSize: 14,
    color: Colors.textDisabled,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 40,
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: Theme.fontSize.body,
    color: Colors.danger,
    fontWeight: Theme.fontWeight.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Theme.borderRadius.card,
    borderTopRightRadius: Theme.borderRadius.card,
    padding: Theme.spacing.page,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.page,
  },
  modalTitle: {
    fontSize: Theme.fontSize.pageTitle,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  modalOptionText: {
    fontSize: Theme.fontSize.body,
    color: Colors.textPrimary,
  },
  modalCancel: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: Theme.fontSize.body,
    color: Colors.textSecondary,
  },
  logoutDesc: {
    fontSize: Theme.fontSize.body,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 24,
  },
  logoutActions: {
    flexDirection: 'row',
    gap: 12,
  },
  logoutCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Theme.borderRadius.button,
    borderWidth: 1,
    borderColor: Colors.divider,
    alignItems: 'center',
  },
  logoutCancelText: {
    fontSize: Theme.fontSize.body,
    color: Colors.textSecondary,
    fontWeight: Theme.fontWeight.medium,
  },
  logoutConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Theme.borderRadius.button,
    backgroundColor: Colors.danger,
    alignItems: 'center',
  },
  logoutConfirmText: {
    fontSize: Theme.fontSize.body,
    color: Colors.white,
    fontWeight: Theme.fontWeight.medium,
  },
});
