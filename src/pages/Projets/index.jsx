import { useCallback, useMemo, useState } from "react";
import { ConfirmModal, Modal, Select } from "../../components/ui";

import "../../styles/projets.css";
import "../../styles/clients.css";

import ProjectsGrid from "./ProjectsGrid";
import ProjectsHeader from "./ProjectsHeader";
import AddProjectForm from "./AddProjectForm";
import EditProjectForm from "./EditProjectForm";
import ViewProjectDetails from "./ViewProjectDetails";

import { useAuth } from "../../api/authContext";
import { useProjets } from "../../hooks/useProjets";
import { useModal } from "../../hooks/useModal";
import { useCognitiveBudget } from "../../hooks/useCognitiveBudget";
import AdaptivePanel from "../../components/ui/AdaptivePanel";

export default function Projets() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [selectedClient, setSelectedClient] = useState("");
  const [sortBy, setSortBy] = useState("client");

  const addModal = useModal();
  const viewModal = useModal();
  const editModal = useModal();

  useCognitiveBudget({
    pageName: 'Projets',
    budget: { maxScore: 30 },
    metrics: {
      visibleActions: 3, 
      visibleColors: 1,
      animationsActive: 0,
      competingCTAs: 0, 
      visiblePanels: 2,
    }
  });

  const {
    projets = [],
    clients = [],
    form,
    setForm,
    resetForm,
    editForm,
    setEditForm,
    getProjetById,
    loadProjets,
    addProjet,
    startEditProjet,
    saveProjet,
    removeProjet,
    confirmProps,
  } = useProjets();

  const handleOpenAdd = useCallback(() => {
    resetForm();
    addModal.openModal();
  }, [addModal, resetForm]);

  const handleCloseAdd = useCallback(() => {
    resetForm();
    addModal.closeModal();
  }, [addModal, resetForm]);

  const handleView = useCallback((id) => {
    const projet = getProjetById(id);

    if (projet) {
      viewModal.openModal(projet);
    }
  }, [getProjetById, viewModal]);

  const handleEdit = useCallback((projet) => {
    startEditProjet(projet);
    editModal.openModal(projet);
  }, [editModal, startEditProjet]);

  const handleCloseEdit = useCallback(() => {
    editModal.closeModal();
  }, [editModal]);

  const handleCreate = useCallback(async () => {
    const success = await addProjet();

    if (success) {
      handleCloseAdd();
    }
  }, [addProjet, handleCloseAdd]);

  const handleUpdate = useCallback(async () => {
    const success = await saveProjet(editModal.selectedItem?.id);

    if (success) {
      handleCloseEdit();
    }
  }, [editModal, handleCloseEdit, saveProjet]);

  const handleClientChange = useCallback((e) => setSelectedClient(e.target.value), []);
  const handleSortChange = useCallback((e) => setSortBy(e.target.value), []);
  const handleRefresh = useCallback(() => {
    loadProjets();
  }, [loadProjets]);

  const visibleProjects = useMemo(() => {
    let list = [...projets];

    if (selectedClient) {
      list = list.filter((p) => String(p.client_id) === String(selectedClient));
    }

    if (sortBy === "client") {
      list.sort((a, b) => (a.client || a.client_nom || "").localeCompare(b.client || b.client_nom || "", "fr-CA"));
    }

    if (sortBy === "nom") {
      list.sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr-CA"));
    }

    if (sortBy === "status") {
      list.sort((a, b) => (a.status || "").localeCompare(b.status || "", "fr-CA"));
    }

    return list;
  }, [projets, selectedClient, sortBy]);

  return (
    <div className="projects-page">
      <ProjectsHeader isAdmin={isAdmin} onAdd={handleOpenAdd} onRefresh={handleRefresh} />

      <AdaptivePanel hideOnOverload={true} className="projects-toolbar">
        <Select value={selectedClient} onChange={handleClientChange}>
          <option value="">Tous les clients</option>

          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </Select>

        <Select value={sortBy} onChange={handleSortChange}>
          <option value="client">Trier par client</option>
          <option value="nom">Trier par projet</option>
          <option value="status">Trier par statut</option>
        </Select>
      </AdaptivePanel>

      <ProjectsGrid
        projects={visibleProjects}
        isAdmin={isAdmin}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={removeProjet}
      />

      <Modal show={viewModal.isOpen} title="Détails du projet" onClose={viewModal.closeModal}>
        <ViewProjectDetails project={viewModal.selectedItem} onClose={viewModal.closeModal} />
      </Modal>

      <Modal show={addModal.isOpen} title="Ajouter un projet" onClose={handleCloseAdd}>
        <AddProjectForm clients={clients} form={form} setForm={setForm} onSubmit={handleCreate} onCancel={handleCloseAdd} />
      </Modal>

      <Modal show={editModal.isOpen} title="Modifier le projet" onClose={handleCloseEdit}>
        <EditProjectForm
          project={editModal.selectedItem}
          clients={clients}
          editForm={editForm}
          setEditForm={setEditForm}
          onSubmit={handleUpdate}
          onCancel={handleCloseEdit}
        />
      </Modal>
      <ConfirmModal {...confirmProps} />
    </div>
  );
}
