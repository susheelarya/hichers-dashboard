import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "../shared/ProductCard";

export default function NewArrivals() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products?new=true'],
  });

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-gray-100">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center uppercase">New Arrivals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-gray-200 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gray-100">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center uppercase">New Arrivals</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} showNewLabel={true} />
          ))}
        </div>
      </div>
    </section>
  );
}
