import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div role="dialog" aria-label={title} className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl border bg-popover p-6 shadow-glow" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Cerrar" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const inputCls = "w-full rounded-lg border bg-input/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
export const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50";
export const btnGhost = "inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted";
