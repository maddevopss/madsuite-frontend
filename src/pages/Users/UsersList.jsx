import { useMemo, useState, memo } from "react";
import { Button, EmptyState } from "../../components/ui";

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .trim();
}

function UsersList({ users = [], isLoading = false, error = null, onPassword, onDelete, onHistory }) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = useMemo(() => {
    const q = normalize(query);
    return (users || [])
      .filter((u) => {
        if (roleFilter !== "all" && u.role !== roleFilter) return false;
        if (!q) return true;
        return normalize(u.nom).includes(q) || normalize(u.email).includes(q) || normalize(u.role).includes(q);
      })
      .sort((a, b) => normalize(a.nom).localeCompare(normalize(b.nom), "fr"));
  }, [users, query, roleFilter]);

  if (isLoading) {
    return (
      <div className="users-empty users-loading">
        <div className="spinner" />
        <p>Chargement des utilisateurs…</p>
      </div>
    );
  }

  if (error) {
    return <EmptyState title="Erreur" message={error} />;
  }

  if (filteredUsers.length === 0) {
    return (
      <EmptyState
        title="Aucun utilisateur"
        message={
          query || roleFilter !== "all"
            ? "Aucun résultat pour ce filtre."
            : "Ajoutez un utilisateur pour lui donner accès à l'organisation."
        }
      />
    );
  }

  return (
    <div className="users-list">
      <div className="users-toolbar">
        <input
          className="users-search"
          placeholder="Rechercher (nom / email / rôle)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select className="users-role-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">Tous les rôles</option>
          <option value="employe">Employé</option>
          <option value="manager">Manager</option>
          <option value="admin">Administrateur</option>
        </select>
      </div>

      <div className="users-head">
        <span>Nom</span>
        <span>Email</span>
        <span>Rôle</span>
        <span>Action</span>
      </div>

      {filteredUsers.map((user) => (
        <div className="users-row" key={user.id}>
          <span>{user.nom || "—"}</span>
          <span>{user.email || "—"}</span>
          <span>{user.role || "—"}</span>

          <div className="user-actions">
            <Button type="button" variant="secondary" onClick={() => onPassword(user.id)}>
              Mot de passe
            </Button>

            <Button type="button" variant="secondary" onClick={() => onHistory(user)}>
              Historique
            </Button>

            <Button type="button" variant="danger" onClick={() => onDelete(user.id, user.nom)}>
              Supprimer
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(UsersList);
