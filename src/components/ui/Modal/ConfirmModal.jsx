import "./confirmModal.css";
import Button from "../Button/Button";

export default function ConfirmModal({ isOpen, message, onConfirm, onCancel, danger = true }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-message">{message}</p>

        <div className="confirm-actions">
          <Button className="confirm-btn confirm-btn--cancel" onClick={onCancel}>
            Annuler
          </Button>
          <Button className={`confirm-btn ${danger ? "confirm-btn--danger" : "confirm-btn--primary"}`} onClick={onConfirm}>
            Confirmer
          </Button>
        </div>
      </div>
    </div>
  );
}
