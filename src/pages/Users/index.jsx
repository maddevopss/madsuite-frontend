import { useCallback } from "react";

import "../../styles/users.css";
import Modal from "../../components/ui/Modal/Modal";
import ConfirmModal from "../../components/ui/Modal/ConfirmModal";

import UsersHeader from "./UsersHeader";
import UsersList from "./UsersList";
import AddUserForm from "./AddUserForm";
import PasswordForm from "./PasswordForm";
import UserHistoryContent from "./UserHistoryContent";
import EditHistoryEntryForm from "./EditHistoryEntryForm";

import { useAuth } from "../../api/authContext";
import { useUsers } from "../../hooks/useUsers";
import { useModal } from "../../hooks/useModal";

export default function Users() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return <UsersAdminPage />;
}

function AccessDenied() {
  return (
    <div className="access-denied">
      <h2>Accès refusé</h2>
      <p>Cette section est réservée aux administrateurs.</p>
    </div>
  );
}

function UsersAdminPage() {
  const addUserModal = useModal();
  const passwordModal = useModal();
  const historyModal = useModal();
  const editModal = useModal();

  const {
    users,
    isLoadingUsers,
    usersError,
    loadUsers,
    preparePasswordChange,
    changePassword,

    editForm,
    setEditForm,
    editClientId,
    setEditClientId,
    clientsEdit,
    projetsEditFiltres,
    createUser,
    deleteUser,
    historyUser,
    historyEntries,
    loadHistory,
    prepareEditHistoryEntry,
    saveHistoryEntry,
    confirmProps,
  } = useUsers();

  // Fonctions pour les modals d'ajout et de modification d'utilisateur
  const openAddUserModal = useCallback(() => {
    addUserModal.openModal();
  }, [addUserModal]);

  const handleCreateUser = useCallback(async (data) => {
    const success = await createUser(data); // On passe directement les données validées par Zod
    if (success) addUserModal.closeModal();
  }, [addUserModal, createUser]);

  // Fonctions pour les modals de changement de mot de passe et d'historique
  const openPasswordModal = useCallback((userId) => {
    preparePasswordChange(userId);
    passwordModal.openModal();
  }, [passwordModal, preparePasswordChange]);

  // Fonction pour changer le mot de passe d'un utilisateur
  const handlePasswordChange = useCallback(async (newPassword) => {
    const success = await changePassword(newPassword);

    if (success) {
      passwordModal.closeModal();
    }
  }, [changePassword, passwordModal]);

  // Fonction pour ouvrir le modal d'historique d'un utilisateur
  const openHistory = useCallback(async (user) => {
    const success = await loadHistory(user);

    if (success) {
      historyModal.openModal(user);
    }
  }, [historyModal, loadHistory]);

  // Fonction pour ouvrir le modal d'édition d'une entrée d'historique
  const openEdit = useCallback((entry) => {
    prepareEditHistoryEntry(entry);
    editModal.openModal(entry);
  }, [editModal, prepareEditHistoryEntry]);

  // Fonction pour enregistrer les modifications d'une entrée d'historique
  const handleSaveEdit = useCallback(async () => {
    const success = await saveHistoryEntry(editModal.selectedItem?.id);

    if (success) {
      editModal.closeModal();
    }
  }, [editModal, saveHistoryEntry]);

  const handleRefresh = useCallback(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <div className="users-page">
      <UsersHeader isAdmin={true} onAdd={openAddUserModal} onRefresh={handleRefresh} />
      <UsersList
        users={users || []}
        isLoading={isLoadingUsers}
        error={usersError}
        onPassword={openPasswordModal}
        onDelete={deleteUser}
        onHistory={openHistory}
      />

      <Modal show={addUserModal.isOpen} title="Ajouter un utilisateur" onClose={addUserModal.closeModal}>
        <AddUserForm onSubmit={handleCreateUser} onCancel={addUserModal.closeModal} />
      </Modal>

      <Modal show={passwordModal.isOpen} title="Changer le mot de passe" onClose={passwordModal.closeModal}>
        <PasswordForm onCancel={passwordModal.closeModal} onSubmit={handlePasswordChange} />
      </Modal>

      <Modal show={historyModal.isOpen} title={`Historique — ${historyUser?.nom || ""}`} onClose={historyModal.closeModal}>
        <UserHistoryContent historyUser={historyUser} historyEntries={historyEntries} onEdit={openEdit} />
      </Modal>

      <Modal show={editModal.isOpen} title="Modifier une entrée" onClose={editModal.closeModal}>
        <EditHistoryEntryForm
          entry={editModal.selectedItem}
          editForm={editForm}
          setEditForm={setEditForm}
          editClientId={editClientId}
          setEditClientId={setEditClientId}
          clientsEdit={clientsEdit}
          projetsEditFiltres={projetsEditFiltres}
          onSubmit={handleSaveEdit}
          onCancel={editModal.closeModal}
        />
      </Modal>

      <ConfirmModal {...confirmProps} />
    </div>
  );
}
