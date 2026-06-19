import "./select.css";

export default function Select({ children, className = "", ...props }) {
  return (
    <select className={`ui-select ${className}`} {...props}>
      {children}
    </select>
  );
}
