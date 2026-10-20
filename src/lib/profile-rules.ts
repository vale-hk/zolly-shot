import { z } from 'zod';
export const profileSchema = z.object({
  name: z.string().trim().min(1, 'El nombre visible es obligatorio').max(60, 'Máximo 60 caracteres'),
  pseudonym: z.string().trim().max(40, 'El seudónimo admite máximo 40 caracteres'),
});
