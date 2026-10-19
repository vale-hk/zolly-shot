import { cn } from "@/lib/utils";
import { STATUS_LABELS, type MediaStatus, type MediaType } from "@/lib/types";

const styles: Record<MediaStatus, string> = {
  watched: "bg-watched/15 text-watched border-watched/30",
  watching: "bg-watching/15 text-watching border-watching/30",
  watchlist: "bg-watchlist/15 text-watchlist border-watchlist/30",
};

export function ItemStatusBadge({ status, mediaType = "movie" }: { status: MediaStatus; mediaType?: MediaType }) {
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur", styles[status])}>
      {STATUS_LABELS[mediaType][status]}
    </span>
  );
}
