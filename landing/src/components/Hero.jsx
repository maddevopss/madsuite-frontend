import React from 'react';
import heroImg from '../../public/assets/hero_banner_1781885478377.png'; // Placeholder, replace with actual path

export default function Hero() {
  return (
    <section className="text-center py-20" id="hero">
      <div className="relative">
        <img src={heroImg} alt="MADSuite dashboard" className="w-full max-h-96 object-cover rounded-lg shadow-lg" />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-30">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Boostez votre productivité avec MADSuite
          </h1>
          <a
            href="https://madsuite.ca/contact"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition"
          >
            Demander une démo
          </a>
        </div>
      </div>
    </section>
  );
}
