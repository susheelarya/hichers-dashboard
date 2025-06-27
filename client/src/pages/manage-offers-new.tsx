import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, RefreshCw, Clipboard, Calendar, Tags, PenSquare, Trash2, Check, AlertCircle, Clock, Timer, History } from "lucide-react";
import logoPath from "@assets/logo.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createOffer, getOffers, deleteOffer, viewOffer } from "@/lib/api";
import { fetchFromAPI } from "@/lib/api";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import AuthenticatedLayout from './auth-layout';
import OfferDetailDialog from '@/components/offers/OfferDetailDialog';
import AuthenticatedHeader from "@/components/layout/AuthenticatedHeader";

interface Offer {
  id: string | number;
  title: string;
  description: string;
  code?: string;
  discount: string;
  validFrom: string;
  validUntil: string;
  validFromTime?: string;
  validUntilTime?: string;
  isActive: boolean;
  offerTypeID?: number;
  timeStatus?: 'PAST' | 'PRESENT' | 'FUTURE' | 'past' | 'present' | 'future';
  mapID?: number;
  redemptionCount?: number;
  createdAt?: string;
}

// Define offer types based on the API data
const offerTypes = [
  { value: 1, label: "Buy One Get One", id: 1 },
  { value: 2, label: "Percentage Discount", id: 2 },
  { value: 3, label: "Cash Discount", id: 3 },
  { value: 4, label: "Minimum Spend", id: 4 },
  { value: 5, label: "Multi Buy", id: 5 },
  { value: 6, label: "Flash Sales", id: 6 }
];

// Form schema for creating offers
const offerSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  offerTypeID: z.number({ required_error: "Offer type is required" }),
  percentDiscount: z.string().optional(),
  cashDiscount: z.string().optional(),
  minimumSpend: z.string().optional(),
  itemsBuying: z.string().optional(),
  itemsFree: z.string().optional(),
  productName: z.string().optional(),
  whileStocksLast: z.boolean().default(false),
  code: z.string().optional(),
  validFrom: z.string({ required_error: "Valid from date is required" }),
  validUntil: z.string({ required_error: "Valid until date is required" }),
  validFromTime: z.string().default("00:00:00"),
  validUntilTime: z.string().default("23:59:59"),
  isActive: z.boolean().default(true),
  copyFlag: z.boolean().default(false)
});

type OfferFormValues = z.infer<typeof offerSchema>;

export default function ManageOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedOfferType, setSelectedOfferType] = useState<number>(2); // Default to Percentage Discount
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Setup form with default values
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: "",
      description: "",
      offerTypeID: 2, // Default to Percentage Discount
      percentDiscount: "",
      cashDiscount: "",
      minimumSpend: "",
      itemsBuying: "",
      itemsFree: "",
      productName: "",
      whileStocksLast: false,
      code: "",
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      validFromTime: "00:00:00",
      validUntilTime: "23:59:59",
      isActive: true,
      copyFlag: false
    }
  });
  
  // Function to fetch offers
  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      // Try the standard getOffers function first
      try {
        const response = await getOffers();
        console.log("Fetched offers response:", response);
        
        if (response && response.offers && Array.isArray(response.offers)) {
          setOffers(response.offers);
          console.log("Successfully loaded offers from get-offers endpoint");
          return;
        }
      } catch (getOffersError) {
        console.log("Could not fetch offers via get-offers endpoint, trying alternative...");
      }
      
      // If the above failed, show a meaningful error but don't break the UI
      console.log("API is not returning offer data at this time");
      setOffers([]);
      
      // Don't show error toast every time - just log it
      console.warn("The offers API endpoints are currently unavailable");
      
    } catch (error) {
      console.error("Error in fetchOffers:", error);
      
      // Show a user-friendly message without the error
      toast({
        title: "Connection issue",
        description: "We're having trouble connecting to the offers service. The form still works for creating new offers.",
        variant: "destructive",
      });
      
      // For development, show empty state
      setOffers([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle offer creation
  const onSubmit = async (data: OfferFormValues) => {
    try {
      console.log("Form submission started - Creating offer with data:", data);
      
      // Validate that start time is at least 20 minutes in the future
      const now = new Date();
      
      // Parse the date and time fields
      const [year, month, day] = data.validFrom.split('-').map(Number);
      const [hours, minutes] = data.validFromTime.split(':').map(Number);
      
      // Create Date object for the start time (adjusting month because JS months are 0-indexed)
      const startTime = new Date(year, month - 1, day, hours, minutes);
      
      // Calculate time difference in minutes
      const diffInMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);
      
      if (diffInMinutes < 20) {
        toast({
          title: "Invalid Start Time",
          description: "Offer must start at least 20 minutes in the future",
          variant: "destructive",
        });
        return; // Stop form submission
      }
      
      // Ensure copyFlag is included in request as specified by API
      const requestData = {
        ...data,
        copyFlag: data.copyFlag || false,
        // Handle discount data based on offer type
        discount: getDiscountValueByType(data)
      };
      
      console.log("About to call save-offer API with requestData:", requestData);
      const response = await createOffer(requestData);
      console.log("API call to save-offer completed successfully");
      console.log("Create offer response:", response);
      
      // If the create API response contains offer data, update our local offers state
      if (response) {
        // Look for existing offers in different possible response formats
        let existingOffers = [];
        
        if (response.offersList && Array.isArray(response.offersList)) {
          existingOffers = response.offersList;
          console.log("Found offers in response.offersList:", existingOffers);
        } else if (response.offers && Array.isArray(response.offers)) {
          existingOffers = response.offers;
          console.log("Found offers in response.offers:", existingOffers);
        } else if (response.allOffers && Array.isArray(response.allOffers)) {
          existingOffers = response.allOffers;
          console.log("Found offers in response.allOffers:", existingOffers);
        } else if (Array.isArray(response)) {
          existingOffers = response;
          console.log("Response is directly an array of offers:", existingOffers);
        }
        
        // Update our state with the offers from the API
        if (existingOffers.length > 0) {
          setOffers(existingOffers);
          console.log("Updated offers state with offers from API response");
        }
        
        toast({
          title: "Offer created",
          description: "Your offer has been created successfully",
        });
        
        // Close the dialog and reset form
        setCreateDialogOpen(false);
        form.reset();
      } else {
        // Handle unexpected response format
        console.warn("Unexpected API response format:", response);
        toast({
          title: "Offer created",
          description: "Your offer was created, but there may have been an issue with the server response.",
        });
        setCreateDialogOpen(false);
        form.reset();
      }
    } catch (error) {
      console.error("Error creating offer:", error);
      
      // Enhanced error message with more details
      toast({
        title: "Failed to create offer",
        description: error instanceof Error 
          ? `Error: ${error.message}`
          : "Network connection issue. Please check your input and try again.",
        variant: "destructive",
      });
      
      // Log the form state for debugging
      console.log("Form state at error time:", {
        values: form.getValues(),
        errors: form.formState.errors
      });
    }
  };

  // Helper function to get the correct discount value based on offer type
  const getDiscountValueByType = (data: OfferFormValues): string => {
    switch (data.offerTypeID) {
      case 1: // Buy One Get One
        return `Buy ${data.itemsBuying || '1'} Get ${data.itemsFree || '1'} Free`;
      case 2: // Percentage Discount
        return `${data.percentDiscount || '0'}%`;
      case 3: // Cash Discount
        return `£${data.cashDiscount || '0'}`;
      case 4: // Minimum Spend
        return `£${data.cashDiscount || '0'} off with min spend £${data.minimumSpend || '0'}`;
      case 5: // Multi Buy
        return `Buy ${data.itemsBuying || '0'} Get ${data.itemsFree || '0'} Free`;
      case 6: // Flash Sales
        return data.percentDiscount ? `${data.percentDiscount}%` : `£${data.cashDiscount || '0'}`;
      default:
        return "";
    }
  };
  
  // Function to handle offer deletion
  const handleDeleteOffer = async (offerId: string | number) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      try {
        await deleteOffer(offerId);
        toast({
          title: "Offer deleted",
          description: "The offer has been deleted successfully",
        });
        fetchOffers();
      } catch (error) {
        console.error("Error deleting offer:", error);
        toast({
          title: "Failed to delete offer",
          description: "Please try again later",
          variant: "destructive",
        });
      }
    }
  };
  
  // Load offers on component mount
  useEffect(() => {
    fetchOffers();
  }, []);
  
  // Function to format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle offer type selection change
  const handleOfferTypeChange = (value: string) => {
    const typeId = parseInt(value);
    setSelectedOfferType(typeId);
    form.setValue("offerTypeID", typeId);
  };
  
  // Filter offers by timeStatus - API returns lowercase status values
  const pastOffers = offers.filter(offer => 
    offer.timeStatus === 'PAST' || offer.timeStatus === 'past');
  const presentOffers = offers.filter(offer => 
    offer.timeStatus === 'PRESENT' || offer.timeStatus === 'present');
  const futureOffers = offers.filter(offer => 
    offer.timeStatus === 'FUTURE' || offer.timeStatus === 'future');
  
  // Default offers without timeStatus get sorted into present
  const unknownStatusOffers = offers.filter(offer => !offer.timeStatus);
  
  // Get counts for the tabs
  const pastCount = pastOffers.length;
  const presentCount = presentOffers.length + unknownStatusOffers.length;
  const futureCount = futureOffers.length;
  
  // Function to handle ending an offer early
  const handleEndOfferEarly = async (offerId: string | number) => {
    if (window.confirm("Are you sure you want to end this offer early?")) {
      try {
        // Will implement proper API when it's ready
        toast({
          title: "Feature coming soon",
          description: "The ability to end offers early will be available soon",
        });
      } catch (error) {
        console.error("Error ending offer early:", error);
        toast({
          title: "Failed to end offer",
          description: "Please try again later",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Offers</h1>
            <p className="text-muted-foreground">
              Create and manage special offers for your customers
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={fetchOffers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Offer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px] max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Create New Offer</DialogTitle>
                  <DialogDescription>
                    Create a special promotion or discount for your customers
                  </DialogDescription>
                </DialogHeader>
                
                <div className="overflow-y-auto pr-1 max-h-[calc(90vh-180px)]">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Basic info */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Summer Sale 20% Off" {...field} />
                          </FormControl>
                          <FormDescription>
                            This will be displayed to customers
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe your offer..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Offer type selector */}
                    <FormField
                      control={form.control}
                      name="offerTypeID"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Offer Type</FormLabel>
                          <Select 
                            onValueChange={handleOfferTypeChange}
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an offer type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {offerTypes.map((type) => (
                                <SelectItem key={type.id} value={type.value.toString()}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose the type of offer you want to create
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Buy One Get One fields */}
                    {selectedOfferType === 1 && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="itemsBuying"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Items Buying</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g. 1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="itemsFree"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Items Free</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g. 1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    {/* Percentage Discount fields */}
                    {selectedOfferType === 2 && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="percentDiscount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Percentage Off</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g. 20" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Code (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. SUMMER20" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    {/* Cash Discount fields */}
                    {selectedOfferType === 3 && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="cashDiscount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cash Off (£)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g. 10" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Code (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. TENOFF" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    {/* Minimum Spend fields */}
                    {selectedOfferType === 4 && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="minimumSpend"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum Spend (£)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g. 50" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="cashDiscount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cash Off (£)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g. 10" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    {/* Product Name field - common for all offer types */}
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Summer T-Shirt" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Date range fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="validFrom"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Valid From Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Using a custom form control for time */}
                        <FormField
                          control={form.control}
                          name="validFromTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input 
                                  type="time"
                                  step="1"
                                  onChange={(e) => {
                                    // Make sure to always have HH format even if user inputs just minutes
                                    const timeValue = e.target.value;
                                    const formattedValue = timeValue.includes(':') ? 
                                      timeValue : 
                                      "00:" + timeValue;
                                    // Ensure seconds are included
                                    const withSeconds = formattedValue.split(':').length === 3 ? 
                                      formattedValue : 
                                      formattedValue + ":00";
                                    field.onChange(withSeconds);
                                  }}
                                  value={field.value || "00:00:00"}
                                />
                              </FormControl>
                              <FormDescription>Format: HH:MM:SS</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="validUntil"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Valid Until Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Using a consistent form control for end time */}
                        <FormField
                          control={form.control}
                          name="validUntilTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input 
                                  type="time"
                                  step="1"
                                  onChange={(e) => {
                                    // Make sure to always have HH format even if user inputs just minutes
                                    const timeValue = e.target.value;
                                    const formattedValue = timeValue.includes(':') ? 
                                      timeValue : 
                                      "00:" + timeValue;
                                    // Ensure seconds are included
                                    const withSeconds = formattedValue.split(':').length === 3 ? 
                                      formattedValue : 
                                      formattedValue + ":00";
                                    field.onChange(withSeconds);
                                  }}
                                  value={field.value || "23:59:59"}
                                />
                              </FormControl>
                              <FormDescription>Format: HH:MM:SS</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Active status switch */}
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                              Make this offer immediately available to customers
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
                    
                    {/* Copy Flag switch */}
                    <FormField
                      control={form.control}
                      name="copyFlag"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Copy Flag</FormLabel>
                            <FormDescription>
                              Used for special API features
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
                    
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Create Offer
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <Tags className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Create Your First Offer</h3>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              Get started by creating special offers for your customers. 
              Choose from six different offer types including percentage discounts, 
              buy-one-get-one, and more.
            </p>
            <Button 
              className="mt-4" 
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Offer
            </Button>
            
            <div className="mt-6 pt-6 border-t border-dashed border-gray-200 max-w-md mx-auto">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> The offers API is currently experiencing connectivity issues. 
                You can still create new offers, but they may not appear in the list immediately.
              </p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="present" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="present" className="text-center">
                <Clock className="h-4 w-4 mr-2" />
                Current <span className="ml-1 text-xs rounded-full bg-primary/10 px-2 py-0.5">{presentCount}</span>
              </TabsTrigger>
              <TabsTrigger value="future" className="text-center">
                <Timer className="h-4 w-4 mr-2" />
                Future <span className="ml-1 text-xs rounded-full bg-primary/10 px-2 py-0.5">{futureCount}</span>
              </TabsTrigger>
              <TabsTrigger value="past" className="text-center">
                <History className="h-4 w-4 mr-2" />
                Past <span className="ml-1 text-xs rounded-full bg-primary/10 px-2 py-0.5">{pastCount}</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Current offers tab */}
            <TabsContent value="present">
              {presentOffers.length === 0 && unknownStatusOffers.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No current offers</h3>
                  <p className="mt-2 text-muted-foreground">
                    You don't have any active offers at the moment
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...presentOffers, ...unknownStatusOffers].map((offer) => (
                    <Card key={offer.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{offer.title}</CardTitle>
                          <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                            Active
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {offer.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center">
                            <Tags className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="font-medium">{offer.discount}</span>
                          </div>
                          {offer.code && (
                            <div className="flex items-center">
                              <Clipboard className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{offer.code}</span>
                            </div>
                          )}
                          <div className="flex items-center col-span-2">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>
                              Until: {offer.validUntil && formatDate(offer.validUntil)}
                            </span>
                          </div>
                          {offer.offerTypeID !== undefined && (
                            <div className="col-span-2 flex items-center mt-2 text-sm">
                              <span className="text-muted-foreground mr-2">Type:</span>
                              <span className="font-medium">
                                {offerTypes.find(t => t.id === offer.offerTypeID)?.label || `Type ${offer.offerTypeID}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2 border-t">
                        <Button variant="outline" size="sm">
                          <PenSquare className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleEndOfferEarly(offer.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          End Early
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Future offers tab */}
            <TabsContent value="future">
              {futureOffers.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                  <Timer className="h-8 w-8 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No future offers</h3>
                  <p className="mt-2 text-muted-foreground">
                    You don't have any scheduled offers
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {futureOffers.map((offer) => (
                    <Card key={offer.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{offer.title}</CardTitle>
                          <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                            Scheduled
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {offer.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center">
                            <Tags className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="font-medium">{offer.discount}</span>
                          </div>
                          {offer.code && (
                            <div className="flex items-center">
                              <Clipboard className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{offer.code}</span>
                            </div>
                          )}
                          <div className="flex items-center col-span-2">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>
                              Starts: {offer.validFrom && formatDate(offer.validFrom)}
                            </span>
                          </div>
                          {offer.offerTypeID !== undefined && (
                            <div className="col-span-2 flex items-center mt-2 text-sm">
                              <span className="text-muted-foreground mr-2">Type:</span>
                              <span className="font-medium">
                                {offerTypes.find(t => t.id === offer.offerTypeID)?.label || `Type ${offer.offerTypeID}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2 border-t">
                        <Button variant="outline" size="sm">
                          <PenSquare className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Past offers tab */}
            <TabsContent value="past">
              {pastOffers.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                  <History className="h-8 w-8 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No past offers</h3>
                  <p className="mt-2 text-muted-foreground">
                    You don't have any expired offers
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastOffers.map((offer) => (
                    <Card key={offer.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{offer.title}</CardTitle>
                          <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                            Expired
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {offer.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center">
                            <Tags className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="font-medium">{offer.discount}</span>
                          </div>
                          {offer.code && (
                            <div className="flex items-center">
                              <Clipboard className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{offer.code}</span>
                            </div>
                          )}
                          <div className="flex items-center col-span-2">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>
                              Ended: {offer.validUntil && formatDate(offer.validUntil)}
                            </span>
                          </div>
                          {offer.offerTypeID !== undefined && (
                            <div className="col-span-2 flex items-center mt-2 text-sm">
                              <span className="text-muted-foreground mr-2">Type:</span>
                              <span className="font-medium">
                                {offerTypes.find(t => t.id === offer.offerTypeID)?.label || `Type ${offer.offerTypeID}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-center pt-2 border-t">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedOffer(offer);
                            setDetailDialogOpen(true);
                          }}
                        >
                          <Clipboard className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
        
        {/* Offer Details Dialog */}
        {selectedOffer && (
          <OfferDetailDialog 
            isOpen={detailDialogOpen}
            onClose={() => {
              setDetailDialogOpen(false);
              setSelectedOffer(null);
            }}
            offer={selectedOffer}
          />
        )}
      </main>
    </div>
  );
}