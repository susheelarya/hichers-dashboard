export default function InstagramSection() {
  const instagramPosts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1527751061343-865133e2a830?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1534187425618-88268586e6a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1527594162753-61b556b5938d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1476231682828-37e571bc172f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    }
  ];

  return (
    <section className="py-16 px-4 bg-gray-100">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold uppercase mb-2">Follow Us @hichers</h2>
          <p className="text-sm">Share your adventures with us using #HichersJourney</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {instagramPosts.map(post => (
            <a 
              key={post.id} 
              href="https://www.instagram.com/hichers" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block overflow-hidden group"
            >
              <div 
                className="w-full h-64 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${post.image})` }}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
