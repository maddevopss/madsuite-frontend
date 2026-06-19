import { memo } from "react";
import { Button } from "../../components/ui";
import { AiOutlineTeam } from "../../assets/Icon/idx_icon";

function UsersHeader({ isAdmin, onAdd, onRefresh }) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <h1>
          <AiOutlineTeam className="page-icon" />
          Gestion de l'équipe
        </h1>

        <h4 className="page-subtitle">Gérez les utilisateurs et leurs accès.</h4>
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

export default memo(UsersHeader);
