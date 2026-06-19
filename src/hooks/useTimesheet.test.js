import { act, renderHook, waitFor } from "@testing-library/react";
import { useTimesheet } from "./useTimesheet";
import { createTimesheetEntry, loadTimesheetEntries, loadTimesheetProjets, updateTimesheetEntry } from "./useTimesheet.api";

const mockRefreshAppData = jest.fn();
const mockShowToast = jest.fn();
const mockConfirm = jest.fn();

jest.mock("./useTimesheet.api");
jest.mock("../RefreshContext", () => ({
  useRefresh: () => ({ refreshKey: 0, refreshAppData: mockRefreshAppData }),
}));
jest.mock("../ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));
jest.mock("./useConfirm", () => ({
  useConfirm: () => ({ confirm: mockConfirm, confirmProps: {} }),
}));

describe("useTimesheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadTimesheetProjets.mockResolvedValue([]);
    loadTimesheetEntries.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
    });
  });

  test("crée une entrée manuelle avec le contrat début/fin", async () => {
    createTimesheetEntry.mockResolvedValue({});
    const { result } = renderHook(() => useTimesheet());

    await waitFor(() => expect(loadTimesheetEntries).toHaveBeenCalled());

    await act(async () => {
      await result.current.saveNewEntry({
        projet_id: 12,
        note: "Travail ciblé",
        start_time: "2026-06-06T09:00",
        end_time: "2026-06-06T10:30",
      });
    });

    expect(createTimesheetEntry).toHaveBeenCalledWith({
      projet_id: 12,
      description: null,
      start_time: "2026-06-06T09:00",
      end_time: "2026-06-06T10:30",
    });
  });

  test("met à jour une entrée avec le contrat début/fin", async () => {
    updateTimesheetEntry.mockResolvedValue({});
    const { result } = renderHook(() => useTimesheet());

    await waitFor(() => expect(loadTimesheetEntries).toHaveBeenCalled());

    act(() => {
      result.current.setEditForm({
        projet_id: 12,
        note: "Révision",
        start_time: "2026-06-06T11:00",
        end_time: "2026-06-06T12:00",
      });
    });

    await act(async () => {
      await result.current.saveEditEntry(44);
    });

    expect(updateTimesheetEntry).toHaveBeenCalledWith(44, {
      projet_id: 12,
      description: null,
      start_time: "2026-06-06T11:00",
      end_time: "2026-06-06T12:00",
    });
  });
});
