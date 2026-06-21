import { Link } from "react-router-dom";
import { Button } from "../../../components/ui";
import { motion } from "framer-motion";
import { fadeUp } from "../animations";

export default function FinalCta() {
  return (
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
  );
}
