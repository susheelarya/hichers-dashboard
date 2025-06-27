import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, RefreshCw, Clipboard, Calendar, Tags, PenSquare, Trash2, Clock, Timer, History, AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createOffer, getOffers, deleteOffer } from "@/lib/api";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import AuthenticatedLayout from './auth-layout';

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
  discount: z.string().optional(),
  cashDiscount: z.string().optional(),
  percentageDiscount: z.string().optional(),
  minimumSpend: z.string().optional(),
  itemsBuying: z.string().optional(),
  itemsFree: z.string().optional(),
  productName: z.string().optional(),
  whileStocksLast: z.boolean().default(false),
  code: z.string().optional(),
  validFrom: z.string({ required_error: "Valid from date is required" }),
  validUntil: z.string({ required_error: "Valid until date is required" }),
  isActive: z.boolean().default(true),
  copyFlag: z.boolean().default(false)
});

type OfferFormValues = z.infer<typeof offerSchema>;

export default function ManageOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedOfferType, setSelectedOfferType] = useState<number>(2); // Default to Percentage Discount
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Setup form with default values
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: "",
      description: "",
      offerTypeID: 2, // Default to Percentage Discount
      discount: "",
      cashDiscount: "",
      percentageDiscount: "",
      minimumSpend: "",
      itemsBuying: "",
      itemsFree: "",
      productName: "",
      whileStocksLast: false,
      code: "",
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      copyFlag: false
    }
  });
  
  // Function to fetch offers
  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const response = await getOffers();
      console.log("Fetched offers:", response);
      
      // Check if we received valid data
      if (response && response.offers) {
        setOffers(response.offers);
      } else if (response && Array.isArray(response)) {
        setOffers(response);
      } else {
        // If no valid data, show empty state
        setOffers([]);
        toast({
          title: "No offers found",
          description: "Create your first offer to get started",
        });
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast({
        title: "Failed to fetch offers",
        description: "Could not retrieve your offers. Please try again.",
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
      console.log("Creating offer with data:", data);
      
      // Ensure copyFlag is included in request as specified by API
      const requestData = {
        ...data,
        copyFlag: data.copyFlag || false
      };
      
      const response = await createOffer(requestData);
      console.log("Create offer response:", response);
      
      // Check the response format
      if (response && (response.success || response.offerID || response.id)) {
        toast({
          title: "Offer created",
          description: "Your offer has been created successfully",
        });
        
        // Close the dialog and refresh offers
        setCreateDialogOpen(false);
        form.reset();
        fetchOffers();
      } else {
        // Handle unexpected response format
        console.warn("Unexpected API response format:", response);
        toast({
          title: "Offer created",
          description: "Your offer was created, but there may have been an issue with the server response.",
        });
        setCreateDialogOpen(false);
        form.reset();
        fetchOffers();
      }
    } catch (error) {
      console.error("Error creating offer:", error);
      toast({
        title: "Failed to create offer",
        description: "Please check your input and try again",
        variant: "destructive",
      });
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
  
  // Function to handle ending an offer early
  const handleEndOfferEarly = async (offerId: string | number) => {
    if (window.confirm("Are you sure you want to end this offer early?")) {
      try {
        // For now, just delete it (will implement proper API in the future)
        await deleteOffer(offerId);
        toast({
          title: "Offer ended",
          description: "The offer has been ended early",
        });
        fetchOffers();
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
  
  return (
      <div className="container mx-auto px-4 py-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Offers</h1>
            <p className="text-muted-foreground">
              Create and manage special offers for your customers
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
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
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Create New Offer</DialogTitle>
                  <DialogDescription>
                    Create a special promotion or discount for your customers
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    
                    <FormField
                      control={form.control}
                      name="offerTypeID"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Offer Type</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              const typeId = parseInt(value);
                              field.onChange(typeId);
                              setSelectedOfferType(typeId);
                            }} 
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
                    
                    {/* Dynamic fields based on selected offer type */}
                    {selectedOfferType === 1 && (
                      // Buy One Get One
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="itemsBuying"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>No. Items Buying</FormLabel>
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
                              <FormLabel>No. Items Free</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g. 1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {selectedOfferType === 2 && (
                      // Percentage Discount
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="percentageDiscount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>% Off</FormLabel>
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

                    {selectedOfferType === 3 && (
                      // Cash Discount
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="cashDiscount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>£ Off</FormLabel>
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
                                <Input placeholder="e.g. SUMMER10" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {selectedOfferType === 4 && (
                      // Minimum Spend
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="minimumSpend"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum Spend</FormLabel>
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
                              <FormLabel>£ Off</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g. 10" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {selectedOfferType === 5 && (
                      // Multi Buy
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="itemsBuying"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>No. Items Buying</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g. 3" {...field} />
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
                              <FormLabel>No. Items Free</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g. 1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {selectedOfferType === 6 && (
                      // Flash Sales
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="percentageDiscount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>% Off</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g. 30" {...field} />
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
                                <Input placeholder="e.g. FLASH30" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

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
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="validFrom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valid From</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="validUntil"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valid Until</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
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
                      <Button type="submit">Create Offer</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <Tags className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No offers yet</h3>
            <p className="mt-2 text-muted-foreground">
              Create your first special offer to attract customers
            </p>
            <Button 
              className="mt-4" 
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create your first offer
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="present" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="present" className="flex gap-2 items-center">
                <Clock className="h-4 w-4" />
                Current
                {presentCount > 0 && (
                  <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {presentCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="future" className="flex gap-2 items-center">
                <Timer className="h-4 w-4" />
                Upcoming
                {futureCount > 0 && (
                  <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {futureCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="past" className="flex gap-2 items-center">
                <History className="h-4 w-4" />
                Past
                {pastCount > 0 && (
                  <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {pastCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            {/* Current offers tab */}
            <TabsContent value="present">
              {presentOffers.length === 0 && unknownStatusOffers.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No current offers</h3>
                  <p className="mt-2 text-muted-foreground">
                    You don't have any offers running at the moment
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
                              {offer.validFrom && formatDate(offer.validFrom)} - {offer.validUntil && formatDate(offer.validUntil)}
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
                          {offer.redemptionCount !== undefined && (
                            <div className="col-span-2 flex items-center justify-between mt-2 text-sm">
                              <span className="text-muted-foreground">Redemptions</span>
                              <span className="font-medium">{offer.redemptionCount}</span>
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
                          onClick={() => handleDeleteOffer(offer.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
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
                  <h3 className="mt-4 text-lg font-medium">No upcoming offers</h3>
                  <p className="mt-2 text-muted-foreground">
                    You don't have any scheduled offers coming up
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
                            Upcoming
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
                          onClick={() => handleDeleteOffer(offer.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
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
                          {offer.redemptionCount !== undefined && (
                            <div className="col-span-2 flex items-center justify-between mt-2 text-sm">
                              <span className="text-muted-foreground">Redemptions</span>
                              <span className="font-medium">{offer.redemptionCount}</span>
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
                          onClick={() => handleDeleteOffer(offer.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
  );
}