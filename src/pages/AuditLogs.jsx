import { useState } from "react";
import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useToast } from "../context/ToastContext";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({ email: "", action: "" });
  const [tempFilters, setTempFilters] = useState({ email: "", action: "" });
  const [exportLoading, setExportLoading] = useState(false);
  const { showToast } = useToast();

  // Debounce : on ne met à jour 'filters' (et donc l'API) que 500ms après la fin de la saisie
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(tempFilters);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [tempFilters]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        });
        if (filters.email) params.append("email", filters.email);
        if (filters.action) params.append("action", filters.action);

        const response = await api.get(`/organisation/audit-logs?${params.toString()}`);
        const data = response.data;
        setLogs(data);
        setHasMore(data.length === 20);
      } catch (err) {
        showToast("Erreur lors du chargement des logs", "error");
      }
    };
    fetchLogs();
  }, [showToast, page, filters]);

  const handleFilterChange = (e) => {
    setTempFilters({ ...tempFilters, [e.target.name]: e.target.value });
  };

  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/organisation/audit-logs/export?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `audit_logs_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast("Erreur lors de l'export CSV", "error");
    } finally {
      setExportLoading(false);
    }
  };

  const formatDetails = (log) => {
    if (!log.details) return "-";

    if (log.action === "UPDATE_RETENTION_POLICY") {
      const d = log.details;
      const parts = [];
      if (d.retention_activity_logs_days) parts.push(`Activité: ${d.retention_activity_logs_days}j`);
      if (d.retention_summary_days) parts.push(`Résumés: ${d.retention_summary_days}j`);
      if (d.retention_audit_logs_days) parts.push(`Audit: ${d.retention_audit_logs_days}j`);
      return `Nouvelle politique : ${parts.join(", ")}`;
    }

    return JSON.stringify(log.details);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Journal d'audit</h2>
          <div className="mt-2 flex gap-4">
            <input
              type="text"
              name="email"
              placeholder="Filtrer par email..."
              value={tempFilters.email}
              onChange={handleFilterChange}
              className="border rounded px-2 py-1 text-sm w-64"
            />
            <input
              type="text"
              name="action"
              placeholder="Filtrer par action..."
              value={tempFilters.action}
              onChange={handleFilterChange}
              className="border rounded px-2 py-1 text-sm w-48"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={exportLoading}
            className={`mr-2 px-3 py-1 bg-green-600 text-white rounded text-sm transition-colors flex items-center gap-2 ${
              exportLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-green-700"
            }`}>
            {exportLoading && (
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {exportLoading ? "Génération..." : "Exporter CSV"}
          </button>
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50">
            Précédent
          </button>
          <span className="py-1">Page {page}</span>
          <button
            disabled={!hasMore}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50">
            Suivant
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Détails</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.utilisateur_email || "Système"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 italic">{formatDetails(log)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
