import React from "react";
import "./Textarea.css";

/**
 * Textarea — reusable textarea form component
 */
export default function Textarea({ label, error, className = "", ...props }) {
  return (
    <div className={`textarea-wrapper ${className}`}>
      {label && <label className="textarea-label">{label}</label>}
      <textarea className={`textarea-field ${error ? "textarea-error" : ""}`} {...props} />
      {error && <span className="textarea-error-msg">{error}</span>}
    </div>
  );
}
