import { useCallback, useState } from "react";
import { useEffect } from "react";
import "../../styles/clients.css";
import { ConfirmModal, Modal } from "../../components/ui";

import ClientsGrid from "./ClientsGrid";
import AddClientForm from "./AddClientForm";
import EditClientForm from "./EditClientForm";
import ViewClientDetails from "./ViewClientDetails";
import ClientsHeader from "./ClientsHeader";

import { useAuth } from "../../api/authContext";
import { useClients } from "../../hooks/useClients";
import { useModal } from "../../hooks/useModal";

export default function Clients() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const addModal = useModal();
  const viewModal = useModal();
  const editModal = useModal();

  const { clients, createClient, updateClient, deleteClient, confirmProps, refreshClients } = useClients();

  const [form, setForm] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    notes: "",
  });

  const [editForm, setEditForm] = useState({
    nom: "",
    hourly_rate_defaut: "",
  });

  const closeEditModal = useCallback(() => {
    editModal.closeModal();
  }, [editModal]);

  const closeAddModal = useCallback(() => {
    addModal.closeModal();
  }, [addModal]);

  const openAddModal = useCallback(() => {
    setForm({
      nom: "",
      email: "",
      telephone: "",
      adresse: "",
      notes: "",
    });
    addModal.openModal();
  }, [addModal]);

  const handleView = useCallback(
    (client) => {
      viewModal.openModal(client);
    },
    [viewModal],
  );

  const handleEdit = useCallback(
    (client) => {
      editModal.openModal(client);
      setEditForm({
        nom: client?.nom || "",
        hourly_rate_defaut: client?.hourly_rate_defaut || "",
        email: client?.email || "",
        phone: client?.phone || "",
        contact_name: client?.contact_name || "",
        adresse: client?.adresse || "",
        notes: client?.notes || "",
      });
    },
    [editModal],
  );

  const handleCreate = useCallback(
    async (clientData) => {
      const success = await createClient(clientData);
      if (success) closeAddModal();
    },
    [closeAddModal, createClient],
  );

  const handleUpdate = useCallback(
    async (clientData) => {
      const id = editModal.selectedItem?.id;
      if (!id) return;

      const success = await updateClient(id, clientData);
      if (success) closeEditModal();
    },
    [closeEditModal, editModal, updateClient],
  );

  return (
    <div className="clients-page">
      <ClientsHeader onAdd={openAddModal} isAdmin={isAdmin} />

      <ClientsGrid
        clients={clients || []}
        isAdmin={isAdmin}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={(id) => deleteClient(id)}
      />
      <Modal show={viewModal.isOpen} title="Détails du client" onClose={viewModal.closeModal}>
        <ViewClientDetails client={viewModal.selectedItem} onClose={viewModal.closeModal} />
      </Modal>

      <Modal show={editModal.isOpen} title="Modifier le client" onClose={closeEditModal}>
        <EditClientForm
          client={editModal.selectedItem}
          editForm={editForm}
          setEditForm={setEditForm}
          onSubmit={handleUpdate}
          onCancel={closeEditModal}
        />
      </Modal>

      <Modal show={addModal.isOpen} title="Ajouter un client" onClose={closeAddModal}>
        <AddClientForm
          form={form || { nom: "", hourly_rate_defaut: "" }}
          setForm={setForm}
          onSubmit={handleCreate}
          onCancel={closeAddModal}
        />
      </Modal>
      <ConfirmModal {...confirmProps} />
    </div>
  );
}
