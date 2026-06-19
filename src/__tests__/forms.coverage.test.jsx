import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import AddClientForm from "../pages/Clients/AddClientForm";
import EditClientForm from "../pages/Clients/EditClientForm";
import AddProjectForm from "../pages/Projets/AddProjectForm";
import EditProjectForm from "../pages/Projets/EditProjectForm";

const clients = [{ id: 1, nom: "Client Test" }];

describe("Client and project forms", () => {
  test("AddClientForm met à jour les champs et soumet", async () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    render(<AddClientForm onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.change(screen.getByPlaceholderText("Ex: Acme Corp"), { target: { value: "Client X" } });
    fireEvent.click(screen.getByRole("button", { name: /sauvegarder/i }));
    fireEvent.click(screen.getByRole("button", { name: /annuler/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onCancel).toHaveBeenCalled();
  });

  test("EditClientForm retourne null sans client", () => {
    const { container } = render(<EditClientForm client={null} editForm={{}} setEditForm={jest.fn()} onSubmit={jest.fn()} onCancel={jest.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  test("EditClientForm modifie les champs", () => {
    const setEditForm = jest.fn();
    const onSubmit = jest.fn();

    render(
      <EditClientForm
        client={{ id: 1 }}
        editForm={{ nom: "Client A", hourly_rate_defaut: "80" }}
        setEditForm={setEditForm}
        onSubmit={onSubmit}
        onCancel={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("Client A"), { target: { value: "Client B" } });
    fireEvent.click(screen.getByRole("button", { name: /sauvegarder/i }));

    expect(setEditForm).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalled();
  });

  test("AddProjectForm met à jour texte, select et couleur", () => {
    const setForm = jest.fn();
    const onSubmit = jest.fn();

    render(
      <AddProjectForm
        clients={clients}
        form={{ nom: "", client_id: "", description: "", status: "actif", couleur: "#1884df" }}
        setForm={setForm}
        onSubmit={onSubmit}
        onCancel={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Nom du projet"), { target: { value: "Projet A" } });
    fireEvent.change(screen.getByDisplayValue("Sélectionner un client"), { target: { value: "1" } });
    fireEvent.click(document.querySelector(".color-preset"));
    fireEvent.click(screen.getByRole("button", { name: /ajouter/i }));

    expect(setForm).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalled();
  });

  test("EditProjectForm affiche la couleur personnalisée", () => {
    const setEditForm = jest.fn();

    render(
      <EditProjectForm
        project={{ id: 1 }}
        clients={clients}
        editForm={{ nom: "Projet", client_id: 1, status: "actif", couleur: "#123456" }}
        setEditForm={setEditForm}
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByText("Perso")).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue("Projet"), { target: { value: "Projet B" } });

    expect(setEditForm).toHaveBeenCalled();
  });
});
