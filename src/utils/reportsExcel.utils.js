import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate, formatHours, formatMoney } from "./formatters";
import { getStoredUser } from "../api/userStore";
import { captureElement } from "./lazyHtml2canvas"; // ← Ajoute cet import

function getCurrentUserName() {
  return getStoredUser()?.nom || "user";
}

function buildExportName(period, extension) {
  const date = new Date().toISOString().slice(0, 10);
  const userName = getCurrentUserName()
    .replaceAll(" ", "-")
    .replace(/[^a-zA-Z0-9-_]/g, "");
  return `MADSuite-${userName}-${period}-${date}.${extension}`;
}

export function exportReportsCSV(rows, period, groupBy) {
  // ✅ Aucun changement — reste synchrone, pas de lazy-load
  if (!rows || rows.length === 0) return;

  const hasPeriod = groupBy === "month" || groupBy === "week";
  const headers = [
    hasPeriod ? "Période" : null,
    "Client",
    "Projet",
    "Utilisateur",
    "Entrées",
    "Première",
    "Dernière",
    "Taux",
    "Temps total",
    "Temps facturable",
    "Montant estimé",
    "Montant facturé",
  ].filter(Boolean);

  let currentClient = null;
  let currentPeriod = null;
  let clientAcc = { heures: 0, heuresFacturables: 0, montantEstime: 0, montantFacture: 0 };
  const csvRows = [];

  for (const r of rows) {
    const clientKey = r.client_id != null ? r.client_id : r.client;
    const periodKey = hasPeriod ? r.periode : null;

    if (clientKey !== currentClient || (hasPeriod && periodKey !== currentPeriod)) {
      if (currentClient !== null) {
        csvRows.push(
          [
            hasPeriod && currentPeriod ? currentPeriod : "",
            `Sous-total ${currentClient || ""}`,
            "",
            "",
            "",
            "",
            "",
            "",
            formatHours(clientAcc.heures),
            formatHours(clientAcc.heuresFacturables),
            formatMoney(clientAcc.montantEstime),
            formatMoney(clientAcc.montantFacture),
          ].filter(Boolean),
        );
      }
      currentClient = clientKey;
      currentPeriod = periodKey;
      clientAcc = { heures: 0, heuresFacturables: 0, montantEstime: 0, montantFacture: 0 };
    }

    csvRows.push([
      hasPeriod ? r.periode_label || r.periode || "" : "",
      r.client || "",
      r.projet || "",
      r.utilisateur || "",
      r.entrees || "",
      r.premiere_entree || "",
      r.derniere_entree || "",
      r.taux_horaire || "",
      formatHours(r.heures),
      formatHours(r.heures_facturables),
      formatMoney(r.montant_estime),
      formatMoney(r.montant_facture),
    ]);

    clientAcc.heures += Number(r.heures || 0);
    clientAcc.heuresFacturables += Number(r.heures_facturables || 0);
    clientAcc.montantEstime += Number(r.montant_estime || 0);
    clientAcc.montantFacture += Number(r.montant_facture || 0);
  }

  if (currentClient !== null) {
    csvRows.push(
      [
        hasPeriod && currentPeriod ? currentPeriod : "",
        `Sous-total ${currentClient || ""}`,
        "",
        "",
        "",
        "",
        "",
        "",
        formatHours(clientAcc.heures),
        formatHours(clientAcc.heuresFacturables),
        formatMoney(clientAcc.montantEstime),
        formatMoney(clientAcc.montantFacture),
      ].filter(Boolean),
    );
  }

  const csvContent = [
    headers.join(";"),
    ...csvRows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = buildExportName(period, "csv");
  link.click();
  URL.revokeObjectURL(url);
}

// ✅ CORRIGÉ : async pour lazy-load html2canvas
export async function exportReportsPDF(rows, total, period, groupBy) {
  if (!rows || rows.length === 0) return;

  try {
    const hasPeriod = groupBy === "month" || groupBy === "week";

    const doc = new jsPDF();
    doc.text("Rapport MADSuite", 14, 15);
    doc.text(`Période : ${period}`, 14, 23);

    const body = [];
    let currentClient = null;
    let currentPeriod = null;
    let clientAcc = { heures: 0, heuresFacturables: 0, montantEstime: 0, montantFacture: 0 };

    for (const r of rows) {
      const clientKey = r.client_id != null ? r.client_id : r.client;
      const periodKey = hasPeriod ? r.periode : null;

      if (clientKey !== currentClient || (hasPeriod && periodKey !== currentPeriod)) {
        if (currentClient !== null) {
          body.push([
            hasPeriod ? r.periode_label || r.periode || "" : `Sous-total ${currentClient || ""}`,
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            formatHours(clientAcc.heures),
            formatHours(clientAcc.heuresFacturables),
            formatMoney(clientAcc.montantEstime),
            formatMoney(clientAcc.montantFacture),
          ]);
        }
        currentClient = clientKey;
        currentPeriod = periodKey;
        clientAcc = { heures: 0, heuresFacturables: 0, montantEstime: 0, montantFacture: 0 };
      }

      body.push([
        hasPeriod ? r.periode_label || r.periode || "" : "",
        r.client || "",
        r.projet || "",
        r.utilisateur || "",
        r.entrees || 0,
        formatDate(r.premiere_entree),
        formatDate(r.derniere_entree),
        formatMoney(r.taux_horaire),
        formatHours(r.heures),
        formatHours(r.heures_facturables),
        formatMoney(r.montant_estime),
        formatMoney(r.montant_facture),
      ]);

      clientAcc.heures += Number(r.heures || 0);
      clientAcc.heuresFacturables += Number(r.heures_facturables || 0);
      clientAcc.montantEstime += Number(r.montant_estime || 0);
      clientAcc.montantFacture += Number(r.montant_facture || 0);
    }

    if (currentClient !== null) {
      body.push([
        hasPeriod && currentPeriod ? currentPeriod : `Sous-total ${currentClient || ""}`,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        formatHours(clientAcc.heures),
        formatHours(clientAcc.heuresFacturables),
        formatMoney(clientAcc.montantEstime),
        formatMoney(clientAcc.montantFacture),
      ]);
    }

    autoTable(doc, {
      startY: 30,
      head: [
        [
          "Période",
          "Client",
          "Projet",
          "Utilisateur",
          "Entrées",
          "Première",
          "Dernière",
          "Taux",
          "Temps total",
          "Temps facturable",
          "Montant estimé",
          "Montant facturé",
        ],
      ],
      body: body,
      foot: [
        [
          "TOTAL GÉNÉRAL",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          formatHours(total.heures),
          formatHours(total.heures_facturables),
          formatMoney(total.montant_estime),
          formatMoney(total.montant_facture),
        ],
      ],
      styles: { fontSize: 8 },
      headStyles: { fontSize: 8 },
    });

    doc.save(buildExportName(period, "pdf"));
  } catch (err) {
    console.error("PDF export error:", err);
    alert("Erreur lors de l'export PDF: " + err.message);
  }
}
