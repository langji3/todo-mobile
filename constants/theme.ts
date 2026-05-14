export const Theme = {
  spacing: {
    page: 16,
    card: 12,
    small: 8,
    medium: 16,
    large: 24,
  },
  borderRadius: {
    card: 12,
    button: 8,
    circle: 9999,
  },
  fontSize: {
    pageTitle: 18,
    taskTitle: 17,
    taskDesc: 14,
    auxiliary: 13,
    body: 14,
    caption: 12,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  } as const,
  lineHeight: {
    taskTitle: 24,
    taskDesc: 20,
  },
  iconSize: {
    small: 16,
    medium: 20,
    large: 24,
    xlarge: 40,
  },
  fabSize: 56,
  avatar: {
    small: 40,
    medium: 64,
    large: 80,
  },
  taskCircle: 24,
} as const;
