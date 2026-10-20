import { Video } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Zolly Shot brand: cinema camera badge plus metallic lettering with film-strip Z and S. */
export function ZollyLogo({ size = 'md', className }: { size?: 'md' | 'lg' | 'xl'; className?: string }) {
  return (
    <span className={cn('zolly-logo', `zolly-${size}`, className)} aria-label="Zolly Shot">
      <span className="zolly-badge" aria-hidden><Video /></span>
      <span className="zolly-word" aria-hidden>
        <span className="zolly-cap">Z</span>olly<span className="zolly-gap" /><span className="zolly-cap">S</span>hot
      </span>
    </span>
  );
}
