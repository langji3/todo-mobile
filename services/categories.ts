import { get, post, put, del } from './api';
import { Category } from '@/types';

export async function getCategories(): Promise<Category[]> {
  return get<Category[]>('/api/categories');
}

export async function createCategory(data: { name: string; color?: string }): Promise<Category> {
  return post<Category>('/api/categories', data);
}

export async function updateCategory(id: string, data: { name: string; color?: string }): Promise<Category> {
  return put<Category>(`/api/categories/${id}`, data);
}

export async function deleteCategory(id: string): Promise<void> {
  await del(`/api/categories/${id}`);
}
