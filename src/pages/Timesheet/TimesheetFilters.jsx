import { memo } from "react";
import { Button, Select } from "../../components/ui";
import CalendarIntegration from "./CalendarIntegration";

function TimesheetFilters({
  clients = [],
  filterClient,
  setFilterClient,
  filterBilled,
  setFilterBilled,
  onAdd,
  onAutoFill,
  onAddEntryFromCalendar,
}) {
  return (
    <div className="ts-filters">
      <Select value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
        <option value="">Tous les clients</option>

        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nom}
          </option>
        ))}
      </Select>

      <Select value={filterBilled} onChange={(e) => setFilterBilled(e.target.value)}>
        <option value="">Tous les statuts</option>
        <option value="false">Non facturées</option>
        <option value="true">Facturées</option>
      </Select>

      <CalendarIntegration onAddEntry={onAddEntryFromCalendar} />

      <Button type="button" variant="secondary" onClick={onAutoFill} style={{ background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)', color: 'white', border: 'none' }}>
        ✨ Remplir avec l'IA
      </Button>

      <Button type="button" variant="primary" onClick={onAdd}>
        + Ajouter
      </Button>
    </div>
  );
}

export default memo(TimesheetFilters);
