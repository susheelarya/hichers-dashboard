import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, RefreshCw, PlusCircle, Pencil, Calculator, Trash2, Check, X, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { getLoyaltyPrograms, createLoyaltyProgram } from "@/lib/api";
import AuthenticatedLayout from './auth-layout';

// Helper functions for scheme type mapping
const getSchemeTypeName = (loyaltySchemeTypeId: number): string => {
  switch (loyaltySchemeTypeId) {
    case 1: return 'POINTS';
    case 2: return 'DISCOUNT';
    case 3: return 'STAMPS';
    default: return 'OTHER';
  }
};

const getSchemeTypeDescription = (loyaltySchemeTypeId: number): string => {
  switch (loyaltySchemeTypeId) {
    case 1: return 'Earn points for purchases and redeem for rewards';
    case 2: return 'Get discounts on future purchases';
    case 3: return 'Collect stamps to earn free items';
    default: return 'Custom loyalty scheme';
  }
};

// Interface for loyalty program with points
interface PointsProgram {
  id: string | number;
  schemeID?: string | number; // API sometimes uses schemeID instead of id
  name: string;
  schemeName?: string; // API sometimes uses schemeName instead of name
  description: string;
  schemeDescription?: string; // API sometimes uses schemeDescription instead of description
  schemeType: string; // POINTS, STAMPS, DISCOUNT, etc.
  isActive: boolean;
  pointsPerPurchase?: number;
  pointsPerDollar?: number;
  settings?: {
    expiryPeriod?: number;
    minimumPurchase?: number;
    welcomeBonus?: number;
    referralBonus?: number;
  };
  rewards?: Reward[];
  createdAt?: string;
  startDate?: string;
  endDate?: string;
  // Metrics fields
  membersCount?: number;
  totalCustomers?: number;
  rewardsCount?: number;
  pointsIssued?: number;
  // Stamp-based scheme fields
  stampsToCollect?: number;
  freeItems?: number;
  mapId?: number;
}

// Interface for rewards in the points program
interface Reward {
  id: string | number;
  name: string;
  description: string;
  type: string;
  pointsRequired: number;
  value: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

// Form schema for creating/editing points programs based on API requirements
const pointsProgramSchema = z.object({
  loyaltySchemeName: z.string().min(3, { message: "Name must be at least 3 characters" }),
  schemeType: z.enum(["POINTS", "STAMPS"], {
    required_error: "Please select a scheme type",
  }),
  // Fields for POINTS type schemes
  amountSpend: z.coerce.number().optional(), 
  pointsCollected: z.coerce.number().int().min(1, { message: "Points collected must be at least 1" }).optional(),
  pointsRedeem: z.coerce.number().int().min(1, { message: "Points to redeem must be at least 1" }).optional(),
  amountFromPoints: z.coerce.number().min(0.1, { message: "Amount from points must be at least 0.1" }).optional(),
  redeemFrequency: z.enum(["daily", "weekly", "monthly"], {
    required_error: "Please select a redeem frequency",
  }).optional(),
  // Fields for STAMPS type schemes
  stampsToCollect: z.coerce.number().int().min(1, { message: "Stamps to collect must be at least 1" }).optional(),
  freeItems: z.coerce.number().int().min(1, { message: "Free items must be at least 1" }).optional(),
  // Common fields
  monthsExpire: z.coerce.number().int().min(1, {
    message: "Expiry months must be at least 1 month"
  }),
  returnPolicy: z.coerce.number().int().min(0, {
    message: "Return policy days must be 0 or more"
  }),
  validFromDate: z.string().min(1, { message: "Valid from date is required" }),
  isActive: z.boolean().default(true),
});

type PointsProgramFormValues = z.infer<typeof pointsProgramSchema>;

// Form schema for creating/editing rewards
const rewardSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  type: z.string().min(1, { message: "Reward type is required" }),
  pointsRequired: z.coerce.number().int().min(1, { message: "Must require at least 1 point" }),
  value: z.string().min(1, { message: "Reward value is required" }),
  isActive: z.boolean().default(true)
});

type RewardFormValues = z.infer<typeof rewardSchema>;

// Helper function to format date as YYYY/MM/DD with slashes (API requirement)
const formatDateWithSlashes = (dateString: string): string => {
  if (!dateString) return '';
  // Convert from YYYY-MM-DD to YYYY/MM/DD
  return dateString.replace(/-/g, '/');
};



export default function ManagePoints() {
  const [programs, setPrograms] = useState<PointsProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createProgramDialogOpen, setCreateProgramDialogOpen] = useState(false);
  const [createRewardDialogOpen, setCreateRewardDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<PointsProgram | null>(null);
  const [activeTab, setActiveTab] = useState("pointsPrograms");
  const { toast } = useToast();
  
  // Setup form with default values for loyalty schemes based on API requirements
  const programForm = useForm<PointsProgramFormValues>({
    resolver: zodResolver(pointsProgramSchema),
    defaultValues: {
      loyaltySchemeName: "",
      schemeType: "POINTS",
      amountSpend: 10,
      pointsCollected: 5,
      pointsRedeem: 15,
      amountFromPoints: 1,
      redeemFrequency: "monthly",
      stampsToCollect: 10,
      freeItems: 1,
      monthsExpire: 3, // 3 months expiry period as default
      returnPolicy: 30, // 30 days return policy as default
      validFromDate: new Date().toISOString().split('T')[0], // Today's date as default
      isActive: true
    }
  });
  
  // Setup form with default values for rewards
  const rewardForm = useForm<RewardFormValues>({
    resolver: zodResolver(rewardSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "discount", // Default to discount type
      pointsRequired: 100,
      value: "10%", // Default value for discounts
      isActive: true
    }
  });
  
  // Helper function to get empty programs array
  const getMockPointsPrograms = (): PointsProgram[] => {
    return [];
  };

  // Function to fetch loyalty programs from the real API only
  const fetchPrograms = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching loyalty programs from API...");
      
      // Get authentication tokens directly
      const token = localStorage.getItem('hichersToken');
      const userID = localStorage.getItem('hichersUserID') || localStorage.getItem('userID');
      
      if (!token || !userID) {
        throw new Error("Authentication required. Please log in again.");
      }
      
      // Make direct API call to ensure we get the latest data
      const url = `https://hichers-api-eight.vercel.app/api/v1/loyalty/load-loyalty-scheme?userID=${userID}`;
      console.log("Making direct API call to:", url);
      
      // Headers with Bearer token authorization
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // Send GET request with proper headers
      console.log("Sending GET request for loyalty schemes with token:", token.substring(0, 10) + "...");
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      console.log("Load loyalty schemes response status:", response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch loyalty programs: ${response.status} ${response.statusText}`);
      }
      
      // Parse the response
      const responseText = await response.text();
      console.log("Raw loyalty schemes response:", responseText);
      
      // Try to parse the response as JSON
      const data = JSON.parse(responseText);
      console.log("API response for loyalty programs:", data);
      
      // Check for API response in different formats
      if (data && data.data && Array.isArray(data.data)) {
        // The API is returning { message, data: [] } format
        const apiPrograms = data.data;
        
        if (apiPrograms.length > 0) {
          // Map all loyalty schemes from the API to our program format
          const loyaltySchemes = apiPrograms.map((scheme: any) => ({
            id: scheme.loyaltyschemeid,
            schemeID: scheme.loyaltyschemeid,
            name: scheme.loyaltyschemename || `Loyalty Scheme ${scheme.loyaltyschemeid}`,
            schemeName: scheme.loyaltyschemename,
            description: scheme.description || getSchemeTypeDescription(scheme.loyaltyschemetypeid),
            schemeDescription: scheme.description,
            schemeType: getSchemeTypeName(scheme.loyaltyschemetypeid),
            isActive: scheme.timestatus === 'present' && !scheme.expireflag,
            pointsPerPurchase: scheme.pointsfrommoney ? parseInt(scheme.pointsfrommoney) : undefined,
            pointsPerDollar: scheme.moneyforpoints ? parseInt(scheme.moneyforpoints) : undefined,
            settings: {
              expiryPeriod: scheme.expiremonths ? parseInt(scheme.expiremonths) : undefined,
            },
            membersCount: scheme.usercount ? parseInt(scheme.usercount) : 0,
            totalCustomers: scheme.usercount ? parseInt(scheme.usercount) : 0,
            createdAt: scheme.validfromdate,
            startDate: scheme.validfromdate,
            endDate: scheme.validtodate !== '9999-12-12' ? scheme.validtodate : undefined,
            // Additional fields for stamp-based schemes
            stampsToCollect: scheme.stampstocollect ? parseInt(scheme.stampstocollect) : undefined,
            freeItems: scheme.freeitems ? parseInt(scheme.freeitems) : undefined,
            mapId: scheme.mapid
          }));
          
          setPrograms(loyaltySchemes as PointsProgram[]);
          console.log("Loaded loyalty schemes:", loyaltySchemes);
        } else {
          console.log("API returned empty data array");
          setPrograms([]);
        }
      } else if (data && (data.loyaltySchemes || data.programs)) {
        // Alternative API format - loyalty schemes or programs directly
        const apiPrograms = data.loyaltySchemes || data.programs || [];
        
        // Map all loyalty schemes from alternative format
        const loyaltySchemes = apiPrograms.map((scheme: any) => ({
          id: scheme.loyaltyschemeid || scheme.id,
          schemeID: scheme.loyaltyschemeid || scheme.id,
          name: scheme.loyaltyschemename || scheme.name || `Loyalty Scheme ${scheme.id}`,
          schemeName: scheme.loyaltyschemename || scheme.name,
          description: scheme.description || getSchemeTypeDescription(scheme.loyaltyschemetypeid || 1),
          schemeType: getSchemeTypeName(scheme.loyaltyschemetypeid || 1),
          isActive: scheme.timestatus === 'present' && !scheme.expireflag,
          membersCount: scheme.usercount ? parseInt(scheme.usercount) : 0,
          totalCustomers: scheme.usercount ? parseInt(scheme.usercount) : 0
        }));
        
        setPrograms(loyaltySchemes as PointsProgram[]);
        console.log("Loaded loyalty schemes from alternative format:", loyaltySchemes);
      } else {
        console.log("API response did not contain expected data format");
        setPrograms([]);
      }
    } catch (error) {
      console.error("Error fetching loyalty programs:", error);
      
      // Show error to user
      setPrograms([]);
      
      toast({
        title: "API Connection Issue",
        description: error instanceof Error ? error.message : "Failed to load programs from API",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new points program
  const createPointsProgram = async (data: PointsProgramFormValues) => {
    try {
      console.log("Creating new points program with data:", data);
      
      // Get the user ID from localStorage
      const userID = localStorage.getItem('hichersUserID');
      
      if (!userID) {
        throw new Error("User ID not found. Please log in again.");
      }
      
      // Add a timestamp to program name to prevent duplicates
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const uniqueNameSuffix = ` (${timestamp})`;
      const programName = data.loyaltySchemeName;
      
      // Map scheme type to API scheme type ID
      const getSchemeTypeId = (schemeType: string): string => {
        switch (schemeType) {
          case 'POINTS': return '1';
          case 'DISCOUNT': return '2';
          case 'STAMPS': return '3';
          default: return '1';
        }
      };

      // Transform form data to API format based on scheme type
      const programData = {
        userID: Number(userID), // Required user ID from localStorage
        loyaltySchemeName: programName,
        loyaltySchemeTypeID: getSchemeTypeId(data.schemeType),
        // POINTS scheme fields
        amountSpend: data.schemeType === 'POINTS' ? String(data.amountSpend || 0) : "0",
        pointsCollected: data.schemeType === 'POINTS' ? String(data.pointsCollected || 0) : "0",
        pointsRedeem: data.schemeType === 'POINTS' ? String(data.pointsRedeem || 0) : "0",
        amountFromPoints: data.schemeType === 'POINTS' ? String(data.amountFromPoints || 0) : "0",
        redeemFrequency: data.schemeType === 'POINTS' ? data.redeemFrequency || "monthly" : "monthly",
        // STAMPS scheme fields
        stampsCollect: data.schemeType === 'STAMPS' ? String(data.stampsToCollect || 0) : "0",
        freeItems: data.schemeType === 'STAMPS' ? String(data.freeItems || 0) : "0",
        // Common fields
        monthsExpire: String(data.monthsExpire), 
        validFromDate: formatDateWithSlashes(data.validFromDate),
        predefined: true,
        unsubscribeFlag: false,
        returnPolicy: data.returnPolicy,
        isActive: data.isActive
      };
      
      // Call the API to create the program
      const result = await createLoyaltyProgram(programData);
      console.log("API response for creating points program:", result);
      
      if (result && result.duplicate) {
        // If the API says it's a duplicate, try again with a unique name
        console.log("Program with this name already exists, trying with a unique name");
        
        // Update the program name to be unique
        programData.loyaltySchemeName = programName + uniqueNameSuffix;
        
        // Try creating again with the unique name
        const retryResult = await createLoyaltyProgram(programData);
        console.log("Retry API response:", retryResult);
        
        toast({
          title: "Success!",
          description: "Points program created with a unique name.",
        });
      } else {
        toast({
          title: "Success!",
          description: "Points program created successfully.",
        });
      }
      
      // Refresh programs to get the latest data from the API
      await fetchPrograms();
      
      setCreateProgramDialogOpen(false);
      programForm.reset();
      
      // No need to refresh programs as we've updated the state directly
      
    } catch (error) {
      console.error("Error creating points program:", error);
      
      // Format error message
      let errorMessage = "Failed to create points program. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  // Create a new reward for a program
  const createReward = async (data: RewardFormValues) => {
    if (!selectedProgram) {
      toast({
        title: "Error",
        description: "No program selected to add reward to",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log(`Creating new reward for program ${selectedProgram.id} with data:`, data);
      
      // Transform form data to API format
      const rewardData = {
        loyaltyProgramId: selectedProgram.id,
        name: data.name,
        description: data.description,
        type: data.type,
        pointsRequired: data.pointsRequired,
        value: data.value,
        isActive: data.isActive
      };
      
      // TODO: Implement API call to create reward
      // For now, just show a success message and close the dialog
      toast({
        title: "Success!",
        description: "Reward created successfully. API integration pending.",
      });
      
      setCreateRewardDialogOpen(false);
      rewardForm.reset();
      
      // Refresh programs list
      fetchPrograms();
    } catch (error) {
      console.error("Error creating reward:", error);
      toast({
        title: "Error",
        description: "Failed to create reward. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Load programs on component mount
  useEffect(() => {
    fetchPrograms();
  }, []);
  
  // Get counts of different program types
  const pointsProgramCount = programs.length;
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Loyalty Schemes</h1>
            <p className="text-muted-foreground">
              Create and manage your loyalty schemes and rewards programs
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchPrograms}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={() => setCreateProgramDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Loyalty Scheme
            </Button>
          </div>
        </div>
        
        {/* Main content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg text-muted-foreground">Loading programs...</span>
          </div>
        ) : (
          <div>
            {/* Programs list */}
            {programs.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-muted/20">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Loyalty Schemes Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Create your first loyalty scheme to start rewarding your customers.
                </p>
                <Button 
                  onClick={() => setCreateProgramDialogOpen(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Loyalty Scheme
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {programs.map((program) => (
                  <Card 
                    key={program.id || program.schemeID} 
                    className={`overflow-hidden ${
                      program.schemeType === 'STAMPS' ? 'border-l-4 border-l-orange-500' :
                      program.schemeType === 'POINTS' ? 'border-l-4 border-l-blue-500' :
                      program.schemeType === 'DISCOUNT' ? 'border-l-4 border-l-green-500' :
                      'border-l-4 border-l-gray-400'
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{program.name || program.schemeName}</CardTitle>
                          <CardDescription className="space-y-2">
                            <div className="flex gap-2">
                              {program.isActive ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <Check className="h-3 w-3 mr-1" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <X className="h-3 w-3 mr-1" />
                                  Inactive
                                </span>
                              )}
                              {program.schemeType === 'STAMPS' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  Stamps
                                </span>
                              )}
                              {program.schemeType === 'POINTS' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Points
                                </span>
                              )}
                              {program.schemeType === 'DISCOUNT' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Discount
                                </span>
                              )}
                            </div>
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {program.description || program.schemeDescription}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Type</span>
                            <p className="font-medium">{program.schemeType}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Members</span>
                            <p className="font-medium">{program.membersCount || 0}</p>
                          </div>
                          {program.schemeType === 'STAMPS' && program.stampsToCollect && (
                            <>
                              <div>
                                <span className="text-muted-foreground">Stamps to Collect</span>
                                <p className="font-medium">{program.stampsToCollect}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Free Items</span>
                                <p className="font-medium">{program.freeItems || 1}</p>
                              </div>
                            </>
                          )}
                          {program.schemeType === 'POINTS' && (
                            <>
                              <div>
                                <span className="text-muted-foreground">Points Per Purchase</span>
                                <p className="font-medium">{program.pointsPerPurchase || "1"}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Points Per $</span>
                                <p className="font-medium">{program.pointsPerDollar || "1"}</p>
                              </div>
                            </>
                          )}
                          {program.settings?.welcomeBonus && (
                            <div>
                              <span className="text-muted-foreground">Welcome Bonus</span>
                              <p className="font-medium">{program.settings.welcomeBonus} points</p>
                            </div>
                          )}
                          {program.settings?.referralBonus && (
                            <div>
                              <span className="text-muted-foreground">Referral Bonus</span>
                              <p className="font-medium">{program.settings.referralBonus} points</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Metrics */}
                        {(program.membersCount || program.totalCustomers || program.pointsIssued) && (
                          <div className="border-t pt-3 mt-3">
                            <h4 className="text-sm font-medium mb-2">Program Metrics</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {(program.membersCount || program.totalCustomers) && (
                                <div>
                                  <span className="text-muted-foreground">Members</span>
                                  <p className="font-medium">{program.membersCount || program.totalCustomers}</p>
                                </div>
                              )}
                              {program.pointsIssued && (
                                <div>
                                  <span className="text-muted-foreground">Points Issued</span>
                                  <p className="font-medium">{program.pointsIssued}</p>
                                </div>
                              )}
                              {program.rewardsCount && (
                                <div>
                                  <span className="text-muted-foreground">Rewards</span>
                                  <p className="font-medium">{program.rewardsCount}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>

                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Create Points Program Dialog */}
        <Dialog open={createProgramDialogOpen} onOpenChange={setCreateProgramDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Create New Loyalty Scheme</DialogTitle>
              <DialogDescription>
                Create a loyalty scheme to reward your customers
              </DialogDescription>
            </DialogHeader>
            
            <div className="overflow-y-auto max-h-[60vh] pr-2">
              <Form {...programForm}>
                <form onSubmit={programForm.handleSubmit(createPointsProgram)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4 md:col-span-2">
                      <FormField
                        control={programForm.control}
                        name="loyaltySchemeName"
                        render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scheme Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Gold Loyalty Scheme" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={programForm.control}
                      name="schemeType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scheme Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a scheme type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="POINTS">Points Program</SelectItem>
                              <SelectItem value="STAMPS">Stamp Collection</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose the type of loyalty scheme you want to create
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Conditional fields based on scheme type */}
                  {programForm.watch("schemeType") === "POINTS" && (
                    <>
                      <FormField
                        control={programForm.control}
                        name="amountSpend"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount Spend</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" step="0.01" {...field} />
                            </FormControl>
                            <FormDescription>
                              Amount customers spend to earn points
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={programForm.control}
                        name="pointsCollected"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Points Collected</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormDescription>
                              Points awarded per qualifying purchase
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={programForm.control}
                        name="pointsRedeem"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Points to Redeem</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormDescription>
                              Points needed for redemption
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  
                  {programForm.watch("schemeType") === "STAMPS" && (
                    <>
                      <FormField
                        control={programForm.control}
                        name="stampsToCollect"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stamps to Collect</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormDescription>
                              Number of stamps customers need to collect
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={programForm.control}
                        name="freeItems"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Free Items</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormDescription>
                              Number of free items customers receive
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  
                  {programForm.watch("schemeType") === "POINTS" && (
                    <>
                      <FormField
                        control={programForm.control}
                        name="amountFromPoints"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount from Points</FormLabel>
                            <FormControl>
                              <Input type="number" min="0.1" step="0.1" {...field} />
                            </FormControl>
                            <FormDescription>
                              Value of each redeemed point
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={programForm.control}
                        name="redeemFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Redeem Frequency</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              How often points can be redeemed
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  
                  <FormField
                    control={programForm.control}
                    name="validFromDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valid From Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          Date when the program becomes active
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={programForm.control}
                    name="monthsExpire"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Months</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormDescription>
                          Number of months until points expire (required by API)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={programForm.control}
                    name="returnPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Return Policy (Days)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormDescription>
                          Number of days for the return policy
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={programForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Enable or disable this program
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateProgramDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Program</Button>
                </DialogFooter>
              </form>
            </Form>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Create Reward Dialog */}
        <Dialog open={createRewardDialogOpen} onOpenChange={setCreateRewardDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Add New Reward</DialogTitle>
              <DialogDescription>
                {selectedProgram && (
                  <span>Add a reward to the "{selectedProgram.name || selectedProgram.schemeName}" program</span>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="overflow-y-auto max-h-[60vh] pr-2">
              <Form {...rewardForm}>
                <form onSubmit={rewardForm.handleSubmit(createReward)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={rewardForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reward Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Free Coffee" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                  />
                  
                    <FormField
                      control={rewardForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Get a free coffee of your choice" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={rewardForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reward Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="discount">Discount</SelectItem>
                              <SelectItem value="free_item">Free Item</SelectItem>
                              <SelectItem value="credit">Store Credit</SelectItem>
                              <SelectItem value="gift">Gift</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={rewardForm.control}
                      name="pointsRequired"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Points Required</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                    <FormField
                      control={rewardForm.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reward Value</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 10%, 5, Any Coffee" {...field} />
                          </FormControl>
                          <FormDescription>
                            For discounts use percentage (10%), for credits use amount (5),
                            for items describe what they get
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                    )}
                  />
                  
                    <FormField
                      control={rewardForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                              Enable or disable this reward
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateRewardDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Reward</Button>
                </DialogFooter>
              </form>
            </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedLayout>
  );
}