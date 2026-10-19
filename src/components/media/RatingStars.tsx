import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { MediaType } from "@/lib/types";

interface Props {
  value: number | null;
  onChange?: (v: number) => void;
  size?: number;
  mediaType?: MediaType;
}

/** Half-star rating. Interactive when onChange is provided (click left/right half). */
export function RatingStars({ value, onChange, size = 16 }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value ?? 0;
  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(null)} role={onChange ? "radiogroup" : undefined} aria-label={`Calificación ${value ?? 0} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = shown >= i ? 100 : shown >= i - 0.5 ? 50 : 0;
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-muted-foreground/40" style={{ width: size, height: size }} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill}%` }}>
              <Star className="fill-star text-star" style={{ width: size, height: size }} />
            </span>
            {onChange &&
              [i - 0.5, i].map((v, idx) => (
                <button
                  key={v}
                  type="button"
                  aria-label={`${v} estrellas`}
                  className={cn("absolute top-0 h-full w-1/2 cursor-pointer", idx === 0 ? "left-0" : "right-0")}
                  onMouseEnter={() => setHover(v)}
                  onClick={() => onChange(v)}
                />
              ))}
          </span>
        );
      })}
    </div>
  );
}
