import { cn } from '@/lib/utils';

/** Zolly Shot brand: IMAX frame holding a cinema camera over a film strip, name and slogan. */
export function ZollyLogo({ size = 'md', className, slogan = true }: { size?: 'md' | 'lg' | 'xl'; className?: string; slogan?: boolean }) {
  return (
    <span className={cn('zolly-logo', `zolly-${size}`, className)} aria-label="Zolly Shot — El cine no termina en los créditos">
      <svg className="zolly-icon" viewBox="0 0 64 48" aria-hidden>
        <path d="M4 6 Q32 0 60 6 L60 42 Q32 48 4 42 Z" fill="none" stroke="var(--star)" strokeWidth="2.5" />
        <rect x="8" y="31" width="48" height="9" rx="1" fill="var(--primary)" />
        {[11, 18, 25, 32, 39, 46, 53].map(x => <rect key={x} x={x - 1.5} y="33.5" width="3" height="4" rx=".6" fill="var(--background)" />)}
        <rect x="17" y="17" width="22" height="12" rx="2" fill="var(--foreground)" />
        <path d="M39 20 L49 16 L49 30 L39 26 Z" fill="var(--foreground)" />
        <circle cx="21" cy="12" r="5" fill="none" stroke="var(--foreground)" strokeWidth="2.5" />
        <circle cx="33" cy="12" r="5" fill="none" stroke="var(--foreground)" strokeWidth="2.5" />
        <circle cx="28" cy="23" r="3" fill="var(--primary)" />
      </svg>
      <span className="flex flex-col">
        <span className="zolly-word" aria-hidden>
          <span className="zolly-cap">Z</span>olly<span className="zolly-gap" /><span className="zolly-cap">S</span>hot
        </span>
        {slogan && <span className="zolly-slogan" aria-hidden>El cine no termina en los créditos</span>}
      </span>
    </span>
  );
}
