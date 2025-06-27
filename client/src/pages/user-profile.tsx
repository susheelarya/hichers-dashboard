import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import AuthenticatedLayout from '@/pages/auth-layout';
import { getLoyaltyPrograms } from '@/lib/api';
import { 
  Settings, 
  Mail, 
  Smartphone,
  Calendar,
  Award,
  TrendingUp
} from 'lucide-react';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  birthdate?: string;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  joinedDate: string;
  preferences: {
    communicationPreferences: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
}

const BUSINESS_TIERS = {
  bronze: { 
    name: 'Bronze Partner', 
    color: 'bg-amber-600', 
    benefits: ['Basic loyalty programs', 'Standard analytics', 'Email support'] 
  },
  silver: { 
    name: 'Silver Partner', 
    color: 'bg-gray-400', 
    benefits: ['Advanced loyalty programs', 'Enhanced analytics', 'Priority support', 'Custom offers'] 
  },
  gold: { 
    name: 'Gold Partner', 
    color: 'bg-yellow-500', 
    benefits: ['Premium features', 'Advanced analytics', 'Priority support', 'Custom branding', 'API access'] 
  },
  platinum: { 
    name: 'Platinum Partner', 
    color: 'bg-purple-600', 
    benefits: ['All features', 'Real-time analytics', 'Dedicated support', 'White-label solution', 'Custom integrations'] 
  }
};

// Calculate business tier based on real loyalty program performance
function calculateBusinessTier(loyaltyPrograms: any[]): 'bronze' | 'silver' | 'gold' | 'platinum' {
  try {
    if (!loyaltyPrograms || !Array.isArray(loyaltyPrograms) || loyaltyPrograms.length === 0) return 'bronze';
    
    const totalCustomers = loyaltyPrograms.reduce((sum: number, program: any) => {
      const userCount = parseInt(program?.usercount || '0');
      return sum + (isNaN(userCount) ? 0 : userCount);
    }, 0);
    const totalPrograms = loyaltyPrograms.length;
    const activePrograms = loyaltyPrograms.filter(p => p?.timestatus === 'present').length;
    
    // Business tier logic based on actual performance metrics
    if (totalCustomers >= 100 && totalPrograms >= 10 && activePrograms >= 8) return 'platinum';
    if (totalCustomers >= 50 && totalPrograms >= 5 && activePrograms >= 4) return 'gold';
    if (totalCustomers >= 20 && totalPrograms >= 3 && activePrograms >= 2) return 'silver';
    return 'bronze';
  } catch (error) {
    console.error('Error calculating business tier:', error);
    return 'bronze';
  }
}

export default function UserProfile() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userID = localStorage.getItem('hichersUserID');
      const token = localStorage.getItem('hichersToken');
      let userData = null;

      try {
        const userDataStr = localStorage.getItem('hichersUser');
        if (userDataStr) {
          userData = JSON.parse(userDataStr);
        }
      } catch (parseError) {
        console.error('Failed to parse user data from localStorage:', parseError);
      }
      
      if (!userData) {
        userData = {
          userid: userID || '1',
          businessname: 'Business User',
          mobilenumber: '',
          countrycode: '44',
          fullname: '',
          email: ''
        };
      }

      // Get real loyalty programs to calculate business tier
      let loyaltyPrograms = [];
      let businessTier: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';
      
      try {
        loyaltyPrograms = await getLoyaltyPrograms();
        businessTier = calculateBusinessTier(loyaltyPrograms);
      } catch (programError) {
        console.error('Failed to load loyalty programs for tier calculation:', programError);
        businessTier = 'bronze';
      }
      
      // Create profile from available user data with safe property access
      const fullNameParts = userData?.fullname ? userData.fullname.split(' ') : [];
      const firstName = fullNameParts[0] || userData?.businessname || 'Business';
      const lastName = fullNameParts.length > 1 ? fullNameParts.slice(1).join(' ') : 'User';
      const email = userData?.email || '';
      const phone = userData?.mobilenumber ? `+${userData.countrycode || '44'}${userData.mobilenumber}` : '';
      const birthdate = userData?.birthdate || '';
      const joinedDate = userData?.createdOn || new Date().toISOString();
      
      const authenticProfile: UserProfile = {
        id: String(userData?.userid || userData?.id || userID || '1'),
        firstName,
        lastName,
        email,
        phone,
        birthdate,
        loyaltyTier: businessTier,
        joinedDate,
        preferences: {
          communicationPreferences: {
            email: false,
            sms: false,
            push: false
          }
        }
      };

      setProfile(authenticProfile);
      setEditedProfile(authenticProfile);
    } catch (error) {
      console.error('Profile page error:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editedProfile) return;

    try {
      setIsLoading(true);
      setProfile(editedProfile);
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const updateCommunicationPreference = (key: string, value: boolean) => {
    if (!editedProfile) return;
    
    setEditedProfile({
      ...editedProfile,
      preferences: {
        ...editedProfile.preferences,
        communicationPreferences: {
          ...editedProfile.preferences.communicationPreferences,
          [key]: value
        }
      }
    });
  };

  if (isLoading || !profile) {
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

  const tierInfo = BUSINESS_TIERS[profile.loyaltyTier];

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="loyalty">Business Status</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-lg">
                      {(profile.firstName && profile.firstName[0]) || 'B'}{(profile.lastName && profile.lastName[0]) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h2>
                    <p className="text-muted-foreground">{profile.email}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <Badge className={`${tierInfo.color} text-white`}>
                        <Award className="w-3 h-3 mr-1" />
                        {tierInfo.name}
                      </Badge>
                      <Badge variant="outline">
                        Since {new Date(profile.joinedDate).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">Business Partner</p>
                      <p className="text-sm text-muted-foreground">Account Type</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{new Date(profile.joinedDate).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="space-x-2">
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={editedProfile?.firstName || ''}
                      onChange={(e) => setEditedProfile(prev => prev ? {...prev, firstName: e.target.value} : null)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={editedProfile?.lastName || ''}
                      onChange={(e) => setEditedProfile(prev => prev ? {...prev, lastName: e.target.value} : null)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="birthdate">Date of Birth</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={editedProfile?.birthdate || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, birthdate: e.target.value} : null)}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Preferences</CardTitle>
                <CardDescription>Choose how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <Label>Email Notifications</Label>
                  </div>
                  <Switch
                    checked={editedProfile?.preferences.communicationPreferences.email || false}
                    onCheckedChange={(checked) => updateCommunicationPreference('email', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4" />
                    <Label>SMS Notifications</Label>
                  </div>
                  <Switch
                    checked={editedProfile?.preferences.communicationPreferences.sms || false}
                    onCheckedChange={(checked) => updateCommunicationPreference('sms', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Settings</CardTitle>
                <CardDescription>Configure your business preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Business Hours Notifications</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get notified about customer activity during business hours
                  </p>
                </div>

                <div>
                  <Label>Customer Engagement Alerts</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive alerts when customers reach loyalty milestones
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loyalty" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Partnership Status</CardTitle>
                <CardDescription>Your current tier and benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full ${tierInfo.color} text-white mb-4`}>
                      <Award className="w-5 h-5 mr-2" />
                      {tierInfo.name}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Congratulations!</h3>
                    <p className="text-muted-foreground">You've achieved {tierInfo.name} status</p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Your Benefits</h4>
                    <ul className="space-y-2">
                      {tierInfo.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div className="text-center">
                    <p className="text-lg text-muted-foreground">
                      Your business tier is calculated based on loyalty program performance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}