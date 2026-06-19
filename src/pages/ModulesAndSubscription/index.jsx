import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useToast } from '../../ToastContext';
import { useAuth } from '../../api/authContext';
import { loadStripe } from '@stripe/stripe-js';

export default function ModulesAndSubscription() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    const fetchModules = async () => {
      setLoading(true);
      try {
        const response = await api.get('/organisation/modules');
        const modulesData = response.data?.data?.modules || [];
        setModules(modulesData);
      } catch (err) {
        showToast('Erreur lors du chargement des modules', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, [isAdmin, navigate, showToast]);

  const toggleModule = async (moduleKey, currentlyActive) => {
    try {
      if (currentlyActive) {
        await api.delete(`/organisation/modules/${moduleKey}`);
      } else {
        await api.post(`/organisation/modules/${moduleKey}`);
      }
      const refreshed = await api.get('/organisation/modules');
      setModules(refreshed.data);
      showToast(`Module ${moduleKey} ${currentlyActive ? 'désactivé' : 'activé'} avec succès`, 'success');
    } catch (err) {
      showToast('Erreur lors de la mise à jour du module', 'error');
    }
  };



  const handleCheckout = async (moduleKey) => {
    try {
      // Request a checkout session from the backend
      const response = await api.post(`/organisation/modules/${moduleKey}/checkout`);
      const checkoutSessionId = response.data?.data?.checkoutSessionId || response.data?.checkoutSessionId;
      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
      const { error } = await stripe.redirectToCheckout({ sessionId: checkoutSessionId });
      if (error) {
        showToast(error.message, 'error');
      }
    } catch (err) {
      showToast('Erreur lors du démarrage du paiement', 'error');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Modules &amp; Abonnement</h2>
      {loading && <p>Chargement...</p>}
      <ul className="space-y-4">
        {modules.map((mod) => (
          <li key={mod.key} className="flex items-center justify-between p-4 border rounded-md">
            <div>
              <h3 className="text-lg font-semibold capitalize">{mod.key.replace('_', ' ')}</h3>
              {mod.price && <p className="text-sm text-gray-600">Prix : {mod.price} $/mois</p>}
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={mod.is_active}
                  onChange={() => toggleModule(mod.key, mod.is_active)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2">Activé</span>
              </label>
              {!mod.is_active && mod.price && (
                <button
                  type="button"
                  onClick={() => handleCheckout(mod.key)}
                  className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                >
                  Acheter
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Link to="/settings" className="text-blue-600 hover:underline">← Retour aux paramètres</Link>
      </div>
    </div>
  );
}
