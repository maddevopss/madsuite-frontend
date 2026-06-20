// frontend/src/pages/Hub.jsx
import React, { useEffect, useState } from "react";
import HubTabs from "../components/HubTabs";
import TimerWidget from "../components/TimerWidget";
import useHubSocket from "../hooks/useHubSocket";
import "../styles/hub.css";

const Hub = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);

  const socket = useHubSocket({
    onTaskStarted: (task) => setTasks((prev) => [...prev, task]),
    onTaskStopped: (task) => setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t))),
    onQuoteCreated: (quote) => setQuotes((prev) => [...prev, quote]),
    onInvoiceCreated: (inv) => setInvoices((prev) => [...prev, inv]),
    onPaymentRecorded: (pay) => setPayments((prev) => [...prev, pay]),
  });

  useEffect(() => {
    // Load initial data
    fetch(`${import.meta.env.VITE_API_URL}/hub/projects`)
      .then((r) => r.json())
      .then(setProjects);
    // TODO: fetch other collections similarly
  }, []);

  return (
    <div className="hub-container">
      <h1 className="hub-title">Smart Work‑Flow Hub</h1>
      <TimerWidget />
      <HubTabs
        projects={projects}
        tasks={tasks}
        quotes={quotes}
        invoices={invoices}
        payments={payments}
      />
    </div>
  );
};

export default Hub;
