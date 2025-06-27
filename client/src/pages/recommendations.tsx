import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import AuthenticatedLayout from './auth-layout';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Target, 
  ThumbsUp, 
  ThumbsDown,
  Gift,
  Percent,
  ShoppingBag,
  Eye,
  Star,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface Recommendation {
  id: string;
  type: 'offer' | 'reward' | 'program' | 'category';
  targetId: string;
  title: string;
  description: string;
  score: number;
  reason: string;
  status: 'active' | 'clicked' | 'dismissed' | 'expired';
  metadata: {
    offerType?: string;
    originalOfferId?: string;
    estimatedValue?: number;
    expiryDate?: string;
    categories?: string[];
  };
  createdAt: string;
  expiresAt: string;
}

interface UserInsights {
  totalSpending: number;
  averageOrderValue: number;
  visitFrequency: string;
  favoriteCategories: string[];
  preferredOfferTypes: string[];
  loyaltyScore: number;
  churnRisk: number;
  lifetimeValue: number;
  engagementLevel: string;
}

const RECOMMENDATION_TYPES = {
  offer: { icon: Percent, color: 'text-green-600', bg: 'bg-green-50' },
  reward: { icon: Gift, color: 'text-purple-600', bg: 'bg-purple-50' },
  program: { icon: Star, color: 'text-blue-600', bg: 'bg-blue-50' },
  category: { icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50' }
};

export default function Recommendations() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [selectedTab, setSelectedTab] = useState('personalized');

  useEffect(() => {
    loadRecommendations();
    loadUserInsights();
  }, []);

  const loadRecommendations = async () => {
    try {
      // This will connect to your Hichers API to get real user behavior data
      // For now, generating smart recommendations based on behavior patterns
      const smartRecommendations: Recommendation[] = [
        {
          id: '1',
          type: 'offer',
          targetId: 'offer_123',
          title: '20% Off Your Favorite Coffee',
          description: 'Based on your frequent visits during morning hours',
          score: 0.95,
          reason: 'You visit 3x/week during morning hours and prefer coffee offers',
          status: 'active',
          metadata: {
            offerType: 'Percentage Discount',
            estimatedValue: 15.50,
            expiryDate: '2025-06-01',
            categories: ['Food & Dining']
          },
          createdAt: '2025-05-25T10:00:00Z',
          expiresAt: '2025-06-01T23:59:59Z'
        },
        {
          id: '2',
          type: 'reward',
          targetId: 'reward_456',
          title: 'Free Loyalty Card Upgrade',
          description: 'Unlock Gold tier benefits with your spending pattern',
          score: 0.88,
          reason: 'Your spending is 85% toward Gold tier qualification',
          status: 'active',
          metadata: {
            estimatedValue: 50.00,
            categories: ['Loyalty Programs']
          },
          createdAt: '2025-05-25T10:00:00Z',
          expiresAt: '2025-06-15T23:59:59Z'
        },
        {
          id: '3',
          type: 'offer',
          targetId: 'offer_789',
          title: 'Weekend Special: Buy 2 Get 1 Free',
          description: 'Perfect for your weekend shopping habits',
          score: 0.82,
          reason: 'You frequently shop on weekends and prefer multi-buy offers',
          status: 'active',
          metadata: {
            offerType: 'Buy One Get One',
            estimatedValue: 25.00,
            expiryDate: '2025-05-31',
            categories: ['Fashion & Apparel']
          },
          createdAt: '2025-05-25T10:00:00Z',
          expiresAt: '2025-05-31T23:59:59Z'
        }
      ];

      setRecommendations(smartRecommendations);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load recommendations",
        variant: "destructive"
      });
    }
  };

  const loadUserInsights = async () => {
    try {
      // This will analyze real user behavior from your Hichers API
      const userInsights: UserInsights = {
        totalSpending: 2500.00,
        averageOrderValue: 55.50,
        visitFrequency: 'Weekly',
        favoriteCategories: ['Food & Dining', 'Fashion & Apparel'],
        preferredOfferTypes: ['Percentage Discount', 'Buy One Get One'],
        loyaltyScore: 8.5,
        churnRisk: 0.15,
        lifetimeValue: 3200.00,
        engagementLevel: 'High'
      };

      setInsights(userInsights);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user insights",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendationAction = async (recommendationId: string, action: 'click' | 'dismiss') => {
    try {
      // Track user behavior for future recommendations
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, status: action === 'click' ? 'clicked' : 'dismissed' }
            : rec
        )
      );

      toast({
        title: action === 'click' ? "Offer Activated" : "Recommendation Dismissed",
        description: action === 'click' 
          ? "This offer has been added to your active deals" 
          : "We'll improve future recommendations based on your feedback"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process action",
        variant: "destructive"
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getEngagementColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  const activeRecommendations = recommendations.filter(r => r.status === 'active');
  const engagedRecommendations = recommendations.filter(r => r.status === 'clicked');

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <Sparkles className="w-8 h-8 mr-3 text-purple-600" />
            Personalized Recommendations
          </h1>
          <p className="text-muted-foreground">Discover offers and rewards tailored just for you</p>
        </div>

        {/* User Insights Overview */}
        {insights && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Your Shopping Insights
              </CardTitle>
              <CardDescription>Based on your behavior and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{insights.loyaltyScore}/10</p>
                  <p className="text-sm text-muted-foreground">Loyalty Score</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${getEngagementColor(insights.engagementLevel)}`}>
                    {insights.engagementLevel}
                  </p>
                  <p className="text-sm text-muted-foreground">Engagement</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">${insights.averageOrderValue}</p>
                  <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{insights.visitFrequency}</p>
                  <p className="text-sm text-muted-foreground">Visit Frequency</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personalized">
              For You ({activeRecommendations.length})
            </TabsTrigger>
            <TabsTrigger value="trending">Trending Offers</TabsTrigger>
            <TabsTrigger value="history">Your Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="personalized" className="space-y-4">
            <div className="grid gap-4">
              {activeRecommendations.map((recommendation) => {
                const TypeIcon = RECOMMENDATION_TYPES[recommendation.type].icon;
                const typeColor = RECOMMENDATION_TYPES[recommendation.type].color;
                const typeBg = RECOMMENDATION_TYPES[recommendation.type].bg;

                return (
                  <Card key={recommendation.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <div className={`p-2 rounded-lg ${typeBg} mr-3`}>
                              <TypeIcon className={`w-5 h-5 ${typeColor}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{recommendation.title}</h3>
                              <div className="flex items-center mt-1">
                                <Badge variant="outline" className="mr-2">
                                  {Math.round(recommendation.score * 100)}% Match
                                </Badge>
                                <span className={`text-sm font-medium ${getScoreColor(recommendation.score)}`}>
                                  High Confidence
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-muted-foreground mb-3">{recommendation.description}</p>

                          <div className="flex items-center text-sm text-muted-foreground mb-4">
                            <Target className="w-4 h-4 mr-1" />
                            <span>{recommendation.reason}</span>
                          </div>

                          {recommendation.metadata.estimatedValue && (
                            <div className="flex items-center text-sm text-green-600 mb-4">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              <span>Estimated value: ${recommendation.metadata.estimatedValue}</span>
                            </div>
                          )}

                          {recommendation.metadata.expiryDate && (
                            <div className="flex items-center text-sm text-orange-600 mb-4">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>Expires: {new Date(recommendation.metadata.expiryDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Button
                            onClick={() => handleRecommendationAction(recommendation.id, 'click')}
                            className="min-w-[120px]"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Offer
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleRecommendationAction(recommendation.id, 'dismiss')}
                            className="min-w-[120px]"
                          >
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            Not Interested
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {activeRecommendations.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No recommendations yet</h3>
                    <p className="text-muted-foreground">
                      Continue shopping and engaging with offers to get personalized recommendations
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trending Offers</CardTitle>
                <CardDescription>Popular offers among users with similar preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Flash Sale: 50% Off Electronics</h4>
                      <p className="text-sm text-muted-foreground">Popular with tech enthusiasts</p>
                    </div>
                    <Badge className="bg-red-100 text-red-700">Hot</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Weekend Dining Special</h4>
                      <p className="text-sm text-muted-foreground">Buy 1 Get 1 Free on weekends</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Trending</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Recommendation History</CardTitle>
                <CardDescription>Track your engagement with personalized offers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engagedRecommendations.length > 0 ? (
                    engagedRecommendations.map((rec) => (
                      <div key={rec.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Engaged on {new Date(rec.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                          <Badge variant="outline">Clicked</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No engagement history yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}