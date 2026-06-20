import { useState } from "react";
import api from "../../api/api";
import { useToast } from "../../ToastContext";

export default function MasterAdminCard() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organisation_nom: "",
    user_nom: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/master-admin/organisations", formData);
      showToast("Organisation créée avec succès", "success");
      setFormData({
        organisation_nom: "",
        user_nom: "",
        email: "",
        password: "",
      });
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de la création", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
      <h3 className="text-lg font-semibold mb-2 text-red-800">Master Admin - Créer Client</h3>
      <p className="text-sm text-red-600 mb-3">Provisionner une organisation avec 14 jours d'essai gratuits.</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col text-sm">
          <span className="font-medium text-gray-700 mb-1">Nom de l'organisation</span>
          <input
            type="text"
            name="organisation_nom"
            required
            className="border border-gray-300 rounded p-2"
            value={formData.organisation_nom}
            onChange={handleChange}
          />
        </label>
        
        <label className="flex flex-col text-sm">
          <span className="font-medium text-gray-700 mb-1">Nom de l'administrateur</span>
          <input
            type="text"
            name="user_nom"
            required
            className="border border-gray-300 rounded p-2"
            value={formData.user_nom}
            onChange={handleChange}
          />
        </label>
        
        <label className="flex flex-col text-sm">
          <span className="font-medium text-gray-700 mb-1">Email de l'administrateur</span>
          <input
            type="email"
            name="email"
            required
            className="border border-gray-300 rounded p-2"
            value={formData.email}
            onChange={handleChange}
          />
        </label>
        
        <label className="flex flex-col text-sm">
          <span className="font-medium text-gray-700 mb-1">Mot de passe provisoire</span>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            className="border border-gray-300 rounded p-2"
            value={formData.password}
            onChange={handleChange}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer l'organisation"}
        </button>
      </form>
    </div>
  );
}
