import React, { forwardRef, useId } from "react";
import "./Input.css"; // À créer pour centraliser le look "SaaS"

const Input = forwardRef(({ error, label, ...props }, ref) => {
  const generatedId = useId();
  const inputId = props.id || props.name || generatedId;

  return (
    <div className={`input-wrapper ${error ? "has-error" : ""}`}>
      {label && (
        <label className="input-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input id={inputId} ref={ref} className={`input-field ${error ? "input-error" : ""}`} {...props} />
      {error && <span className="error-message">{error.message}</span>}
    </div>
  );
});

export default Input;
