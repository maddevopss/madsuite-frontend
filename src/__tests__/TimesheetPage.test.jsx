import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Timesheet from "../pages/Timesheet";

const mockUseTimesheet = jest.fn();
const mockUseModal = jest.fn();
const mockPrepareEditForm = jest.fn();
const mockResetAddForm = jest.fn();
const mockOpenModal = jest.fn();
const mockCloseModal = jest.fn();

jest.mock("react-router-dom", () => ({
  useSearchParams: () => [new URLSearchParams("user=42")],
}));

jest.mock("../hooks/useTimesheet", () => ({
  useTimesheet: (...args) => mockUseTimesheet(...args),
}));

jest.mock("../hooks/useModal", () => ({
  useModal: (...args) => mockUseModal(...args),
}));

jest.mock("../components/ui", () => ({
  ConfirmModal: (props) => <div data-testid="confirm-modal" data-props={JSON.stringify(props)} />,
  Loader: ({ label }) => <div>{label}</div>,
  Modal: ({ show, title, children }) => (show ? <div role="dialog" aria-label={title}>{children}</div> : null),
}));

jest.mock("../pages/Timesheet/TimesheetHeader", () => (props) => (
  <div>
    <span>header</span>
    <button type="button" onClick={props.onPrevWeek}>
      prev
    </button>
    <button type="button" onClick={props.onNextWeek}>
      next
    </button>
  </div>
));

jest.mock("../pages/Timesheet/TimesheetStats", () => () => <div>stats</div>);
jest.mock("../pages/Timesheet/TimesheetWeekStats", () => () => <div>week-stats</div>);
jest.mock("../pages/Timesheet/TimesheetFilters", () => (props) => (
  <div>
    <button type="button" onClick={props.onAdd}>
      add
    </button>
  </div>
));
jest.mock("../pages/Timesheet/TimesheetTable", () => (props) => (
  <div>
    <button type="button" onClick={() => props.onEdit(props.entries[0])}>
      edit-row
    </button>
  </div>
));
jest.mock("../pages/Timesheet/EntryForm", () => () => <div>entry-form</div>);
jest.mock("../pages/Timesheet/EditEntryForm", () => jest.fn(() => <div data-testid="edit-form">edit-form</div>));

describe("Timesheet page", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseModal.mockImplementation(() => ({
      isOpen: true,
      selectedItem: { id: 100 },
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    }));

    mockUseTimesheet.mockReturnValue({
      weekDate: new Date("2026-06-09T00:00:00.000Z"),
      projets: [{ id: 1, nom: "Projet A", client_nom: "Client A" }],
      clients: [{ id: 1, nom: "Client A" }],
      loading: false,
      filterClient: "",
      setFilterClient: jest.fn(),
      filterBilled: "",
      setFilterBilled: jest.fn(),
      resetAddForm: mockResetAddForm,
      editForm: {
        projet_id: 1,
        description: "Travail en cours",
        start_time: "2026-06-09T09:00",
        end_time: "2026-06-09T10:00",
      },
      setEditForm: jest.fn(),
      prepareEditForm: mockPrepareEditForm,
      prevWeek: jest.fn(),
      nextWeek: jest.fn(),
      toggleBilled: jest.fn(),
      deleteEntry: jest.fn(),
      saveNewEntry: jest.fn(),
      saveEditEntry: jest.fn(),
      todayStats: {},
      groupedEntries: {
        "2026-06-09": [
          {
            id: 1,
            projet_id: 1,
            description: "Travail en cours",
            client_nom: "Client A",
            projet_nom: "Projet A",
            heures: 1,
          },
        ],
      },
      weekStats: {},
      confirmProps: {},
    });
  });

  test("passes edit form state to the edit modal", () => {
    render(<Timesheet />);

    fireEvent.click(screen.getByText("edit-row"));

    expect(mockPrepareEditForm).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));

    const EditEntryForm = require("../pages/Timesheet/EditEntryForm");
    expect(EditEntryForm.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        editForm: expect.objectContaining({
          projet_id: 1,
          description: "Travail en cours",
        }),
      }),
    );
  });
});
