export default function About() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-12">About HICHERS</h1>
      
      <div className="flex flex-col md:flex-row gap-12 mb-16">
        <div className="md:w-1/2">
          <div className="h-full bg-cover bg-center" style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')"
          }}></div>
        </div>
        
        <div className="md:w-1/2">
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <p className="mb-4">
            Founded in 2018, HICHERS was born out of a passion for adventure and high-quality craftsmanship. 
            Our founder, an avid hiker and traveler, was constantly disappointed by bags that couldn't 
            withstand the rigors of the trail while maintaining style for everyday use.
          </p>
          <p className="mb-4">
            After years of testing various materials and designs, we developed our first line of 
            backpacks that combined durability, functionality, and timeless aesthetics. Since then, 
            we've expanded our collection to include a variety of bags and accessories, all crafted 
            with the same attention to detail and commitment to quality.
          </p>
          <p>
            Today, HICHERS is proud to be an Indian brand creating premium quality products 
            for adventurers, commuters, and everyone in between. Our products are designed to last 
            and accompany you on all of life's journeys.
          </p>
        </div>
      </div>
      
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Our Values</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-3">Sustainability</h3>
            <p>
              We're committed to minimizing our environmental impact by using sustainable materials 
              and ethical manufacturing processes. Each product is designed to last, reducing the 
              need for frequent replacements.
            </p>
          </div>
          
          <div className="text-center p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-3">Quality</h3>
            <p>
              We never compromise on quality. Each product undergoes rigorous testing to ensure 
              it meets our high standards for durability, functionality, and comfort. We stand 
              behind our craftsmanship with a 1-year warranty.
            </p>
          </div>
          
          <div className="text-center p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-3">Community</h3>
            <p>
              We believe in building a community of adventurers and travelers. By sharing stories 
              and experiences, we inspire each other to explore more and live fully. Our products 
              are designed to enable your journey.
            </p>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-center mb-8">Our Process</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold">1</span>
            </div>
            <h3 className="font-semibold mb-2">Design</h3>
            <p className="text-sm">
              Each product starts as a concept, based on customer needs and our design principles.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold">2</span>
            </div>
            <h3 className="font-semibold mb-2">Material Selection</h3>
            <p className="text-sm">
              We source high-quality, durable materials that meet our sustainability standards.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold">3</span>
            </div>
            <h3 className="font-semibold mb-2">Crafting</h3>
            <p className="text-sm">
              Skilled artisans craft each piece with meticulous attention to detail.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold">4</span>
            </div>
            <h3 className="font-semibold mb-2">Quality Testing</h3>
            <p className="text-sm">
              Every product undergoes rigorous testing before it reaches our customers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
