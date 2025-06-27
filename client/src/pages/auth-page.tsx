import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

// Validation schemas
const phoneLoginSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
});

const otpVerificationSchema = z.object({
  otp: z.string().min(4, "OTP must be at least 4 digits"),
});

interface OtpResponse {
  response: string;
  userID: number;
  otp: string;
}

type PhoneLoginFormValues = z.infer<typeof phoneLoginSchema>;
type OtpVerificationFormValues = z.infer<typeof otpVerificationSchema>;

export default function AuthPage() {
  const { toast } = useToast();
  const [step, setStep] = useState<'phone'>('phone');
  const [userID, setUserID] = useState<number | null>(null);
  const [phoneDetails, setPhoneDetails] = useState<{countryCode: string, mobileNumber: string} | null>(null);
  const [errorDialog, setErrorDialog] = useState<{open: boolean, title: string, message: string}>({
    open: false,
    title: '',
    message: ''
  });

  // Phone form
  const phoneForm = useForm<PhoneLoginFormValues>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: {
      phone: "",
    },
  });

  // OTP form
  const otpForm = useForm<OtpVerificationFormValues>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Function to make API call
  const callOtpApi = async (countryCode: string, mobileNumber: string, isResend = false) => {
    try {
      console.log(`${isResend ? "Resending" : "Sending"} OTP request:`, { countryCode, mobileNumber });
      
      const requestBody = { 
        countryCode: countryCode,
        mobileNumber: mobileNumber,
        webFlag: true
      };
      
      console.log('OTP API Request Body:', requestBody);
      
      // Make the API call to the Hichers API
      const response = await fetch('https://hichers-api-eight.vercel.app/api/v1/auth/generate-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('OTP API Response Status:', response.status);
      console.log('OTP API Response Headers:', Array.from(response.headers.entries()));
      
      if (!response.ok) {
        // Get the error response body for better debugging
        try {
          const errorBody = await response.text();
          console.error('API Error Response Body:', errorBody);
          
          // Try to parse as JSON for better error details
          try {
            const errorJson = JSON.parse(errorBody);
            console.error('Parsed Error JSON:', errorJson);
            
            // Extract user-friendly error message
            let userMessage = 'Failed to send OTP';
            if (errorJson.errors && errorJson.errors.length > 0 && errorJson.errors[0].message) {
              userMessage = errorJson.errors[0].message;
            } else if (errorJson.message) {
              userMessage = errorJson.message;
            }
            
            // Show user-friendly error in beautiful dialog
            setErrorDialog({
              open: true,
              title: "Authentication Error",
              message: userMessage
            });
            return false;
          } catch (parseError) {
            setErrorDialog({
              open: true,
              title: "Network Error",
              message: `Failed to send OTP - status: ${response.status}`
            });
            return false;
          }
        } catch (e) {
          console.error('Could not read error response body');
          setErrorDialog({
            open: true,
            title: "Network Error", 
            message: `Failed to send OTP - status: ${response.status}`
          });
          return false;
        }
      }
        
      const result = await response.json() as OtpResponse;
      console.log(`OTP ${isResend ? "Resend " : ""}API response:`, result);
      
      // Store the userID and phone details
      if (result.response === "Success" && result.userID) {
        setUserID(result.userID);
        setPhoneDetails({ countryCode, mobileNumber });
        console.log(`${isResend ? "Updated" : "Stored"} userID:`, result.userID);
        
        toast({
          title: isResend ? "OTP Resent" : "OTP Sent",
          description: `${isResend ? "A new OTP" : "OTP"} has been sent to ${countryCode} ${mobileNumber}`,
        });
        
        // Instead of showing the OTP input field in the same page,
        // store the data in localStorage and redirect to the dedicated OTP page
        localStorage.setItem('tempUserID', result.userID.toString());
        localStorage.setItem('tempPhoneDetails', JSON.stringify({ countryCode, mobileNumber }));
        
        // Redirect to OTP verification page
        if (!isResend) {
          window.location.href = '/verify-otp';
        }
        
        return true;
      } else {
        setErrorDialog({
          open: true,
          title: "Server Error",
          message: "Invalid response from server"
        });
        return false;
      }
    } catch (error) {
      console.error(`OTP ${isResend ? "resend " : ""}error:`, error instanceof Error ? error.message : String(error));
      setErrorDialog({
        open: true,
        title: "Connection Error",
        message: `Failed to ${isResend ? "resend" : "send"} OTP. Please check your connection and try again.`
      });
      return false;
    }
  };
  
  // Handle phone submission
  const onPhoneSubmit = async (data: PhoneLoginFormValues) => {
    console.log('Phone form submitted:', data);
    
    // For UK number 447753440910, split as +44 and 7753440910
    const phoneNumber = data.phone;
    const countryCode = '+44';
    const mobileNumber = phoneNumber.substring(2); // Remove the 44 prefix
    
    console.log('Sending to API - Country Code:', countryCode, 'Mobile Number:', mobileNumber);
    
    const result = await callOtpApi(countryCode, mobileNumber);
    
    if (result) {
      console.log('OTP sent successfully');
    } else {
      console.log('Failed to send OTP');
    }
  };

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

  // OTP verification is now handled in a separate page - otp-verification.tsx

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left side - Login Form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Welcome to Hichers</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your loyalty program dashboard
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Phone Login</CardTitle>
              <CardDescription>
                Enter your phone number to receive an OTP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...phoneForm}>
                <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                  <FormField
                    control={phoneForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <PhoneInput
                            country={'gb'}
                            value={field.value}
                            onChange={(phone) => field.onChange(phone)}
                            inputProps={{
                              name: 'phone',
                              required: true,
                              autoFocus: true
                            }}
                            containerStyle={{
                              width: '100%'
                            }}
                            inputStyle={{
                              width: '100%',
                              height: '40px',
                              fontSize: '16px',
                              paddingLeft: '48px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px'
                            }}
                            buttonStyle={{
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px 0 0 6px',
                              background: '#f8fafc'
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={phoneForm.formState.isSubmitting}
                  >
                    {phoneForm.formState.isSubmitting ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero Section */}
      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="mx-auto h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center mb-4">
              <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Boost Customer Loyalty
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Create powerful loyalty programs that keep customers coming back. Track rewards, manage points, and grow your business.
            </p>
          </div>
          
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">Points & Stamp-based rewards</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">Personalized recommendations</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">Customer behavior analytics</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">Multi-country support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Beautiful Error Dialog */}
      <AlertDialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-red-800">
                  {errorDialog.title}
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-gray-600 mt-4">
              {errorDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setErrorDialog(prev => ({ ...prev, open: false }))}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}