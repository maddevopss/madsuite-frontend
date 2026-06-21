import { motion } from "framer-motion";

export default function TestimonialBanner() {
  return (
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
  );
}
