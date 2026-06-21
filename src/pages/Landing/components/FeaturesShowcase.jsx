import { motion } from "framer-motion";
import { CheckCircle, FolderOpen, Clock, FileText, TrendingUp, CreditCard, PieChart } from "lucide-react";
import { fadeUp } from "../animations";

export default function FeaturesShowcase() {
  const features = [
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
  ];

  return (
    <section className="features-showcase">
      <div className="landing-container">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="section-title">Les fonctionnalités qui vous font gagner du temps</h2>
          <p className="section-subtitle">Oubliez les allers-retours entre vos outils.</p>
        </motion.div>

        <div className="features-grid-custom">
          {features.map((feat, idx) => (
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
  );
}
