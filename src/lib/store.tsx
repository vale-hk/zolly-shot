import { useState, useEffect, useRef, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FEED, MEDIA, QUOTES } from './mock-data';
import { saveOnce } from './library-rules';
import type { Activity, MediaItem, MediaStatus, PostComment, Quote, UserMediaStatus } from './types';
import { StoreContext, type Idea, type Store } from './store-context';
export { useStore } from './store-context';
const today = () => new Date().toLocaleDateString('en-CA');
export function StoreProvider({ children }: { children: ReactNode }) {
  const [media, setMedia] = useState<MediaItem[]>(MEDIA);
  const [statuses, setStatuses] = useState<UserMediaStatus[]>([]);
  const statusesRef = useRef(statuses);
  const [quotes, setQuotes] = useState<Quote[]>(QUOTES);
  const [feed, setFeed] = useState<Activity[]>(FEED);
  const [user, setUser] = useState<User | null>(null);
  const identity = useRef<string | null>(null);
  const syncRevision = useRef(0);
  const [displayName, setDisplayName] = useState('Cinéfilo');
  const [pseudonym, setPseudonym] = useState<string | null>(null);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [myLikes, setMyLikes] = useState<string[]>([]);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);
  const replaceStatuses = (rows: UserMediaStatus[]) => { statusesRef.current = rows; setStatuses(rows); };
  const syncUser = async (next: User | null) => {
    const revision = ++syncRevision.current;
    identity.current = next?.id ?? null; setUser(next); replaceStatuses([]); setIdeas([]); setLoading(true);
    const id = next?.id ?? null;
    if (next) {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (identity.current !== id || syncRevision.current !== revision) return;
      if (error || (data?.nextLevel === 'aal2' && data.currentLevel !== 'aal2')) {
        setAuthMode('login'); setLoading(false); return;
      }
      setAuthMode(null);
    }
    const [catalog, qs, activities, library, profile, cms, counts, mine, ids] = await Promise.all([
      supabase.from('media_items').select('id,title,year,genre,poster_url,type,synopsis,director,duration,based_on'), supabase.from('quotes').select('id,media_id,quote_text,timestamp,display_name,created_at').order('created_at', { ascending: false }).limit(100),
      supabase.from('activity_feed').select('id,media_id,action_type,comment,rating,display_name,created_at').order('created_at', { ascending: false }).limit(100),
      next ? supabase.from('user_media_status').select('*').eq('user_id', next.id) : Promise.resolve({ data: [], error: null }),
      next ? supabase.from('profiles').select('display_name,pseudonym').eq('id', next.id).maybeSingle() : Promise.resolve({ data: null, error: null }),
      supabase.from('post_comments').select('id,activity_id,display_name,body,created_at').order('created_at').limit(500),
      supabase.rpc('post_like_counts'),
      next ? supabase.from('post_likes').select('activity_id').eq('user_id', next.id) : Promise.resolve({ data: [], error: null }),
      next ? supabase.from('user_ideas').select('id,area,media_id,title,body,created_at').eq('user_id', next.id).order('created_at', { ascending: false }) : Promise.resolve({ data: [], error: null }),
    ]);
    if (identity.current !== id || syncRevision.current !== revision) return;
    const err = catalog.error || qs.error || activities.error || library.error || profile.error;
    if (err) toast.error('No pudimos cargar tus datos. Intenta nuevamente.');
    setMedia([...MEDIA, ...(catalog.data ?? []).map(m => ({ ...m, type: m.type as MediaItem['type'], synopsis: m.synopsis ?? undefined, director: m.director ?? undefined, duration: m.duration ?? undefined, based_on: m.based_on ?? undefined }))]);
    setQuotes([...(qs.data ?? []).map(q => ({ ...q, user: q.display_name })), ...QUOTES]);
    setFeed([...(activities.data ?? []).map(a => ({ ...a, user: a.display_name, action_type: a.action_type as Activity['action_type'], comment: a.comment ?? undefined, rating: a.rating ?? undefined, created_at: new Date(a.created_at).toLocaleDateString('es-CL') })), ...FEED]);
    replaceStatuses((library.data ?? []).map(s => ({ ...s, status: s.status as MediaStatus })));
    setDisplayName(profile.data?.display_name ?? 'Cinéfilo'); setPseudonym(profile.data?.pseudonym ?? null);
    setComments((cms.data ?? []).map(c => ({ ...c, created_at: new Date(c.created_at).toLocaleDateString('es-CL') })));
    setLikeCounts(Object.fromEntries((counts.data ?? []).map(c => [c.activity_id, Number(c.likes)])));
    setMyLikes((mine.data ?? []).map(l => l.activity_id)); setIdeas((ids.data ?? []) as Idea[]); setLoading(false);
  };
  useEffect(() => {
    const revision = syncRevision.current;
    void supabase.auth.getUser().then(({ data }) => {
      if (syncRevision.current === revision) void syncUser(data.user);
    });
  }, []);
  const signedIn = () => {
    if (loading) { toast('Un momento, estamos cargando tu Filmoteca.'); return false; }
    if (user) return true;
    setAuthMode('login'); return false;
  };
  const post = async (action_type: Activity['action_type'], media_id: string, comment?: string, rating?: number) => {
    if (!user) return;
    const { data, error } = await supabase.from('activity_feed').insert({ user_id: user.id, media_id, action_type, comment: comment ?? null, rating: rating ?? null, display_name: displayName }).select('id').single();
    if (error) { toast.error('Tu actividad no se pudo publicar.'); return; }
    setFeed(f => [{ id: data.id, user: displayName, media_id, action_type, comment, rating, created_at: 'ahora' }, ...f]);
  };
  const setStatus = async (mediaId: string, status: MediaStatus, rating?: number) => {
    if (!signedIn() || !user) return;
    const previous = statusesRef.current;
    const existing = previous.find(s => s.media_id === mediaId);
    const row = { media_id: mediaId, status, rating: rating ?? existing?.rating ?? null, updated_at: today(), watched_at: status === 'watched' ? today() : null };
    replaceStatuses([...previous.filter(s => s.media_id !== mediaId), row]);
    const { error } = await supabase.from('user_media_status').upsert({ ...row, user_id: user.id }, { onConflict: 'user_id,media_id' });
    if (error) { replaceStatuses(previous); toast.error('No se pudo guardar el cambio.'); return false; }
    return true;
  };
  const saveToWatchlist = async (id: string) => {
    if (!signedIn() || !user) return;
    const previous = statusesRef.current;
    const next = saveOnce(previous, id, today());
    if (next === previous) return;
    replaceStatuses(next);
    const { error } = await supabase.from('user_media_status').upsert({ user_id: user.id, media_id: id, status: 'watchlist' }, { onConflict: 'user_id,media_id', ignoreDuplicates: true });
    if (error) { replaceStatuses(previous); toast.error('No se pudo guardar la película.'); }
    else toast.success('Guardada en tu Watchlist');
  };
  const removeFromList = async (id: string) => {
    if (!signedIn() || !user) return;
    const previous = statusesRef.current;
    replaceStatuses(previous.filter(s => s.media_id !== id));
    const { error } = await supabase.from('user_media_status').delete().eq('user_id', user.id).eq('media_id', id);
    if (error) { replaceStatuses(previous); toast.error('No se pudo eliminar de tu lista.'); } else toast.success('Eliminada de tu Filmoteca');
  };
  const updateProfile = async (name: string, alias: string) => {
    if (!signedIn() || !user) return false;
    const { error } = await supabase.from('profiles').update({ display_name: name.trim(), pseudonym: alias.trim() || null }).eq('id', user.id);
    if (error) { toast.error('No se pudo guardar tu perfil.'); return false; }
    setDisplayName(name.trim()); setPseudonym(alias.trim() || null); toast.success('Perfil actualizado'); return true;
  };
  const toggleLike = async (activityId: string) => {
    if (!signedIn() || !user) return;
    const liked = myLikes.includes(activityId);
    setMyLikes(l => liked ? l.filter(x => x !== activityId) : [...l, activityId]);
    setLikeCounts(c => ({ ...c, [activityId]: Math.max(0, (c[activityId] ?? 0) + (liked ? -1 : 1)) }));
    const { error } = liked ? await supabase.from('post_likes').delete().eq('user_id', user.id).eq('activity_id', activityId) : await supabase.from('post_likes').insert({ activity_id: activityId, user_id: user.id });
    if (error) { setMyLikes(l => liked ? [...l, activityId] : l.filter(x => x !== activityId)); setLikeCounts(c => ({ ...c, [activityId]: Math.max(0, (c[activityId] ?? 0) + (liked ? 1 : -1)) })); toast.error('No se pudo registrar tu Me gusta.'); }
  };
  const addComment = async (activityId: string, body: string) => {
    if (!signedIn() || !user) return false;
    const { data, error } = await supabase.from('post_comments').insert({ activity_id: activityId, body: body.trim() }).select('id').single();
    if (error) { toast.error('No se pudo publicar tu comentario.'); return false; }
    setComments(c => [...c, { id: data.id, activity_id: activityId, display_name: displayName, body: body.trim(), created_at: 'ahora' }]); return true;
  };
  const addIdea: Store['addIdea'] = async (i) => {
    if (!signedIn() || !user) return false;
    const { data, error } = await supabase.from('user_ideas').insert({ ...i, user_id: user.id }).select('id,area,media_id,title,body,created_at').single();
    if (error) { toast.error('No se pudo guardar tu idea.'); return false; }
    setIdeas(x => [data as Idea, ...x]); toast.success('Idea guardada en tu diario privado'); return true;
  };
  const removeIdea = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('user_ideas').delete().eq('id', id).eq('user_id', user.id);
    if (error) toast.error('No se pudo eliminar la idea.'); else setIdeas(x => x.filter(i => i.id !== id));
  };
  const store: Store = { ideas, addIdea, removeIdea, media, statuses, quotes, feed, user, loading, displayName, authMode, pseudonym, likeCounts, myLikes, comments, removeFromList, updateProfile, toggleLike, addComment,
    openAuth: (mode = 'login') => setAuthMode(mode), closeAuth: () => setAuthMode(null), syncUser, setStatus, saveToWatchlist,
    addMedia: async (m, status = 'watchlist') => {
      if (!signedIn() || !user) return;
      const duplicate = media.find(x => x.title.trim().toLowerCase() === m.title.trim().toLowerCase() && x.year === m.year);
      if (duplicate) { await saveToWatchlist(duplicate.id); return duplicate.id; }
      const { data, error } = await supabase.from('media_items').insert({ ...m, type: 'movie', synopsis: m.synopsis ?? null, director: m.director ?? null, duration: m.duration ?? null, based_on: m.based_on ?? null, owner_id: user.id }).select('id').single();
      if (error) { toast.error('No se pudo agregar la película.'); return; }
      setMedia(rows => [{ ...m, id: data.id }, ...rows]); await setStatus(data.id, status); return data.id;
    },
    rate: async (id, rating, comment) => { if (!signedIn()) return; if (await setStatus(id, 'watched', rating)) await post('rated', id, comment, rating); },
    addQuote: async (media_id, quote_text, timestamp) => {
      if (!signedIn() || !user) return;
      const { data, error } = await supabase.from('quotes').insert({ user_id: user.id, media_id, quote_text, timestamp, display_name: displayName }).select('id').single();
      if (error) { toast.error('No se pudo guardar la cita.'); return; }
      setQuotes(q => [{ id: data.id, user: displayName, media_id, quote_text, timestamp }, ...q]); await post('quoted', media_id, quote_text);
    },
  };
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}
