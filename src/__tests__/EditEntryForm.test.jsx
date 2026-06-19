import { render, screen, fireEvent } from "@testing-library/react";
import EditEntryForm from "../pages/Timesheet/EditEntryForm";

describe("EditEntryForm", () => {
  const projets = [
    {
      id: 1,
      nom: "Projet Test",
      client_nom: "Client Test",
    },
  ];

  test("affiche formulaire édition", () => {
    render(
      <EditEntryForm
        editForm={{
          note: "Entrée test",
          projet_id: 1,
          start_time: "2026-05-20T09:00",
          end_time: "2026-05-20T10:00",
        }}
        setEditForm={jest.fn()}
        projets={projets}
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByDisplayValue("Entrée test")).toBeInTheDocument();

    expect(screen.getByText(/sauvegarder/i)).toBeInTheDocument();
  });

  test("soumet édition", () => {
    const onSubmit = jest.fn();

    render(
      <EditEntryForm
        editForm={{
          note: "Entrée test",
          projet_id: 1,
          start_time: "2026-05-20T09:00",
          end_time: "2026-05-20T10:00",
        }}
        setEditForm={jest.fn()}
        projets={projets}
        onSubmit={onSubmit}
        onCancel={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByText(/sauvegarder/i));

    expect(onSubmit).toHaveBeenCalled();
  });
});
