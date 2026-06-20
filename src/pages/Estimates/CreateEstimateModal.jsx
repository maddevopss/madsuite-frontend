import { useState, useEffect } from "react";
import { Modal, Button, Input, Select, Textarea } from "../../components/ui";
import { AiOutlinePlus, AiOutlineDelete } from "react-icons/ai";

export default function CreateEstimateModal({ show, clients, loading, initialClientId, onClose, onCreate }) {
  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState("14.975");
  const [items, setItems] = useState([
    { description: "", quantity: 1, unit_rate: 0 }
  ]);

  useEffect(() => {
    if (show) {
      setClientId(initialClientId ? String(initialClientId) : "");
      setIssueDate(new Date().toISOString().slice(0, 10));
      setValidUntil("");
      setNotes("");
      setTaxRate("14.975");
      setItems([{ description: "", quantity: 1, unit_rate: 0 }]);
    }
  }, [show, initialClientId]);

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_rate: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientId) return;

    // Filter out empty items
    const validItems = items.filter(item => item.description.trim() !== "");
    if (validItems.length === 0) return;

    onCreate({
      client_id: Number(clientId),
      issue_date: issueDate,
      valid_until: validUntil || undefined,
      notes,
      tax_rate: Number(taxRate),
      items: validItems
    });
  };

  return (
    <Modal show={show} onClose={onClose} title="Créer une soumission" size="large">
      <form onSubmit={handleSubmit}>
        <div className="form-group-row">
          <Select label="Client" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
            <option value="">Sélectionner un client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </Select>
          <Input type="date" label="Date d'émission" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
        </div>

        <div className="form-group-row">
          <Input type="date" label="Valide jusqu'au" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          <Input type="number" step="0.001" label="Taux de taxes (%)" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Items de la soumission</label>
          {items.map((item, index) => (
            <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
              <Input
                placeholder="Description"
                value={item.description}
                onChange={(e) => handleItemChange(index, "description", e.target.value)}
                required
                style={{ flex: 2, marginBottom: 0 }}
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Qté"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                required
                style={{ width: "80px", marginBottom: 0 }}
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Taux unitaire"
                value={item.unit_rate}
                onChange={(e) => handleItemChange(index, "unit_rate", Number(e.target.value))}
                required
                style={{ width: "120px", marginBottom: 0 }}
              />
              <Button type="button" variant="danger" onClick={() => handleRemoveItem(index)} disabled={items.length === 1} style={{ height: "42px", padding: "0 10px" }}>
                <AiOutlineDelete />
              </Button>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={handleAddItem} size="small" style={{ marginTop: "10px" }}>
            <AiOutlinePlus /> Ajouter un item
          </Button>
        </div>

        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Notes ou conditions (optionnel)" />

        <div className="modal-actions" style={{ marginTop: "2rem" }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Annuler</Button>
          <Button type="submit" variant="primary" disabled={loading || !clientId || items.filter(i => i.description.trim() !== "").length === 0}>
            {loading ? "Création..." : "Créer la soumission"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
