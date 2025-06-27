import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; 
import AuthenticatedLayout from './auth-layout';
import { Loader2, CheckCircle2 } from 'lucide-react';

// Test different auth formats to match Postman's auth style
const AUTH_FORMATS = {
  BEARER_PREFIX: 'Bearer {token}',
  NO_PREFIX: '{token}',
  LOWERCASE_BEARER: 'bearer {token}',
  AUTHORIZATION_HEADER: 'Authorization: Bearer {token}',
  NO_AUTHORIZATION_HEADER: 'No Authorization header',
};

// Pre-defined endpoints to test
const API_ENDPOINTS = {
  LOAD_OFFERS: '/offer/load-offers',
  OFFERS: '/offers',
  OFFER_OFFERS: '/offer/offers',
  GET_OFFERS: '/offer/get-offers',
  LIST_OFFERS: '/offer/list-offers',
};

export default function DebugAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [customHeaders, setCustomHeaders] = useState('');
  const [selectedAuthFormat, setSelectedAuthFormat] = useState(AUTH_FORMATS.BEARER_PREFIX);
  const [apiEndpoint, setApiEndpoint] = useState('/offer/load-offers');
  const [activeTab, setActiveTab] = useState("authentication");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Get token and userId from localStorage
    const storedToken = localStorage.getItem('hichersToken') || localStorage.getItem('token') || '';
    const storedUserId = localStorage.getItem('hichersUserID') || localStorage.getItem('userID') || '1';
    
    setToken(storedToken);
    setUserId(storedUserId);
  }, []);

  const testApiWithAuthFormat = async () => {
    setIsLoading(true);
    console.log('Testing API connectivity...');
    setSuccessMessage("");
    
    try {
      // Build headers based on selected format
      let headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Parse custom headers if provided
      if (customHeaders.trim()) {
        try {
          const parsedHeaders = JSON.parse(customHeaders);
          headers = { ...headers, ...parsedHeaders };
        } catch (e) {
          console.error('Failed to parse custom headers:', e);
          const headerLines = customHeaders.split('\n');
          headerLines.forEach(line => {
            if (line.includes(':')) {
              const [key, value] = line.split(':').map(part => part.trim());
              if (key && value) {
                headers[key] = value;
              }
            }
          });
        }
      }
      
      // Apply the selected auth format
      switch (selectedAuthFormat) {
        case AUTH_FORMATS.BEARER_PREFIX:
          headers['Authorization'] = `Bearer ${token}`;
          break;
        case AUTH_FORMATS.NO_PREFIX:
          headers['Authorization'] = token;
          break;
        case AUTH_FORMATS.LOWERCASE_BEARER:
          headers['Authorization'] = `bearer ${token}`;
          break;
        case AUTH_FORMATS.AUTHORIZATION_HEADER:
          headers['Authorization'] = `Bearer ${token}`;
          break;
        case AUTH_FORMATS.NO_AUTHORIZATION_HEADER:
          // Don't add Authorization header
          break;
      }
      
      const url = `https://hichers-api-eight.vercel.app/api/v1${apiEndpoint}${apiEndpoint.includes('?') ? '&' : '?'}userID=${userId}`;
      console.log(`Making request to: ${url}`);
      console.log('Headers:', headers);
      
      // Create payload for POST request
      const payload = {
        userID: parseInt(userId)
      };
      
      console.log('Using POST request with payload:', payload);
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      // Make the request with POST
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      // Try to get the response content
      let responseBody = '';
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType && contentType.includes('application/json')) {
          const json = await response.json();
          responseBody = JSON.stringify(json, null, 2);
        } else {
          responseBody = await response.text();
        }
      } catch (e) {
        responseBody = `Error parsing response: ${e}`;
      }
      
      if (response.ok) {
        setSuccessMessage(`Successfully connected to ${apiEndpoint}`);
        setActiveTab("results");
      }
      
      // Add result to list
      setResults(prev => [{
        endpoint: apiEndpoint,
        method: 'POST',
        authFormat: selectedAuthFormat,
        status: response.status,
        response: responseBody,
        timestamp: new Date().toISOString(),
        headers: JSON.stringify(headers, null, 2)
      }, ...prev]);
      
    } catch (error) {
      console.error('API test error:', error);
      
      setResults(prev => [{
        endpoint: apiEndpoint,
        method: 'GET',
        authFormat: selectedAuthFormat,
        status: 'Error',
        response: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Test multiple endpoints to find which ones work
  const testAllEndpoints = async () => {
    setIsLoading(true);
    console.log('Testing all API endpoints with POST requests...');
    setSuccessMessage("");
    
    try {
      // Build headers with Bearer token - the standard format 
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Create a future-dated offer to avoid validation errors (for POST requests)
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 6); // 6 hours in the future
      
      const validFromDate = futureDate.toISOString().split('T')[0].replace(/-/g, '/');
      const validFromHour = futureDate.getHours().toString().padStart(2, '0');
      const validFromMinute = futureDate.getMinutes().toString().padStart(2, '0');
      const validFromTime = `${validFromHour}:${validFromMinute}`;
      
      // End date is 30 days from now
      const validToDate = new Date(futureDate.getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0].replace(/-/g, '/');
    
      // Test payload for POST requests
      const payload = {
        userID: parseInt(userId),
        offerTypeID: 2, // Percentage discount
        offerName: "TEST_ENDPOINT_ONLY",
        validFromDate,
        validFromTime,
        validToDate,
        validToTime: "23:59",
        validfrom: `${validFromDate} ${validFromTime}`,
        validto: `${validToDate} 23:59`,
        percentageDiscount: "10",
        cashDiscount: "0",
        minSpend: "0",
        itemsBuy: "0",
        itemsFree: "0",
        offerPicture: "",
        offerInformation: "Test endpoint availability",
        predefined: false,
        editFlag: false,
        deleteFlag: false
      };
      
      // Test all predefined endpoints with both GET and POST methods
      for (const [name, endpoint] of Object.entries(API_ENDPOINTS)) {
        // Test with GET first
        try {
          const url = `https://hichers-api-eight.vercel.app/api/v1${endpoint}?userID=${userId}`;
          console.log(`Testing GET ${name} at ${url}`);
          
          // Create abort controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          // Make the GET request
          const response = await fetch(url, {
            method: 'GET',
            headers,
            signal: controller.signal,
          }).finally(() => clearTimeout(timeoutId));
          
          console.log(`GET ${name} response: ${response.status} ${response.statusText}`);
          
          // Try to get the response content
          let responseBody = '';
          try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const json = await response.json();
              responseBody = JSON.stringify(json, null, 2);
            } else {
              responseBody = await response.text();
            }
          } catch (e) {
            responseBody = `Error parsing response: ${e}`;
          }
          
          // Add to results
          setResults(prev => [{
            endpoint,
            method: 'GET',
            authFormat: 'Bearer {token}',
            status: response.status,
            response: responseBody,
            timestamp: new Date().toISOString(),
            headers: JSON.stringify(headers, null, 2)
          }, ...prev]);
          
          // If we got a successful response, update the UI
          if (response.ok) {
            setSuccessMessage(prev => prev + `\n✅ GET ${name} (${endpoint}) works!`);
            setApiEndpoint(endpoint);
            setActiveTab("results");
          }
        } catch (error) {
          console.error(`Error testing GET ${name}:`, error);
          
          setResults(prev => [{
            endpoint,
            method: 'GET',
            authFormat: 'Bearer {token}',
            status: 'Error',
            response: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
          }, ...prev]);
        }
        
        // Now test with POST
        try {
          const url = `https://hichers-api-eight.vercel.app/api/v1${endpoint}?userID=${userId}`;
          console.log(`Testing POST ${name} at ${url}`);
          console.log('With payload:', payload);
          
          // Create abort controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          // Make the POST request
          const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
            signal: controller.signal,
          }).finally(() => clearTimeout(timeoutId));
          
          console.log(`POST ${name} response: ${response.status} ${response.statusText}`);
          
          // Try to get the response content
          let responseBody = '';
          try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const json = await response.json();
              responseBody = JSON.stringify(json, null, 2);
            } else {
              responseBody = await response.text();
            }
          } catch (e) {
            responseBody = `Error parsing response: ${e}`;
          }
          
          // Add to results
          setResults(prev => [{
            endpoint,
            method: 'POST',
            authFormat: 'Bearer {token}',
            status: response.status,
            response: responseBody,
            timestamp: new Date().toISOString(),
            headers: JSON.stringify(headers, null, 2)
          }, ...prev]);
          
          // If we got a successful response, update the UI
          if (response.ok) {
            setSuccessMessage(prev => prev + `\n✅ POST ${name} (${endpoint}) works!`);
            setApiEndpoint(endpoint);
            setActiveTab("results");
          }
        } catch (error) {
          console.error(`Error testing POST ${name}:`, error);
          
          setResults(prev => [{
            endpoint,
            method: 'POST',
            authFormat: 'Bearer {token}',
            status: 'Error',
            response: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
          }, ...prev]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Test save offer endpoint
  const testSaveOffer = async () => {
    setIsLoading(true);
    console.log('Testing save-offer POST endpoint...');
    
    try {
      // Create a future-dated offer to avoid validation errors
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 6); // 6 hours in the future
      
      const validFromDate = futureDate.toISOString().split('T')[0].replace(/-/g, '/');
      const validFromHour = futureDate.getHours().toString().padStart(2, '0');
      const validFromMinute = futureDate.getMinutes().toString().padStart(2, '0');
      const validFromTime = `${validFromHour}:${validFromMinute}`;
      
      // End date is 30 days from now
      const validToDate = new Date(futureDate.getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0].replace(/-/g, '/');
      
      // Test payload
      const payload = {
        userID: parseInt(userId),
        offerTypeID: 2, // Percentage discount
        offerName: "TEST_CONNECTION_ONLY",
        validFromDate,
        validFromTime,
        validToDate,
        validToTime: "23:59",
        validfrom: `${validFromDate} ${validFromTime}`,
        validto: `${validToDate} 23:59`,
        percentageDiscount: "10",
        cashDiscount: "0",
        minSpend: "0",
        itemsBuy: "0",
        itemsFree: "0",
        offerPicture: "",
        offerInformation: "Test connection",
        predefined: false,
        editFlag: false,
        deleteFlag: false
      };
      
      console.log('Test POST payload:', payload);
      
      // Build headers based on selected format
      let headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Apply the selected auth format
      switch (selectedAuthFormat) {
        case AUTH_FORMATS.BEARER_PREFIX:
          headers['Authorization'] = `Bearer ${token}`;
          break;
        case AUTH_FORMATS.NO_PREFIX:
          headers['Authorization'] = token;
          break;
        case AUTH_FORMATS.LOWERCASE_BEARER:
          headers['Authorization'] = `bearer ${token}`;
          break;
        case AUTH_FORMATS.AUTHORIZATION_HEADER:
          headers['Authorization'] = `Bearer ${token}`;
          break;
        case AUTH_FORMATS.NO_AUTHORIZATION_HEADER:
          // Don't add Authorization header
          break;
      }
      
      // Parse custom headers if provided
      if (customHeaders.trim()) {
        try {
          const parsedHeaders = JSON.parse(customHeaders);
          headers = { ...headers, ...parsedHeaders };
        } catch (e) {
          console.error('Failed to parse custom headers:', e);
          const headerLines = customHeaders.split('\n');
          headerLines.forEach(line => {
            if (line.includes(':')) {
              const [key, value] = line.split(':').map(part => part.trim());
              if (key && value) {
                headers[key] = value;
              }
            }
          });
        }
      }
      
      const url = `https://hichers-api-eight.vercel.app/api/v1/offer/save-offer?userID=${userId}`;
      console.log(`Making POST request to: ${url}`);
      console.log('Headers:', headers);
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      // Make the POST request
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
      
      console.log('API POST response:', response.status, response.statusText);
      
      // Try to get the response content
      let responseBody = '';
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType && contentType.includes('application/json')) {
          const json = await response.json();
          responseBody = JSON.stringify(json, null, 2);
          console.log('JSON response:', responseBody);
        } else {
          responseBody = await response.text();
          console.log('Text response:', responseBody);
        }
      } catch (e) {
        responseBody = `Error parsing response: ${e}`;
        console.error('Error parsing response:', e);
      }
      
      console.log('Adding result to state...');
      
      // Add result to list - using a callback to make sure state is properly updated
      setResults((prevResults) => {
        console.log('Previous results:', prevResults.length);
        const newResults = [{
          endpoint: '/offer/save-offer',
          method: 'POST',
          authFormat: selectedAuthFormat,
          status: response.status,
          response: responseBody || `Status: ${response.status} ${response.statusText}`,
          timestamp: new Date().toISOString(),
          headers: JSON.stringify(headers, null, 2)
        }, ...prevResults];
        
        console.log('New results:', newResults.length);
        return newResults;
      });
      
    } catch (error) {
      console.error('API POST test error:', error);
      
      setResults(prev => [{
        endpoint: '/offer/save-offer',
        method: 'POST',
        authFormat: selectedAuthFormat,
        status: 'Error',
        response: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthenticatedLayout>
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">API Authentication Debug Tool</h1>
        <p className="text-muted-foreground">
          Test different authentication formats to match Postman's configuration
        </p>
      </header>
      
      <Tabs defaultValue="authentication" className="mb-8">
        <TabsList>
          <TabsTrigger value="authentication">Authentication Test</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="authentication">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
                <CardDescription>Configure API authentication format</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="token">Authentication Token</Label>
                  <Textarea 
                    id="token" 
                    value={token} 
                    onChange={(e) => setToken(e.target.value)}
                    className="font-mono text-xs h-20"
                    placeholder="Enter authentication token"
                  />
                </div>
                
                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <Input 
                    id="userId" 
                    value={userId} 
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter user ID"
                  />
                </div>
                
                <div>
                  <Label htmlFor="authFormat">Authorization Format</Label>
                  <select 
                    id="authFormat"
                    className="w-full p-2 border rounded"
                    value={selectedAuthFormat}
                    onChange={(e) => setSelectedAuthFormat(e.target.value)}
                  >
                    {Object.entries(AUTH_FORMATS).map(([key, value]) => (
                      <option key={key} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="apiEndpoint">API Endpoint</Label>
                  <Input 
                    id="apiEndpoint" 
                    value={apiEndpoint} 
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    placeholder="/offer/load-offers"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter endpoint path without base URL or query parameters
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="customHeaders">Additional Headers (optional)</Label>
                  <Textarea 
                    id="customHeaders" 
                    value={customHeaders} 
                    onChange={(e) => setCustomHeaders(e.target.value)}
                    className="font-mono text-xs h-20"
                    placeholder={`{\n  "Custom-Header": "Value"\n}`}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter as JSON object or "Key: Value" pairs, one per line
                  </p>
                </div>
                
                <div className="space-y-4 pt-4">
                  <Button 
                    onClick={testApiWithAuthFormat} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : 'Test Selected Endpoint'}
                  </Button>
                  
                  <Button 
                    onClick={testAllEndpoints} 
                    disabled={isLoading}
                    variant="secondary"
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing All Endpoints...
                      </>
                    ) : 'Test ALL Endpoints'}
                  </Button>
                  
                  <Button 
                    onClick={testSaveOffer} 
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing POST...
                      </>
                    ) : 'Test Save Offer (POST)'}
                  </Button>
                  
                  {successMessage && (
                    <Alert className="mt-4 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Success!</AlertTitle>
                      <AlertDescription className="text-green-700 whitespace-pre-line">
                        {successMessage}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Reference for Postman</CardTitle>
                <CardDescription>Common Postman authentication formats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Postman Authorization Types</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <strong>Bearer Token</strong>: In Postman, this adds "Bearer" prefix automatically
                    </li>
                    <li>
                      <strong>API Key</strong>: Adds the token as a custom header without "Bearer" prefix
                    </li>
                    <li>
                      <strong>No Auth</strong>: No authorization header is sent
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">Debug Recommendations</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Try with and without the "Bearer" prefix</li>
                    <li>Check for case sensitivity in "bearer" vs "Bearer"</li>
                    <li>Verify the token value matches exactly what Postman uses</li>
                    <li>Try adding raw headers exactly as seen in Postman's "Headers" tab</li>
                  </ul>
                </div>
                
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-2">Example Headers from Postman</p>
                  <pre className="text-xs overflow-x-auto">
{`Content-Type: application/json
Authorization: Bearer eyJhbGci...
Accept: */*
Connection: keep-alive`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>View the results of API tests</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No tests run yet. Click a test button to begin.
                </p>
              ) : (
                <div className="space-y-6">
                  {results.map((result, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="font-medium text-lg">
                            {result.method} {result.endpoint}
                          </span>
                          <div className="text-sm text-muted-foreground mt-1">
                            Auth: {result.authFormat || 'N/A'}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          result.status === 200 ? 'bg-green-100 text-green-800' :
                          result.status === 404 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {result.status}
                        </span>
                      </div>
                      
                      {result.headers && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium mb-1">Request Headers</h4>
                          <div className="bg-muted p-2 rounded-md overflow-x-auto">
                            <pre className="text-xs">{result.headers}</pre>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Response</h4>
                        <div className="bg-muted p-2 rounded-md overflow-x-auto">
                          <pre className="text-xs">{result.response}</pre>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(result.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </AuthenticatedLayout>
  );
}