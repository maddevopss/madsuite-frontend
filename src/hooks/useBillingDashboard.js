import { useCallback, useEffect, useMemo, useState } from "react";

import api from "../api/api";
import { useRefresh } from "../RefreshContext";
import { useToast } from "../ToastContext";

const defaultDashboard = {
  total_to_invoice: 0,
  total_invoiced_this_month: 0,
  total_paid_this_month: 0,
  unbilled_hours: 0,
  billed_hours: 0,
  overdue_count: 0,
  overdue_total: 0,
  due_soon_count: 0,
  due_soon_total: 0,
  invoice_status: {},
  top_clients_to_bill: [],
  top_projects_to_bill: [],
  recent_invoices: [],
  overdue_invoices: [],
  due_soon_invoices: [],
};

export function useBillingDashboard() {
  const { refreshKey } = useRefresh();
  const { showToast } = useToast();

  const [data, setData] = useState(defaultDashboard);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/billing/dashboard");
      setData({
        ...defaultDashboard,
        ...(res.data || {}),
      });
    } catch (err) {
      showToast("Erreur lors du chargement du cockpit de facturation.", "error");
      console.error("BILLING DASHBOARD ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard, refreshKey]);

  const topClients = useMemo(() => {
    return Array.isArray(data.top_clients_to_bill) ? data.top_clients_to_bill : [];
  }, [data.top_clients_to_bill]);

  const topProjects = useMemo(() => {
    return Array.isArray(data.top_projects_to_bill) ? data.top_projects_to_bill : [];
  }, [data.top_projects_to_bill]);

  const recentInvoices = useMemo(() => {
    return Array.isArray(data.recent_invoices) ? data.recent_invoices : [];
  }, [data.recent_invoices]);

  const overdueInvoices = useMemo(() => {
    return Array.isArray(data.overdue_invoices) ? data.overdue_invoices : [];
  }, [data.overdue_invoices]);

  const dueSoonInvoices = useMemo(() => {
    return Array.isArray(data.due_soon_invoices) ? data.due_soon_invoices : [];
  }, [data.due_soon_invoices]);

  return {
    loading,
    data,

    total_to_invoice: Number(data.total_to_invoice || 0),
    total_invoiced_this_month: Number(data.total_invoiced_this_month || 0),
    total_paid_this_month: Number(data.total_paid_this_month || 0),
    unbilled_hours: Number(data.unbilled_hours || 0),
    billed_hours: Number(data.billed_hours || 0),
    overdue_count: Number(data.overdue_count || 0),
    overdue_total: Number(data.overdue_total || 0),
    due_soon_count: Number(data.due_soon_count || 0),
    due_soon_total: Number(data.due_soon_total || 0),
    invoiceStatus: data.invoice_status || {},

    topClients,
    topProjects,
    recentInvoices,
    overdueInvoices,
    dueSoonInvoices,

    fetchDashboard,
  };
}
