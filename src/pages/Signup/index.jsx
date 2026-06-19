import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input } from "../../components/ui";
import { useAuth } from "../../api/authContext";
import authService from "../../api/authService";
import { useToast } from "../../ToastContext";
import "./signup.css";

export default function Signup() {
  const [formData, setFormData] = useState({
    organisation_nom: "",
    user_nom: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { onLogin } = useAuth();
  const { showToast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const session = await authService.signup(
        formData.organisation_nom,
        formData.user_nom,
        formData.email,
        formData.password
      );
      
      onLogin(session);
      navigate("/onboarding");
      showToast("Bienvenue sur MADSuite ! Complétez votre profil.", "success");
    } catch (err) {
      showToast(err.message || "Erreur lors de l'inscription.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <h2>Créer votre compte</h2>
          <p>Démarrez votre essai gratuit dès aujourd'hui.</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <Input
              label="Nom de l'entreprise"
              name="organisation_nom"
              value={formData.organisation_nom}
              onChange={handleChange}
              required
              placeholder="Ex: Ma Super PME"
            />
          </div>

          <div className="form-group">
            <Input
              label="Votre nom complet"
              name="user_nom"
              value={formData.user_nom}
              onChange={handleChange}
              required
              placeholder="Ex: Jean Dupont"
            />
          </div>

          <div className="form-group">
            <Input
              label="Adresse courriel"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="jean@pme.com"
            />
          </div>

          <div className="form-group">
            <Input
              label="Mot de passe"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Minimum 8 caractères"
            />
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            size="large" 
            style={{ width: "100%", marginTop: "1rem" }}
            disabled={loading}
          >
            {loading ? "Création en cours..." : "Commencer mon essai"}
          </Button>
        </form>

        <div className="signup-footer">
          Vous avez déjà un compte ? <Link to="/login">Connectez-vous</Link>
        </div>
      </div>
    </div>
  );
}
