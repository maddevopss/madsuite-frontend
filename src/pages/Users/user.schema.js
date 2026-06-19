import * as z from "zod";

/**
 * Schéma de validation pour la création d'un utilisateur
 * Centralise les messages d'erreur et les contraintes.
 */
export const addUserSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  is_kiosk_user: z.boolean().default(false).optional(),
  email: z.string().email("Format d'email invalide").optional().or(z.literal('')),
  password: z.string().optional().or(z.literal('')),
  pin: z.string().regex(/^\d{4}$/, "Le NIP doit contenir 4 chiffres").optional().or(z.literal('')),
  role: z.enum(["admin", "manager", "employe"], {
    required_error: "Le rôle est obligatoire",
  }),
}).refine((data) => data.is_kiosk_user || data.email, {
  message: "L'email est requis pour les utilisateurs standards",
  path: ["email"]
}).refine((data) => data.is_kiosk_user || (data.password && data.password.length >= 8), {
  message: "Le mot de passe (min 8 caractères) est requis",
  path: ["password"]
}).refine((data) => !data.is_kiosk_user || (data.pin && data.pin.length === 4), {
  message: "Le NIP à 4 chiffres est requis pour le kiosque",
  path: ["pin"]
});

export const passwordSchema = z
  .object({
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });
