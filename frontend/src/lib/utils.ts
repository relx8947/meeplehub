import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });
}

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function getPlaytimeLabel(min?: number, max?: number): string {
  if (!min && !max) return '未知';
  if (min === max) return `${min} 分钟`;
  return `${min || '?'}-${max || '?'} 分钟`;
}

export function getPlayerCountLabel(min: number, max: number): string {
  if (min === max) return `${min} 人`;
  return `${min}-${max} 人`;
}

export function getDifficultyLabel(difficulty?: string): string {
  const labels: Record<string, string> = {
    beginner: '入门',
    intermediate: '进阶',
    advanced: '硬核',
  };
  return labels[difficulty || ''] || '未知';
}

export function getDifficultyColor(difficulty?: string): string {
  const colors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };
  return colors[difficulty || ''] || 'bg-gray-100 text-gray-800';
}

export function getRoomStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    waiting: '等待对手',
    playing: '对局中',
    finished: '已结束',
  };
  return labels[status] || status;
}

export function getRoomStatusColor(status: string): string {
  const colors: Record<string, string> = {
    waiting: 'bg-yellow-100 text-yellow-800',
    playing: 'bg-green-100 text-green-800',
    finished: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getModeLabel(mode: string): string {
  return mode === 'ai' ? '人机对战' : '双人对战';
}

export function getGameNameZh(slug: string): string {
  const names: Record<string, string> = {
    gomoku: '五子棋',
    reversi: '黑白棋',
    'connect-four': '四子棋',
  };
  return names[slug] || slug;
}

export function getRoomPlayHref(room: { gameSlug: string; id: string }): string {
  return `/play/${room.gameSlug}/${room.id}`;
}
