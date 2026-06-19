import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addUserSchema } from "./user.schema";
import Input from "../../components/ui/Input/Input";
import FormField from "../../components/ui/FormField";

const AddUserForm = ({ onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addUserSchema),
    defaultValues: { role: "employe", is_kiosk_user: false },
  });

  const isKiosk = watch("is_kiosk_user");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="standard-form">
      <Input label="Nom complet" placeholder="Ex: Jean Dupont" {...register("nom")} error={errors.nom} />

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
          <input type="checkbox" {...register("is_kiosk_user")} />
          <span style={{ fontWeight: 500 }}>Utilisateur Kiosque (Pointage par NIP seulement)</span>
        </label>
      </div>

      {!isKiosk ? (
        <>
          <Input
            label="Adresse Email"
            type="email"
            placeholder="jean.dupont@madsuite.com"
            {...register("email")}
            error={errors.email}
          />
          <Input label="Mot de passe provisoire" type="password" {...register("password")} error={errors.password} />
        </>
      ) : (
        <Input
          label="NIP (4 chiffres)"
          type="text"
          placeholder="1234"
          maxLength={4}
          {...register("pin")}
          error={errors.pin}
        />
      )}

      <FormField label="Rôle système" error={errors.role}>
        <select className="input-field" {...register("role")} disabled={isKiosk}>
          <option value="employe">Employé</option>
          <option value="manager">Manager</option>
          <option value="admin">Administrateur</option>
        </select>
      </FormField>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Création..." : "Créer l'utilisateur"}
        </button>
      </div>
    </form>
  );
};

export default AddUserForm;
