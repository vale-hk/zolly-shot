import { createContext, useContext, type Context } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Activity, MediaItem, MediaStatus, Quote, UserMediaStatus } from './types';

export interface Store {
  media: MediaItem[]; statuses: UserMediaStatus[]; quotes: Quote[]; feed: Activity[];
  user: User | null; displayName: string; loading: boolean; authMode: 'login' | 'signup' | null;
  openAuth: (mode?: 'login' | 'signup') => void; closeAuth: () => void;
  syncUser: (user: User | null) => Promise<void>;
  addMedia: (m: Omit<MediaItem, 'id'>, status?: MediaStatus) => Promise<void>;
  setStatus: (id: string, status: MediaStatus) => Promise<void | boolean>;
  saveToWatchlist: (id: string) => Promise<void>;
  rate: (id: string, rating: number, comment?: string) => Promise<void>;
  addQuote: (id: string, text: string, timestamp: string) => Promise<void>;
}

// Preserve only the context identity during development updates, never user data.
const hot = import.meta.hot;
export const StoreContext: Context<Store | null> =
  hot?.data?.storeContext ?? createContext<Store | null>(null);
if (hot?.data) hot.data.storeContext = StoreContext;

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be inside StoreProvider');
  return store;
}