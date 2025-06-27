import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Mail, Linkedin, Github } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-50 border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Product Section */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-foreground">Product</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/integrations" className="hover:text-primary transition-colors">Integrations</Link></li>
              <li><Link href="/changelog" className="hover:text-primary transition-colors">Changelog</Link></li>
              <li><Link href="/roadmap" className="hover:text-primary transition-colors">Roadmap</Link></li>
            </ul>
          </div>
          
          {/* Resources Section */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-foreground">Resources</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/guides" className="hover:text-primary transition-colors">Guides</Link></li>
              <li><Link href="/case-studies" className="hover:text-primary transition-colors">Case Studies</Link></li>
              <li><Link href="/documentation" className="hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link href="/api" className="hover:text-primary transition-colors">API Reference</Link></li>
            </ul>
          </div>
          
          {/* Company Section */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-foreground">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link href="/customers" className="hover:text-primary transition-colors">Customers</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms</Link></li>
            </ul>
          </div>
          
          {/* Newsletter Section */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-foreground">Subscribe to our newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">Get loyalty insights and product updates in your inbox</p>
            <form className="space-y-2 mb-6">
              <Input 
                type="email" 
                placeholder="Email address" 
                className="w-full"
              />
              <Button 
                type="submit" 
                className="w-full"
              >
                Subscribe
              </Button>
            </form>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Github size={18} />
              </a>
              <a href="mailto:support@hichers.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright Section */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div>
            <p>&copy; {currentYear} Hichers. All rights reserved.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
