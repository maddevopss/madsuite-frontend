import React, { forwardRef, useId } from "react";
import "./Input.css";

const Select = forwardRef(({ error, label, options = [], placeholder, ...props }, ref) => {
  const generatedId = useId();
  const selectId = props.id || props.name || generatedId;

  return (
    <div className={`input-wrapper ${error ? "has-error" : ""}`}>
      {label && (
        <label className="input-label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <div className="select-container">
        <select id={selectId} ref={ref} className={`input-field select-field ${error ? "input-error" : ""}`} {...props}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && <span className="error-message">{error.message}</span>}
    </div>
  );
});

export default Select;
