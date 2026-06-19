import { Button, Input } from "../../components/ui";
import { useState } from "react";

export default function PasswordForm({ onSubmit, onCancel }) {
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const value = newPassword.trim();
    if (!value) return;

    const success = await onSubmit(value);

    if (success !== false) {
      setNewPassword("");
    }
  };

  return (
    <form className="users-form" onSubmit={handleSubmit}>
      <Input
        type="password"
        placeholder="Nouveau mot de passe"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />

      <div className="modal-actions">
        <Button type="submit" variant="primary">
          Sauvegarder
        </Button>

        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
