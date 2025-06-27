import { Link } from "wouter";
import { Menu, X, User, BarChart2, Settings, HelpCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = isMobileMenuOpen ? 'auto' : 'hidden';
  };

  return (
    <header className="bg-white sticky top-0 z-40 border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button 
              className="flex items-center" 
              onClick={toggleMobileMenu}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center mr-8">
              <img 
                src="/logo.png" 
                alt="Hichers Logo" 
                className="h-10 w-10 mr-2" 
              />
              <span className="font-bold text-2xl tracking-tight text-primary">Hichers</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-8">
              <Link href="/features" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="/customers" className="text-sm font-medium hover:text-primary transition-colors">
                Customers
              </Link>
              <Link href="/resources" className="text-sm font-medium hover:text-primary transition-colors">
                Resources
              </Link>
            </nav>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/login" className="inline-flex text-sm font-medium hover:text-primary transition-colors">
              Log In
            </Link>
            <Button asChild variant="default" className="hidden sm:inline-flex">
              <Link href="/signup">
                Sign Up
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 p-4 flex flex-col lg:hidden">
          <div className="flex justify-between items-center mb-8">
            <Link href="/" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Hichers Logo" 
                className="h-10 w-10 mr-2" 
              />
              <span className="font-bold text-2xl text-primary">Hichers</span>
            </Link>
            <button 
              onClick={toggleMobileMenu}
              className="text-black"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col space-y-6">
            <Link href="/features" className="flex items-center space-x-2 text-lg font-medium">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <span>Features</span>
            </Link>
            <Link href="/pricing" className="flex items-center space-x-2 text-lg font-medium">
              <BarChart2 className="h-5 w-5 text-muted-foreground" />
              <span>Pricing</span>
            </Link>
            <Link href="/customers" className="flex items-center space-x-2 text-lg font-medium">
              <User className="h-5 w-5 text-muted-foreground" />
              <span>Customers</span>
            </Link>
            <Link href="/resources" className="flex items-center space-x-2 text-lg font-medium">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <span>Resources</span>
            </Link>
          </nav>
          <div className="mt-auto flex flex-col gap-3">
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">
                Log In
              </Link>
            </Button>
            <Button asChild variant="default" className="w-full">
              <Link href="/signup">
                Sign Up
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
