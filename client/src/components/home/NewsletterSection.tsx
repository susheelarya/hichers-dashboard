import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const { mutate: subscribe, isPending } = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest('POST', '/api/newsletter', { email });
      if (!response.ok) {
        throw new Error('Failed to subscribe to newsletter');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thank you for subscribing!",
        description: "You'll receive updates on loyalty program best practices and platform news.",
      });
      setEmail("");
    },
    onError: (error) => {
      toast({
        title: "Subscription Error",
        description: error instanceof Error ? error.message : "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      subscribe(email);
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-primary/10 to-primary/5">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="md:w-1/2">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Mail className="h-5 w-5" />
              <span className="text-sm font-semibold">LOYALTY INSIGHTS</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Stay Updated on Loyalty Trends</h2>
            <p className="text-muted-foreground mb-6">
              Join our newsletter to receive tips on creating effective loyalty programs, 
              customer retention strategies, and exclusive platform updates.
            </p>
            
            <form 
              className="flex flex-col sm:flex-row gap-3"
              onSubmit={handleSubmit}
            >
              <div className="flex-grow">
                <Input 
                  type="email" 
                  placeholder="Your email address" 
                  className="h-12" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="h-12 px-6"
                disabled={isPending}
                size="lg"
              >
                {isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
            
            <p className="text-sm text-muted-foreground mt-3">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
          
          <div className="md:w-1/2 bg-card p-6 rounded-lg shadow-sm border border-border">
            <h3 className="font-semibold mb-3">Why Subscribe:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <svg className="h-3 w-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Exclusive loyalty program strategies and case studies</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <svg className="h-3 w-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Early access to new Hichers platform features</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <svg className="h-3 w-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Insights on customer retention and engagement</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
