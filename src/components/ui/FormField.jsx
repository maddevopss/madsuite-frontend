import React from "react";

/**
 * Wrapper pour regrouper label + input + erreur
 */
const FormField = ({ label, error, children }) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      {children}
      {error && <p className="field-error-text">{error.message}</p>}
    </div>
  );
};

export default FormField;
