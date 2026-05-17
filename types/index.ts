export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string YYYY-MM-DD
  categoryId: string;
  completed: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
}

// API response types
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  total: number;
  list: T[];
  pageNum: number;
  pageSize: number;
  pages: number;
}

export interface AuthResult {
  user: User;
  token: string;
}
