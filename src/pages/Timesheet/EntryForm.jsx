import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { timesheetSchema } from "./timesheet.schema";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";

const EntryForm = ({ projets, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(timesheetSchema),
    defaultValues: {
      projet_id: "",
      start_time: "",
      end_time: "",
      description: "",
    },
  });

  const projetOptions = projets.map((p) => ({
    value: p.id,
    label: `${p.client_nom || "Client inconnu"} — ${p.nom}`,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="standard-form">
      <Select
        label="Projet"
        placeholder="Sélectionner un projet..."
        options={projetOptions}
        {...register("projet_id")}
        error={errors.projet_id}
      />

      <Input label="Début" type="datetime-local" {...register("start_time")} error={errors.start_time} />
      <Input label="Fin" type="datetime-local" {...register("end_time")} error={errors.end_time} />

      <Input
        label="Description (optionnel)"
        placeholder="Qu'avez-vous fait ?"
        {...register("description")}
        error={errors.description}
      />

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Ajouter l'entrée"}
        </button>
      </div>
    </form>
  );
};

export default EntryForm;
