import { useState, useCallback } from "react";
import * as api from "../api/estimates.api";
import { useToast } from "../ToastContext";
import { getApiErrorMessage } from "../api/apiError";

export function useEstimates() {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const loadEstimates = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.getEstimates(params);
      setEstimates(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      showToast(getApiErrorMessage(err, "Erreur lors du chargement des soumissions."), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchEstimate = useCallback(async (id) => {
    try {
      const res = await api.getEstimate(id);
      return res.data;
    } catch (err) {
      showToast(getApiErrorMessage(err, "Impossible de charger la soumission."), "error");
      return null;
    }
  }, [showToast]);

  const addEstimate = useCallback(async (payload) => {
    setLoading(true);
    try {
      await api.createEstimate(payload);
      showToast("Soumission créée avec succès.", "success");
      return true;
    } catch (err) {
      showToast(getApiErrorMessage(err, "Erreur lors de la création."), "error");
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const saveEstimate = useCallback(async (id, payload) => {
    setLoading(true);
    try {
      await api.updateEstimate(id, payload);
      showToast("Soumission mise à jour.", "success");
      return true;
    } catch (err) {
      showToast(getApiErrorMessage(err, "Erreur lors de la mise à jour."), "error");
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const removeEstimate = useCallback(async (id) => {
    try {
      await api.deleteEstimate(id);
      showToast("Soumission supprimée.", "success");
      return true;
    } catch (err) {
      showToast(getApiErrorMessage(err, "Erreur lors de la suppression."), "error");
      return false;
    }
  }, [showToast]);

  const convertToInvoice = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await api.convertEstimateToInvoice(id);
      showToast("Soumission convertie en facture avec succès.", "success");
      return res.data;
    } catch (err) {
      showToast(getApiErrorMessage(err, "Erreur lors de la conversion."), "error");
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const downloadPdf = useCallback(async (id, number) => {
    setLoading(true);
    try {
      const blob = await api.downloadEstimatePdf(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `soumission_${number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    } catch (err) {
      showToast("Impossible de télécharger le PDF.", "error");
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const convertToProject = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await api.convertEstimateToProject(id);
      showToast("Soumission convertie en projet avec succès.", "success");
      return res.data;
    } catch (err) {
      showToast(getApiErrorMessage(err, "Erreur lors de la conversion."), "error");
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return {
    estimates,
    loading,
    loadEstimates,
    fetchEstimate,
    addEstimate,
    saveEstimate,
    removeEstimate,
    convertToInvoice,
    convertToProject,
    downloadPdf
  };
}
