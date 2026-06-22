import React, { Suspense, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "../../api/authContext";
import { env } from "../../env";

import Layout from "../../components/Layout";
import ProtectedRoute from "../../routes/ProtectedRoute";
import ComingSoon from "../../components/soon";
import ModuleGate from "../../components/ModuleGate";

const Landing = React.lazy(() => import("../Landing"));
const Signup = React.lazy(() => import("../Signup"));
const Login = React.lazy(() => import("../Login"));
const Dashboard = React.lazy(() => import("../Dashboard/index.jsx"));
const Users = React.lazy(() => import("../Users/index.jsx"));
const Reports = React.lazy(() => import("../Reports/index.jsx"));
const Timesheet = React.lazy(() => import("../Timesheet/index.jsx"));
const Clients = React.lazy(() => import("../Clients/index.jsx"));
const Projets = React.lazy(() => import("../Projets/index.jsx"));
const Settings = React.lazy(() => import("../Settings/index.jsx"));
const Innovation = React.lazy(() => import("../Innovation/Innovation"));
const Invoices = React.lazy(() => import("../Invoices/index.jsx"));
const Estimates = React.lazy(() => import("../Estimates/index.jsx"));
const BillingAssistant = React.lazy(() => import("../BillingAssistant/index.jsx"));
const Expenses = React.lazy(() => import("../Expenses/index.jsx"));
const Portal = React.lazy(() => import("../Portal/index.jsx"));
const Onboarding = React.lazy(() => import("../Onboarding/index.jsx"));
const MobilePunch = React.lazy(() => import("../MobilePunch/index.jsx"));
const CalculKm = React.lazy(() => import("../CalculKm/index.jsx"));
const Kiosk = React.lazy(() => import("../Kiosk/index.jsx"));
const KioskKm = React.lazy(() => import("../KioskKm/index.jsx"));
const ModulesAndSubscription = React.lazy(() => import("../ModulesAndSubscription/index.jsx"));

export default function App() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!window.agentAPI?.onAppClose) return;

    const cleanup = window.agentAPI.onAppClose(() => {});

    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  }, []);

  return (
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/portal/:token" element={<Portal />} />
          <Route path="/kiosk/:kioskToken" element={<Kiosk />} />
          <Route path="/kiosk_km/:kioskToken" element={<KioskKm />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/mobilepunch" element={<MobilePunch />} />
            <Route path="/calculkm" element={<CalculKm />} />
            
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/reports" element={<ModuleGate module="reports"><Reports /></ModuleGate>} />
              <Route path="/invoices" element={<ModuleGate module="invoices"><Invoices /></ModuleGate>} />
              <Route path="/estimates" element={<ModuleGate module="estimates"><Estimates /></ModuleGate>} />
              <Route path="/timesheet" element={<Timesheet />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/projets" element={<Projets />} />
              <Route path="/settings" element={<Settings />} />
              <Route
                path="/innovation"
                element={isAdmin ? <Innovation /> : <Navigate to="/dashboard" replace />}
              />

              <Route
                path="/billing-assistant"
                element={<ModuleGate module="billing_assistant"><BillingAssistant /></ModuleGate>}
              />

              <Route
                path="/expenses"
                element={<Expenses />}
              />
              
              <Route 
                path="/modules-and-subscription" 
                element={<ModulesAndSubscription />} 
              />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
  );
}
