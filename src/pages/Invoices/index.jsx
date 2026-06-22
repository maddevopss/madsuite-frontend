import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ConfirmModal, Button, EmptyState, Loader, Select } from "../../components/ui";
import { useInvoices } from "../../hooks/useInvoices";
import { useModal } from "../../hooks/useModal";
import { useConfirm } from "../../hooks/useConfirm";
import { useToast } from "../../ToastContext";
import { getApiErrorMessage } from "../../api/apiError";
import { getClients } from "../../api/clients.api";
import CreateInvoiceModal from "./CreateInvoiceModal";
import EditInvoiceModal from "./EditInvoiceModal";
import InvoiceCard from "./InvoiceCard";
import ViewInvoiceModal from "./ViewInvoiceModal";
import MakeRecurringModal from "./MakeRecurringModal";
import { captureElement } from "@/utils/lazyHtml2canvas";

import api from "../../api/api";
import "./invoices.css";

export default function Invoices() {
  const { invoices, loading, loadInvoices, fetchInvoice, addInvoice, saveInvoice, removeInvoice, fetchPortalLink, checkoutInvoice } = useInvoices();
  const { showToast } = useToast();
  const location = useLocation();
  const handledLocationState = useRef(false);

  const createModal = useModal();
  const viewModal = useModal();
  const editModal = useModal();
  const makeRecurringModal = useModal();

  const [statusFilter, setStatusFilter] = useState("");
  const [clients, setClients] = useState([]);
  const [initialCreateClientId, setInitialCreateClientId] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const confirmProps = useConfirm();
  const reloadInvoices = useCallback(() => {
    loadInvoices(statusFilter ? { status: statusFilter } : {});
  }, [loadInvoices, statusFilter]);

  useEffect(() => {
    reloadInvoices();
    getClients()
      .then((c) => setClients(c || []))
      .catch(() => {});
  }, [reloadInvoices]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("payment") === "success") {
      showToast("Paiement réussi ! La facture sera mise à jour d'ici quelques instants.", "success");
      // Remove query param without reload
      window.history.replaceState(null, "", location.pathname);
    } else if (params.get("payment") === "cancelled") {
      showToast("Le paiement a été annulé.", "error");
      window.history.replaceState(null, "", location.pathname);
    }
  }, [location, showToast]);

  const openCreateModal = useCallback(() => {
    setInitialCreateClientId(null);
    createModal.openModal();
  }, [createModal]);

  useEffect(() => {
    if (handledLocationState.current || !location.state?.openCreateInvoice) return;

    handledLocationState.current = true;
    setInitialCreateClientId(location.state.clientId || null);
    createModal.openModal();
  }, [createModal, location.state]);

  const handleCreate = useCallback(
    async (payload) => {
      const success = await addInvoice(payload);
      if (success) {
        createModal.closeModal();
        reloadInvoices();
      }
    },
    [addInvoice, createModal, reloadInvoices],
  );

  const handleView = useCallback(
    async (id) => {
      const inv = await fetchInvoice(id);
      if (inv) {
        setViewInvoice(inv);
        viewModal.openModal(inv);
      }
    },
    [fetchInvoice, viewModal],
  );

  const handleEdit = useCallback(
    (inv) => {
      setEditStatus(inv.status || "");
      setEditNotes(inv.notes || "");
      editModal.openModal(inv);
    },
    [editModal],
  );

  const handleUpdate = useCallback(async () => {
    const success = await saveInvoice(editModal.selectedItem?.id, {
      status: editStatus,
      notes: editNotes,
    });
    if (success) {
      editModal.closeModal();
      reloadInvoices();
    }
  }, [editModal, editNotes, editStatus, reloadInvoices, saveInvoice]);

  const handleDelete = useCallback(
    async (id) => {
      const confirmed = await confirmProps.confirm({
        title: "Supprimer la facture",
        message: "Supprimer ce brouillon et libérer ses entrées de temps ?",
      });
      if (confirmed) {
        await removeInvoice(id);
        reloadInvoices();
      }
    },
    [confirmProps, reloadInvoices, removeInvoice],
  );

  const handleDownloadPDF = useCallback(
    async (id) => {
      try {
        // ✅ Option 1 : Télécharger depuis le backend (recommandé)
        const buffer = await api.get(`/invoices/${id}/pdf`, { responseType: "arraybuffer" });
        const blob = new Blob([buffer.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `facture-${id}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        showToast("PDF téléchargé.", "success");
      } catch (err) {
        showToast(getApiErrorMessage(err, "Impossible de télécharger le PDF pour le moment."), "error");
      }
    },
    [showToast],
  );

  const handlePreviewPDF = useCallback(
    async (id) => {
      try {
        const buffer = await api.get(`/invoices/${id}/pdf`, { responseType: "arraybuffer" });
        const blob = new Blob([buffer.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch (err) {
        showToast(getApiErrorMessage(err, "Impossible de prévisualiser le PDF."), "error");
      }
    },
    [showToast]
  );

  const handleCopyPortalLink = useCallback(
    async (id) => {
      const data = await fetchPortalLink(id);
      if (data?.portalUrl) {
        try {
          await navigator.clipboard.writeText(data.portalUrl);
          showToast("Lien client copié dans le presse-papiers !", "success");
        } catch (err) {
          showToast("Impossible de copier le lien. Vérifiez les permissions de votre navigateur.", "error");
        }
      }
    },
    [fetchPortalLink, showToast]
  );

  const handlePay = useCallback(
    async (id) => {
      const data = await checkoutInvoice(id);
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    [checkoutInvoice]
  );

  const handleMakeRecurring = useCallback((inv) => {
    viewModal.closeModal();
    makeRecurringModal.openModal(inv);
  }, [viewModal, makeRecurringModal]);

  return (
    <div className="invoices-page">
      <div className="invoices-header">
        <div>
          <h1>Facturation</h1>
          <p className="page-subtitle">Générez et gérez vos factures.</p>
        </div>
        <div className="invoices-actions">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="sent">Envoyée</option>
            <option value="paid">Payée</option>
            <option value="void">Annulée</option>
          </Select>
          <Button variant="primary" onClick={openCreateModal}>
            + Nouvelle facture
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader label="Chargement des factures..." />
      ) : invoices.length === 0 ? (
        <EmptyState
          title={statusFilter ? "Aucune facture pour ce statut" : "Aucune facture"}
          message={
            statusFilter
              ? "Essayez un autre statut ou affichez toutes les factures."
              : "Aucune facture encore — créez un devis ou un client."
          }
          action={
            statusFilter ? (
              <Button variant="secondary" onClick={() => setStatusFilter("")}>
                Voir toutes les factures
              </Button>
            ) : (
              <Button variant="primary" onClick={openCreateModal}>
                Créer une facture
              </Button>
            )
          }
        />
      ) : (
        <div className="invoices-list">
          {invoices.map((inv) => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              onView={handleView}
              onDownloadPDF={handleDownloadPDF}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CreateInvoiceModal
        show={createModal.isOpen}
        clients={clients}
        loading={loading}
        initialClientId={initialCreateClientId}
        onClose={createModal.closeModal}
        onCreate={handleCreate}
      />

      <ViewInvoiceModal
        show={viewModal.isOpen}
        invoice={viewInvoice}
        onClose={viewModal.closeModal}
        onDownloadPDF={handleDownloadPDF}
        onPreviewPDF={handlePreviewPDF}
        onCopyPortalLink={handleCopyPortalLink}
        onPay={handlePay}
        onMakeRecurring={handleMakeRecurring}
      />

      <MakeRecurringModal 
        show={makeRecurringModal.isOpen}
        invoice={makeRecurringModal.selectedItem}
        onClose={makeRecurringModal.closeModal}
        onSuccess={() => reloadInvoices()}
      />

      <EditInvoiceModal
        show={editModal.isOpen}
        status={editStatus}
        notes={editNotes}
        loading={loading}
        onStatusChange={setEditStatus}
        onNotesChange={setEditNotes}
        onClose={editModal.closeModal}
        onSave={handleUpdate}
      />

      <ConfirmModal {...confirmProps} />
    </div>
  );
}
