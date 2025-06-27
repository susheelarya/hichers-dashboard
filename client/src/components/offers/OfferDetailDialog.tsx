import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Tags, Clipboard, Check, X, Clock } from "lucide-react";
import { viewOffer } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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

interface OfferDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  offer: Offer;
}

interface DetailedOfferResponse {
  // Fields returned by the view-offer API
  offer?: {
    offertypeid: number;
    offerid: number;
    description: string;
    validfromdate: string;
    validtodate: string;
    validfromtime: string;
    validtotime: string;
    mapid: number;
    expireflag: boolean;
    timestatus: string;
    
    // Statistics fields
    scannedcount?: number;
    clickcount?: number;
    redemptioncount?: number;
    conversionrate?: number;
    
    // Metadata fields
    createddate?: string;
    modifieddate?: string;
    createduserid?: number;
    modifieduserid?: number;
    
    // Offer details fields
    offertitle?: string;
    offerdescription?: string;
    offertypename?: string;
    code?: string;
    discount?: string;
    expirereason?: string;
    
    // Business fields
    businessid?: number;
    businessname?: string;
    
    // Any other fields that might come in the response
    [key: string]: any;
  };
  
  // Allow for any structure in the API response
  [key: string]: any;
}

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export default function OfferDetailDialog({ isOpen, onClose, offer }: OfferDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [detailedOffer, setDetailedOffer] = useState<DetailedOfferResponse | null>(null);
  const { toast } = useToast();
  
  // Function to load offer details
  const loadOfferDetails = async () => {
    if (!offer.id || !offer.mapID) {
      toast({
        title: "Error",
        description: "Missing offer information",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await viewOffer(offer.id, offer.mapID);
      setDetailedOffer(response);
    } catch (error) {
      console.error("Failed to load offer details:", error);
      toast({
        title: "Error",
        description: "Failed to load offer details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Load offer details when dialog opens
  const handleDialogOpenChange = (open: boolean) => {
    if (open && !detailedOffer) {
      loadOfferDetails();
    }
    if (!open) {
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{offer.title}</DialogTitle>
          <DialogDescription>
            Offer details and statistics
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">Start Date</span>
                  <span className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formatDate(offer.validFrom)}
                  </span>
                  {offer.validFromTime && (
                    <span className="text-xs text-muted-foreground ml-6">
                      {offer.validFromTime}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">End Date</span>
                  <span className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formatDate(offer.validUntil)}
                  </span>
                  {offer.validUntilTime && (
                    <span className="text-xs text-muted-foreground ml-6">
                      {offer.validUntilTime}
                    </span>
                  )}
                </div>
              </div>
              
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
              
              <div className="text-sm text-muted-foreground border-t pt-3 mt-3">
                <h4 className="font-medium text-foreground mb-2">Description</h4>
                <p>{offer.description}</p>
              </div>
              
              {detailedOffer && detailedOffer.offer && (
                <div className="border-t pt-3 mt-3">
                  <h4 className="font-medium mb-2">Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {detailedOffer.offer.scannedcount !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Views/Scans</span>
                        <p className="font-medium">{detailedOffer.offer.scannedcount}</p>
                      </div>
                    )}
                    {detailedOffer.offer.clickcount !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Clicks</span>
                        <p className="font-medium">{detailedOffer.offer.clickcount}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Status</span>
                      <p className="font-medium flex items-center">
                        {offer.timeStatus === 'past' || offer.timeStatus === 'PAST' ? (
                          <>
                            <X className="h-4 w-4 mr-1 text-red-500" />
                            Expired
                          </>
                        ) : offer.timeStatus === 'present' || offer.timeStatus === 'PRESENT' ? (
                          <>
                            <Check className="h-4 w-4 mr-1 text-green-500" />
                            Active
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 mr-1 text-blue-500" />
                            Scheduled
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created On</span>
                      <p className="font-medium">{detailedOffer.offer.createddate ? formatDate(detailedOffer.offer.createddate) : formatDate(offer.createdAt || '')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onClose()}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}