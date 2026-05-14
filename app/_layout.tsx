import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TaskSheetProvider } from '@/contexts/TaskSheetContext';
import { useTodoStore } from '@/store/useTodoStore';
import { useUserStore } from '@/store/useUserStore';

export default function RootLayout() {
  const initTodos = useTodoStore((s) => s.initMockData);
  const initUser = useUserStore((s) => s.initMockData);

  useEffect(() => {
    initTodos();
    initUser();
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="dark" />
        <TaskSheetProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </TaskSheetProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
