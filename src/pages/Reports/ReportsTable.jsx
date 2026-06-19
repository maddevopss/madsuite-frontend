import { useMemo, useState } from "react";

import { Button, Card, EmptyState } from "../../components/ui";

import { formatDate, formatHours, formatMoney } from "../../utils/formatters";

const DEFAULT_PAGE_SIZE = 200;

export default function ReportsTable({ rows = [], total = {}, groupBy }) {
  const [showAll, setShowAll] = useState(false);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);

  const hasPeriod = groupBy === "month" || groupBy === "week";

  const visibleRows = useMemo(() => {
    if (showAll) return rows;
    return rows.slice(0, pageSize);
  }, [rows, showAll, pageSize]);

  const displayRows = useMemo(() => {
    return visibleRows.map((r, i) => {
      const periodeCell = hasPeriod ? r.periode_label || r.periode || "—" : null;
      const key = r.id ?? i;

      return {
        key,
        periodeCell,
        cells: {
          client: r.client || "—",
          projet: r.projet || "—",
          utilisateur: r.utilisateur || "—",
          entrees: r.entrees || 0,
          premiere: r.premiere_entree ? formatDate(r.premiere_entree) : "—",
          derniere: r.derniere_entree ? formatDate(r.derniere_entree) : "—",
          taux: formatMoney(r.taux_horaire || 0),
          heures: formatHours(r.heures || 0),
          heuresFacturables: formatHours(r.heures_facturables || 0),
          montantEstime: formatMoney(r.montant_estime || 0),
          montantFacture: formatMoney(r.montant_facture || 0),
        },
      };
    });
  }, [visibleRows, hasPeriod]);

  if (rows.length === 0) {
    return <EmptyState message="Aucune donnée disponible." />;
  }

  const shouldShowMore = !showAll && rows.length > pageSize;

  return (
    <Card className="report-table-wrapper">
      <table className="report-table">
        <thead>
          <tr>
            {hasPeriod && <th>Période</th>}
            <th>Client</th>
            <th>Projet</th>
            <th>Utilisateur</th>
            <th>Entrées</th>
            <th>Première</th>
            <th>Dernière</th>
            <th>Taux</th>
            <th>Temps total</th>
            <th>Temps facturable</th>
            <th>Montant estimé</th>
            <th>Montant facturé</th>
          </tr>
        </thead>

        <tbody>
          {displayRows.map((row) => (
            <tr key={row.key}>
              {hasPeriod && <td>{row.periodeCell}</td>}

              <td>{row.cells.client}</td>
              <td>{row.cells.projet}</td>
              <td>{row.cells.utilisateur}</td>
              <td>{row.cells.entrees}</td>
              <td>{row.cells.premiere}</td>
              <td>{row.cells.derniere}</td>
              <td>{row.cells.taux}</td>
              <td>{row.cells.heures}</td>
              <td>{row.cells.heuresFacturables}</td>
              <td>{row.cells.montantEstime}</td>
              <td>{row.cells.montantFacture}</td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <td colSpan={hasPeriod ? "8" : "7"}>TOTAL</td>
            <td>{formatHours(total.heures || 0)}</td>
            <td>{formatHours(total.heures_facturables || 0)}</td>
            <td>{formatMoney(total.montant_estime || 0)}</td>
            <td>{formatMoney(total.montant_facture || 0)}</td>
          </tr>
        </tfoot>
      </table>

      {shouldShowMore && (
        <div className="reports-showmore">
          <Button type="button" variant="secondary" onClick={() => setShowAll(true)}>
            Afficher {rows.length - pageSize} autres lignes
          </Button>
        </div>
      )}
    </Card>
  );
}
