import * as z from "zod";

/**
 * Schéma de validation pour un Client
 * Centralise les contraintes de saisie.
 */
export const clientSchema = z.object({
  nom: z.string().min(2, "Le nom du client doit contenir au moins 2 caractères"),
  email: z.string().email("Format d'email invalide").optional().or(z.literal("")),
  telephone: z.string().optional().or(z.literal("")),
  adresse: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});
