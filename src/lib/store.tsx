import { createContext, useContext, useState, type ReactNode } from "react";
import { FEED, MEDIA, QUOTES, STATUSES } from "./mock-data";
import type { Activity, MediaItem, MediaStatus, Quote, UserMediaStatus } from "./types";

// In-memory store using mock data. Swap internals for Lovable Cloud queries later.
interface Store {
  media: MediaItem[];
  statuses: UserMediaStatus[];
  quotes: Quote[];
  feed: Activity[];
  addMedia: (m: Omit<MediaItem, "id">, status?: MediaStatus) => void;
  setStatus: (mediaId: string, status: MediaStatus) => void;
  rate: (mediaId: string, rating: number, comment?: string) => void;
  addQuote: (mediaId: string, text: string, timestamp: string) => void;
}

const Ctx = createContext<Store | null>(null);
const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 9);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [media, setMedia] = useState(MEDIA);
  const [statuses, setStatuses] = useState(STATUSES);
  const [quotes, setQuotes] = useState(QUOTES);
  const [feed, setFeed] = useState(FEED);

  const upsert = (mediaId: string, patch: Partial<UserMediaStatus>) =>
    setStatuses((s) => {
      const existing = s.find((x) => x.media_id === mediaId);
      if (existing) return s.map((x) => (x.media_id === mediaId ? { ...x, ...patch, updated_at: today() } : x));
      return [...s, { media_id: mediaId, status: "watchlist", rating: null, ...patch, updated_at: today() }];
    });

  const post = (a: Omit<Activity, "id" | "user" | "created_at">) =>
    setFeed((f) => [{ id: uid(), user: "Tú", created_at: "ahora", ...a }, ...f]);

  const store: Store = {
    media, statuses, quotes, feed,
    addMedia: (m, status = "watchlist") => {
      const id = uid();
      setMedia((x) => [{ ...m, id }, ...x]);
      upsert(id, { status });
      post({ action_type: "added", media_id: id, comment: "Agregó una película nueva al catálogo." });
    },
    setStatus: (mediaId, status) => {
      upsert(mediaId, { status });
      if (status === "watching") post({ action_type: "started", media_id: mediaId });
    },
    rate: (mediaId, rating, comment) => {
      upsert(mediaId, { rating, status: "watched" });
      post({ action_type: "rated", media_id: mediaId, rating, comment });
    },
    addQuote: (mediaId, text, timestamp) => {
      setQuotes((q) => [{ id: uid(), user: "Tú", media_id: mediaId, quote_text: text, timestamp }, ...q]);
      post({ action_type: "quoted", media_id: mediaId, comment: text });
    },
  };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be inside StoreProvider");
  return s;
}
