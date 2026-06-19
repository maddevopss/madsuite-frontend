// frontend/src/components/HubTabs.jsx
import React from "react";
import "../styles/hub.css";

/**
 * Simple tab navigation for the Smart Work‑Flow Hub.
 * Uses CSS glassmorphism, gradient background and subtle hover animations.
 */
const tabs = [
  { id: "projects", label: "Projets" },
  { id: "tasks", label: "Tâches" },
  { id: "quotes", label: "Devis" },
  { id: "invoices", label: "Factures" },
  { id: "payments", label: "Paiements" },
];

export default function HubTabs({ projects, tasks, quotes, invoices, payments }) {
  const [active, setActive] = React.useState("projects");

  const renderContent = () => {
    switch (active) {
      case "projects":
        return (
          <ul className="hub-list">
            {projects.map((p) => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
        );
      case "tasks":
        return (
          <ul className="hub-list">
            {tasks.map((t) => (
              <li key={t.id}>
                {t.description} – {new Date(t.start_time).toLocaleTimeString()} – {t.status}
              </li>
            ))}
          </ul>
        );
      case "quotes":
        return (
          <ul className="hub-list">
            {quotes.map((q) => (
              <li key={q.id}>${q.amount} – {q.description}</li>
            ))}
          </ul>
        );
      case "invoices":
        return (
          <ul className="hub-list">
            {invoices.map((i) => (
              <li key={i.id}>${i.amount} – {i.status}</li>
            ))}
          </ul>
        );
      case "payments":
        return (
          <ul className="hub-list">
            {payments.map((p) => (
              <li key={p.id}>${p.amount} – {p.provider}</li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  };

  return (
    <div className="hub-tabs-container">
      <div className="hub-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`hub-tab ${active === tab.id ? "active" : ""}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="hub-tab-content">{renderContent()}</div>
    </div>
  );
}
