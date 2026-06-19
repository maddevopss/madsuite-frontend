import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../api/authContext";
import { useTimer } from "../../TimerContext";
import LoginForm from "./LoginForm";
import "./login.css";

/**
 * Page de Connexion - MADSuite
 * Orchestre le LoginForm et la redirection post-authentification.
 */
const LoginPage = () => {
  const { onLogin } = useAuth();
  const { reloadTimerData } = useTimer();
  const navigate = useNavigate();
  const location = useLocation();
  const [notice, setNotice] = useState("");

  // Récupère la page d'origine si elle existe (ex: redirection depuis une route protégée)
  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    const storedNotice = sessionStorage.getItem("auth_notice");

    if (!storedNotice) return;

    setNotice(storedNotice);
    sessionStorage.removeItem("auth_notice");
  }, []);

  /**
   * Gère le succès de la connexion
   * @param {Object} session - Contient { token, user }
   */
  const handleLoginSuccess = useCallback(
    (session) => {
      // 1. Mise à jour de l'état global (Context + TokenStore)
      onLogin(session);

      if (typeof reloadTimerData === "function") {
        reloadTimerData();
      }

      // 2. Redirection vers la page d'origine (deep linking) ou la racine
      // On utilise "replace" pour éviter que l'utilisateur ne revienne au login via le bouton "Précédent"
      navigate(from, { replace: true });
    },
    [onLogin, navigate, from, reloadTimerData],
  );

  return (
    <main className="login-page-container">
      <section className="login-card">
        {notice ? (
          <div className="error-message global-error" style={{ marginBottom: "1rem", textAlign: "center" }}>
            {notice}
          </div>
        ) : null}

        <div className="login-header">
          <h1>MADSuite</h1>
          <p>Connectez-vous pour suivre votre temps</p>
        </div>

        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </section>
    </main>
  );
};

export default LoginPage;
