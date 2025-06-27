import { Link } from "wouter";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const mobileMenu = document.getElementById('mobile-menu');
      
      if (isOpen && mobileMenu && !mobileMenu.contains(target) && target.id !== 'mobile-menu-button') {
        closeMobileMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const closeMobileMenu = () => {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
      mobileMenu.style.transform = 'translateX(-100%)';
      setIsOpen(false);
    }
  };

  return (
    <div 
      id="mobile-menu"
      className="fixed inset-0 bg-white z-50 transform -translate-x-full transition-transform duration-300"
    >
      <div className="p-4 flex justify-end">
        <button className="text-black" onClick={closeMobileMenu}>
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex flex-col space-y-6 p-6">
        <Link href="/" className="text-lg uppercase tracking-wide" onClick={closeMobileMenu}>
          Home
        </Link>
        <Link href="/shop" className="text-lg uppercase tracking-wide" onClick={closeMobileMenu}>
          Shop All
        </Link>
        <Link href="/new-arrivals" className="text-lg uppercase tracking-wide" onClick={closeMobileMenu}>
          New Arrivals
        </Link>
        <Link href="/about" className="text-lg uppercase tracking-wide" onClick={closeMobileMenu}>
          About
        </Link>
        <Link href="/contact" className="text-lg uppercase tracking-wide" onClick={closeMobileMenu}>
          Contact
        </Link>
      </nav>
    </div>
  );
}
