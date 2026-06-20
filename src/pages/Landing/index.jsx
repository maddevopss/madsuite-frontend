import { Link, Navigate } from "react-router-dom";
import { Button } from "../../components/ui";
import { useAuth } from "../../api/authContext";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  PlayCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  FileText,
  CreditCard,
  PieChart,
  FolderOpen
} from "lucide-react";
import "./landing.css";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function Landing() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-wrapper">
      <header className="landing-header">
        <div className="landing-container flex-header">
          <div className="brand-logo">MADSuite</div>
          <nav className="landing-nav">
            <Link to="/login" className="login-link">Connexion</Link>
            <Link to="/signup">
              <Button variant="primary" className="btn-glow">Essayer gratuitement</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero-section">
          <div className="landing-container hero-grid">
            <motion.div 
              className="hero-content"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.h1 className="hero-title" variants={fadeUp}>
                La plateforme de gestion conçue pour les <span>travailleurs autonomes et PME</span> du Québec.
              </motion.h1>
              <motion.p className="hero-subtitle" variants={fadeUp}>
                Gérez vos clients, suivez votre temps, créez vos soumissions et envoyez vos factures conformes TPS/TVQ depuis un seul endroit.
              </motion.p>
              <motion.div className="hero-actions" variants={fadeUp}>
                <Link to="/signup">
                  <Button variant="primary" size="large" className="btn-glow">
                    Essayer gratuitement pendant 14 jours <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
                <button className="btn-outline-play">
                  <PlayCircle size={20} className="mr-2" /> Voir une démonstration
                </button>
              </motion.div>
            </motion.div>
            <motion.div 
              className="hero-visual"
              initial={{ opacity: 0, scale: 0.95, rotate: 1 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="mockup-frame">
                <div className="mockup-header">
                  <div className="dot red"></div>
                  <div className="dot yellow"></div>
                  <div className="dot green"></div>
                </div>
                <div className="mockup-body placeholder-gif">
                  <span>Démonstration (Capture/GIF à intégrer)</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PROBLEMES / SOLUTIONS */}
        <section className="problems-section">
          <div className="landing-container">
            <motion.h2 
              className="section-title text-center"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            >
              Les problèmes que MADSuite règle
            </motion.h2>
            
            <div className="comparison-grid">
              <motion.div className="comparison-card card-before" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <h3 className="text-red-500 flex items-center"><XCircle className="mr-2" /> Vous perdez du temps avec...</h3>
                <ul className="problem-list">
                  <li>Les heures oubliées et non facturées</li>
                  <li>Les factures faites dans Excel</li>
                  <li>Les calculs TPS/TVQ</li>
                  <li>Les suivis clients dispersés</li>
                  <li>Les soumissions qui ne se convertissent jamais en revenus</li>
                  <li>Les paiements qui prennent des semaines à rentrer</li>
                </ul>
              </motion.div>
              
              <div className="comparison-divider">VS</div>

              <motion.div className="comparison-card card-after" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <h3 className="text-green-500 flex items-center"><CheckCircle className="mr-2" /> Avec MADSuite</h3>
                <ul className="solution-list">
                  <li>Toutes vos heures deviennent facturables</li>
                  <li>Vos factures sont générées automatiquement</li>
                  <li>Les taxes sont calculées pour vous</li>
                  <li>Vos clients et projets sont centralisés</li>
                  <li>Les soumissions deviennent des mandats</li>
                  <li>Vos paiements arrivent plus rapidement</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FONCTIONNALITÉS */}
        <section className="features-showcase">
          <div className="landing-container">
            <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="section-title">Les fonctionnalités qui vous font gagner du temps</h2>
              <p className="section-subtitle">Oubliez les allers-retours entre vos outils.</p>
            </motion.div>

            <div className="features-grid-custom">
              {[
                {
                  icon: <FolderOpen size={32} />,
                  title: "Gestion des clients et projets",
                  tagline: "Gardez le contrôle de tous vos mandats",
                  items: [
                    "Centralisez tous vos clients",
                    "Associez des taux horaires différents par projet",
                    "Consultez l'historique complet d'un client",
                    "Archivez les projets terminés sans perdre vos données"
                  ],
                  result: "Moins de recherche. Plus de temps productif."
                },
                {
                  icon: <Clock size={32} />,
                  title: "Suivi du temps intelligent",
                  tagline: "Chaque minute compte",
                  items: [
                    "Chronomètre en temps réel",
                    "Entrée manuelle des heures",
                    "Notifications d'oubli",
                    "Historique détaillé"
                  ],
                  result: "Facturez ce que vous travaillez réellement."
                },
                {
                  icon: <FileText size={32} />,
                  title: "Facturation conforme au Québec",
                  tagline: "Des factures professionnelles en quelques secondes",
                  items: [
                    "Calcul automatique TPS et TVQ",
                    "Logo personnalisé",
                    "Conditions de paiement personnalisables",
                    "Export PDF professionnel",
                    "Numérotation automatique"
                  ],
                  result: "Des factures propres, conformes et sans erreurs."
                },
                {
                  icon: <TrendingUp size={32} />,
                  title: "Soumissions et approbations",
                  tagline: "Transformez vos devis en revenus",
                  items: [
                    "Création rapide de soumissions",
                    "PDF professionnels",
                    "Approbation électronique",
                    "Conversion en projet et facture"
                  ],
                  result: "Moins d'administration, plus de contrats signés."
                },
                {
                  icon: <CreditCard size={32} />,
                  title: "Paiements simplifiés",
                  tagline: "Soyez payé plus rapidement",
                  items: [
                    "Instructions Interac intégrées",
                    "Paiements Stripe",
                    "Suivi du statut des paiements",
                    "Historique complet"
                  ],
                  result: "Une meilleure trésorerie pour votre entreprise."
                },
                {
                  icon: <PieChart size={32} />,
                  title: "Tableau de bord",
                  tagline: "Votre entreprise en un coup d'œil",
                  items: [
                    "Revenus mensuels",
                    "Clients les plus rentables",
                    "Heures facturables",
                    "Projets actifs",
                    "Rapports exportables"
                  ],
                  result: "Prenez de meilleures décisions avec de vraies données."
                }
              ].map((feat, idx) => (
                <motion.div key={idx} className="feature-block-card" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp}>
                  <div className="feat-header">
                    <div className="feat-icon">{feat.icon}</div>
                    <h4>{feat.title}</h4>
                  </div>
                  <p className="feat-tagline">{feat.tagline}</p>
                  <ul className="feat-list">
                    {feat.items.map((item, i) => (
                      <li key={i}><CheckCircle size={14} className="mr-2 text-primary" /> {item}</li>
                    ))}
                  </ul>
                  <div className="feat-result">
                    <strong>Résultat :</strong> {feat.result}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* POURQUOI MADSUITE */}
        <section className="why-us-section">
          <div className="landing-container">
            <h2 className="section-title text-center mb-12">Pourquoi les entreprises québécoises choisissent MADSuite ?</h2>
            <div className="why-grid">
              <motion.div className="why-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="why-icon">🇨🇦</div>
                <h3>Pensé pour le Québec</h3>
                <p>TPS et TVQ intégrées, virements Interac, support en français, et conforme aux pratiques d'affaires locales.</p>
              </motion.div>
              <motion.div className="why-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="why-icon">👥</div>
                <h3>Utilisateurs illimités</h3>
                <p>Ajoutez vos employés et collaborateurs sans frais cachés. Grandissez sans payer plus cher par siège.</p>
              </motion.div>
              <motion.div className="why-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="why-icon">☁️</div>
                <h3>Accessible partout</h3>
                <p>Accédez à vos données depuis votre navigateur ou via notre application de bureau dédiée (Windows / Mac).</p>
              </motion.div>
              <motion.div className="why-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="why-icon">🔒</div>
                <h3>Sécurisé</h3>
                <p>Vos données sont isolées, protégées par cryptage, et sauvegardées automatiquement de façon sécurisée.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* TARIFS */}
        <section className="pricing-section" id="pricing">
          <div className="landing-container">
            <motion.div className="text-center mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="section-title">Une tarification simple et transparente</h2>
              <p className="section-subtitle">Pas de frais cachés. Payez pour ce que vous utilisez.</p>
            </motion.div>
            
            <div className="pricing-grid">
              <motion.div className="pricing-card-modern" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="pricing-header">
                  <h3>Plan Pro</h3>
                  <div className="price">
                    <span className="amount">20$</span>
                    <span className="currency">CAD</span>
                    <span className="period">/mois</span>
                  </div>
                  <p>Tout ce dont vous avez besoin pour gérer votre PME, sans limites artificielles.</p>
                </div>
                <div className="pricing-body">
                  <ul className="pricing-features">
                    <li><CheckCircle size={16} className="text-primary mr-2" /> Utilisateurs illimités</li>
                    <li><CheckCircle size={16} className="text-primary mr-2" /> Clients & Projets illimités</li>
                    <li><CheckCircle size={16} className="text-primary mr-2" /> Suivi du temps & App de Bureau</li>
                    <li><CheckCircle size={16} className="text-primary mr-2" /> Factures & Soumissions illimitées</li>
                    <li><CheckCircle size={16} className="text-primary mr-2" /> Paiements Stripe & Interac</li>
                    <li><CheckCircle size={16} className="text-primary mr-2" /> Support prioritaire québécois</li>
                  </ul>
                  <Link to="/signup">
                    <Button variant="primary" className="btn-glow w-full mt-6">Essayer gratuitement (14 jours)</Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* COMPARATIF */}
        <section className="comparison-table-section">
          <div className="landing-container">
            <h2 className="section-title text-center mb-10">MADSuite vs. Les Autres</h2>
            <div className="table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Fonctionnalité</th>
                    <th className="highlight-col">MADSuite</th>
                    <th>Solutions génériques</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>TPS/TVQ automatiques</td>
                    <td className="highlight-col"><CheckCircle className="icon-success mx-auto" /></td>
                    <td><AlertTriangle className="icon-warning mx-auto" /></td>
                  </tr>
                  <tr>
                    <td>Instructions Interac intégrées</td>
                    <td className="highlight-col"><CheckCircle className="icon-success mx-auto" /></td>
                    <td><XCircle className="icon-error mx-auto" /></td>
                  </tr>
                  <tr>
                    <td>Utilisateurs illimités</td>
                    <td className="highlight-col"><CheckCircle className="icon-success mx-auto" /></td>
                    <td><AlertTriangle className="icon-warning mx-auto" /></td>
                  </tr>
                  <tr>
                    <td>Support québécois</td>
                    <td className="highlight-col"><CheckCircle className="icon-success mx-auto" /></td>
                    <td><XCircle className="icon-error mx-auto" /></td>
                  </tr>
                  <tr>
                    <td>Gestion projets + facturation</td>
                    <td className="highlight-col"><CheckCircle className="icon-success mx-auto" /></td>
                    <td><AlertTriangle className="icon-warning mx-auto" /></td>
                  </tr>
                  <tr>
                    <td>Application de bureau</td>
                    <td className="highlight-col"><CheckCircle className="icon-success mx-auto" /></td>
                    <td><XCircle className="icon-error mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* TEMOIGNAGE */}
        <section className="testimonial-banner">
          <div className="landing-container">
            <motion.div 
              className="quote-box"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="quote-mark">"</div>
              <blockquote>
                Avant MADSuite, je perdais facilement 3 à 4 heures par semaine en administration. 
                Maintenant mes factures partent en quelques minutes et je facture beaucoup moins d'heures oubliées.
              </blockquote>
              <div className="author">— Entrepreneur en services TI, Québec</div>
            </motion.div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="final-cta">
          <div className="landing-container text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="cta-heading">Arrêtez de gérer votre entreprise avec 5 outils différents.</h2>
              <p className="cta-subheading">
                Essayez MADSuite gratuitement pendant 14 jours et découvrez combien de temps vous pouvez récupérer chaque semaine.
              </p>
              <Link to="/signup">
                <Button variant="primary" size="large" className="btn-glow-large">
                  Commencer mon essai gratuit
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container flex justify-between items-center text-sm">
          <p>&copy; {new Date().getFullYear()} MADSuite. Développé au Québec.</p>
          <div className="footer-links">
            <Link to="/login">Connexion</Link>
            <Link to="/signup">Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
