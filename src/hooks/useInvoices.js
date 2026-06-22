import { useCallback, useState } from "react";
import { useRefresh } from "../RefreshContext";
import { useToast } from "../ToastContext";
import { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice } from "../api/invoices.api";
import { getApiErrorMessage } from "../api/apiError";

export function useInvoices() {
  const { showToast } = useToast();
  useRefresh();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadInvoices = useCallback(
    async (params) => {
      try {
        setLoading(true);
        const data = await getInvoices(params);
        setInvoices(data || []);
      } catch (err) {
        showToast(getApiErrorMessage(err, "Impossible de charger les factures pour le moment."), "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  const fetchInvoice = useCallback(
    async (id) => {
      try {
        setLoading(true);
        return await getInvoice(id);
      } catch (err) {
        showToast(getApiErrorMessage(err, "Impossible d'ouvrir cette facture pour le moment."), "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  const addInvoice = useCallback(
    async (data) => {
      try {
        setLoading(true);
        await createInvoice(data);
        showToast("Facture créée avec succès.", "success");
        return true;
      } catch (err) {
        showToast(getApiErrorMessage(err, "Impossible de créer la facture. Vérifiez les informations saisies."), "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  const saveInvoice = useCallback(
    async (id, payload) => {
      try {
        setLoading(true);
        await updateInvoice(id, payload);
        showToast("Facture mise à jour.", "success");
        return true;
      } catch (err) {
        showToast(getApiErrorMessage(err, "Impossible de mettre à jour la facture."), "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  const removeInvoice = useCallback(
    async (id) => {
      try {
        setLoading(true);
        const result = await deleteInvoice(id);
        const releasedEntries = Number(result?.released_entries || 0);

        showToast(
          releasedEntries > 0
            ? `Facture supprim\u00e9e. ${releasedEntries} entr\u00e9e(s) de temps peuvent \u00eatre refactur\u00e9es.`
            : "Facture supprim\u00e9e.",
          "success",
        );
        return true;
      } catch (err) {
        showToast(getApiErrorMessage(err, "Impossible de supprimer la facture."), "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  const fetchPortalLink = useCallback(
    async (id) => {
      try {
        setLoading(true);
        const { getInvoicePortalLink } = require("../api/invoices.api");
        return await getInvoicePortalLink(id);
      } catch (err) {
        showToast(getApiErrorMessage(err, "Impossible de récupérer le lien du portail."), "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  const checkoutInvoiceHook = useCallback(
    async (id) => {
      try {
        setLoading(true);
        const { checkoutInvoice } = require("../api/invoices.api");
        return await checkoutInvoice(id);
      } catch (err) {
        showToast(getApiErrorMessage(err, "Impossible de rediriger vers Stripe."), "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  return {
    invoices,
    loading,
    loadInvoices,
    fetchInvoice,
    addInvoice,
    saveInvoice,
    removeInvoice,
    fetchPortalLink,
    checkoutInvoice: checkoutInvoiceHook,
  };
}

