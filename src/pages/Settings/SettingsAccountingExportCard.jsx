import { useState } from "react";
import { exportInvoicesCSV, exportExpensesCSV, exportLedgerCSV } from "../../api/export.api";

export default function SettingsAccountingExportCard() {
  const [loading, setLoading] = useState(null);

  const handleExport = async (type) => {
    try {
      setLoading(type);
      if (type === "invoices") {
        await exportInvoicesCSV();
      } else if (type === "expenses") {
        await exportExpensesCSV();
      } else if (type === "ledger") {
        await exportLedgerCSV();
      }
    } catch (err) {
      console.error("Export failed", err);
      alert("Erreur lors de l'exportation");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold mb-2">Comptabilité & Exports</h3>
      <p className="text-sm text-gray-600 mb-3">
        Générez des exports CSV compatibles QuickBooks, Excel et systèmes ERP pour simplifier la réconciliation comptable.
      </p>

      <div className="flex flex-col gap-2 mt-4">
        <button
          onClick={() => handleExport("invoices")}
          disabled={loading === "invoices"}
          className="w-full text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded text-sm text-gray-700 flex justify-between items-center"
        >
          <span>Factures (Invoices)</span>
          <span className="text-xs text-gray-500">{loading === "invoices" ? "Génération..." : "Télécharger .csv"}</span>
        </button>

        <button
          onClick={() => handleExport("expenses")}
          disabled={loading === "expenses"}
          className="w-full text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded text-sm text-gray-700 flex justify-between items-center"
        >
          <span>Dépenses (Expenses)</span>
          <span className="text-xs text-gray-500">{loading === "expenses" ? "Génération..." : "Télécharger .csv"}</span>
        </button>

        <button
          onClick={() => handleExport("ledger")}
          disabled={loading === "ledger"}
          className="w-full text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded text-sm text-gray-700 flex justify-between items-center"
        >
          <span>Grand livre (Ledger)</span>
          <span className="text-xs text-gray-500">{loading === "ledger" ? "Génération..." : "Télécharger .csv"}</span>
        </button>
      </div>
    </div>
  );
}
