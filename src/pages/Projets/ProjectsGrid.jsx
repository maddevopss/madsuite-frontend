import { memo } from "react";
import { Button, EmptyState } from "../../components/ui";

const ProjectCard = memo(function ProjectCard({ project, isAdmin, onView, onEdit, onDelete }) {
  return (
    <div
      className="project-card"
      style={{
        border: `1px solid ${project.couleur || "var(--color-border-primary)"}`,
        borderLeft: `6px solid ${project.couleur || "var(--color-primary)"}`,
      }}
    >
      <div className="project-card-top">
        <div>
          <h3>{project.nom || project.projet || "Projet sans nom"}</h3>
          <p className="project-client">{project.client || project.client_nom || "Client N/A"}</p>
        </div>

        <span className={`project-badge project-badge--${project.status || "actif"}`}>
          {project.status || "actif"}
        </span>
      </div>

      {project.description && <p className="project-description">{project.description}</p>}

      <div className="project-info-grid">
        <div>
          <span>Taux</span>
          <strong>{Number(project.taux_horaire || 0).toFixed(2)}$ / h</strong>
        </div>

        <div>
          <span>Budget ($)</span>
          <strong>{Number(project.budget_amount || project.budget || 0).toFixed(2)}$</strong>
        </div>

        <div>
          <span>Budget (Heures)</span>
          <strong>{Number(project.budget_hours || 0).toFixed(1)} h</strong>
        </div>

        <div>
          <span>Fin</span>
          <strong>{project.date_fin ? new Date(project.date_fin).toLocaleDateString("fr-CA") : "N/A"}</strong>
        </div>
      </div>

      <div className="project-card-actions">
        <Button type="button" size="sm" variant="secondary" onClick={() => onView(project.id)}>
          Voir
        </Button>

        {isAdmin && (
          <Button type="button" size="sm" variant="primary" onClick={() => onEdit(project)}>
            Modifier
          </Button>
        )}

        {isAdmin && (
          <Button type="button" size="sm" variant="danger" onClick={() => onDelete(project.id)}>
            Supprimer
          </Button>
        )}
      </div>
    </div>
  );
});

function ProjectsGrid({ projects = [], isAdmin, onView, onEdit, onDelete }) {
  if (projects.length === 0) {
    return (
      <EmptyState
        title="Aucun projet"
        message="Créez un projet ou modifiez vos filtres pour afficher des résultats."
      />
    );
  }

  return (
    <div className="projects-grid">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          isAdmin={isAdmin}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default memo(ProjectsGrid);
