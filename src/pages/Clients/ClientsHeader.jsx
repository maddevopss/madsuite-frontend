import { memo } from "react";
import { Button } from "../../components/ui";

import { AiOutlineContacts, AiOutlineUserAdd } from "../../assets/Icon/idx_icon";

function ClientsHeader({ isAdmin, onAdd }) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <div>
          <h1>
            <AiOutlineContacts className="page-icon" />
            Gestion des clients
          </h1>

          <h4 className="page-subtitle">Gérez vos clients et leurs informations.</h4>
        </div>
      </div>

      <div className="page-header-actions">
        {isAdmin && (
          <Button type="button" variant="primary" onClick={onAdd}>
            <AiOutlineUserAdd className="page-icon" />
            Ajouter
          </Button>
        )}

        <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
          Rafraîchir
        </Button>
      </div>
    </div>
  );
}

export default memo(ClientsHeader);
