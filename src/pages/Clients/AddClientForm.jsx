import { memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema } from "./client.schema";
import Input from "../../components/ui/Input";

function AddClientForm({ onSubmit, onCancel, initialData }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || {
      nom: "",
      email: "",
      telephone: "",
      adresse: "",
      notes: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="standard-form">
      <Input label="Nom de l'entreprise ou client" placeholder="Ex: Acme Corp" {...register("nom")} error={errors.nom} />

      <div className="form-row" style={{ display: "flex", gap: "1rem" }}>
        <Input
          label="Email de contact"
          type="email"
          placeholder="contact@client.com"
          {...register("email")}
          error={errors.email}
        />
        <Input label="Téléphone" placeholder="(555) 000-0000" {...register("telephone")} error={errors.telephone} />
      </div>

      <Input
        label="Adresse complète"
        placeholder="123 Rue de la Paix, Ville, Code Postal"
        {...register("adresse")}
        error={errors.adresse}
      />

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Sauvegarder le client"}
        </button>
      </div>
    </form>
  );
}

export default memo(AddClientForm);
