import { useState, useCallback, useEffect } from "react";
import { getUnbilledInvoiceEntries, getUnbilledExpenses } from "../api/invoices.api";

export function useCreateInvoiceModal({ show, initialClientId, onCreate }) {
  const [selectedClient, setSelectedClient] = useState("");
  const [unbilledEntries, setUnbilledEntries] = useState([]);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [unbilledExpenses, setUnbilledExpenses] = useState([]);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [taxRate, setTaxRate] = useState("0");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [customDescriptions, setCustomDescriptions] = useState({});
  const [aiLoading, setAiLoading] = useState(false);

  const handleClientChange = useCallback(async (clientId) => {
    setSelectedClient(clientId);
    setSelectedEntries([]);

    if (!clientId) {
      setUnbilledEntries([]);
      setUnbilledExpenses([]);
      return;
    }

    try {
      const entries = await getUnbilledInvoiceEntries(clientId);
      setUnbilledEntries(Array.isArray(entries) ? entries : []);
      const expenses = await getUnbilledExpenses(clientId);
      setUnbilledExpenses(Array.isArray(expenses) ? expenses : []);
    } catch {
      setUnbilledEntries([]);
      setUnbilledExpenses([]);
    }
  }, []);

  useEffect(() => {
    if (!show) return;

    const nextClientId = initialClientId ? String(initialClientId) : "";
    setSelectedClient(nextClientId);
    setUnbilledEntries([]);
    setSelectedEntries([]);
    setUnbilledExpenses([]);
    setSelectedExpenses([]);
    setTaxRate("0");
    setIssueDate("");
    setDueDate("");
    setNotes("");
    setCustomDescriptions({});
    setAiLoading(false);

    if (nextClientId) {
      handleClientChange(nextClientId);
    }
  }, [handleClientChange, initialClientId, show]);

  const toggleEntry = useCallback((row) => {
    setSelectedEntries((prev) => {
      const exists = prev.find((entry) => entry.id === row.id);
      if (exists) return prev.filter((entry) => entry.id !== row.id);
      return [...prev, row];
    });
  }, []);

  const toggleAllEntries = useCallback(() => {
    if (selectedEntries.length === unbilledEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries([...unbilledEntries]);
    }
  }, [selectedEntries.length, unbilledEntries]);

  const toggleExpense = useCallback((row) => {
    setSelectedExpenses((prev) => {
      const exists = prev.find((exp) => exp.id === row.id);
      if (exists) return prev.filter((exp) => exp.id !== row.id);
      return [...prev, row];
    });
  }, []);

  const toggleAllExpenses = useCallback(() => {
    if (selectedExpenses.length === unbilledExpenses.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses([...unbilledExpenses]);
    }
  }, [selectedExpenses.length, unbilledExpenses]);

  const subtotal = selectedEntries.reduce((acc, row) => {
    const hours = Number(row.hours || 0);
    const rate = Number(row.hourly_rate_used || 0);
    return acc + (Number(row.amount) || hours * rate);
  }, 0) + selectedExpenses.reduce((acc, row) => acc + Number(row.amount || 0), 0);
  
  const taxRateNum = Number(taxRate) || 0;
  const taxTotal = (subtotal * taxRateNum) / 100;
  const total = subtotal + taxTotal;

  const handleCleanDescriptions = useCallback(async () => {
    if (selectedEntries.length === 0) return;
    setAiLoading(true);
    try {
      const { default: api } = await import("../api/api");
      const newDescs = { ...customDescriptions };
      for (const entry of selectedEntries) {
        if (!newDescs[entry.id]) {
          try {
            const res = await api.post("/billingAssistant/suggest-description", { timeEntryId: entry.id });
            if (res.data && res.data.suggested_description) {
              newDescs[entry.id] = res.data.suggested_description;
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
      setCustomDescriptions(newDescs);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  }, [customDescriptions, selectedEntries]);

  const handleCustomDescChange = useCallback((id, value) => {
    setCustomDescriptions(prev => ({ ...prev, [id]: value }));
  }, []);

  const handleCreate = useCallback(async () => {
    if (!selectedClient || (selectedEntries.length === 0 && selectedExpenses.length === 0)) return;

    await onCreate({
      client_id: Number(selectedClient),
      time_entry_ids: selectedEntries.map((entry) => entry.id),
      expense_ids: selectedExpenses.map((exp) => exp.id),
      tax_rate: Number(taxRate),
      issue_date: issueDate || undefined,
      due_date: dueDate || undefined,
      notes: notes || undefined,
      custom_descriptions: customDescriptions,
      idempotency_key: crypto.randomUUID(),
    });
  }, [dueDate, issueDate, notes, customDescriptions, onCreate, selectedClient, selectedEntries, selectedExpenses, taxRate]);

  return {
    state: {
      selectedClient,
      unbilledEntries,
      selectedEntries,
      unbilledExpenses,
      selectedExpenses,
      taxRate,
      issueDate,
      dueDate,
      notes,
      customDescriptions,
      aiLoading,
      subtotal,
      taxTotal,
      total,
    },
    actions: {
      handleClientChange,
      toggleEntry,
      toggleAllEntries,
      toggleExpense,
      toggleAllExpenses,
      handleCleanDescriptions,
      handleCustomDescChange,
      setTaxRate,
      setIssueDate,
      setDueDate,
      setNotes,
      handleCreate,
    }
  };
}
