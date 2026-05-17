import { get, post, setToken } from './api';
import { AuthResult, User } from '@/types';

export async function login(email: string, password: string): Promise<AuthResult> {
  const result = await post<AuthResult>('/api/auth/login', { email, password });
  await setToken(result.token);
  return result;
}

export async function register(name: string, email: string, password: string, code: string): Promise<AuthResult> {
  const result = await post<AuthResult>('/api/auth/register', { name, email, password, code });
  await setToken(result.token);
  return result;
}

export async function sendCode(email: string): Promise<void> {
  await post('/api/auth/send-code', { email });
}

export async function logout(): Promise<void> {
  try {
    await post('/api/auth/logout');
  } finally {
    await setToken(null);
  }
}

export async function getMe(): Promise<User> {
  return get<User>('/api/auth/me');
}
