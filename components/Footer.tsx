import React from 'react';
import Image from 'next/image';
import { Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-brand-border/50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">

          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-8 h-8">
                <Image
                  src="/logo.png"
                  alt="Vouch Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-brand-primary">Vouch</span>
            </div>
            <p className="text-sm text-brand-secondary leading-relaxed mb-6 font-medium">
              Decentralized escrow infrastructure for social commerce in Southeast Asia.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-ice/30 border border-brand-ice/50">
              <div className="w-2 h-2 rounded-full bg-brand-action animate-pulse"></div>
              <span className="text-xs font-bold text-brand-primary">Built on Lisk</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-brand-primary mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-brand-muted">
              <li><a href="/#how-it-works" className="hover:text-brand-action">How it Works</a></li>
              <li><a href="/#safety" className="hover:text-brand-action">Safety</a></li>
              <li><a href="/#faq" className="hover:text-brand-action">FAQ</a></li>
              <li><a href="/create" className="hover:text-brand-action">Create Link</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-brand-primary mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-brand-muted">
              <li><a href="#" className="hover:text-brand-action">About Us</a></li>
              <li><a href="#" className="hover:text-brand-action">Careers</a></li>
              <li><a href="#" className="hover:text-brand-action">Blog</a></li>
              <li><a href="#" className="hover:text-brand-action">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-brand-primary mb-4">Connect</h4>
            <div className="flex gap-4 text-brand-secondary">
              <a href="#" className="hover:text-brand-action transition-colors"><Twitter size={20} /></a>
              <a href="#" className="hover:text-brand-action transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-brand-action transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-brand-muted">
            &copy; {new Date().getFullYear()} Vouch. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-brand-muted">
            <a href="#" className="hover:text-brand-primary">Privacy Policy</a>
            <a href="#" className="hover:text-brand-primary">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;