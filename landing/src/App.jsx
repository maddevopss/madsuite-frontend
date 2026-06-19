import React from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Features from './components/Features.jsx';
import PricingTeaser from './components/PricingTeaser.jsx';
import Testimonials from './components/Testimonials.jsx';
import FAQ from './components/FAQ.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <div className="font-inter min-h-screen bg-gradient-to-b from-gray-100 to-white text-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-16">
        <Hero />
        <Features />
        <PricingTeaser />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
