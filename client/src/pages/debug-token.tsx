import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function DebugTokenPage() {
  const { toast } = useToast();
  const [token, setToken] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [storedToken, setStoredToken] = useState<string | null>(null);
  const [storedUserId, setStoredUserId] = useState<string | null>(null);
  const [hichersToken, setHichersToken] = useState<string | null>(null);
  const [hichersUserId, setHichersUserId] = useState<string | null>(null);
  
  // Load saved values from localStorage on component mount
  useEffect(() => {
    // Regular tokens
    const savedToken = localStorage.getItem('token');
    const savedUserId = localStorage.getItem('userID');
    
    // Hichers-prefixed tokens
    const savedHichersToken = localStorage.getItem('hichersToken');
    const savedHichersUserId = localStorage.getItem('hichersUserID');
    
    setStoredToken(savedToken);
    setStoredUserId(savedUserId);
    setHichersToken(savedHichersToken);
    setHichersUserId(savedHichersUserId);
    
    // Pre-fill the form with stored values
    if (savedToken) setToken(savedToken);
    if (savedUserId) setUserId(savedUserId);
  }, []);
  
  const handleSaveToken = () => {
    if (!token.trim()) {
      toast({
        title: "Error",
        description: "Token cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    // Save to both regular and hichers-prefixed keys
    localStorage.setItem('token', token);
    localStorage.setItem('hichersToken', token);
    
    // Update stored values
    setStoredToken(token);
    setHichersToken(token);
    
    toast({
      title: "Success",
      description: "Token saved successfully"
    });
  };
  
  const handleSaveUserId = () => {
    if (!userId.trim()) {
      toast({
        title: "Error",
        description: "User ID cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    // Save to both regular and hichers-prefixed keys
    localStorage.setItem('userID', userId);
    localStorage.setItem('hichersUserID', userId);
    
    // Update stored values
    setStoredUserId(userId);
    setHichersUserId(userId);
    
    toast({
      title: "Success",
      description: "User ID saved successfully"
    });
  };
  
  const handleClearStorage = () => {
    // Clear all authentication related items
    localStorage.removeItem('token');
    localStorage.removeItem('userID');
    localStorage.removeItem('hichersToken');
    localStorage.removeItem('hichersUserID');
    localStorage.removeItem('userInfo');
    
    // Reset state
    setStoredToken(null);
    setStoredUserId(null);
    setHichersToken(null);
    setHichersUserId(null);
    setToken('');
    setUserId('');
    
    toast({
      title: "Storage Cleared",
      description: "All authentication data has been removed"
    });
  };
  
  const [customEndpoint, setCustomEndpoint] = useState<string>('https://hichers-api-eight.vercel.app/api/v1/offer/get-offers');
  const [endpointHistory, setEndpointHistory] = useState<{url: string, status: number, authType?: string}[]>([]);

  // Function to test multiple endpoint variations
  const testMultipleEndpoints = async () => {
    const possibleEndpoints = [
      'https://hichers-api-eight.vercel.app/api/v1/offer/get-offers',
      'https://hichers-api-eight.vercel.app/api/v1/offer/load-offers',
      'https://hichers-api-eight.vercel.app/api/v1/offer/read-offers',
      'https://hichers-api-eight.vercel.app/api/v1/offer/fetch-offers',
      'https://hichers-api-eight.vercel.app/api/v1/offer/list-offers',
      'https://hichers-api-eight.vercel.app/api/v1/offer/offers',
      'https://hichers-api-eight.vercel.app/api/v1/offers/get-offers',
      'https://hichers-api-eight.vercel.app/api/v1/offers',
    ];
    
    // Different auth header formats to try - only include the ones we need
    const authFormats = [
      { name: 'Bearer Token', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } },
      { name: 'Token Only', headers: { 'Content-Type': 'application/json', 'Authorization': token } },
      { name: 'token param', headers: { 'Content-Type': 'application/json' }, urlParam: `&token=${token}` },
      { name: 'No Auth', headers: { 'Content-Type': 'application/json' } }
    ];
    
    const newHistory: {url: string, status: number, authType: string}[] = [];
    
    toast({
      title: "Testing Multiple Combinations",
      description: `Testing ${possibleEndpoints.length * authFormats.length} combinations. Please wait...`
    });
    
    // Flag to stop all tests once we find a working combination
    let foundWorking = false;
    
    for (const authFormat of authFormats) {
      if (foundWorking) break;
      
      for (const endpoint of possibleEndpoints) {
        if (foundWorking) break;
        
        try {
          // Add userID parameter if needed
          let url = endpoint.includes('?') 
            ? `${endpoint}&userID=${userId || '1'}`
            : `${endpoint}?userID=${userId || '1'}`;
          
          // Add extra URL params if this auth format uses them
          if (authFormat.urlParam) {
            url += authFormat.urlParam;
          }
          
          console.log(`Testing endpoint with ${authFormat.name}:`, url);
          
          // Make API call with the headers directly from the auth format
          const response = await fetch(url, {
            method: 'GET',
            headers: authFormat.headers
          });
          
          const status = response.status;
          console.log(`Endpoint ${url} with ${authFormat.name} returned status ${status}`);
          
          newHistory.push({ url, status, authType: authFormat.name });
          
          // If we find a successful endpoint, stop and use it
          if (response.ok) {
            setCustomEndpoint(endpoint);
            toast({
              title: "Success",
              description: `Found working combination: ${endpoint} with ${authFormat.name} (Status: ${status})`
            });
            foundWorking = true;
            break;
          }
        } catch (error) {
          console.error(`Error testing endpoint ${endpoint} with ${authFormat.name}:`, error);
          newHistory.push({ url: endpoint, status: 0, authType: authFormat.name }); // Use 0 to indicate connection error
        }
      }
    }
    
    setEndpointHistory(newHistory);
    
    // If all tests failed
    if (!newHistory.some(item => item.status >= 200 && item.status < 300)) {
      toast({
        title: "All Tests Failed",
        description: "None of the tested endpoints returned a successful response",
        variant: "destructive"
      });
    }
  };

  const handleTestApiConnection = async () => {
    toast({
      title: "Testing API Connection",
      description: "Please wait..."
    });
    
    try {
      // Add userID parameter if needed
      const url = customEndpoint.includes('?') 
        ? `${customEndpoint}&userID=${userId || '1'}`
        : `${customEndpoint}?userID=${userId || '1'}`;

      console.log('Testing API connection to:', url);
      console.log('Using token:', token.substring(0, 20) + '...');
      
      // Make API call to test connection
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const statusText = `Status: ${response.status} ${response.statusText}`;
      console.log('API test response:', statusText);
      
      let responseText = '';
      try {
        responseText = await response.text();
        console.log('API response body:', responseText);
      } catch (e) {
        responseText = 'Could not read response body';
      }
      
      if (response.ok) {
        toast({
          title: "API Connection Successful",
          description: statusText
        });
      } else {
        toast({
          title: "API Error",
          description: `${statusText}. See console for details.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('API test error:', error);
      toast({
        title: "API Connection Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Auth Debug & Token Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Storage Values */}
          <div className="bg-secondary/50 p-4 rounded-md">
            <h3 className="font-medium mb-2">Current Storage Values:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">token:</p>
                <p className="text-sm break-all bg-background p-2 rounded">
                  {storedToken || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">userID:</p>
                <p className="text-sm break-all bg-background p-2 rounded">
                  {storedUserId || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">hichersToken:</p>
                <p className="text-sm break-all bg-background p-2 rounded">
                  {hichersToken || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">hichersUserID:</p>
                <p className="text-sm break-all bg-background p-2 rounded">
                  {hichersUserId || 'Not set'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Token Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">JWT Token</Label>
              <Input 
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter JWT token"
              />
              <Button onClick={handleSaveToken}>Save Token</Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input 
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID"
              />
              <Button onClick={handleSaveUserId}>Save User ID</Button>
            </div>
            
            {/* API Endpoint Testing */}
            <div className="space-y-2 mt-6 pt-4 border-t">
              <Label htmlFor="customEndpoint">API Endpoint</Label>
              <Input 
                id="customEndpoint"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="Enter API endpoint URL"
              />
              
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <Button variant="secondary" onClick={handleTestApiConnection}>
                    Test Single Endpoint
                  </Button>
                  <Button variant="default" onClick={testMultipleEndpoints}>
                    Test All Endpoints
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Testing endpoint: {customEndpoint}?userID={userId || '1'}
                </div>
              </div>
            </div>
            
            {/* Endpoint Test Results */}
            {endpointHistory.length > 0 && (
              <div className="space-y-2 mt-4 border-t pt-4">
                <h3 className="font-medium">Endpoint Test Results:</h3>
                <div className="bg-muted p-2 rounded text-xs space-y-1 max-h-40 overflow-y-auto">
                  {endpointHistory.map((item, index) => (
                    <div key={index} className={`grid grid-cols-12 gap-1 p-1 rounded ${
                      item.status >= 200 && item.status < 300 ? 'bg-green-100 text-green-800' : 
                      item.status === 0 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      <span className="truncate col-span-7 mr-1">{item.url}</span>
                      <span className="font-medium col-span-3 whitespace-nowrap">{item.authType || 'Bearer Token'}</span>
                      <span className="font-medium col-span-2 text-right whitespace-nowrap">{
                        item.status === 0 ? 'Error' : `Status: ${item.status}`
                      }</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={handleClearStorage}>
                Clear All Auth Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}