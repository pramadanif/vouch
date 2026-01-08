
import React from 'react';
import { Reveal } from './Reveal';

const SocialProof = () => {
  // Official brand colors or just generic blue-themed as requested "termask biru"
  // Using a consistent blue/navy theme for all icons to match "MyBCA" professional look
  const iconClass = "h-8 w-auto fill-brand-primary opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300";

  return (
    <section className="py-10 border-b border-brand-border/30 bg-brand-surfaceHighlight/50">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal width="100%">
          <p className="text-center text-sm font-semibold text-brand-secondary/60 uppercase tracking-widest mb-8">
            TRUSTED BY SELLERS ON
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {/* Instagram */}
            <div className="group flex flex-col items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-brand-primary fill-current">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span className="text-xs font-bold text-brand-primary mt-1">Instagram</span>
            </div>

            {/* WhatsApp */}
            <div className="group flex flex-col items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-brand-primary fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span className="text-xs font-bold text-brand-primary mt-1">WhatsApp</span>
            </div>

            {/* Facebook */}
            <div className="group flex flex-col items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-brand-primary fill-current">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692 1.157 0 1.671.046 2.015.086v1.906z" />
              </svg>
              <span className="text-xs font-bold text-brand-primary mt-1">Facebook</span>
            </div>

            {/* TikTok */}
            <div className="group flex flex-col items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-brand-primary fill-current">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.58-1.02v6.12c0 3.41-2.87 6.25-6.51 6.25-3.64 0-6.6-2.96-6.6-6.6 0-3.21 2.61-6.01 5.82-6.23.15-.01.27.02.32 0v3.62c-.2.03-.4.07-.61.12-1.64.44-2.7 2.07-2.4 3.76.33 1.87 2.15 3.12 4.02 2.77 1.87-.35 3.12-2.15 2.77-4.02-.05-.28-.15-.56-.25-.82v-12.97z" />
              </svg>
              <span className="text-xs font-bold text-brand-primary mt-1">TikTok</span>
            </div>


          </div>
          <div className="mt-12 flex flex-col items-center gap-3">
            <span className="text-[10px] font-bold text-brand-secondary/40 uppercase tracking-widest">BUILT WITH</span>
            <img src="/lisk.png" alt="Lisk" className="h-8 w-auto opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default SocialProof;