'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import Button from './Button';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-white/90 backdrop-blur-md border-slate-200 py-3' : 'bg-transparent border-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="bg-brand-primary text-white p-1.5 rounded-lg">
            <ShieldCheck size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-brand-primary">Vouch</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-medium text-brand-secondary hover:text-brand-primary transition-colors">How It Works</a>
          <a href="#safety" className="text-sm font-medium text-brand-secondary hover:text-brand-primary transition-colors">Safety</a>
        </nav>

        {/* Auth & CTA */}
        <div className="flex items-center gap-4">
          <button className="hidden sm:block text-sm font-semibold text-brand-primary hover:text-brand-action transition-colors">
            Login
          </button>
          <Button variant="primary" size="sm">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;