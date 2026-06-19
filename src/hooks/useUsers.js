import { useCallback, useEffect, useMemo, useState } from "react";
import { useRefresh } from "../RefreshContext";
import { useToast } from "../ToastContext";
import { getApiErrorMessage } from "../api/apiError";
import { useConfirm } from "./useConfirm";
import {
  changeUserPasswordRequest,
  createUserRequest,
  deleteUserRequest,
  loadTimesheetProjets,
  loadUserHistoryEntries,
  loadUsersList,
  updateHistoryEntryRequest,
} from "./useUsers.api";
import {
  buildCreateUserPayload,
  buildHistoryEntryPayload,
  getClientIdForEntry,
  getClientsEdit,
  getEditHistoryFormFromEntry,
  getEmptyEditForm,
  getProjetsForClient,
  normalizePassword,
  validateCreateUserPayload,
} from "./useUsers.helpers";

export function useUsers() {
  const { refreshAppData } = useRefresh();
  const { showToast } = useToast();
  const { confirmProps, confirm } = useConfirm();

  const [users, setUsers] = useState([]);
  const [projets, setProjets] = useState([]);

  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingProjets, setIsLoadingProjets] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [projetsError, setProjetsError] = useState(null);

  const [targetUserId, setTargetUserId] = useState(null);
  const [historyUser, setHistoryUser] = useState(null);
  const [historyEntries, setHistoryEntries] = useState([]);
  const [editClientId, setEditClientId] = useState("");
  const [editForm, setEditForm] = useState(getEmptyEditForm);

  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setUsersError(null);
    try {
      setUsers(await loadUsersList());
    } catch (err) {
      const msg = getApiErrorMessage(err, "Erreur lors du chargement des utilisateurs.");
      setUsersError(msg);
      showToast("Erreur lors du chargement des utilisateurs.", "error");
      console.error("Erreur chargement users:", err.response?.data || err.message);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [showToast]);

  const loadProjets = useCallback(async () => {
    setIsLoadingProjets(true);
    setProjetsError(null);
    try {
      setProjets(await loadTimesheetProjets());
    } catch (err) {
      const msg = getApiErrorMessage(err, "Erreur lors du chargement des projets.");
      setProjetsError(msg);
      showToast("Erreur lors du chargement des projets.", "error");
      console.error("Erreur chargement projets:", err.response?.data || err.message);
    } finally {
      setIsLoadingProjets(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadUsers();
    loadProjets();
  }, [loadUsers, loadProjets]);

  const createUser = useCallback(
    async (userData) => {
      const payload = buildCreateUserPayload(userData);
      const validationError = validateCreateUserPayload(payload);

      if (validationError) {
        showToast(validationError, "warning");
        return false;
      }

      try {
        await createUserRequest(payload);
        await loadUsers();
        refreshAppData();
        showToast("Utilisateur créé avec succès.", "success");
        return true;
      } catch (err) {
        console.error("Erreur création user:", err.response?.data || err.message);
        showToast(getApiErrorMessage(err, "Erreur lors de la création de l'utilisateur."), "error");
        return false;
      }
    },
    [loadUsers, refreshAppData, showToast],
  );

  const preparePasswordChange = useCallback((userId) => {
    setTargetUserId(userId);
  }, []);

  const changePassword = useCallback(
    async (data) => {
      if (!targetUserId) {
        showToast("Utilisateur introuvable.", "error");
        return false;
      }

      const password = normalizePassword(data?.password, data);
      if (!password) {
        showToast("Le nouveau mot de passe est requis.", "warning");
        return false;
      }

      try {
        await changeUserPasswordRequest(targetUserId, password);
        setTargetUserId(null);

        setTimeout(() => {
          document.activeElement?.blur();
        }, 0);

        showToast("Mot de passe modifié avec succès.", "success");
        return true;
      } catch (err) {
        console.error("Erreur modification password:", err.response?.data || err.message);
        showToast(getApiErrorMessage(err, "Erreur lors de la modification du mot de passe."), "error");
        return false;
      }
    },
    [targetUserId, showToast],
  );

  const deleteUser = useCallback(
    async (id, nomUser) => {
      const ok = await confirm(`Supprimer l'utilisateur "${nomUser || id}" ?`);
      if (!ok) return false;

      try {
        await deleteUserRequest(id);
        await loadUsers();
        refreshAppData();
        showToast("Utilisateur supprimé avec succès.", "success");
        return true;
      } catch (err) {
        console.error("Erreur suppression user:", err.response?.data || err.message);
        showToast(getApiErrorMessage(err, "Erreur lors de la suppression."), "error");
        return false;
      }
    },
    [confirm, loadUsers, refreshAppData, showToast],
  );

  const loadHistory = useCallback(
    async (user) => {
      try {
        setHistoryUser(user);
        setHistoryEntries(await loadUserHistoryEntries(user.id));
        showToast("Historique chargé.", "success");
        return true;
      } catch (err) {
        console.error("Erreur historique user:", err.response?.data || err.message);
        showToast("Erreur lors du chargement de l'historique.", "error");
        return false;
      }
    },
    [showToast],
  );

  const prepareEditHistoryEntry = useCallback(
    (entry) => {
      setEditClientId(getClientIdForEntry(entry, projets));
      setEditForm(getEditHistoryFormFromEntry(entry));
    },
    [projets],
  );

  const saveHistoryEntry = useCallback(
    async (entryId) => {
      if (!entryId) {
        showToast("Entrée introuvable.", "error");
        return false;
      }

      if (!editForm.projet_id) {
        showToast("Sélectionne un projet avant de sauvegarder.", "error");
        return false;
      }

      try {
        await updateHistoryEntryRequest(entryId, buildHistoryEntryPayload(editForm));

        if (historyUser) {
          await loadHistory(historyUser);
        }

        refreshAppData();
        showToast("Entrée modifiée avec succès.", "success");
        return true;
      } catch (err) {
        console.error("EDIT HISTORY:", err.response?.data || err.message);
        showToast(getApiErrorMessage(err, "Erreur lors de la modification de l'entrée."), "error");
        return false;
      }
    },
    [editForm, historyUser, loadHistory, refreshAppData, showToast],
  );

  const clientsEdit = useMemo(() => getClientsEdit(projets), [projets]);
  const projetsEditFiltres = useMemo(() => getProjetsForClient(projets, editClientId), [projets, editClientId]);

  return {
    users,
    projets,

    isLoadingUsers,
    isLoadingProjets,
    usersError,
    projetsError,

    historyUser,
    historyEntries,
    editForm,
    setEditForm,
    editClientId,
    setEditClientId,
    clientsEdit,
    projetsEditFiltres,
    loadUsers,
    loadProjets,
    confirmProps,
    createUser,
    preparePasswordChange,
    changePassword,
    deleteUser,
    loadHistory,
    prepareEditHistoryEntry,
    saveHistoryEntry,
  };
}
