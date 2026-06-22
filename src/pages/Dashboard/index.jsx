import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/dashboard.css";
import { Loader, Card } from "../../components/ui";

import { useBillingDashboard } from "../../hooks/useBillingDashboard";
import { useEstimates } from "../../hooks/useEstimates";
import { formatMoney } from "../../utils/formatters";
import SampleDataGenerator from "../../components/onboarding/SampleDataGenerator";

export default function Dashboard() {
  const {
    loading: billingLoading,
    total_paid_this_month,
    unbilled_hours,
    invoiceStatus,
    refresh: refreshBilling
  } = useBillingDashboard();

  const {
    estimates,
    loading: estimatesLoading,
    loadEstimates
  } = useEstimates();

  useEffect(() => {
    loadEstimates({ status: 'draft' });
  }, [loadEstimates]);

  const handleGenerate = () => {
    refreshBilling();
    loadEstimates({ status: 'draft' });
    window.location.reload(); // Quickest way to ensure all parts catch the new data.
  };

  const isLoading = billingLoading || estimatesLoading;

  if (isLoading) {
    return <Loader label="Chargement du tableau de bord..." variant="dashboard" />;
  }

  const unpaidInvoicesCount = Number(invoiceStatus?.sent?.count || 0) + Number(invoiceStatus?.overdue?.count || 0);
  const pendingEstimatesCount = estimates.filter(e => e.status === 'draft' || e.status === 'sent').length;

  return (
    <div className="dashboard-page" style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Tableau de bord</h1>
          <p style={{ color: '#64748b', marginTop: '5px' }}>L'essentiel de vos revenus en un coup d'œil.</p>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '20px',
        marginBottom: '40px' 
      }}>
        {/* Metric 1: Revenue this month */}
        <Card style={{ padding: '24px', background: '#fff', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Revenus (Ce mois)</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', margin: '10px 0' }}>{formatMoney(total_paid_this_month)}</p>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Montant total payé</p>
        </Card>

        {/* Metric 2: Unpaid invoices */}
        <Card style={{ padding: '24px', background: '#fff', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Factures en attente</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', margin: '10px 0' }}>{unpaidInvoicesCount}</p>
          <div style={{ marginTop: '10px' }}>
            <Link to="/invoices" style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>Voir les factures &rarr;</Link>
          </div>
        </Card>

        {/* Metric 3: Pending estimates */}
        <Card style={{ padding: '24px', background: '#fff', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Devis en attente</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', margin: '10px 0' }}>{pendingEstimatesCount}</p>
          <div style={{ marginTop: '10px' }}>
            <Link to="/estimates" style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>Voir les devis &rarr;</Link>
          </div>
        </Card>

        {/* Metric 4: Hours billable */}
        <Card style={{ padding: '24px', background: '#fff', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Heures Facturables</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#6366f1', margin: '10px 0' }}>{unbilled_hours.toFixed(1)}h</p>
          <div style={{ marginTop: '10px' }}>
            <Link to="/invoices" state={{ openCreateInvoice: true }} style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>Facturer le temps &rarr;</Link>
          </div>
        </Card>
      </div>

      <SampleDataGenerator onGenerate={handleGenerate} />
    </div>
  );
}
