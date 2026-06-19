import "./card.css";

export default function Card({ children, title, className = "" }) {
  return (
    <div className={`ui-card ${className}`}>
      {title && <div className="ui-card-title">{title}</div>}
      {children}
    </div>
  );
}
