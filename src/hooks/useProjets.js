import { useCallback, useEffect, useState } from "react";
import { useRefresh } from "../RefreshContext";
import { useToast } from "../ToastContext";
import { getApiErrorMessage } from "../api/apiError";
import { useConfirm } from "./useConfirm";

import { getProjects, createProject, updateProject, deleteProject } from "../api/projets.api";

import { getClientsDashboard } from "../api/clients.api";

const getEmptyForm = () => ({
  client_id: "",
  nom: "",
  description: "",
  date_fin: "",
  budget: "",
  taux_horaire: "",
  status: "actif",
  couleur: "",
});

export function useProjets() {
  const { refreshAppData } = useRefresh();
  const { showToast } = useToast();
  const { confirmProps, confirm } = useConfirm();

  const [projets, setProjets] = useState([]);
  const [clients, setClients] = useState([]);

  const [form, setForm] = useState(getEmptyForm);
  const [editForm, setEditForm] = useState(getEmptyForm);

  // Fonction pour charger les projets et clients depuis l'API
  const loadProjets = useCallback(async () => {
    try {
      const [projetsData, clientsData] = await Promise.all([getProjects(), getClientsDashboard()]);

      setProjets(projetsData || []);
      setClients(clientsData || []);
    } catch (err) {
      showToast("Erreur lors du chargement des projets.", "error");
      console.error("LOAD PROJETS:", err.response?.data || err.message);
    }
  }, [showToast]);

  // Charge les projets et clients au montage du composant
  useEffect(() => {
    loadProjets();
  }, [loadProjets]);

  // Réinitialise le formulaire de création
  const resetForm = useCallback(() => {
    setForm(getEmptyForm());
  }, []);

  // Réinitialise le formulaire d'édition
  const resetEditForm = useCallback(() => {
    setEditForm(getEmptyForm());
  }, []);

  // Récupère un projet par son ID
  const getProjetById = useCallback(
    (id) => {
      return projets.find((p) => String(p.id) === String(id)) || null;
    },
    [projets],
  );

  // Ajoute un nouveau projet
  const addProjet = useCallback(async () => {
    if (!form.nom.trim()) {
      showToast("Le nom du projet est requis.", "warning");
      return false;
    }

    if (!form.client_id) {
      showToast("Le client est requis.", "warning");
      return false;
    }

    try {
      await createProject({
        client_id: Number(form.client_id),
        nom: form.nom.trim(),
        description: form.description || null,
        date_fin: form.date_fin || null,
        budget: Number(form.budget || 0),
        taux_horaire: Number(form.taux_horaire || 0),
        status: form.status || "actif",
        couleur: form.couleur || null,
      });

      resetForm();
      await loadProjets();

      refreshAppData();
      showToast("Projet créé avec succès.", "success");

      return true;
    } catch (err) {
      showToast(getApiErrorMessage(err, "Erreur lors de la création du projet."), "error");
      console.error("CREATE PROJET:", err.response?.data || err.message);

      return false;
    }
  }, [form, loadProjets, refreshAppData, resetForm, showToast]);

  // Prépare le formulaire d'édition avec les données du projet sélectionné
  const startEditProjet = useCallback((projet) => {
    if (!projet) return;

    setEditForm({
      client_id: projet.client_id || "",
      nom: projet.nom || projet.projet || "",
      description: projet.description || "",
      date_fin: projet.date_fin ? String(projet.date_fin).slice(0, 10) : "",
      budget: projet.budget ?? "",
      taux_horaire: projet.taux_horaire ?? "",
      status: projet.status || "actif",
      couleur: projet.couleur || "",
    });
  }, []);

  // Sauvegarde les modifications d'un projet
  const saveProjet = useCallback(
    async (projetId) => {
      if (!projetId) {
        showToast("Projet introuvable.", "error");
        return false;
      }

      if (!editForm.nom.trim()) {
        showToast("Le nom du projet est requis.", "warning");
        return false;
      }

      if (!editForm.client_id) {
        showToast("Le client est requis.", "warning");
        return false;
      }

      try {
        await updateProject(projetId, {
          client_id: Number(editForm.client_id),
          nom: editForm.nom.trim(),
          description: editForm.description || null,
          date_fin: editForm.date_fin || null,
          budget: Number(editForm.budget || 0),
          taux_horaire: Number(editForm.taux_horaire || 0),
          status: editForm.status || "actif",
          couleur: editForm.couleur || null,
        });

        resetEditForm();
        await loadProjets();

        refreshAppData();
        showToast("Projet mis à jour avec succès.", "success");

        return true;
      } catch (err) {
        showToast(getApiErrorMessage(err, "Erreur lors de la mise à jour du projet."), "error");
        console.error("UPDATE PROJET:", err.response?.data || err.message);

        return false;
      }
    },
    [editForm, loadProjets, refreshAppData, resetEditForm, showToast],
  );

  // Supprime un projet
  const removeProjet = useCallback(
    async (id) => {
      const confirmed = await confirm("Supprimer ce projet ?");

      if (!confirmed) {
        return false;
      }

      try {
        await deleteProject(id);
        await loadProjets();

        refreshAppData();
        showToast("Projet supprimé avec succès.", "success");

        return true;
      } catch (err) {
        showToast(getApiErrorMessage(err, "Erreur lors de la suppression du projet."), "error");
        console.error("DELETE PROJET:", err.response?.data || err.message);

        return false;
      }
    },
    [confirm, loadProjets, refreshAppData, showToast],
  );

  return {
    projets,
    clients,
    confirmProps,

    form,
    setForm,
    resetForm,

    editForm,
    setEditForm,
    resetEditForm,

    loadProjets,
    getProjetById,
    addProjet,
    startEditProjet,
    saveProjet,
    removeProjet,
  };
}
