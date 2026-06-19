import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema } from "./project.schema";
import Input from "../../components/UI/Input";
import FormField from "../../components/UI/FormField";

const ProjectForm = ({ clients, onSubmit, onCancel, initialData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData || { status: "actif", taux_horaire: 0 },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="standard-form">
      <Input label="Nom du projet" {...register("nom")} error={errors.nom} />

      <FormField label="Client" error={errors.client_id}>
        <select className="input-field" {...register("client_id")}>
          <option value="">Sélectionner un client...</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
      </FormField>

      <div className="form-row" style={{ display: "flex", gap: "1rem" }}>
        <Input
          label="Taux horaire ($)"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register("taux_horaire")}
          error={errors.taux_horaire}
        />
        <Input label="Budget total" type="number" placeholder="Optionnel" {...register("budget")} error={errors.budget} />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Enregistrer le projet"}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
