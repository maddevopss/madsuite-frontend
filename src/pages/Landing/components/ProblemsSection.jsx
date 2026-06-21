import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { fadeUp } from "../animations";

export default function ProblemsSection() {
  return (
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
  );
}
