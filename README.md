# MADSuite — batch tests coverage 60%

Copie le dossier `src/__tests__` de ce ZIP dans `frontend/src/__tests__`, puis lance:

```bash
cd frontend
npm run test:coverage
```

Ce batch cible surtout les fichiers à 0% ou très bas:
- pages/Dashboard/*
- pages/Invoices/*
- pages/Login/index.jsx
- routes/ProtectedRoute.jsx
- components/PageHeader, Layout, StatCard, ConfirmModal
- hooks/useBillingDashboard.js
- hooks/useRecentActivity.js
- components/activity-intelligence/*
- formulaires Clients/Projets

Objectif: faire passer le coverage global de ~50% vers au moins 60% avec des tests simples et stables.
