import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Modal, btnPrimary, inputCls } from "@/components/ui-kit/Modal";
import { RatingStars } from "./RatingStars";
import { useStore } from "@/lib/store";
import type { MediaItem } from "@/lib/types";

export function RateModal({ item, initial, onClose }: { item: MediaItem | null; initial: number | null; onClose: () => void }) {
  const { rate } = useStore();
  const [value, setValue] = useState<number>(initial ?? 0);
  const [comment, setComment] = useState("");
  return (
    <Modal open={!!item} onClose={onClose} title={`Calificar "${item?.title ?? ""}"`}>
      <div className="flex flex-col items-center gap-3 py-2">
        <RatingStars value={value} onChange={setValue} size={36} />
        <p className="font-display text-3xl text-star">{value ? value.toFixed(1) : "—"}</p>
      </div>
      <textarea className={inputCls} rows={3} maxLength={280} placeholder="¿Qué te pareció? (opcional)" value={comment} onChange={(e) => setComment(e.target.value)} />
      <p className="mt-2 text-xs text-muted-foreground">La calificación, reseña y tu nombre visible serán públicos. No incluyas datos personales.</p>
      <Button
        className={`${btnPrimary} mt-4 w-full`}
        disabled={!value}
        onClick={async () => {
          if (item) await rate(item.id, value, comment.trim() || undefined);
          onClose();
        }}
      >
        Guardar y publicar
      </Button>
    </Modal>
  );
}
