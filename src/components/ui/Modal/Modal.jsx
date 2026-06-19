import "./modal.css";

export default function Modal({ show, title, children, onClose, className = "" }) {
  if (!show) return null;

  return (
    <div className="ui-modal-backdrop" onClick={onClose}>
      <div className={`ui-modal ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="ui-modal-header">
          <h2>{title}</h2>

          <button className="ui-modal-close" onClick={onClose} type="button">
            X
          </button>
        </div>

        <div className="ui-modal-body">{children}</div>
      </div>
    </div>
  );
}
