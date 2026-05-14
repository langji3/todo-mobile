import React, { createContext, useContext, useState, useCallback } from 'react';
import { Todo } from '@/types';

interface TaskSheetContextType {
  visible: boolean;
  editingTodo: Todo | null;
  initialDate: string;
  initialCategoryId: string | null;
  openNewTask: (date?: string, categoryId?: string | null) => void;
  openEditTask: (todo: Todo) => void;
  closeTaskSheet: () => void;
}

const TaskSheetContext = createContext<TaskSheetContextType | null>(null);

export function TaskSheetProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [initialDate, setInitialDate] = useState('');
  const [initialCategoryId, setInitialCategoryId] = useState<string | null>(null);

  const openNewTask = useCallback((date?: string, categoryId?: string | null) => {
    const today = new Date();
    const dateStr = date || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setEditingTodo(null);
    setInitialDate(dateStr);
    setInitialCategoryId(categoryId || null);
    setVisible(true);
  }, []);

  const openEditTask = useCallback((todo: Todo) => {
    setEditingTodo(todo);
    setInitialDate(todo.date);
    setInitialCategoryId(todo.categoryId);
    setVisible(true);
  }, []);

  const closeTaskSheet = useCallback(() => {
    setVisible(false);
    setEditingTodo(null);
  }, []);

  return (
    <TaskSheetContext.Provider
      value={{
        visible,
        editingTodo,
        initialDate,
        initialCategoryId,
        openNewTask,
        openEditTask,
        closeTaskSheet,
      }}
    >
      {children}
    </TaskSheetContext.Provider>
  );
}

export function useTaskSheet() {
  const ctx = useContext(TaskSheetContext);
  if (!ctx) throw new Error('useTaskSheet must be used within TaskSheetProvider');
  return ctx;
}
