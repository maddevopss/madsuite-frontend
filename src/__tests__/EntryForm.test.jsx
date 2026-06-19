import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EntryForm from "../pages/Timesheet/EntryForm";

describe("EntryForm", () => {
  const projets = [
    {
      id: 1,
      nom: "Projet Test",
      client_nom: "Client Test",
    },
  ];

  test("affiche formulaire", () => {
    render(
      <EntryForm
        addForm={{
          note: "",
          projet_id: "",
          start_time: "",
          end_time: "",
        }}
        setAddForm={jest.fn()}
        projets={projets}
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByPlaceholderText("Qu'avez-vous fait ?")).toBeInTheDocument();
  });

  test("soumet formulaire", async () => {
    const onSubmit = jest.fn();

    render(
      <EntryForm
        addForm={{
          note: "Nouvelle entrée",
          projet_id: 1,
          start_time: "2026-05-20T09:00",
          end_time: "2026-05-20T10:00",
        }}
        setAddForm={jest.fn()}
        projets={projets}
        onSubmit={onSubmit}
        onCancel={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Projet"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Début"), { target: { value: "2026-05-20T09:00" } });
    fireEvent.change(screen.getByLabelText("Fin"), { target: { value: "2026-05-20T10:00" } });
    fireEvent.click(screen.getByText(/ajouter/i));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });
});
