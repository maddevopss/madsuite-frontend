import React from 'react';

const features = [
  {title:'Suivi du temps', description:'Enregistrez facilement vos heures de travail.', icon:'⏱️'},
  {title:'Facturation', description:'Générez des factures professionnelles en un clic.', icon:'💰'},
  {title:'Gestion de projet', description:'Organisez vos projets et tâches.', icon:'📂'},
  {title:'Rapports détaillés', description:'Analysez votre activité avec des dashboards.', icon:'📊'},
];

export default function Features() {
  return (
    <section className="space-y-8" id="features">
      <h2 className="text-3xl font-bold text-center mb-6">Fonctionnalités</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f) => (
          <div key={f.title} className="p-6 bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg rounded-xl shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-700">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
