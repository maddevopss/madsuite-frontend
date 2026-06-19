import * as z from "zod";

/**
 * Schéma de validation pour un projet
 * Gère les taux horaires et les budgets comme des nombres positifs.
 */
export const projectSchema = z.object({
  nom: z.string().min(2, "Le nom du projet doit contenir au moins 2 caractères"),
  client_id: z.string().uuid("Veuillez sélectionner un client valide"),
  taux_horaire: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ required_error: "Le taux horaire est obligatoire" }).min(0.01, "Le taux doit être supérieur à 0"),
  ),
  budget: z.preprocess(
    (val) => (val === "" || val == null ? undefined : Number(val)),
    z.number().min(0).nonnegative().optional(),
  ),
  budget_hours: z.preprocess(
    (val) => (val === "" || val == null ? undefined : Number(val)),
    z.number().min(0).nonnegative().optional(),
  ),
  budget_amount: z.preprocess(
    (val) => (val === "" || val == null ? undefined : Number(val)),
    z.number().min(0).nonnegative().optional(),
  ),
  description: z.string().optional(),
  status: z.enum(["actif", "archive", "termine"]).default("actif"),
  billing_increment: z.preprocess(
    (val) => (val === "" || val == null ? 1 : Number(val)),
    z.number().min(1).max(60).optional(),
  ),
  billing_rounding_type: z.enum(["exact", "up", "nearest"]).default("exact").optional(),
});
