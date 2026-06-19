import React from "react";
import { useModules } from "../hooks/useModules";
import { useAuth } from "../api/authContext";

/**
 * Composant qui gate l'accès à un module.
 * 
 * Si le module est actif → affiche les children.
 * Si le module est inactif → affiche un paywall (upsell).
 * 
 * Usage:
 *   <ModuleGate module="calcul_km">
 *     <CalculKm />
 *   </ModuleGate>
 */
export default function ModuleGate({ module: moduleKey, children }) {
  const { hasModule, modules, loading } = useModules();
  const { user } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
        <p style={{ color: "#6b7280" }}>Chargement...</p>
      </div>
    );
  }

  if (hasModule(moduleKey)) {
    return children;
  }

  // Trouver les infos du module pour l'affichage
  const mod = modules.find((m) => m.key === moduleKey);
  const label = mod?.label || moduleKey;
  const price = mod?.price || 0;
  const isAdmin = user?.role === "admin";

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "60vh",
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        padding: "40px",
        maxWidth: "450px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🔒</div>
        <h2 style={{ marginBottom: "10px", color: "#111827" }}>{label}</h2>
        <p style={{ color: "#6b7280", marginBottom: "20px", lineHeight: 1.5 }}>
          Ce module n'est pas activé pour votre organisation.
        </p>

        {price > 0 && (
          <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#4f46e5", marginBottom: "20px" }}>
            {price}$ <span style={{ fontSize: "1rem", fontWeight: "normal", color: "#6b7280" }}>/ mois</span>
          </p>
        )}

        {isAdmin ? (
          <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
            Allez dans <strong>Paramètres → Modules</strong> pour activer cette fonctionnalité.
          </p>
        ) : (
          <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
            Contactez votre administrateur pour activer cette fonctionnalité.
          </p>
        )}
      </div>
    </div>
  );
}
