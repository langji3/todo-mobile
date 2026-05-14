export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isToday(dateStr: string): boolean {
  return dateStr === formatDate(new Date());
}

export function isPastDate(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = parseDate(dateStr);
  target.setHours(0, 0, 0, 0);
  return target < today;
}

export function isFutureOrToday(dateStr: string): boolean {
  return !isPastDate(dateStr);
}

export function getMonthData(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();
  return { year, month, daysInMonth, startWeekday };
}

export function getRelativeDateLabel(dateStr: string): string {
  if (isToday(dateStr)) return '今天';
  const tomorrow = formatDate(new Date(Date.now() + 86400000));
  if (dateStr === tomorrow) return '明天';
  const d = parseDate(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
