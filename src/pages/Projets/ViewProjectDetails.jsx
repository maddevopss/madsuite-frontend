import { memo, useState } from "react";
import { Button } from "../../components/ui";
import { getProjectAiSummary } from "../../api/projets.api";
import { toast } from "react-toastify";

function ViewProjectDetails({ project, onClose }) {
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleGenerateAiSummary = async () => {
    setLoadingAi(true);
    try {
      const result = await getProjectAiSummary(project.id);
      if (result.success) {
        setAiSummary(result.data.summary);
      }
    } catch (err) {
      toast.error(err.response?.data?.errors?.message || "Erreur de génération du résumé IA");
    } finally {
      setLoadingAi(false);
    }
  };
  if (!project) return null;

  return (
    <>
      <div className="project-detail-header">
        <div
          className="project-detail-color"
          style={{
            background: project.couleur || "var(--color-primary)",
          }}
        />

        <div>
          <h3>{project.nom || project.projet || "Projet sans nom"}</h3>
          <p>{project.client || project.client_nom || "Client N/A"}</p>
        </div>
      </div>

      <div className="project-detail-grid">
        <div>
          <span>Statut</span>
          <strong>{project.status || "actif"}</strong>
        </div>

        <div>
          <span>Taux horaire</span>
          <strong>{Number(project.taux_horaire || 0).toFixed(2)}$ / h</strong>
        </div>

        <div>
          <span>Budget</span>
          <strong>{Number(project.budget || 0).toFixed(2)}$</strong>
        </div>

        <div>
          <span>Date de fin</span>
          <strong>{project.date_fin ? new Date(project.date_fin).toLocaleDateString("fr-CA") : "N/A"}</strong>
        </div>

        <div>
          <span>Couleur</span>
          <strong>{project.couleur || "N/A"}</strong>
        </div>

        <div>
          <span>Créé le</span>
          <strong>{project.created_at ? new Date(project.created_at).toLocaleDateString("fr-CA") : "N/A"}</strong>
        </div>
      </div>

      <div className="project-detail-description">
        <span>Description</span>
        <p>{project.description || "Aucune description."}</p>
      </div>

      <div className="project-detail-ai" style={{ marginTop: '1.5rem', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>✨ Intelligence Artificielle</span>
          <Button type="button" variant="secondary" size="small" onClick={handleGenerateAiSummary} disabled={loadingAi}>
            {loadingAi ? "Analyse..." : "Générer un résumé IA"}
          </Button>
        </div>
        {aiSummary ? (
          <p style={{ fontStyle: 'italic', fontSize: '0.9rem', lineHeight: '1.4' }}>{aiSummary}</p>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Obtenez un résumé intelligent de l'avancement et de la santé de ce projet basé sur le temps enregistré.</p>
        )}
      </div>

      <div className="modal-actions">
        <Button type="button" variant="secondary" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </>
  );
}

export default memo(ViewProjectDetails);
