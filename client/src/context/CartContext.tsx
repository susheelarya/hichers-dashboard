import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "../lib/queryClient";
import { Product } from "@shared/schema";
import { CartContextType, CartItemWithProduct } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

// Ensure cart context has default values
const defaultCartContext: CartContextType = {
  cartItems: [],
  isCartOpen: false,
  openCart: () => {},
  closeCart: () => {},
  addToCart: () => {},
  removeFromCart: () => {},
  increaseQuantity: () => {},
  decreaseQuantity: () => {},
  cartTotal: 0,
  itemCount: 0,
};

const CartContext = createContext<CartContextType>(defaultCartContext);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  // Generate session ID if needed
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch('/api/cart');
        if (response.ok) {
          const data = await response.json();
          setCartItems(data);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    fetchCart();
  }, []);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = async (product: Product) => {
    try {
      const existingItem = cartItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        await increaseQuantity(existingItem.id);
        return;
      }
      
      const response = await apiRequest('POST', '/api/cart', { productId: product.id, quantity: 1 });
      
      if (response.ok) {
        const newItem = await response.json();
        setCartItems(prev => [...prev, newItem]);
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart.`,
        });
        openCart();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/cart/${id}`);
      setCartItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const increaseQuantity = async (id: number) => {
    try {
      const item = cartItems.find(item => item.id === id);
      if (!item) return;

      const response = await apiRequest('PATCH', `/api/cart/${id}`, { 
        quantity: item.quantity + 1 
      });
      
      if (response.ok) {
        const updatedItem = await response.json();
        setCartItems(prev => 
          prev.map(item => item.id === id ? updatedItem : item)
        );
      }
    } catch (error) {
      console.error('Error increasing quantity:', error);
    }
  };

  const decreaseQuantity = async (id: number) => {
    try {
      const item = cartItems.find(item => item.id === id);
      if (!item) return;
      
      if (item.quantity === 1) {
        await removeFromCart(id);
        return;
      }

      const response = await apiRequest('PATCH', `/api/cart/${id}`, { 
        quantity: item.quantity - 1 
      });
      
      if (response.ok) {
        const updatedItem = await response.json();
        setCartItems(prev => 
          prev.map(item => item.id === id ? updatedItem : item)
        );
      }
    } catch (error) {
      console.error('Error decreasing quantity:', error);
    }
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.product.price) * item.quantity), 
    0
  );

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      openCart,
      closeCart,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      cartTotal,
      itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
