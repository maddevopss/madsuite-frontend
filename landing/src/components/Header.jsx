import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="flex justify-between items-center py-4 border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <img src="/assets/logo.png" alt="MADSuite" className="h-8 w-8" />
        <span className="text-xl font-semibold">MADSuite</span>
      </div>
      <nav className="space-x-4">
        <Link to="#features" className="text-gray-700 hover:text-gray-900">Fonctionnalités</Link>
        <Link to="#pricing" className="text-gray-700 hover:text-gray-900">Tarifs</Link>
        <Link to="#contact" className="text-gray-700 hover:text-gray-900">Contact</Link>
      </nav>
    </header>
  );
}
