import { Link } from "react-router-dom";
import { Button } from "../../../components/ui";
import { motion } from "framer-motion";
import { PlayCircle, ArrowRight } from "lucide-react";
import { fadeUp, staggerContainer } from "../animations";

export default function HeroSection() {
  return (
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
  );
}
