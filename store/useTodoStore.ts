import { create } from 'zustand';
import { Todo, Category } from '@/types';
import * as todosApi from '@/services/todos';
import * as categoriesApi from '@/services/categories';
import { RandomCategoryColors } from '@/constants/colors';

interface TodoState {
  todos: Todo[];
  categories: Category[];
  loading: boolean;
}

interface TodoActions {
  fetchTodos: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => Promise<Todo>;
  updateTodo: (id: string, updates: Partial<Omit<Todo, 'id'>>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  getTodosByDate: (date: string) => Todo[];
  getTodosByCategoryAndDate: (categoryId: string | null, date: string) => Todo[];
  getTodoCountByCategoryAndDate: (categoryId: string | null, date: string) => number;
  addCategory: (name: string) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<boolean>;
  getCategoryById: (id: string) => Category | undefined;
  canDeleteCategory: (id: string) => boolean;
}

export const useTodoStore = create<TodoState & TodoActions>()((set, get) => ({
  todos: [],
  categories: [],
  loading: false,

  fetchTodos: async () => {
    set({ loading: true });
    try {
      const result = await todosApi.getTodos({ pageSize: 1000 });
      set({ todos: result.list, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const cats = await categoriesApi.getCategories();
      set({ categories: cats });
    } catch {
      // ignore
    }
  },

  addTodo: async (todoData) => {
    const newTodo = await todosApi.createTodo(todoData);
    set((state) => ({ todos: [newTodo, ...state.todos] }));
    return newTodo;
  },

  updateTodo: async (id, updates) => {
    const updated = await todosApi.updateTodo(id, updates);
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? updated : t)),
    }));
  },

  deleteTodo: async (id) => {
    await todosApi.deleteTodo(id);
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    }));
  },

  toggleComplete: async (id) => {
    const updated = await todosApi.toggleTodo(id);
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? updated : t)),
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
    return get().getTodosByCategoryAndDate(categoryId, date).length;
  },

  addCategory: async (name) => {
    const usedColors = get().categories.map((c) => c.color);
    const availableColors = RandomCategoryColors.filter(
      (c) => !usedColors.includes(c)
    );
    const color =
      availableColors.length > 0
        ? availableColors[0]
        : RandomCategoryColors[Math.floor(Math.random() * RandomCategoryColors.length)];

    const newCategory = await categoriesApi.createCategory({ name, color });
    set((state) => ({ categories: [...state.categories, newCategory] }));
    return newCategory;
  },

  updateCategory: async (id, updates) => {
    const updated = await categoriesApi.updateCategory(id, {
      name: updates.name || '',
      color: updates.color,
    });
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? updated : c)),
    }));
  },

  deleteCategory: async (id) => {
    if (!get().canDeleteCategory(id)) return false;
    await categoriesApi.deleteCategory(id);
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
}));
