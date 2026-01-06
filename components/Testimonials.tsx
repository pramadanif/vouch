import React from 'react';

const TestimonialCard = ({ name, role, text, avatar }: { name: string, role: string, text: string, avatar: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-soft border border-brand-surface h-full flex flex-col">
    <div className="flex items-center gap-4 mb-4">
      <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-brand-cream" />
      <div>
        <h4 className="font-bold text-brand-primary">{name}</h4>
        <p className="text-xs text-brand-secondary uppercase tracking-wide">{role}</p>
      </div>
    </div>
    <div className="flex-1">
        <div className="bg-brand-surface/50 p-4 rounded-xl rounded-tl-none relative">
            <p className="text-brand-secondary text-[15px] italic">"{text}"</p>
        </div>
    </div>
  </div>
);

const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-brand-surface relative overflow-hidden">
       {/* Decor */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cream/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
       
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-primary mb-6">
            Trusted by the <br/><span className="italic font-serif">Community</span>
          </h2>
          <p className="text-brand-secondary text-lg">
            From vintage sneaker collectors to digital artists, see why sellers are switching to Vouch.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard 
                name="Sarah K."
                role="Thrift Store Owner"
                avatar="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100"
                text="I used to lose 3-4 sales a week because people were scared to transfer first. With Vouch, they pay immediately. It's a no-brainer."
            />
             <TestimonialCard 
                name="Budi S."
                role="Sneaker Collector"
                avatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100"
                text="Bought a pair of Jordans for 5jt. Seller was anon on Twitter. Used Vouch, felt 100% safe. The shoes arrived, I clicked release. Easy."
            />
             <TestimonialCard 
                name="Jessica L."
                role="Digital Illustrator"
                avatar="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100"
                text="For commissions, Vouch is perfect. The client deposits the money, I do the work, and I know I'm guaranteed to get paid when I deliver."
            />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;