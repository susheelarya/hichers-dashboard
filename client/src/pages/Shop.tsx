import { useQuery } from "@tanstack/react-query";
import { Product, Category } from "@shared/schema";
import ProductCard from "@/components/shared/ProductCard";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function Shop() {
  const [location] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Get category from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const category = params.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [location]);
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', selectedCategory],
  });
  
  const isLoading = categoriesLoading || productsLoading;

  // Filter products by category if a category is selected
  const filteredProducts = selectedCategory 
    ? products?.filter(product => {
        const category = categories?.find(c => c.slug === selectedCategory);
        return product.categoryId === category?.id;
      })
    : products;

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-12">Shop All Products</h1>
      
      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          className={`px-4 py-2 border ${!selectedCategory ? 'bg-black text-white' : 'border-black hover:bg-black hover:text-white'}`}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </button>
        {categories?.map(category => (
          <button
            key={category.id}
            className={`px-4 py-2 border ${selectedCategory === category.slug ? 'bg-black text-white' : 'border-black hover:bg-black hover:text-white'}`}
            onClick={() => setSelectedCategory(category.slug)}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-96 bg-gray-200 animate-pulse"></div>
          ))}
        </div>
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}
