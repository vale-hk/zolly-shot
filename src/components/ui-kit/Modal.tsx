import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  return <Dialog open={open} onOpenChange={value => { if (!value) onClose(); }}><DialogContent aria-describedby={undefined} className="max-h-[90svh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-lg"><DialogTitle className="pr-7 font-display text-2xl">{title}</DialogTitle><div>{children}</div></DialogContent></Dialog>;
}
export const inputCls = 'w-full rounded-lg border bg-input/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring';
export const btnPrimary = 'inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50';
export const btnGhost = 'inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted';
