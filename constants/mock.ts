import { Category, Todo, User } from '@/types';
import { CategoryColors } from './colors';

export const MOCK_USER: User = {
  id: 'user-1',
  name: '张三',
  email: 'zhangsan@example.com',
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-study', name: '学习', color: CategoryColors.study },
  { id: 'cat-work', name: '工作', color: CategoryColors.work },
  { id: 'cat-life', name: '生活', color: CategoryColors.life },
];

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getMockTodos(): Todo[] {
  const today = getToday();
  return [
    {
      id: 'todo-1',
      title: '完成项目方案初稿',
      description: '',
      date: today,
      categoryId: 'cat-work',
      completed: false,
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'todo-2',
      title: '背单词 50 个',
      description: '重点复习 GRE 高频词汇',
      date: today,
      categoryId: 'cat-study',
      completed: false,
      createdAt: Date.now() - 80000000,
    },
    {
      id: 'todo-3',
      title: '买咖啡豆',
      description: '深烘 500g',
      date: today,
      categoryId: 'cat-life',
      completed: true,
      createdAt: Date.now() - 70000000,
    },
    {
      id: 'todo-4',
      title: '整理周报',
      description: '',
      date: today,
      categoryId: 'cat-work',
      completed: false,
      createdAt: Date.now() - 60000000,
    },
  ];
}
