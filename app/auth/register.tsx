import React, { useState, useRef, useEffect } from 'react';
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
import { sendCode } from '@/services/auth';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('提示', '请输入邮箱');
      return;
    }
    setCodeLoading(true);
    try {
      await sendCode(email.trim());
      setCountdown(60);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (e: any) {
      Alert.alert('发送失败', e.message || '请稍后重试');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !code.trim()) {
      Alert.alert('提示', '请填写所有字段');
      return;
    }
    setLoading(true);
    try {
      await signUp(name.trim(), email.trim(), password, code.trim());
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('注册失败', e.message || '请检查输入信息');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.title}>创建账号</Text>
        <Text style={styles.subtitle}>注册一个新的 Todo 账号</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="昵称"
            placeholderTextColor={Colors.textDisabled}
            value={name}
            onChangeText={setName}
          />
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
          <View style={styles.codeRow}>
            <TextInput
              style={styles.codeInput}
              placeholder="验证码"
              placeholderTextColor={Colors.textDisabled}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={4}
            />
            <Pressable
              style={[styles.codeButton, (countdown > 0 || codeLoading) && styles.codeButtonDisabled]}
              onPress={handleSendCode}
              disabled={countdown > 0 || codeLoading}
            >
              {codeLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={styles.codeButtonText}>
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </Text>
              )}
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            placeholder="密码（至少6位）"
            placeholderTextColor={Colors.textDisabled}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>注册</Text>
            )}
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/auth/login')} style={styles.linkRow}>
          <Text style={styles.linkText}>
            已有账号？<Text style={styles.linkHighlight}>去登录</Text>
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
  codeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  codeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: Theme.borderRadius.button,
    padding: 14,
    fontSize: Theme.fontSize.body,
    color: Colors.textPrimary,
  },
  codeButton: {
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Theme.borderRadius.button,
  },
  codeButtonDisabled: {
    opacity: 0.5,
    borderColor: Colors.textDisabled,
  },
  codeButtonText: {
    color: Colors.primary,
    fontSize: Theme.fontSize.auxiliary,
    fontWeight: Theme.fontWeight.medium,
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
