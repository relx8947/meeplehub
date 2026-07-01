import axios from 'axios';
import { getOrCreatePlayer } from './playerIdentity';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach the local anonymous player identity.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const player = getOrCreatePlayer();
    const headers = config.headers as Record<string, string>;
    headers['x-player-id'] = player.id;
    headers['x-player-nickname'] = encodeURIComponent(player.nickname);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);
