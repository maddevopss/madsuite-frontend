import { useCallback, useEffect, useMemo, useState } from "react";
import { useRefresh } from "../RefreshContext";
import { useToast } from "../ToastContext";
import { getApiErrorMessage } from "../api/apiError";
import { useConfirm } from "./useConfirm";
import {
  createTimesheetEntry,
  loadTimesheetEntries,
  loadTimesheetProjets,
  removeTimesheetEntry,
  updateTimesheetEntry,
  updateTimesheetEntryBilled,
  updateTimesheetEntryStatus,
} from "./useTimesheet.api";
import {
  buildEntriesQuery,
  getAddEntryPayload,
  getClientsFromProjets,
  getEditEntryPayload,
  getEditFormFromEntry,
  getEmptyEntryForm,
  groupEntriesByDate,
  isAddEntryFormValid,
  shiftWeek,
} from "./useTimesheet.helpers";

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 50,
  total: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

export function useTimesheet(filterUser = "") {
  const { refreshKey, refreshAppData } = useRefresh();
  const { showToast } = useToast();
  const { confirmProps, confirm } = useConfirm();

  const [weekDate, setWeekDate] = useState(new Date());
  const [entries, setEntries] = useState([]);
  const [projets, setProjets] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterClient, setFilterClientState] = useState("");
  const [filterBilled, setFilterBilledState] = useState("");
  const [editForm, setEditForm] = useState(getEmptyEntryForm);
  const [addForm, setAddForm] = useState(getEmptyEntryForm);
  const [stats, setStats] = useState({ today: {}, week: {} });
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

  const currentPage = pagination?.page ?? 1;

  const loadProjets = useCallback(async () => {
    try {
      const projetsData = await loadTimesheetProjets();
      setProjets(projetsData);
      setClients(getClientsFromProjets(projetsData));
    } catch (err) {
      showToast("Erreur lors du chargement des projets.", "error");
      console.error("LOAD TIMESHEET PROJETS:", err.response?.data || err.message);
    }
  }, [showToast]);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);

      const queryString = buildEntriesQuery({ weekDate, currentPage, filterClient, filterBilled, filterUser });
      const result = await loadTimesheetEntries(queryString);

      setEntries(result.data);
      if (result.stats) setStats(result.stats);
      setPagination(result.pagination);
    } catch (err) {
      showToast("Erreur lors du chargement des entrées.", "error");
      console.error("FETCH ENTRIES:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [weekDate, filterClient, filterBilled, filterUser, currentPage, showToast]);

  useEffect(() => {
    loadProjets();
  }, [loadProjets]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries, refreshKey]);

  const prevWeek = useCallback(() => {
    setWeekDate((prev) => shiftWeek(prev, -7));
    setPagination(DEFAULT_PAGINATION);
  }, []);

  const nextWeek = useCallback(() => {
    setWeekDate((prev) => shiftWeek(prev, 7));
    setPagination(DEFAULT_PAGINATION);
  }, []);

  const setFilterClient = useCallback((value) => {
    setFilterClientState(value);
    setPagination(DEFAULT_PAGINATION);
  }, []);

  const setFilterBilled = useCallback((value) => {
    setFilterBilledState(value);
    setPagination(DEFAULT_PAGINATION);
  }, []);

  const resetAddForm = useCallback(() => {
    setAddForm(getEmptyEntryForm());
  }, []);

  const prepareEditForm = useCallback((entry) => {
    setEditForm(getEditFormFromEntry(entry));
  }, []);

  const toggleBilled = useCallback(
    async (entry) => {
      try {
        await updateTimesheetEntryBilled(entry.id, !entry.is_billed);
        await fetchEntries();
        refreshAppData();
        showToast("Statut de facturation mis à jour.", "success");
      } catch (err) {
        showToast("Erreur lors du changement de statut.", "error");
        console.error("TOGGLE BILLED:", err.response?.data || err.message);
      }
    },
    [fetchEntries, refreshAppData, showToast],
  );

  const toggleStatus = useCallback(
    async (entry) => {
      try {
        let newStatus = "draft";
        if (entry.status === "draft") newStatus = "submitted";
        else if (entry.status === "submitted") newStatus = "approved"; // Admin only basically, but good for MVP
        else if (entry.status === "approved") newStatus = "draft"; // Or whatever logic
        else if (entry.status === "rejected") newStatus = "draft";

        await updateTimesheetEntryStatus(entry.id, newStatus);
        await fetchEntries();
        refreshAppData();
        showToast("Statut d'approbation mis à jour.", "success");
      } catch (err) {
        showToast("Erreur lors du changement de statut.", "error");
        console.error("TOGGLE STATUS:", err.response?.data || err.message);
      }
    },
    [fetchEntries, refreshAppData, showToast],
  );

  const deleteEntry = useCallback(
    async (id) => {
      const ok = await confirm("Supprimer cette entrée de temps ?");
      if (!ok) return false;

      try {
        await removeTimesheetEntry(id);
        await fetchEntries();
        refreshAppData();
        showToast("Entrée supprimée avec succès.", "success");
        return true;
      } catch (err) {
        showToast("Erreur lors de la suppression de l'entrée.", "error");
        console.error("DELETE ENTRY:", err.response?.data || err.message);
        return false;
      }
    },
    [confirm, fetchEntries, refreshAppData, showToast],
  );

  const saveNewEntry = useCallback(async (formData = addForm) => {
    if (!isAddEntryFormValid(formData)) {
      showToast("Projet, début et fin sont requis.", "warning");
      return false;
    }

    try {
      await createTimesheetEntry(getAddEntryPayload(formData));
      resetAddForm();
      await fetchEntries();
      refreshAppData();
      showToast("Entrée ajoutée avec succès.", "success");
      return true;
    } catch (err) {
      showToast(getApiErrorMessage(err, "Erreur lors de la création de l'entrée."), "error");
      console.error("CREATE ENTRY:", err.response?.data || err.message);
      return false;
    }
  }, [addForm, fetchEntries, refreshAppData, resetAddForm, showToast]);

  const saveEditEntry = useCallback(
    async (entryId) => {
      if (!entryId) {
        showToast("Entrée introuvable.", "error");
        return false;
      }

      try {
        await updateTimesheetEntry(entryId, getEditEntryPayload(editForm));
        await fetchEntries();
        refreshAppData();
        showToast("Entrée modifiée avec succès.", "success");
        return true;
      } catch (err) {
        showToast(getApiErrorMessage(err, "Erreur lors de la modification de l'entrée."), "error");
        console.error("SAVE EDIT ENTRY:", err.response?.data || err.message);
        return false;
      }
    },
    [editForm, fetchEntries, refreshAppData, showToast],
  );

  const groupedEntries = useMemo(() => groupEntriesByDate(entries), [entries]);
  const todayStats = stats.today;
  const weekStats = stats.week;

  return {
    weekDate,
    entries,
    projets,
    clients,
    loading,
    confirmProps,
    filterClient,
    setFilterClient,
    filterBilled,
    setFilterBilled,
    addForm,
    setAddForm,
    resetAddForm,
    editForm,
    setEditForm,
    prepareEditForm,
    fetchEntries,
    prevWeek,
    nextWeek,
    toggleBilled,
    toggleStatus,
    deleteEntry,
    saveNewEntry,
    saveEditEntry,
    groupedEntries,
    todayStats,
    weekStats,
    pagination,
    setPagination,
  };
}
