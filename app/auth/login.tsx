import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('提示', '请输入邮箱和密码');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('登录失败', e.message || '请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.content, { paddingTop: insets.top + 80 }]}>
        <Text style={styles.title}>欢迎回来</Text>
        <Text style={styles.subtitle}>登录你的账号</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="邮箱"
            placeholderTextColor={Colors.textDisabled}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="密码"
            placeholderTextColor={Colors.textDisabled}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>登录</Text>
            )}
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/auth/register')} style={styles.linkRow}>
          <Text style={styles.linkText}>
            没有账号？<Text style={styles.linkHighlight}>去注册</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Theme.spacing.page,
  },
  title: {
    fontSize: 28,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Theme.fontSize.body,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  form: {
    marginTop: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: Theme.borderRadius.button,
    padding: 14,
    fontSize: Theme.fontSize.body,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Theme.borderRadius.button,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: Theme.fontSize.body,
    fontWeight: Theme.fontWeight.semibold,
  },
  linkRow: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    fontSize: Theme.fontSize.body,
    color: Colors.textSecondary,
  },
  linkHighlight: {
    color: Colors.primary,
    fontWeight: Theme.fontWeight.medium,
  },
});
