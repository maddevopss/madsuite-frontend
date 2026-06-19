import { Link, Navigate } from "react-router-dom";
import { Button } from "../../components/ui";
import { useAuth } from "../../api/authContext";
import { motion } from "framer-motion";
import "./landing.css";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Landing() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="logo-container">
          <h2>MADSuite</h2>
        </div>
        <nav className="landing-nav">
          <Link to="/login" className="nav-link">Connexion</Link>
          <Link to="/signup">
            <Button variant="primary">Essai gratuit</Button>
          </Link>
        </nav>
      </header>

      <main className="landing-main">
        {/* HERO SECTION */}
        <section className="hero-section">
          <motion.h1 
            className="hero-title"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            Passez moins de temps à gérer,<br />
            <span className="highlight">plus de temps à facturer.</span>
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            Le logiciel de facturation et de suivi du temps conçu spécifiquement pour les PME, travailleurs autonomes et agences québécoises.
          </motion.p>
          <motion.div 
            className="hero-actions"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <Link to="/signup">
              <Button variant="primary" size="large">Commencer mon essai gratuit (14 jours)</Button>
            </Link>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginLeft: "1rem" }}>Aucune carte requise.</p>
          </motion.div>

          {/* DASHBOARD MOCKUP */}
          <motion.div 
            className="dashboard-mockup"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <img src="/images/dashboard_mockup.png" alt="Aperçu de MADSuite" />
          </motion.div>
        </section>

        {/* FEATURES SECTION */}
        <motion.section 
          className="features-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div className="feature-card" variants={fadeUp}>
            <div className="feature-icon">⏱️</div>
            <h3>Suivi du temps intelligent</h3>
            <p>Démarrez le chronomètre ou ajoutez vos heures manuellement. Ne perdez plus aucune minute facturable avec notre agent de bureau.</p>
          </motion.div>
          <motion.div className="feature-card" variants={fadeUp}>
            <div className="feature-icon">🧾</div>
            <h3>Facturation automatisée</h3>
            <p>Générez des factures professionnelles en un clic à partir de vos heures et dépenses. Recevez vos paiements via Interac ou Stripe.</p>
          </motion.div>
          <motion.div className="feature-card" variants={fadeUp}>
            <div className="feature-icon">📝</div>
            <h3>Soumissions rapides</h3>
            <p>Créez de superbes soumissions PDF, faites-les approuver par vos clients et convertissez-les en factures sans friction.</p>
          </motion.div>
        </motion.section>

        {/* HOW IT WORKS SECTION */}
        <section className="how-it-works">
          <h2 className="section-title">Comment ça marche ?</h2>
          <div className="steps-container">
            <motion.div 
              className="step-card"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            >
              <div className="step-number">01</div>
              <div className="step-content">
                <h3>Enregistrez votre temps</h3>
                <p>Associez vos heures à des projets et des clients spécifiques. Définissez vos taux horaires par défaut ou personnalisez-les par projet.</p>
              </div>
            </motion.div>
            <motion.div 
              className="step-card"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            >
              <div className="step-number">02</div>
              <div className="step-content">
                <h3>Générez votre facture</h3>
                <p>À la fin du mois, sélectionnez les heures non facturées et laissez MADSuite créer un PDF professionnel calculant automatiquement les taxes.</p>
              </div>
            </motion.div>
            <motion.div 
              className="step-card"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            >
              <div className="step-number">03</div>
              <div className="step-content">
                <h3>Soyez payé plus vite</h3>
                <p>Vos clients reçoivent des instructions de paiement claires (Virement Interac ou Carte de crédit). Vous améliorez votre flux de trésorerie.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="testimonials-section">
          <h2 className="section-title">Ils font confiance à MADSuite</h2>
          <div className="testimonials-grid">
            <motion.div className="testimonial-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <p className="testimonial-text">"Avant MADSuite, j'oubliais souvent de facturer des petites modifications de 15-30 minutes. Maintenant, chaque minute est traquée et facturée. Mon chiffre d'affaires a augmenté de 15% dès le premier mois."</p>
              <div className="testimonial-author">
                <div className="author-avatar">J</div>
                <div className="author-info">
                  <h4>Julien Tremblay</h4>
                  <span>Consultant TI & Développeur</span>
                </div>
              </div>
            </motion.div>
            <motion.div className="testimonial-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <p className="testimonial-text">"La génération de factures avec les taxes du Québec calculées automatiquement est un vrai charme. Je sauve environ 3 heures par mois sur mon administration."</p>
              <div className="testimonial-author">
                <div className="author-avatar">S</div>
                <div className="author-info">
                  <h4>Sophie Gagnon</h4>
                  <span>Fondatrice, Agence Web Horizon</span>
                </div>
              </div>
            </motion.div>
            <motion.div className="testimonial-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <p className="testimonial-text">"Le fait de pouvoir mettre mes instructions Interac directement sur mes PDF me fait gagner un temps fou. L'interface est super propre et facile à utiliser."</p>
              <div className="testimonial-author">
                <div className="author-avatar">M</div>
                <div className="author-info">
                  <h4>Marc-Antoine L.</h4>
                  <span>Designer Graphique Indépendant</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="pricing-section">
          <h2 className="section-title">Un tarif simple et transparent</h2>
          <motion.div 
            className="pricing-card"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3>Plan Pro</h3>
            <p className="pricing-desc">Tout ce dont vous avez besoin pour gérer votre PME, sans limites artificielles.</p>
            <div className="price">
              <span className="amount">20$</span>
              <span className="currency">CAD</span>
              <span className="period">/mois</span>
            </div>
            <ul className="pricing-features">
              <li>Utilisateurs illimités</li>
              <li>Clients & Projets illimités</li>
              <li>Suivi du temps & App de Bureau</li>
              <li>Factures & Soumissions illimitées</li>
              <li>Paiements Stripe & Interac</li>
              <li>Support prioritaire</li>
            </ul>
            <Link to="/signup">
              <Button variant="primary" style={{ width: "100%", marginTop: "1rem", padding: "1rem" }}>
                Essayer gratuitement
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* FAQ SECTION */}
        <section className="faq-section">
          <h2 className="section-title">Questions fréquentes</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3>Faut-il une carte de crédit pour l'essai ?</h3>
              <p>Non, vous pouvez créer votre compte et utiliser MADSuite gratuitement pendant 14 jours, sans entrer de carte de crédit.</p>
            </div>
            <div className="faq-item">
              <h3>Est-ce que je peux annuler n'importe quand ?</h3>
              <p>Absolument. Il n'y a aucun engagement à long terme. Si le logiciel ne vous convient plus, vous pouvez annuler votre abonnement d'un simple clic.</p>
            </div>
            <div className="faq-item">
              <h3>Comment fonctionnent les paiements par Interac ?</h3>
              <p>Vous configurez votre adresse courriel dans vos paramètres, et MADSuite l'imprime automatiquement sur les factures PDF que vous générez pour vos clients. MADSuite ne prend aucune commission sur les virements Interac.</p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="cta-section">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2>Prêt à optimiser votre gestion ?</h2>
            <p style={{ color: "#94a3b8", fontSize: "1.2rem", marginBottom: "2rem" }}>
              Rejoignez les PME qui ont choisi MADSuite pour simplifier leur quotidien.
            </p>
            <Link to="/signup">
              <Button variant="primary" size="large">Commencer mon essai gratuit</Button>
            </Link>
          </motion.div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} MADSuite. Développé au Québec. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
