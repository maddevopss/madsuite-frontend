import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import api from '../api/api';
import { useAuth } from '../api/authContext';

const ModulesContext = createContext(null);

/**
 * Provider qui charge les modules activés pour l'organisation courante.
 * À placer dans l'arbre React, sous AuthProvider.
 */
export function ModulesProvider({ children }) {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const [modules, setModules] = useState([]);
  const [planType, setPlanType] = useState('free');
  const [loading, setLoading] = useState(true);

  const fetchModules = useCallback(async () => {
    if (!isAuthenticated) {
      setModules([]);
      setPlanType('free');
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/organisation/modules');
      setModules(res.data.data.modules || []);
      setPlanType(res.data.data.plan_type || 'free');
    } catch (err) {
      // Silently fail — user might not be logged in
      console.warn('Could not load modules:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchModules();
    }
  }, [fetchModules, isAuthLoading]);

  /**
   * Vérifie si un module est actif pour l'organisation courante.
   * @param {string} key - Ex: "invoices", "calcul_km"
   * @returns {boolean}
   */
  const hasModule = useCallback(
    (key) => {
      const mod = modules.find((m) => m.key === key);
      return mod?.is_active ?? false;
    },
    [modules]
  );

  /**
   * Active un module (admin only).
   */
  const activateModule = useCallback(async (key) => {
    await api.post(`/organisation/modules/${key}`);
    await fetchModules();
  }, [fetchModules]);

  /**
   * Désactive un module (admin only).
   */
  const deactivateModule = useCallback(async (key) => {
    await api.delete(`/organisation/modules/${key}`);
    await fetchModules();
  }, [fetchModules]);

  return (
    <ModulesContext.Provider value={{ modules, planType, loading, hasModule, activateModule, deactivateModule, refetch: fetchModules }}>
      {children}
    </ModulesContext.Provider>
  );
}

/**
 * Hook pour accéder aux modules dans n'importe quel composant.
 */
export function useModules() {
  const context = useContext(ModulesContext);
  if (!context) {
    // Graceful fallback si le provider n'est pas monté (ex: pages publiques)
    return { modules: [], planType: 'free', loading: false, hasModule: () => true, activateModule: () => {}, deactivateModule: () => {}, refetch: () => {} };
  }
  return context;
}
