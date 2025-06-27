import { Product, CartItem } from "@shared/schema";

export interface CartItemWithProduct extends Omit<CartItem, 'productId'> {
  product: Product;
}

export interface CartContextType {
  cartItems: CartItemWithProduct[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  cartTotal: number;
  itemCount: number;
}
