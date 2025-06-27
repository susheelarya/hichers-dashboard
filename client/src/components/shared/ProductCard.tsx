import { Link } from "wouter";
import { Product } from "@shared/schema";
import { useCart } from "@/context/CartContext";
import { Eye } from "lucide-react";

interface ProductCardProps {
  product: Product;
  showNewLabel?: boolean;
}

export default function ProductCard({ product, showNewLabel = false }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <div className="product-card group relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="mb-3 overflow-hidden">
          <div className="relative">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full aspect-[3/4] object-cover"
            />
            {(showNewLabel && product.isNew) && (
              <div className="product-tag">NEW</div>
            )}
          </div>
        </div>
        <div className="px-1 pb-4">
          <h3 className="text-sm font-light">{product.name}</h3>
          <p className="text-sm mt-1 font-light">£{product.price}</p>
        </div>
      </Link>
      
      {/* Quick View Button */}
      <div className="quick-view">
        <Link href={`/product/${product.slug}`} className="flex items-center justify-center space-x-2">
          <Eye size={16} />
          <span>Quick View</span>
        </Link>
      </div>
      
      {/* Add to Cart Button - Shown on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
        <button 
          className="bg-white bg-opacity-90 text-black px-6 py-2 text-sm hover:bg-black hover:text-white transition-colors"
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
