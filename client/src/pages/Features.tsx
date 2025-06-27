import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { StampIcon, WalletIcon, TicketPercent, Coins, Tag, Gift, Users, BadgePercent, ShieldCheck, Timer, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

// Feature component for reusability
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  bulletPoints: string[];
}

const FeatureCard = ({ icon, title, description, className, bulletPoints }: FeatureCardProps) => (
  <div className={cn("bg-white p-8 rounded-xl shadow-sm border border-border", className)}>
    <div className="mb-6">
      <div className="bg-primary/10 p-3 inline-flex rounded-lg">
        {icon}
      </div>
    </div>
    <h3 className="text-2xl font-semibold mb-3">{title}</h3>
    <p className="text-muted-foreground mb-6">
      {description}
    </p>
    <ul className="space-y-3">
      {bulletPoints.map((point, index) => (
        <li key={index} className="flex items-start gap-2">
          <div className="rounded-full bg-primary/10 p-1 mt-1">
            <svg className="h-3 w-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-sm">{point}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default function Features() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Powerful Loyalty Platform Features
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Everything you need to create, manage, and grow effective loyalty programs for your business.
            </p>
            <a 
              href="https://onelink.to/pw4m2d" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button size="lg" className="px-8">
                Download App Now
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Core Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform provides multiple ways to engage customers and boost loyalty.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Offers Feature */}
            <FeatureCard
              icon={<TicketPercent className="h-8 w-8 text-primary" />}
              title="Exclusive Offers"
              description="Create compelling offers that drive customer engagement and repeat purchases."
              bulletPoints={[
                "Limited-time discounts to create urgency",
                "Special promotions for loyal customers",
                "Seasonal and holiday campaigns",
                "Birthday and anniversary offers",
                "Referral bonuses to expand your customer base"
              ]}
            />

            {/* Stamp Based Loyalty */}
            <FeatureCard
              icon={<StampIcon className="h-8 w-8 text-primary" />}
              title="Stamp-Based Loyalty"
              description="The classic 'buy X get one free' loyalty program that customers love and understand."
              bulletPoints={[
                "Digital stamp cards - no more paper cards to lose",
                "Customizable number of stamps needed for rewards",
                "Multiple stamp cards for different products or services",
                "Auto-redeem options for seamless customer experience",
                "Expiration management to drive regular visits"
              ]}
            />

            {/* Point Based Loyalty */}
            <FeatureCard
              icon={<Coins className="h-8 w-8 text-primary" />}
              title="Point-Based Loyalty"
              description="Flexible points systems that reward customers for every purchase and engagement."
              bulletPoints={[
                "Points for purchases, referrals, social media engagement",
                "Customizable points-to-value ratio",
                "Tiered rewards for different point thresholds",
                "Point boosters for slow periods or specific products",
                "Detailed points history and balance tracking"
              ]}
            />

            {/* Wallet for All Loyalty Cards */}
            <FeatureCard
              icon={<WalletIcon className="h-8 w-8 text-primary" />}
              title="Digital Loyalty Wallet"
              description="A single app for customers to store and manage all their loyalty programs."
              bulletPoints={[
                "All loyalty cards in one convenient place",
                "Real-time updates on points balance and available rewards",
                "Push notifications for new offers and point milestones",
                "Location-based reminders when near your business",
                "Password-protected and secure customer data"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Enhanced Capabilities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Beyond the basics, our platform offers advanced features to help your business grow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Enhanced Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
              <div className="mb-4 text-primary">
                <Medal className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Customer Segmentation</h3>
              <p className="text-muted-foreground">
                Target specific customer groups with personalized offers based on purchase history and preferences.
              </p>
            </div>

            {/* Enhanced Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
              <div className="mb-4 text-primary">
                <Gift className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gift Cards & Rewards</h3>
              <p className="text-muted-foreground">
                Create digital gift cards and customizable rewards that align with your brand and customer interests.
              </p>
            </div>

            {/* Enhanced Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
              <div className="mb-4 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Referral Programs</h3>
              <p className="text-muted-foreground">
                Turn your loyal customers into brand ambassadors with incentivized referral programs.
              </p>
            </div>

            {/* Enhanced Feature 4 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
              <div className="mb-4 text-primary">
                <BadgePercent className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tiered Loyalty Levels</h3>
              <p className="text-muted-foreground">
                Create VIP tiers to encourage higher spending and reward your most valuable customers.
              </p>
            </div>

            {/* Enhanced Feature 5 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
              <div className="mb-4 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fraud Protection</h3>
              <p className="text-muted-foreground">
                Advanced security measures to prevent fraud and protect both your business and customers.
              </p>
            </div>

            {/* Enhanced Feature 6 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
              <div className="mb-4 text-primary">
                <Timer className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Automated Campaigns</h3>
              <p className="text-muted-foreground">
                Set up time-based or trigger-based campaigns that run automatically based on your criteria.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Customer Loyalty?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of businesses already growing with Hichers' loyalty platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://onelink.to/pw4m2d" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button size="lg" className="w-full sm:w-auto">
                Download Now
              </Button>
            </a>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}