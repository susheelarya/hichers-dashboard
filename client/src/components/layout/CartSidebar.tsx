import { Trash2, X, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useEffect } from "react";
import { Link } from "wouter";

export default function CartSidebar() {
  const { 
    cartItems, 
    isCartOpen, 
    closeCart, 
    removeFromCart, 
    increaseQuantity, 
    decreaseQuantity,
    cartTotal,
    itemCount
  } = useCart();

  // Handle clicking outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const overlay = document.getElementById('cart-overlay');
      
      if (isCartOpen && overlay && target === overlay) {
        closeCart();
      }
    };

    if (isCartOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isCartOpen, closeCart]);

  // Handle transform styling based on cart open state
  useEffect(() => {
    const cartOverlay = document.getElementById('cart-overlay');
    const cartSidebar = document.getElementById('cart-sidebar');
    
    if (cartOverlay && cartSidebar) {
      if (isCartOpen) {
        cartOverlay.classList.remove('hidden');
        setTimeout(() => {
          cartSidebar.style.transform = 'translateX(0)';
        }, 50);
      } else {
        cartSidebar.style.transform = 'translateX(100%)';
        setTimeout(() => {
          cartOverlay.classList.add('hidden');
        }, 300);
      }
    }
  }, [isCartOpen]);

  // Calculate shipping based on cart total
  const shippingFee = cartTotal >= 49 ? 0 : 4.99;
  const freeShippingThreshold = 49;
  const shippingRemaining = freeShippingThreshold - cartTotal > 0 ? freeShippingThreshold - cartTotal : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 hidden" id="cart-overlay">
      <div 
        id="cart-sidebar"
        className="absolute top-0 right-0 h-full w-full md:w-[450px] bg-white transform translate-x-full transition-transform duration-300 flex flex-col"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-light text-lg">Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})</h2>
          <button 
            className="text-black hover:text-gray-500 transition-colors" 
            onClick={closeCart}
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex-grow flex flex-col justify-center items-center p-8 text-center">
            <p className="text-gray-500 mb-6">Your cart is currently empty</p>
            <button 
              onClick={closeCart}
              className="bg-black text-white px-8 py-3 text-sm font-light hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-grow overflow-auto px-6 py-4">
              {/* Free shipping progress bar */}
              {shippingRemaining > 0 && (
                <div className="mb-6 pb-2 border-b border-gray-100">
                  <div className="mb-2">
                    <p className="text-xs text-center">
                      You're £{shippingRemaining.toFixed(2)} away from FREE UK shipping!
                    </p>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-black h-full"
                      style={{ width: `${(cartTotal / freeShippingThreshold) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Cart items */}
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-6 border-b border-gray-100">
                    <div className="w-20 h-24 bg-gray-50">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col flex-grow">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-light">{item.product.name}</h3>
                        <button 
                          className="text-gray-400 hover:text-black transition-colors" 
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove item"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Black</p>
                      <div className="mt-auto flex justify-between items-end">
                        <div className="flex items-center border border-gray-200 h-8">
                          <button 
                            className="px-2 h-full flex items-center justify-center" 
                            onClick={() => decreaseQuantity(item.id)}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 text-sm">{item.quantity}</span>
                          <button 
                            className="px-2 h-full flex items-center justify-center" 
                            onClick={() => increaseQuantity(item.id)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-sm">£{item.product.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart footer with totals and checkout */}
            <div className="border-t border-gray-100 p-6">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>£{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span>{shippingFee === 0 ? 'FREE' : `£${shippingFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-medium pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span>£{(cartTotal + shippingFee).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link 
                  href="/checkout" 
                  className="block w-full bg-black text-white text-center py-3 font-light text-sm hover:bg-gray-800 transition-colors"
                >
                  Checkout
                </Link>
                <button 
                  onClick={closeCart}
                  className="block w-full py-3 text-sm font-light hover:text-gray-500 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
