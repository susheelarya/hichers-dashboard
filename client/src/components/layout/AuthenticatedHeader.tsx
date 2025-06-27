import { Link } from "wouter";
import { Menu, X, User, Bell, LogOut, Settings, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function AuthenticatedHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Load user data from localStorage - data is stored as 'userInfo' now
    const userData = localStorage.getItem('userInfo');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = isMobileMenuOpen ? 'auto' : 'hidden';
  };

  const handleLogout = () => {
    // Clear stored auth data
    localStorage.removeItem('token');
    localStorage.removeItem('userID');
    localStorage.removeItem('userInfo');
    // Redirect to auth page
    window.location.href = '/auth';
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
            <Link href="/dashboard" className="flex items-center mr-8">
              <img 
                src="/logo.png" 
                alt="Hichers Logo" 
                className="h-10 w-10 mr-2" 
              />
              <span className="font-bold text-2xl tracking-tight text-primary">Hichers</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-8">
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/manage-offers" className="text-sm font-medium hover:text-primary transition-colors">
                Manage Offers
              </Link>
              <Link href="/manage-points" className="text-sm font-medium hover:text-primary transition-colors">
                Loyalty Schemes
              </Link>
              <Link href="/recommendations" className="text-sm font-medium hover:text-primary transition-colors flex items-center">
                <Sparkles className="w-4 h-4 mr-1" />
                Recommendations
              </Link>
              <Link href="/profile" className="text-sm font-medium hover:text-primary transition-colors">
                Profile
              </Link>
            </nav>
          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center space-x-4">
            <Button size="icon" variant="ghost" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user?.businesslogo || ''} alt={user?.businessname || 'User'} />
                    <AvatarFallback>{user?.businessname ? getInitials(user.businessname) : 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.businessname || 'Your Business'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.mobilenumber ? `+${user.countrycode} ${user.mobilenumber}` : 'Mobile user'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 p-4 flex flex-col lg:hidden">
          <div className="flex justify-between items-center mb-8">
            <Link href="/dashboard" className="flex items-center">
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
          <div className="flex items-center space-x-3 mb-8">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.businesslogo || ''} alt={user?.businessname || 'User'} />
              <AvatarFallback>{user?.businessname ? getInitials(user.businessname) : 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user?.businessname || 'Your Business'}</div>
              <div className="text-sm text-muted-foreground">
                {user?.mobilenumber ? `+${user.countrycode} ${user.mobilenumber}` : 'Mobile user'}
              </div>
            </div>
          </div>
          <nav className="flex flex-col space-y-6">
            <Link href="/dashboard" className="flex items-center space-x-2 text-lg font-medium">
              <span>Dashboard</span>
            </Link>
            <Link href="/manage-offers" className="flex items-center space-x-2 text-lg font-medium">
              <span>Manage Offers</span>
            </Link>
            <Link href="/manage-points" className="flex items-center space-x-2 text-lg font-medium">
              <span>Loyalty Schemes</span>
            </Link>
            <Link href="/recommendations" className="flex items-center space-x-2 text-lg font-medium">
              <Sparkles className="w-5 h-5" />
              <span>Recommendations</span>
            </Link>
            <Link href="/profile" className="flex items-center space-x-2 text-lg font-medium">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
          </nav>
          <div className="mt-auto">
            <Button onClick={handleLogout} variant="outline" className="w-full flex items-center">
              <LogOut className="h-4 w-4 mr-2" />
              <span>Log out</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}