import { useState,  useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ConfirmModal, Loader, Modal } from "../../components/ui";

import "../../styles/timesheet.css";

import TimesheetHeader from "./TimesheetHeader";
import TimesheetFilters from "./TimesheetFilters";
import TimesheetTable from "./TimesheetTable";
import EntryForm from "./EntryForm";
import EditEntryForm from "./EditEntryForm";
import TimesheetStats from "./TimesheetStats";
import TimesheetWeekStats from "./TimesheetWeekStats";
import AutoTimesheetModal from "./AutoTimesheetModal";

import { useTimesheet } from "../../hooks/useTimesheet";
import { useModal } from "../../hooks/useModal";

export default function Timesheet() {
  const [searchParams] = useSearchParams();
  const filterUser = searchParams.get("user") || "";
  const addModal = useModal();
  const editModal = useModal();
  const [showAutoFill, setShowAutoFill] = useState(false);

  const {
    weekDate,
    projets,
    clients,
    loading,
    filterClient,
    setFilterClient,
    filterBilled,
    setFilterBilled,
    resetAddForm,
    editForm,
    setEditForm,
    prepareEditForm,
    prevWeek,
    nextWeek,
    toggleBilled,
    toggleStatus,
    deleteEntry,
    saveNewEntry,
    saveEditEntry,
    todayStats,
    groupedEntries,
    weekStats,
    confirmProps,
  } = useTimesheet(filterUser);

  const dayGroups = useMemo(() => Object.entries(groupedEntries), [groupedEntries]);
  const dayTotals = useMemo(
    () =>
      dayGroups.map(([date, dayEntries]) => {
        const total = dayEntries.reduce((sum, e) => sum + Number(e.heures || 0), 0);
        return { date, dayEntries, total };
      }),
    [dayGroups],
  );

  const closeAddModal = () => {
    resetAddForm();
    addModal.closeModal();
  };

  const handleAddEntryFromCalendar = (calendarEvt) => {
    resetAddForm();
    setAddForm((prev) => ({
      ...prev,
      description: calendarEvt.description,
      start_time: calendarEvt.start_time.slice(0, 16), // datetime-local format
      end_time: calendarEvt.end_time.slice(0, 16),
    }));
    addModal.openModal();
  };

  const handleOpenEdit = (entry) => {
    prepareEditForm(entry);
    editModal.openModal(entry);
  };

  const handleSaveNewEntry = async (formData) => {
    const success = await saveNewEntry(formData);

    if (success) {
      closeAddModal();
    }
  };

  const handleSaveEdit = async () => {
    const success = await saveEditEntry(editModal.selectedItem?.id);

    if (success) {
      editModal.closeModal();
    }
  };

  return (
    <div className="timesheet-page">
      <h1>Feuilles de temps</h1>

      <div className="view active" id="view-timesheet">
        <TimesheetHeader weekDate={weekDate} onPrevWeek={prevWeek} onNextWeek={nextWeek} />

        <TimesheetStats stats={todayStats} />
        <TimesheetWeekStats stats={weekStats} />

        <TimesheetFilters
          clients={clients}
          filterClient={filterClient}
          setFilterClient={setFilterClient}
          filterBilled={filterBilled}
          setFilterBilled={setFilterBilled}
          onAutoFill={() => setShowAutoFill(true)}
          onAdd={() => {
            resetAddForm();
            addModal.openModal();
          }}
          onAddEntryFromCalendar={handleAddEntryFromCalendar}
        />

        {loading && Object.keys(groupedEntries).length === 0 ? (
          <Loader label="Chargement des feuilles de temps..." variant="table" rows={5} />
        ) : (
          dayTotals.map(({ date, dayEntries, total }) => (
            <div key={date} className="timesheet-day-group">
              <div className="timesheet-day-header">
                <h3>
                  {new Date(date).toLocaleDateString("fr-CA", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h3>

                <span>{total.toFixed(1)}h</span>
              </div>

              <TimesheetTable
                entries={dayEntries}
                loading={loading}
                totalHeures={total}
                onToggleBilled={toggleBilled}
                onToggleStatus={toggleStatus}
                onEdit={handleOpenEdit}
                onDelete={deleteEntry}
              />
            </div>
          ))
        )}
      </div>

      <Modal show={addModal.isOpen} title="Ajouter une entree" onClose={closeAddModal}>
        <EntryForm projets={projets} onSubmit={handleSaveNewEntry} onCancel={closeAddModal} />
      </Modal>

      <Modal show={editModal.isOpen} title="Modifier l'entree" onClose={editModal.closeModal}>
        <EditEntryForm
          projets={projets}
          editForm={editForm}
          setEditForm={setEditForm}
          onSubmit={handleSaveEdit}
          onCancel={editModal.closeModal}
        />
      </Modal>

      <AutoTimesheetModal 
        show={showAutoFill} 
        onClose={() => setShowAutoFill(false)} 
        targetDate={weekDate.toISOString().split('T')[0]}
        onSaveSuccess={() => window.location.reload()} 
      />

      <ConfirmModal {...confirmProps} />
    </div>
  );
}
