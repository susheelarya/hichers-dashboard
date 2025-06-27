import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "@/components/shared/ProductCard";

export default function NewArrivals() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products?new=true'],
  });

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-12">New Arrivals</h1>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-96 bg-gray-200 animate-pulse"></div>
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} showNewLabel={true} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl">No new arrivals at the moment. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
