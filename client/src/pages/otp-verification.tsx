import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link, useLocation } from "wouter";

// OTP verification schema
const otpVerificationSchema = z.object({
  otp: z.string().min(4, {
    message: "OTP must be at least 4 digits",
  }),
});

// Interface for OTP validation response
interface OtpValidationResponse {
  response: string;
  token: string;
  user: {
    id: number;
    fullname: string | null;
    mobilenumber: string;
    countrycode: string;
    businessname: string | null;
    // ... other user properties as needed
  };
}

type OtpVerificationFormValues = z.infer<typeof otpVerificationSchema>;

export default function OtpVerificationPage() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [userID, setUserID] = useState<number | null>(null);
  const [phoneDetails, setPhoneDetails] = useState<{countryCode: string, mobileNumber: string} | null>(null);

  // OTP form
  const otpForm = useForm<OtpVerificationFormValues>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Load saved user data from localStorage on component mount
  useEffect(() => {
    const storedUserID = localStorage.getItem('tempUserID');
    const storedPhoneDetails = localStorage.getItem('tempPhoneDetails');
    
    if (storedUserID) {
      setUserID(parseInt(storedUserID, 10));
    }
    
    if (storedPhoneDetails) {
      try {
        setPhoneDetails(JSON.parse(storedPhoneDetails));
      } catch (e) {
        console.error("Error parsing phone details:", e);
      }
    }
    
    // If no userID is found, redirect back to auth page
    if (!storedUserID) {
      toast({
        title: "Error",
        description: "Missing user information. Please try again.",
        variant: "destructive",
      });
      setLocation("/auth");
    }
  }, [toast, setLocation]);

  // Function to validate OTP with retry
  const validateOtp = async (otp: string, userId: number): Promise<OtpValidationResponse> => {
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      attempts++;
      try {
        // API expects userID as a string
        const userIdString = userId.toString();
        
        console.log(`Validating OTP (attempt ${attempts}/${maxAttempts}):`, { otp, userID: userIdString });
        
        // Make the API call to the Hichers API validation endpoint
        const response = await fetch('https://hichers-api-eight.vercel.app/api/v1/auth/validate-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userID: userIdString, // Make sure to use the string version
            otp: otp
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to validate OTP - status: ${response.status}`);
        }
        
        const result = await response.json() as OtpValidationResponse;
        console.log(`OTP Validation API response:`, result);
        
        if (result.response === "OTP matched") {
          return result;
        } else {
          throw new Error(`Invalid OTP response from server: ${result.response}`);
        }
      } catch (error) {
        console.error(`OTP validation error (attempt ${attempts}/${maxAttempts}):`, 
                      error instanceof Error ? error.message : String(error));
        console.error(`Full validation error object:`, error);
        
        // If we have more attempts, try again after a delay
        if (attempts < maxAttempts) {
          console.log(`Retrying validation in 1 second... (attempt ${attempts + 1}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          // We've exhausted our attempts
          throw error;
        }
      }
    }
    
    throw new Error('Failed to validate OTP after multiple attempts');
  };
  
  // Handle OTP verification form submission
  const onOtpSubmit = async (data: OtpVerificationFormValues) => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      // Verify the OTP
      console.log("Verifying OTP:", data.otp);
      
      if (!userID) {
        throw new Error('Missing user information. Please try again.');
      }
      
      // Call the validation endpoint with the OTP and userID
      const validationResult = await validateOtp(data.otp, userID);
      
      if (validationResult && validationResult.token) {
        // Store the userID and token in localStorage for future API calls
        // Use the correct storage keys that match what our API functions are looking for
        localStorage.setItem('userID', userID.toString());
        localStorage.setItem('token', validationResult.token);
        // Also store with hichers prefix for consistency with other functions
        localStorage.setItem('hichersUserID', userID.toString());
        localStorage.setItem('hichersToken', validationResult.token);
        
        // Store user info if needed
        if (validationResult.user) {
          localStorage.setItem('userInfo', JSON.stringify(validationResult.user));
        }
        
        // Clean up temporary storage
        localStorage.removeItem('tempUserID');
        localStorage.removeItem('tempPhoneDetails');
        
        toast({
          title: "Success",
          description: "Successfully logged in!",
        });
        
        // Redirect to dashboard or home page
        setLocation("/");
      } else {
        throw new Error('OTP validation failed - no token received');
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast({
        title: "Error",
        description: "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle resending OTP
  const handleResendOTP = async () => {
    if (!phoneDetails) {
      toast({
        title: "Error",
        description: "Phone details missing. Please go back and try again.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Resending OTP:", phoneDetails);
      
      // Make API call to resend OTP
      const response = await fetch('https://hichers-api-eight.vercel.app/api/v1/auth/generate-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          countryCode: phoneDetails.countryCode,
          mobileNumber: phoneDetails.mobileNumber,
          webFlag: true
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to resend OTP - status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.response === "Success" && result.userID) {
        setUserID(result.userID);
        localStorage.setItem('tempUserID', result.userID.toString());
        
        toast({
          title: "OTP Resent",
          description: `A new OTP has been sent to ${phoneDetails.countryCode} ${phoneDetails.mobileNumber}`,
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Login Form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">OTP Verification</CardTitle>
            <CardDescription className="text-center">
              Enter the OTP sent to your phone
              {phoneDetails && 
                <div className="mt-1 font-medium">
                  {phoneDetails.countryCode} {phoneDetails.mobileNumber}
                </div>
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Enter OTP</FormLabel>
                      <FormControl>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Enter OTP" 
                          value={field.value}
                          onChange={(e) => {
                            // Only allow numbers
                            const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(onlyNums);
                          }}
                          onBlur={field.onBlur}
                          className="w-full h-12 px-3 py-2 border border-border rounded-md text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          maxLength={6}
                          autoComplete="one-time-code"
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-between items-center">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setLocation("/auth")}
                    className="text-sm"
                  >
                    Change Number
                  </Button>
                  <Button 
                    type="button" 
                    variant="link" 
                    className="text-sm"
                    onClick={handleResendOTP}
                    disabled={loading}
                  >
                    Resend OTP
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign Up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Right side - Hero / Brand */}
      <div className="hidden md:flex flex-1 bg-gradient-to-b from-primary/5 to-primary/10 p-10 items-center justify-center">
        <div className="max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Rewarding Loyalty Made Simple
            </h1>
            <p className="text-lg">
              Create, manage and grow customer loyalty with our comprehensive platform
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Secure Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  OTP verification for safe and easy login
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}