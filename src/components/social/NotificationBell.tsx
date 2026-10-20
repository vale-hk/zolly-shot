import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Bell, Heart, MessageCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { inputCls } from '@/components/ui-kit/Modal';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/lib/store';

type Note = { kind: string; activity_id: string; actor: string; body: string | null; created_at: string };
const SEEN = 'zolly-notes-seen';

/** Likes and comments others leave on the signed-in user's posts, with inline replies. */
export function NotificationBell() {
  const { user, addComment } = useStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [seen, setSeen] = useState('');
  const [reply, setReply] = useState<Record<string, string>>({});
  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.rpc('my_notifications');
    setNotes((data ?? []) as Note[]);
  }, [user]);
  useEffect(() => {
    if (!user) return;
    setSeen(localStorage.getItem(SEEN) ?? '');
    void load();
    const timer = setInterval(load, 30000);
    // Unique name per mount: several bells (sidebar + header) and StrictMode remounts must not reuse a subscribed channel.
    const ch = supabase.channel(`notes-${user.id}-${crypto.randomUUID()}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_comments' }, () => void load()).subscribe();
    return () => { clearInterval(timer); void supabase.removeChannel(ch); };
  }, [user, load]);
  if (!user) return null;
  const unread = notes.filter(n => n.created_at > seen).length;
  const markSeen = (open: boolean) => { if (open && notes[0]) { localStorage.setItem(SEEN, notes[0].created_at); setSeen(notes[0].created_at); } };
  const send = async (e: FormEvent, n: Note, key: string) => {
    e.preventDefault(); const text = reply[key]?.trim(); if (!text) return;
    if (await addComment(n.activity_id, text)) setReply(r => ({ ...r, [key]: '' }));
  };
  return <Popover onOpenChange={markSeen}>
    <PopoverTrigger asChild><Button variant="ghost" size="icon" aria-label={`Notificaciones${unread ? ` (${unread} nuevas)` : ''}`} className="relative"><Bell />{unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">{unread}</span>}</Button></PopoverTrigger>
    <PopoverContent align="end" className="max-h-[70vh] w-80 overflow-y-auto">
      <h3 className="mb-3 text-lg">Notificaciones</h3>
      {notes.length === 0 ? <p className="text-sm text-muted-foreground">Aún no hay Me gusta ni comentarios en tus publicaciones.</p> :
        <ul className="space-y-3">{notes.map((n, i) => { const key = `${n.activity_id}-${i}`; return <li key={key} className="frame-perf p-3 text-sm">
          <p className="flex items-start gap-2">{n.kind === 'like' ? <Heart className="h-4 w-4 shrink-0 text-primary" /> : <MessageCircle className="h-4 w-4 shrink-0 text-star" />}<span><b>{n.actor}</b> {n.kind === 'like' ? 'le dio Me gusta a tu publicación' : <>comentó: <span className="text-muted-foreground">{n.body}</span></>}</span></p>
          {n.kind === 'comment' && <form onSubmit={e => send(e, n, key)} className="mt-2 flex gap-2"><input className={inputCls} maxLength={300} aria-label="Responder" placeholder="Responder…" value={reply[key] ?? ''} onChange={e => setReply(r => ({ ...r, [key]: e.target.value }))} /><Button size="sm" type="submit">Enviar</Button></form>}
        </li>; })}</ul>}
    </PopoverContent>
  </Popover>;
}
