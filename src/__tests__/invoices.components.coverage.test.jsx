import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import CreateInvoiceModal from "../pages/Invoices/CreateInvoiceModal";
import EditInvoiceModal from "../pages/Invoices/EditInvoiceModal";
import InvoiceCard from "../pages/Invoices/InvoiceCard";
import ViewInvoiceModal from "../pages/Invoices/ViewInvoiceModal";
import { STATUS_COLORS, STATUS_LABELS } from "../pages/Invoices/invoiceStatus";

jest.mock("../api/invoices.api", () => ({
  getUnbilledInvoiceEntries: jest.fn(),
}));

const { getUnbilledInvoiceEntries } = require("../api/invoices.api");

const invoice = {
  id: 7,
  invoice_number: "INV-007",
  status: "draft",
  client_nom: "Client Facture",
  issue_date: "2026-06-01",
  due_date: "2026-06-15",
  subtotal: 100,
  tax_total: 15,
  total: 115,
  entries_count: 2,
  notes: "Note test",
  items: [
    {
      id: 1,
      projet_nom: "Projet A",
      description: "Développement",
      quantity: 2,
      unit_rate: 50,
      amount: 100,
    },
  ],
};

describe("Invoice components", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("invoiceStatus expose les libellés et couleurs", () => {
    expect(STATUS_LABELS).toEqual(
      expect.objectContaining({
        draft: "Brouillon",
        sent: "Envoyée",
        paid: "Payée",
        void: "Annulée",
      }),
    );

    expect(STATUS_COLORS).toEqual(
      expect.objectContaining({
        draft: "warning",
        sent: "info",
        paid: "success",
        void: "error",
      }),
    );
  });

  test("InvoiceCard affiche la facture et déclenche les actions", () => {
    const onView = jest.fn();
    const onDownloadPDF = jest.fn();
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(
      <InvoiceCard invoice={invoice} onView={onView} onDownloadPDF={onDownloadPDF} onEdit={onEdit} onDelete={onDelete} />,
    );

    expect(screen.getByText("INV-007")).toBeInTheDocument();
    expect(screen.getByText("Client Facture")).toBeInTheDocument();
    expect(screen.getByText("Brouillon")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /voir/i }));
    fireEvent.click(screen.getByRole("button", { name: /pdf/i }));
    fireEvent.click(screen.getByRole("button", { name: /modifier/i }));
    fireEvent.click(screen.getByRole("button", { name: /supprimer/i }));

    expect(onView).toHaveBeenCalledWith(7);
    expect(onDownloadPDF).toHaveBeenCalledWith(7);
    expect(onEdit).toHaveBeenCalledWith(invoice);
    expect(onDelete).toHaveBeenCalledWith(7);
  });

  test("ViewInvoiceModal affiche les détails et télécharge le PDF", () => {
    const onClose = jest.fn();
    const onDownloadPDF = jest.fn();

    render(<ViewInvoiceModal show invoice={invoice} onClose={onClose} onDownloadPDF={onDownloadPDF} />);

    expect(screen.getByText("Facture INV-007")).toBeInTheDocument();
    expect(screen.getByText("Projet A")).toBeInTheDocument();
    expect(screen.getByText("Développement")).toBeInTheDocument();
    expect(screen.getByText("Note test")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /télécharger pdf/i }));

    expect(onDownloadPDF).toHaveBeenCalledWith(7);
  });

  test("ViewInvoiceModal explique une facture sans lignes", () => {
    render(<ViewInvoiceModal show invoice={{ ...invoice, items: [] }} onClose={jest.fn()} onDownloadPDF={jest.fn()} />);

    expect(screen.getByText("Aucune ligne de facturation.")).toBeInTheDocument();
  });

  test("EditInvoiceModal modifie statut et notes", () => {
    const onStatusChange = jest.fn();
    const onNotesChange = jest.fn();
    const onClose = jest.fn();
    const onSave = jest.fn();

    render(
      <EditInvoiceModal
        show
        status="draft"
        notes="Ancienne note"
        loading={false}
        onStatusChange={onStatusChange}
        onNotesChange={onNotesChange}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("Brouillon"), { target: { value: "paid" } });
    fireEvent.change(screen.getByDisplayValue("Ancienne note"), { target: { value: "Nouvelle note" } });
    fireEvent.click(screen.getByRole("button", { name: /enregistrer/i }));
    fireEvent.click(screen.getByRole("button", { name: /annuler/i }));

    expect(onStatusChange).toHaveBeenCalledWith("paid");
    expect(onNotesChange).toHaveBeenCalledWith("Nouvelle note");
    expect(onSave).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  test("CreateInvoiceModal charge les entrées et crée la facture", async () => {
    const onCreate = jest.fn();

    getUnbilledInvoiceEntries.mockResolvedValue([
      {
        id: 12,
        projet_nom: "Projet facture",
        hours: 2,
        hourly_rate_used: 100,
        amount: 200,
      },
    ]);

    render(
      <CreateInvoiceModal
        show
        clients={[{ id: 4, nom: "Client A" }]}
        loading={false}
        initialClientId={null}
        onClose={jest.fn()}
        onCreate={onCreate}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("— Sélectionner un client —"), { target: { value: "4" } });

    await screen.findByText(/Projet facture/i);

    fireEvent.click(screen.getByText(/Projet facture/i));
    fireEvent.change(screen.getByPlaceholderText("0"), { target: { value: "15" } });
    fireEvent.click(screen.getByRole("button", { name: /créer la facture/i }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          client_id: 4,
          time_entry_ids: [12],
          tax_rate: 15,
        }),
      );
    });
  });
});
