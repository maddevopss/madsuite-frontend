import { useState } from "react";
import React, { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import { getExpenses, createExpense, deleteExpense } from "../../api/expenses.api";
import { getProjets } from "../../api/projets.api";


export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    projet_id: "",
    category: "general",
    amount: "",
    description: "",
    distance: "",
    rate_per_unit: 0.68,
    expense_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expRes, projRes] = await Promise.all([
        getExpenses(),
        getProjets()
      ]);
      setExpenses(expRes.data || []);
      setProjets(projRes.data || []);
    } catch (err) {
      setError("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      let finalAmount = parseFloat(formData.amount) || 0;
      if (formData.category === "mileage") {
        const dist = parseFloat(formData.distance) || 0;
        const rate = parseFloat(formData.rate_per_unit) || 0;
        finalAmount = dist * rate;
      }

      await createExpense({
        ...formData,
        amount: finalAmount,
        total_amount: finalAmount,
        distance: formData.distance ? parseFloat(formData.distance) : null,
        rate_per_unit: formData.rate_per_unit ? parseFloat(formData.rate_per_unit) : null,
      });

      setFormData({
        ...formData,
        amount: "",
        description: "",
        distance: "",
      });
      fetchData();
    } catch (err) {
      setError("Erreur lors de l'ajout de la dépense.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette dépense ?")) return;
    try {
      await deleteExpense(id);
      fetchData();
    } catch (err) {
      setError("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="page-container">
      <PageHeader title="Dépenses & Kilométrage" subtitle="Gérez vos frais et déplacements facturables" />

      {error && <div className="error-message" style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        {/* Formulaire */}
        <div style={{ flex: "1 1 300px", background: "#fff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h3>Ajouter une dépense</h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label>Projet *</label>
              <select name="projet_id" value={formData.projet_id} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem" }}>
                <option value="">Sélectionnez un projet</option>
                {projets.map((p) => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Type de dépense</label>
              <select name="category" value={formData.category} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem" }}>
                <option value="general">Dépense standard</option>
                <option value="mileage">Kilométrage</option>
                <option value="meals">Repas</option>
              </select>
            </div>

            <div>
              <label>Date</label>
              <input type="date" name="expense_date" value={formData.expense_date} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem" }} />
            </div>

            <div>
              <label>Description</label>
              <input type="text" name="description" value={formData.description} onChange={handleInputChange} placeholder="Ex: Dîner client, trajet Montréal..." style={{ width: "100%", padding: "0.5rem" }} />
            </div>

            {formData.category === "mileage" ? (
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label>Distance (km)</label>
                  <input type="number" step="0.1" name="distance" value={formData.distance} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Taux ($/km)</label>
                  <input type="number" step="0.01" name="rate_per_unit" value={formData.rate_per_unit} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem" }} />
                </div>
              </div>
            ) : (
              <div>
                <label>Montant ($) *</label>
                <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem" }} />
              </div>
            )}

            <button type="submit" style={{ padding: "0.75rem", background: "var(--primary-color, #007bff)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
              Enregistrer
            </button>
          </form>
        </div>

        {/* Liste */}
        <div style={{ flex: "2 1 500px" }}>
          {loading ? (
            <p>Chargement...</p>
          ) : expenses.length === 0 ? (
            <p>Aucune dépense enregistrée.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                <thead style={{ background: "#f8f9fa", textAlign: "left" }}>
                  <tr>
                    <th style={{ padding: "1rem" }}>Date</th>
                    <th style={{ padding: "1rem" }}>Projet</th>
                    <th style={{ padding: "1rem" }}>Description</th>
                    <th style={{ padding: "1rem" }}>Type</th>
                    <th style={{ padding: "1rem" }}>Montant</th>
                    <th style={{ padding: "1rem" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => {
                    const projet = projets.find((p) => p.id === exp.projet_id);
                    return (
                      <tr key={exp.id} style={{ borderTop: "1px solid #eee" }}>
                        <td style={{ padding: "1rem" }}>{new Date(exp.expense_date).toLocaleDateString()}</td>
                        <td style={{ padding: "1rem" }}>{projet ? projet.nom : "Inconnu"}</td>
                        <td style={{ padding: "1rem" }}>{exp.description || "-"}</td>
                        <td style={{ padding: "1rem" }}>
                          {exp.category === "mileage" ? `Km (${exp.distance}km)` : exp.category}
                        </td>
                        <td style={{ padding: "1rem", fontWeight: "bold" }}>{parseFloat(exp.amount).toFixed(2)} $</td>
                        <td style={{ padding: "1rem" }}>
                          <button onClick={() => handleDelete(exp.id)} style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}>Supprimer</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
