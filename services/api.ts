import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ApiResponse } from '@/types';

const BASE_URL = __DEV__ ? 'http://192.168.1.5:8088' : 'http://api.dlacm.top/todo';
const TOKEN_KEY = 'auth-token';

let onAuthFailure: (() => void) | null = null;

export function setOnAuthFailure(callback: () => void) {
  onAuthFailure = callback;
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string | null) {
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}

async function handleResponse<T>(json: ApiResponse<T>): Promise<T> {
  if (json.code === 401) {
    await setToken(null);
    onAuthFailure?.();
    throw new Error(json.message || '登录已过期');
  }

  if (json.code !== 200 && json.code !== 201) {
    throw new Error(json.message || '请求失败');
  }

  return json.data;
}

async function buildHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
  const token = await getToken();
  const headers: Record<string, string> = { ...extra };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await buildHeaders({
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  });
  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  return handleResponse<T>(await response.json());
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function put<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function patch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

export async function upload<T>(
  path: string,
  fileUri: string,
  fieldName: string = 'file',
  mimeType?: string,
  fileName?: string,
): Promise<T> {
  const headers = await buildHeaders();
  const formData = new FormData();
  const type = mimeType || 'image/jpeg';
  const name = fileName || 'avatar.jpg';

  if (Platform.OS === 'web') {
    const blob = await (await fetch(fileUri)).blob();
    formData.append(fieldName, blob, name);
  } else {
    formData.append(fieldName, { uri: fileUri, type, name } as any);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  return handleResponse<T>(await response.json());
}
