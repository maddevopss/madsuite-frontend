import { useCallback, useEffect, useState } from "react";
import { ConfirmModal, Button, EmptyState, Loader, Select } from "../../components/ui";
import { useEstimates } from "../../hooks/useEstimates";
import { useModal } from "../../hooks/useModal";
import { useConfirm } from "../../hooks/useConfirm";
import { getClients } from "../../api/clients.api";
import CreateEstimateModal from "./CreateEstimateModal";
import EditEstimateModal from "./EditEstimateModal";
import EstimateCard from "./EstimateCard";
import ViewEstimateModal from "./ViewEstimateModal";

import "./estimates.css";

export default function Estimates() {
  const { estimates, loading, loadEstimates, fetchEstimate, addEstimate, saveEstimate, removeEstimate, convertToInvoice, downloadPdf } = useEstimates();
  const createModal = useModal();
  const viewModal = useModal();
  const editModal = useModal();

  const [statusFilter, setStatusFilter] = useState("");
  const [clients, setClients] = useState([]);
  const [viewEstimate, setViewEstimate] = useState(null);
  
  const [editStatus, setEditStatus] = useState("");
  const [editIssueDate, setEditIssueDate] = useState("");
  const [editValidUntil, setEditValidUntil] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const confirmProps = useConfirm();

  const reloadEstimates = useCallback(() => {
    loadEstimates(statusFilter ? { status: statusFilter } : {});
  }, [loadEstimates, statusFilter]);

  useEffect(() => {
    reloadEstimates();
    getClients()
      .then((c) => setClients(c || []))
      .catch(() => {});
  }, [reloadEstimates]);

  const openCreateModal = useCallback(() => {
    createModal.openModal();
  }, [createModal]);

  const handleCreate = useCallback(
    async (payload) => {
      const success = await addEstimate(payload);
      if (success) {
        createModal.closeModal();
        reloadEstimates();
      }
    },
    [addEstimate, createModal, reloadEstimates]
  );

  const handleView = useCallback(
    async (id) => {
      const est = await fetchEstimate(id);
      if (est) {
        setViewEstimate(est);
        viewModal.openModal(est);
      }
    },
    [fetchEstimate, viewModal]
  );

  const handleEdit = useCallback(
    (est) => {
      setEditStatus(est.status || "");
      setEditIssueDate(est.issue_date ? est.issue_date.slice(0, 10) : "");
      setEditValidUntil(est.valid_until ? est.valid_until.slice(0, 10) : "");
      setEditNotes(est.notes || "");
      editModal.openModal(est);
    },
    [editModal]
  );

  const handleUpdate = useCallback(async () => {
    const success = await saveEstimate(editModal.selectedItem?.id, {
      status: editStatus,
      issue_date: editIssueDate,
      valid_until: editValidUntil || null,
      notes: editNotes,
    });
    if (success) {
      editModal.closeModal();
      reloadEstimates();
    }
  }, [editModal, editStatus, editIssueDate, editValidUntil, editNotes, reloadEstimates, saveEstimate]);

  const handleDelete = useCallback(
    async (id) => {
      const confirmed = await confirmProps.confirm({
        title: "Supprimer la soumission",
        message: "Êtes-vous sûr de vouloir supprimer cette soumission ?",
      });
      if (confirmed) {
        await removeEstimate(id);
        reloadEstimates();
      }
    },
    [confirmProps, reloadEstimates, removeEstimate]
  );

  const handleConvert = useCallback(
    async (id) => {
      const confirmed = await confirmProps.confirm({
        title: "Convertir en facture",
        message: "Créer une facture à partir de cette soumission ?",
        confirmText: "Convertir",
      });
      if (confirmed) {
        const invoice = await convertToInvoice(id);
        if (invoice) {
          reloadEstimates();
        }
      }
    },
    [confirmProps, convertToInvoice, reloadEstimates]
  );

  const handleQuickStatusUpdate = useCallback(
    async (id, newStatus) => {
      const success = await saveEstimate(id, { status: newStatus });
      if (success) {
        reloadEstimates();
        // Update local state if modal is open
        if (viewEstimate && viewEstimate.id === id) {
          setViewEstimate(prev => ({ ...prev, status: newStatus }));
        }
      }
    },
    [saveEstimate, reloadEstimates, viewEstimate]
  );

  return (
    <div className="estimates-page">
      <div className="estimates-header">
        <div>
          <h1>Soumissions</h1>
          <p className="page-subtitle">Gérez vos soumissions et convertissez-les en factures.</p>
        </div>
        <div className="estimates-actions">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="sent">Envoyée</option>
            <option value="accepted">Acceptée</option>
            <option value="rejected">Refusée</option>
            <option value="invoiced">Facturée</option>
          </Select>
          <Button variant="primary" onClick={openCreateModal}>
            + Nouvelle soumission
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader label="Chargement des soumissions..." />
      ) : estimates.length === 0 ? (
        <EmptyState
          title={statusFilter ? "Aucune soumission pour ce statut" : "Aucune soumission"}
          message="Créez votre première soumission pour un client."
          action={
            statusFilter ? (
              <Button variant="secondary" onClick={() => setStatusFilter("")}>
                Voir toutes les soumissions
              </Button>
            ) : (
              <Button variant="primary" onClick={openCreateModal}>
                Créer une soumission
              </Button>
            )
          }
        />
      ) : (
        <div className="estimates-list">
          {estimates.map((est) => (
            <EstimateCard
              key={est.id}
              estimate={est}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onConvert={handleConvert}
            />
          ))}
        </div>
      )}

      <CreateEstimateModal
        show={createModal.isOpen}
        clients={clients}
        loading={loading}
        onClose={createModal.closeModal}
        onCreate={handleCreate}
      />

      <ViewEstimateModal
        show={viewModal.isOpen}
        estimate={viewEstimate}
        onClose={viewModal.closeModal}
        onConvert={handleConvert}
        onUpdateStatus={handleQuickStatusUpdate}
        onDownload={downloadPdf}
      />

      <EditEstimateModal
        show={editModal.isOpen}
        status={editStatus}
        issueDate={editIssueDate}
        validUntil={editValidUntil}
        notes={editNotes}
        loading={loading}
        onStatusChange={setEditStatus}
        onIssueDateChange={setEditIssueDate}
        onValidUntilChange={setEditValidUntil}
        onNotesChange={setEditNotes}
        onClose={editModal.closeModal}
        onSave={handleUpdate}
      />

      <ConfirmModal {...confirmProps} />
    </div>
  );
}
