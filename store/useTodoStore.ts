import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo, Category } from '@/types';
import { DEFAULT_CATEGORIES, getMockTodos } from '@/constants/mock';
import { formatDate } from '@/utils/date';
import { RandomCategoryColors } from '@/constants/colors';

interface TodoState {
  todos: Todo[];
  categories: Category[];
  initialized: boolean;
}

interface TodoActions {
  initMockData: () => void;
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => Todo;
  updateTodo: (id: string, updates: Partial<Omit<Todo, 'id'>>) => void;
  deleteTodo: (id: string) => void;
  toggleComplete: (id: string) => void;
  getTodosByDate: (date: string) => Todo[];
  getTodosByCategoryAndDate: (categoryId: string | null, date: string) => Todo[];
  getTodoCountByCategoryAndDate: (categoryId: string | null, date: string) => number;
  addCategory: (name: string) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => boolean;
  getCategoryById: (id: string) => Category | undefined;
  canDeleteCategory: (id: string) => boolean;
}

export const useTodoStore = create<TodoState & TodoActions>()(
  persist(
    (set, get) => ({
      todos: [],
      categories: [],
      initialized: false,

      initMockData: () => {
        const state = get();
        const today = formatDate(new Date());
        const mockIds = new Set(['todo-1', 'todo-2', 'todo-3', 'todo-4']);

        if (!state.initialized || state.todos.length === 0) {
          set({
            todos: getMockTodos(),
            categories: DEFAULT_CATEGORIES,
            initialized: true,
          });
          return;
        }

        // 更新已有 mock 任务的日期为今天
        const hasOldMockTodos = state.todos.some(
          (t) => mockIds.has(t.id) && t.date !== today
        );
        if (hasOldMockTodos) {
          set({
            todos: state.todos.map((t) =>
              mockIds.has(t.id) ? { ...t, date: today } : t
            ),
          });
        }
      },

      addTodo: (todoData) => {
        const newTodo: Todo = {
          ...todoData,
          id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
        };
        set((state) => ({ todos: [newTodo, ...state.todos] }));
        return newTodo;
      },

      updateTodo: (id, updates) => {
        set((state) => ({
          todos: state.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      deleteTodo: (id) => {
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
        }));
      },

      toggleComplete: (id) => {
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        }));
      },

      getTodosByDate: (date) => {
        return get().todos.filter((t) => t.date === date);
      },

      getTodosByCategoryAndDate: (categoryId, date) => {
        return get().todos.filter(
          (t) => t.date === date && (categoryId ? t.categoryId === categoryId : true)
        );
      },

      getTodoCountByCategoryAndDate: (categoryId, date) => {
        return get().todos.filter(
          (t) => t.date === date && (categoryId ? t.categoryId === categoryId : true)
        ).length;
      },

      addCategory: (name) => {
        const usedColors = get().categories.map((c) => c.color);
        const availableColors = RandomCategoryColors.filter(
          (c) => !usedColors.includes(c)
        );
        const color =
          availableColors.length > 0
            ? availableColors[0]
            : RandomCategoryColors[Math.floor(Math.random() * RandomCategoryColors.length)];

        const newCategory: Category = {
          id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          color,
        };
        set((state) => ({ categories: [...state.categories, newCategory] }));
        return newCategory;
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteCategory: (id) => {
        if (!get().canDeleteCategory(id)) return false;
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
        return true;
      },

      getCategoryById: (id) => {
        return get().categories.find((c) => c.id === id);
      },

      canDeleteCategory: (id) => {
        return !get().todos.some((t) => t.categoryId === id);
      },
    }),
    {
      name: 'todo-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        todos: state.todos,
        categories: state.categories,
        initialized: state.initialized,
      }),
    }
  )
);
