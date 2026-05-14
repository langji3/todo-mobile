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
  createdAt: number;
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
