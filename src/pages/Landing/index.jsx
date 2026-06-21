import { Link, Navigate } from "react-router-dom";
import { Button } from "../../components/ui";
import { useAuth } from "../../api/authContext";

import HeroSection from "./components/HeroSection";
import ProblemsSection from "./components/ProblemsSection";
import FeaturesShowcase from "./components/FeaturesShowcase";
import WhyUsSection from "./components/WhyUsSection";
import PricingSection from "./components/PricingSection";
import ComparisonTable from "./components/ComparisonTable";
import TestimonialBanner from "./components/TestimonialBanner";
import FinalCta from "./components/FinalCta";

import "./landing.css";

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
        <HeroSection />
        <ProblemsSection />
        <FeaturesShowcase />
        <WhyUsSection />
        <PricingSection />
        <ComparisonTable />
        <TestimonialBanner />
        <FinalCta />
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
