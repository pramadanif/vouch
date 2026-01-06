import React from 'react';
import { ShieldCheck, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-brand-primary text-white p-1 rounded-md">
                <ShieldCheck size={20} />
              </div>
              <span className="text-xl font-bold text-brand-primary">Vouch</span>
            </div>
            <p className="text-sm text-brand-muted leading-relaxed">
              Making social commerce safe, simple, and trustworthy for everyone in Southeast Asia.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-brand-primary mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-brand-muted">
              <li><a href="#" className="hover:text-brand-action">How it Works</a></li>
              <li><a href="#" className="hover:text-brand-action">Pricing</a></li>
              <li><a href="#" className="hover:text-brand-action">Safety</a></li>
              <li><a href="#" className="hover:text-brand-action">Dispute Resolution</a></li>
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
            &copy; {new Date().getFullYear()} Vouch Inc. All rights reserved.
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