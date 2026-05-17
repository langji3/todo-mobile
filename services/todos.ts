import { get, post, put, del, patch } from './api';
import { Todo, PaginatedData } from '@/types';

export interface GetTodosParams {
  date?: string;
  categoryId?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}

export async function getTodos(params?: GetTodosParams): Promise<PaginatedData<Todo>> {
  const query = new URLSearchParams();
  if (params?.date) query.set('date', params.date);
  if (params?.categoryId) query.set('categoryId', params.categoryId);
  if (params?.status !== undefined) query.set('status', String(params.status));
  if (params?.page) query.set('page', String(params.page));
  if (params?.pageSize) query.set('pageSize', String(params.pageSize));
  const qs = query.toString();
  return get<PaginatedData<Todo>>(`/api/todos${qs ? `?${qs}` : ''}`);
}

export async function createTodo(data: Partial<Todo>): Promise<Todo> {
  return post<Todo>('/api/todos', data);
}

export async function updateTodo(id: string, data: Partial<Todo>): Promise<Todo> {
  return put<Todo>(`/api/todos/${id}`, data);
}

export async function deleteTodo(id: string): Promise<void> {
  await del(`/api/todos/${id}`);
}

export async function toggleTodo(id: string): Promise<Todo> {
  return patch<Todo>(`/api/todos/${id}/toggle`);
}
