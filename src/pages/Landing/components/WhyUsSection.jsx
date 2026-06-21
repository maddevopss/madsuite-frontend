import { motion } from "framer-motion";
import { fadeUp } from "../animations";

export default function WhyUsSection() {
  return (
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
  );
}
