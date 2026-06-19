import * as z from "zod";

/**
 * Schéma de validation Login
 * Empêche les requêtes inutiles au serveur si le format est invalide.
 */
export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});
