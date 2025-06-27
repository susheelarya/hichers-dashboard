import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NewArrivals from "./pages/NewArrivals";
import Features from "./pages/Features";
import AuthPage from "./pages/auth-page";
import OtpVerificationPage from "./pages/otp-verification";
import Dashboard from "./pages/dashboard";
import ManageOffers from "./pages/manage-offers-new";
import ManagePoints from "./pages/manage-points";
import MobileNavigation from "./components/layout/MobileNavigation";
import CartSidebar from "./components/layout/CartSidebar";
import { CartProvider } from "./context/CartContext";
import { ProtectedRoute } from "./lib/protected-route";
import AuthenticatedHeader from "./components/layout/AuthenticatedHeader";
import DebugTokenPage from "./pages/debug-token";
import DebugApiPage from "./pages/debug-api";
import UserProfile from "./pages/user-profile";
import Recommendations from "./pages/recommendations";
import { useEffect, useState } from "react";

function Router() {
  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/features" component={Features} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/verify-otp" component={OtpVerificationPage} />
      <Route path="/debug-token" component={DebugTokenPage} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/manage-offers" component={ManageOffers} />
      <ProtectedRoute path="/manage-points" component={ManagePoints} />
      <ProtectedRoute path="/profile" component={UserProfile} />
      <ProtectedRoute path="/recommendations" component={Recommendations} />
      <Route path="/debug-api" component={DebugApiPage} />
      <ProtectedRoute path="/shop" component={Shop} />
      <ProtectedRoute path="/product/:slug" component={ProductDetail} />
      <ProtectedRoute path="/new-arrivals" component={NewArrivals} />
      
      {/* Home route with conditional rendering based on auth status */}
      <Route path="/">
        {isAuthenticated() ? <Dashboard /> : <Home />}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [location] = useLocation();
  
  // Check authentication status whenever location changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <div className="flex flex-col min-h-screen">
          {isAuthenticated ? (
            // Authenticated layout - header is handled by AuthenticatedLayout
            <main className="flex-grow bg-gray-50">
              <Router />
            </main>
          ) : (
            // Public layout
            <>
              <Header />
              <MobileNavigation />
              <CartSidebar />
              <main className="flex-grow">
                <Router />
              </main>
              <Footer />
            </>
          )}
        </div>
        <Toaster />
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
