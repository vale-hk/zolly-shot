import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import type { Activity, MediaItem, Quote, UserMediaStatus } from "./types";

export const GENRES = ["Acción", "Animación", "Aventura", "Bélico", "Biográfico", "Ciencia ficción", "Comedia", "Documental", "Drama", "Fantasía", "Musical", "Neorrealismo", "Noir", "Romance", "Suspenso", "Terror", "Thriller psicológico", "Western"];
export const FIRST_YEAR = 1920;
export const catalogYears = (now = new Date()) => Array.from({ length: now.getFullYear() - FIRST_YEAR + 1 }, (_, i) => now.getFullYear() - i);

export const MEDIA: MediaItem[] = [
  { id: "m1", title: "Lluvia de Neón", synopsis: "En una ciudad que vive bajo la lluvia, una detective encuentra una cinta que conecta una desaparición con los secretos de su pasado. Mientras las luces de neón ocultan las huellas, deberá decidir cuánto está dispuesta a perder por revelar la verdad.", director: "Elena Ríos", duration: 118, year: 2023, genre: "Noir", poster_url: p1, type: "movie" },
  { id: "m2", title: "Luna Carmesí", synopsis: "Una astronauta recibe una señal desde una colonia abandonada en la Luna. Al regresar, descubre que la señal contiene recuerdos que todavía no ha vivido. Su búsqueda la obliga a confrontar la frontera entre memoria, tiempo y humanidad.", director: "Mateo Vidal", duration: 126, year: 2024, genre: "Ciencia ficción", poster_url: p2, type: "movie" },
  { id: "m3", title: "Tejados de París", synopsis: "Una fotógrafa y un músico se conocen en la azotea de un edificio parisino. Durante un verano recorren la ciudad buscando una melodía perdida, sin saber que sus encuentros cambiarán el rumbo de sus vidas.", director: "Claire Moreau", duration: 104, year: 2019, genre: "Romance", poster_url: p3, type: "movie" },
  { id: "m4", title: "La Cabaña del Bosque", synopsis: "Un grupo de amigos pasa un fin de semana en una cabaña aislada. Cuando encuentran grabaciones de sus propias conversaciones antes de haberlas pronunciado, comprenden que el bosque guarda algo más que silencio.", director: "Daniel Arce", duration: 97, year: 2021, genre: "Terror", poster_url: p4, type: "movie" },
  { id: "m5", title: "El Zorro de Cristal", synopsis: "Un pequeño zorro descubre que su bosque está perdiendo sus colores. Junto a una niña cartógrafa, emprende una aventura para recuperar los fragmentos de un antiguo cristal y aprender qué significa proteger un hogar.", director: "Lucía Torres", duration: 92, year: 2022, genre: "Animación", poster_url: p5, type: "movie" },
  { id: "m6", title: "Sol Rojo", synopsis: "Un guerrero regresa a su pueblo después de años de exilio y lo encuentra dividido por una antigua deuda. Para proteger a su familia, debe elegir entre la venganza y el honor antes del último amanecer.", director: "Kenji Sato", duration: 112, year: 2018, genre: "Acción", poster_url: p6, type: "movie" },
];

export const STATUSES: UserMediaStatus[] = [
  { media_id: "m1", status: "watched", rating: 4.5, updated_at: "2026-10-12" },
  { media_id: "m3", status: "watched", rating: 3.5, updated_at: "2026-10-05" },
  { media_id: "m6", status: "watched", rating: 5, updated_at: "2026-09-28" },
  { media_id: "m2", status: "watching", rating: null, updated_at: "2026-10-18" },
  { media_id: "m4", status: "watchlist", rating: null, updated_at: "2026-10-01" },
  { media_id: "m5", status: "watchlist", rating: null, updated_at: "2026-10-15" },
];

export const QUOTES: Quote[] = [
  { id: "q1", user: "Valeska", media_id: "m1", quote_text: "La ciudad nunca duerme, solo aprende a mentir mejor de noche.", timestamp: "01:12:40" },
  { id: "q2", user: "Tomás", media_id: "m2", quote_text: "Estamos hechos de polvo de estrellas que olvidó volver a casa.", timestamp: "00:48:03" },
  { id: "q3", user: "Camila", media_id: "m3", quote_text: "París no se visita. París te encuentra.", timestamp: "00:22:15" },
  { id: "q4", user: "Diego", media_id: "m6", quote_text: "Una espada sin honor es solo metal.", timestamp: "01:40:51" },
];

export const FEED: Activity[] = [
  { id: "a1", user: "Camila", action_type: "rated", media_id: "m3", rating: 4, comment: "Una carta de amor a la luz dorada. Lloré dos veces.", created_at: "hace 2 h" },
  { id: "a2", user: "Tomás", action_type: "quoted", media_id: "m2", comment: "Estamos hechos de polvo de estrellas que olvidó volver a casa.", created_at: "hace 5 h" },
  { id: "a3", user: "Diego", action_type: "started", media_id: "m4", comment: "Con las luces apagadas, como corresponde.", created_at: "ayer" },
  { id: "a4", user: "Valeska", action_type: "rated", media_id: "m1", rating: 4.5, comment: "Fotografía impecable, guion que se toma su tiempo.", created_at: "hace 3 días" },
  { id: "a5", user: "Ana", action_type: "added", media_id: "m5", comment: "La agregué a mi lista para el fin de semana.", created_at: "hace 4 días" },
];

// Days in 2026 with viewing activity: "YYYY-MM-DD" -> count
export const ACTIVITY_DAYS: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let seed = 7;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let m = 0; m < 10; m++) {
    for (let d = 1; d <= 28; d++) {
      const r = rand();
      if (r > 0.62) out[`2026-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`] = r > 0.93 ? 3 : r > 0.8 ? 2 : 1;
    }
  }
  return out;
})();
