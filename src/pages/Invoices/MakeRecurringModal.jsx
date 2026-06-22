import { useState } from "react";
import { Modal, Button, Select, Input } from "../../components/ui";
import { getApiErrorMessage } from "../../api/apiError";
import api from "../../api/api";
import { useToast } from "../../ToastContext";

export default function MakeRecurringModal({ show, invoice, onClose, onSuccess }) {
  const [frequency, setFrequency] = useState("monthly");
  const [nextIssueDate, setNextIssueDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/invoices/${invoice.id}/recurring`, {
        frequency,
        next_issue_date: nextIssueDate
      });
      showToast("Facture rendue récurrente avec succès.", "success");
      onSuccess();
      onClose();
    } catch (err) {
      showToast(getApiErrorMessage(err, "Erreur lors de l'activation de la récurrence."), "error");
    } finally {
      setLoading(false);
    }
  };

  if (!invoice) return null;

  return (
    <Modal show={show} title={`Rendre récurrente (Facture ${invoice.invoice_number})`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Fréquence</label>
          <Select value={frequency} onChange={(e) => setFrequency(e.target.value)} required>
            <option value="weekly">Hebdomadaire</option>
            <option value="monthly">Mensuelle</option>
            <option value="yearly">Annuelle</option>
          </Select>
        </div>

        <div className="form-group">
          <label>Prochaine émission</label>
          <Input 
            type="date" 
            value={nextIssueDate} 
            onChange={(e) => setNextIssueDate(e.target.value)} 
            required 
          />
        </div>

        <div className="form-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Activation..." : "Activer la récurrence"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
