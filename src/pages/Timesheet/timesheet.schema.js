import * as z from "zod";

/**
 * Schéma de validation pour une entrée manuelle de temps
 */
export const timesheetSchema = z
  .object({
    projet_id: z.coerce.number().int().positive("Veuillez sélectionner un projet"),
    start_time: z.string().min(1, "L'heure de début est requise"),
    end_time: z.string().min(1, "L'heure de fin est requise"),
    description: z.string().max(2000, "La description est trop longue").optional().or(z.literal("")),
  })
  .refine((data) => new Date(data.end_time) > new Date(data.start_time), {
    message: "La fin doit être après le début",
    path: ["end_time"],
  });
