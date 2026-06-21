import { Link } from "react-router-dom";
import { Button } from "../../../components/ui";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { fadeUp } from "../animations";

export default function PricingSection() {
  return (
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
  );
}
