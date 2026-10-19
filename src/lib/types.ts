// Domain types mirror the planned database tables (media_items, user_media_status, quotes, activity_feed).
export type MediaType = "movie" | "book";
export type MediaStatus = "watched" | "watching" | "watchlist";

export interface MediaItem {
  id: string;
  title: string;
  year: number;
  genre: string;
  poster_url: string;
  type: MediaType;
}

export interface UserMediaStatus {
  media_id: string;
  status: MediaStatus;
  rating: number | null; // 0.5 - 5.0, step 0.5
  updated_at: string;
}

export interface Quote {
  id: string;
  user: string;
  media_id: string;
  quote_text: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  user: string;
  action_type: "rated" | "quoted" | "started" | "added";
  media_id: string;
  comment?: string | undefined;
  rating?: number | undefined;
  created_at: string;
}

export const STATUS_LABELS: Record<MediaType, Record<MediaStatus, string>> = {
  movie: { watched: "Vista", watching: "Viendo", watchlist: "Por ver" },
  book: { watched: "Leído", watching: "Leyendo", watchlist: "Por leer" },
};

export function clampRating(value: number): number {
  const r = Math.round(value * 2) / 2;
  return Math.min(5, Math.max(0.5, r));
}
