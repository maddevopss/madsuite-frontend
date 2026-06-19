import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "./login.schema";
import Input from "../../components/UI/Input";
import authService from "../../api/authService";

/**
 * Composant LoginForm - Standardisé MADSuite
 * Utilise react-hook-form + Zod pour la validation.
 * Intègre automatiquement le flow Electron via authService.
 */
const LoginForm = ({ onLoginSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    try {
      const session = await authService.login(data.email, data.password);
      if (onLoginSuccess) onLoginSuccess(session);
    } catch (err) {
      // On mappe l'erreur serveur sur une erreur "root" pour l'UI
      const message = err?.response?.data?.message || err?.message || "Une erreur est survenue lors de la connexion.";

      setError("root", {
        message,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="standard-form login-form">
      <Input
        label="Adresse courriel"
        type="email"
        placeholder="nom@entreprise.com"
        autoComplete="email"
        {...register("email")}
        error={errors.email}
      />

      <Input
        label="Mot de passe"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        {...register("password")}
        error={errors.password}
      />

      {errors.root && (
        <div role="alert" className="error-message global-error" style={{ marginBottom: "1rem", textAlign: "center" }}>
          {errors.root.message}
        </div>
      )}

      <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
        {isSubmitting ? "Connexion en cours..." : "Se connecter"}
      </button>
    </form>
  );
};

export default LoginForm;
