import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Product } from "@shared/schema";
import { useCart } from "@/context/CartContext";
import { Truck, ShieldCheck, RotateCcw } from "lucide-react";

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${slug}`],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/2 bg-gray-200 h-[600px] animate-pulse"></div>
          <div className="md:w-1/2">
            <div className="h-8 bg-gray-200 w-3/4 mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 w-1/4 mb-6 animate-pulse"></div>
            <div className="h-32 bg-gray-200 mb-6 animate-pulse"></div>
            <div className="h-10 bg-gray-200 w-full mb-4 animate-pulse"></div>
            <div className="h-10 bg-gray-200 w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p>The product you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Product Image */}
        <div className="md:w-1/2">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-auto"
          />
        </div>
        
        {/* Product Details */}
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl mb-6">£{product.price.toString()}</p>
          
          <div className="mb-6">
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          <button 
            onClick={() => addToCart(product)}
            className="w-full py-3 bg-black text-white uppercase tracking-wide hover:bg-gray-800 transition-colors mb-4"
          >
            Add to Cart
          </button>
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex items-start mb-4">
              <Truck className="h-5 w-5 mr-2 mt-0.5" />
              <div>
                <h3 className="font-semibold">Free Shipping</h3>
                <p className="text-sm text-gray-600">On orders above £49</p>
              </div>
            </div>
            
            <div className="flex items-start mb-4">
              <ShieldCheck className="h-5 w-5 mr-2 mt-0.5" />
              <div>
                <h3 className="font-semibold">Quality Guarantee</h3>
                <p className="text-sm text-gray-600">1-year warranty on all products</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <RotateCcw className="h-5 w-5 mr-2 mt-0.5" />
              <div>
                <h3 className="font-semibold">Easy Returns</h3>
                <p className="text-sm text-gray-600">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
