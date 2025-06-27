import { Link } from "wouter";

export default function PromotionBanner() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="relative h-96">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1472859743222-523fc616a174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" 
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">SUMMER SPECIAL OFFER</h2>
            <p className="text-lg md:text-xl max-w-2xl text-center mb-8">
              Get 20% off on all backpacks. Limited time offer.
            </p>
            <Link 
              href="/shop" 
              className="bg-white text-black uppercase tracking-wide px-6 py-3 font-medium hover:bg-opacity-90 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
