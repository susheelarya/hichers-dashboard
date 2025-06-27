import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Store, Award, TrendingUp, Download, ExternalLink } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 space-y-6">
            <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              Powerful Loyalty Program Builder
            </div>
            <h1 id="hero-header-text" className="mb-4 text-4xl font-bold lg:text-5xl xl:text-6xl">
              Rewarding Loyalty Made Simple
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              Hichers is a powerful tool for shopkeepers to create, manage and promote effective loyalty schemes, boosting customer engagement and business growth.
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="https://onelink.to/pw4m2d" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90">
                  <Download size={18} />
                  Download Now
                </Button>
              </a>
              <Button size="lg" variant="outline" className="gap-2">
                Learn More <ArrowRight size={16} />
              </Button>
            </div>
            
            {/* Mobile App CTA */}
            <div className="bg-white rounded-lg p-4 border border-border shadow-sm mt-4">
              <div className="flex items-center">
                <div className="flex-grow">
                  <h3 className="text-base font-semibold">Get the Hichers Mobile App</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your loyalty program on the go.
                  </p>
                </div>
                <a 
                  href="https://onelink.to/pw4m2d" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <Button size="sm" variant="outline" className="gap-1">
                    <ExternalLink size={14} />
                    Download
                  </Button>
                </a>
              </div>
            </div>
            
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">5,000+ Businesses</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">96% Satisfaction</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">23% More Sales</span>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full -z-10"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full -z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1556742393-d75f468bfcb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Loyalty rewards program dashboard" 
                className="rounded-lg shadow-xl"
              />
              
              {/* Download button overlay */}
              <div className="absolute -bottom-5 right-10 bg-white rounded-lg shadow-lg p-3 border border-border">
                <a 
                  href="https://onelink.to/pw4m2d" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-primary"
                >
                  <Download size={16} />
                  Download Mobile App
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
