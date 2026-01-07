'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-brand-border/50 shadow-soft py-3' : 'bg-transparent border-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="Vouch Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-brand-primary">Vouch</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-medium text-brand-secondary hover:text-brand-primary transition-colors hover:bg-brand-ice/30 px-3 py-2 rounded-lg">How It Works</a>
          <a href="#safety" className="text-sm font-medium text-brand-secondary hover:text-brand-primary transition-colors hover:bg-brand-ice/30 px-3 py-2 rounded-lg">Safety</a>
        </nav>

        {/* Auth & CTA */}
        <div className="flex items-center gap-4">
          <Link href="/create">
            <Button variant="primary" size="sm" className="shadow-lg shadow-brand-action/20 hover:shadow-brand-action/40 transition-shadow">
              Create Link
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;