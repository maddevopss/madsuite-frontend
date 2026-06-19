import { memo } from "react";
import { Button } from "../../components/ui";
import { AiOutlineFundProjectionScreen } from "../../assets/Icon/idx_icon";

function ProjectsHeader({ isAdmin, onAdd, onRefresh }) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <div>
          <h1>
            <AiOutlineFundProjectionScreen className="page-icon" />
            Gestion des projets
          </h1>

          <h4 className="page-subtitle">Gérez vos projets et leurs informations.</h4>
        </div>
      </div>

      <div className="page-header-actions">
        {isAdmin && (
          <Button type="button" variant="primary" onClick={onAdd}>
            + Ajouter
          </Button>
        )}

        <Button type="button" variant="secondary" onClick={onRefresh}>
          Rafraîchir
        </Button>
      </div>
    </div>
  );
}

export default memo(ProjectsHeader);
