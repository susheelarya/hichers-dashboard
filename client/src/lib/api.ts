/**
 * API Utility functions for Hichers services
 */

// API response types
interface ApiOfferResponse {
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
}

// Base URL for the Hichers API
const baseUrl = 'https://hichers-api-eight.vercel.app/api/v1';

/**
 * Makes an authenticated API request to the Hichers backend
 * @param endpoint The API endpoint (without the base URL)
 * @param method HTTP method (GET, POST, PUT, DELETE)
 * @param data Optional data to send with the request
 * @returns Promise with the response data
 */
export async function fetchFromAPI(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', 
  data?: any
): Promise<any> {
  const token = localStorage.getItem('token'); // Token is stored simply as 'token'
  const userID = localStorage.getItem('userID');
  
  // Skip token check for auth endpoints
  if (!token && endpoint !== '/auth/generate-otp' && endpoint !== '/auth/validate-otp') {
    console.error('Authentication required - no token found');
    throw new Error('Authentication required');
  }
  
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log(`Adding token to request: Bearer ${token.substring(0, 15)}...`);
    }
    
    const options: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };
    
    // Add body if data is provided and method is not GET
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    // Determine if we need to add userID as a parameter
    let url = `${baseUrl}/${endpoint}`;
    
    // If endpoint requires userID and we have userID stored
    const storedUserID = localStorage.getItem('userID'); // Fix the key name
    if (storedUserID && (
        endpoint.includes('/loyalty/') || 
        endpoint.includes('/customer/') ||
        endpoint.includes('/business/') ||
        endpoint.includes('/offer/')
    )) {
      // Special case for offer/create-offer endpoint
      if (endpoint === '/offer/create-offer' && method === 'POST') {
        // Always include userID in body for create-offer
        if (data) {
          data.userID = parseInt(storedUserID);
          console.log(`Adding userID to create-offer payload:`, data);
        } else {
          data = { userID: parseInt(storedUserID) };
        }
        
        // Don't add userID as query param for this specific endpoint
      } else {
        // For all other endpoints, add as query param
        const userIdParam = url.includes('?') ? '&userID=' : '?userID=';
        url += `${userIdParam}${storedUserID}`;
        console.log(`Adding userID to request URL: ${storedUserID}`);
      }
    } else if (
      endpoint.includes('/loyalty/') || 
      endpoint.includes('/customer/') || 
      endpoint.includes('/business/') ||
      endpoint.includes('/offer/')
    ) {
      console.warn('Endpoint requires userID but none was found in localStorage');
    }
    
    console.log(`Making API request to: ${url}`);
    
    // Add better error handling around the fetch call with a timeout
    let response;
    try {
      // Add a timeout to prevent hanging fetch requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      // Add the abort signal to our options
      options.signal = controller.signal;
      
      // Attempt the fetch with a timeout
      response = await fetch(url, options).finally(() => clearTimeout(timeoutId));
      
      // Log response status
      console.log(`API response status: ${response.status} ${response.statusText}`);
    } catch (error) {
      // Safe handling of unknown error type
      console.error("Network error during fetch:", error);
      
      // Type guard to check for AbortError
      const isAbortError = error instanceof Error && error.name === 'AbortError';
      
      // Check if this was a timeout
      if (isAbortError) {
        console.error('Request timed out after 15 seconds');
        // For some endpoints, we want to handle timeouts gracefully
        if (url.includes('/offer/') || url.includes('/loyalty/')) {
          console.warn('Treating API timeout as unsuccessful but non-fatal');
          return { error: "API timeout", success: false };
        }
        throw new Error("API request timed out. The server is taking too long to respond.");
      }
      
      // For other network errors
      throw new Error("Network error: Could not connect to API server");
    }
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API error response body:', errorBody);
      
      let errorObj;
      try {
        errorObj = JSON.parse(errorBody);
      } catch (e) {
        errorObj = { message: errorBody || 'Unknown error' };
      }
      
      throw new Error(errorObj.message || errorObj.errors?.[0]?.message || `HTTP error! status: ${response.status}`);
    }
    
    try {
      // Try to parse the response as JSON
      const responseData = await response.json();
      console.log('API response data (parsed):', responseData);
      
      // For the load-offers endpoint, check for the specific response format we received
      if (endpoint === '/offer/load-offers' && responseData.response && Array.isArray(responseData.response)) {
        console.log('Detected offers in response.response array, will map in getOffers function');
      }
      
      return responseData;
    } catch (error) {
      // If the response isn't valid JSON, handle it as text
      console.error('Failed to parse response as JSON:', error);
      const textResponse = await response.text();
      console.log('Response as text:', textResponse);
      
      // Try to handle non-JSON responses gracefully
      if (textResponse.trim() === '') {
        console.log('Empty response received, returning empty object');
        return {};
      }
      
      // For some endpoints, an empty or non-JSON response might be acceptable
      if (endpoint.includes('/offer/')) {
        console.log('Non-JSON response for offers endpoint, handling gracefully');
        return { success: true, message: textResponse };
      }
      
      throw new Error('Invalid JSON response from API');
    }
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Get all loyalty programs for the authenticated user/business
 */
export async function getLoyaltyPrograms() {
  // Get the user ID from localStorage - prioritize hichersUserID
  const userID = localStorage.getItem('hichersUserID') || localStorage.getItem('userID') || '1';
  
  console.log(`Fetching loyalty programs for userID: ${userID}`);
  
  // Similar to getOffers, we need to make a direct API call with very specific parameters
  const token = localStorage.getItem('hichersToken') || localStorage.getItem('token');
  
  if (!token) {
    console.error('No authentication token available for load-loyalty-scheme');
    return { loyaltySchemes: [] };
  }
  
  try {
    // Make a direct API call with proper parameters - use a GET request with userID as query param
    const url = `https://hichers-api-eight.vercel.app/api/v1/loyalty/load-loyalty-scheme?userID=${userID}`;
    console.log('Making direct API call to:', url);
    
    // Headers with Bearer token authorization
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    // Make the API call with GET
    console.log('Sending GET request for loyalty schemes');
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    console.log('Load loyalty schemes response status:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      
      console.error(`Load loyalty schemes API error (${response.status}): ${errorText}`);
      return [];
    }
    
    // Parse response
    const responseData = await response.json();
    console.log('Raw loyalty schemes response:', JSON.stringify(responseData, null, 2));
    
    // Return the data array directly for consistency with Profile page expectations
    return responseData.data || [];
  } catch (error) {
    console.error('Network error during load-loyalty-schemes fetch:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    // Return empty array instead of throwing
    return [];
  }
}

/**
 * Get customer data for the authenticated business
 */
export async function getCustomers() {
  return fetchFromAPI('/customers');
}

/**
 * Get business metrics and statistics
 */
export async function getBusinessMetrics() {
  return fetchFromAPI('/business/metrics');
}

/**
 * Get a specific loyalty program by ID
 */
export async function getLoyaltyProgramById(programId: string | number) {
  return fetchFromAPI(`/loyalty-programs/${programId}`);
}

/**
 * Create a new loyalty program
 */
export async function createLoyaltyProgram(programData: any) {
  // Get authentication tokens
  const token = localStorage.getItem('hichersToken');
  const userID = localStorage.getItem('hichersUserID') || '1';

  if (!token) {
    console.error('No authentication token available for save-loyalty-scheme');
    throw new Error('Authentication required. Please log in again.');
  }

  try {
    // Debug log tokens
    console.log('Using userID:', userID);
    console.log('Auth token available:', token ? 'Yes' : 'No');
    
    // Prepare the API endpoint with the correct path
    const url = `https://hichers-api-eight.vercel.app/api/v1/loyalty/save-loyalty-scheme`;
    console.log('Creating loyalty scheme at:', url);
    
    // Headers with Bearer token authorization
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    // Make sure the userID is explicitly in the payload and properly formatted
    const payload = {
      ...programData,
      userID: parseInt(userID),
    };
    
    console.log('Creating loyalty scheme with payload:', payload);
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
    
    try {
      console.log('About to make fetch request with these details:');
      console.log('URL:', url);
      console.log('Headers:', JSON.stringify(headers, null, 2).replace(token, '[REDACTED]'));
      console.log('Payload:', JSON.stringify(payload, null, 2));
      
      // Make the API call
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      }).catch(err => {
        console.error('Raw fetch error:', err);
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        throw err;
      });
      
      // Clear timeout immediately
      clearTimeout(timeoutId);
      
      console.log('Save loyalty scheme response status:', response.status, response.statusText);
      
      // Handle different response status cases
      if (response.status === 401) {
        console.error('Authentication error: Token expired or invalid');
        throw new Error('Your session has expired. Please log in again.');
      }
      
      // Try to get response text regardless of status code
      let responseText = '';
      try {
        responseText = await response.text();
        console.log('Response text:', responseText);
      } catch (e) {
        console.error('Could not read response text:', e);
      }
      
      // Check if we received a response with content
      if (responseText) {
        try {
          // Try to parse it as JSON
          const responseData = JSON.parse(responseText);
          console.log('Parsed response data:', responseData);
          
          // Check for API-specific success/error formats
          if (responseData.response === "Success") {
            // The API might return a success message even for duplicates
            if (responseData.msg && responseData.msg.includes("already added")) {
              console.log('Program with this name already exists');
              return { 
                success: true, 
                duplicate: true, 
                message: responseData.msg
              };
            }
            return responseData;
          } 
          // Handle error response but with "response" field
          else if (responseData.status === "fail" || responseData.errors) {
            const errorMessage = responseData.errors && responseData.errors.length > 0 
              ? responseData.errors[0].message 
              : 'Unknown API error';
            throw new Error(errorMessage);
          }
          // Return the data even if we don't recognize the format
          return responseData;
        } catch (parseError) {
          // If it's not valid JSON, just use the text as error message
          if (!response.ok) {
            throw new Error(`API error: ${responseText}`);
          }
          // If response was OK but not JSON, return a basic success object
          return { success: true, message: responseText };
        }
      }
      
      // If we get here and response is not OK, throw a generic error
      if (!response.ok) {
        throw new Error(`Failed to create loyalty program: ${response.statusText}`);
      }
      
      // Fallback return value if we got here somehow
      return { success: true };
    } catch (fetchError) {
      // Handle fetch-specific errors
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('Save loyalty scheme request timed out after 45 seconds');
        throw new Error('Request timed out. The server is taking too long to respond. Please try again later.');
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Error creating loyalty scheme:', error);
    
    // Transform network errors into user-friendly messages
    if (error instanceof TypeError && error.message.includes('network')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    
    throw error;
  }
}

/**
 * Update an existing loyalty program
 */
export async function updateLoyaltyProgram(programId: string | number, programData: any) {
  return fetchFromAPI(`/loyalty-programs/${programId}`, 'PUT', programData);
}

/**
 * Get a user's profile data
 */
export async function getUserProfile() {
  return fetchFromAPI('/user/profile');
}

/**
 * Update a user's business profile
 */
export async function updateBusinessProfile(profileData: any) {
  return fetchFromAPI('/business/profile', 'PUT', profileData);
}

/**
 * Get business transaction history
 */
export async function getTransactionHistory() {
  return fetchFromAPI('/business/transactions');
}

/**
 * Get analytics data for business dashboard
 */
export async function getAnalyticsData(period: 'day' | 'week' | 'month' | 'year' = 'month') {
  return fetchFromAPI(`/business/analytics?period=${period}`);
}

/**
 * Get all offers for the authenticated business
 */
export async function getOffers() {
  try {
    // Make a direct API call instead of using fetchFromAPI to better debug
    const token = localStorage.getItem('token');
    const userID = localStorage.getItem('userID');
    
    console.log('Getting offers using token:', token ? 'Token exists' : 'No token');
    console.log('User ID for offers request:', userID);
    
    if (!token) {
      console.error('No authentication token available for load-offers');
      return { offers: [] };
    }
    
    try {
      // Get the proper tokens from localStorage - ensure we use the right keys
      const hichersToken = localStorage.getItem('hichersToken') || token;
      const hichersUserID = localStorage.getItem('hichersUserID') || userID || '1';
      
      console.log('Using token:', hichersToken ? hichersToken.substring(0, 20) + '...' : 'No token');
      console.log('Using userID from localStorage:', hichersUserID);
      
      // Use the correct endpoint that we confirmed works
      const url = `https://hichers-api-eight.vercel.app/api/v1/offer/load-offers?userID=${hichersUserID}`;
      console.log('Making direct API call to:', url);
      
      // Headers with Bearer token authorization
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hichersToken}`
      };
      
      // Create a simple payload for the POST request - this API requires POST
      console.log('Using POST request to load offers since the API requires POST method');
      const postPayload = {
        userID: parseInt(hichersUserID)
      };
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      // Make the API call with POST instead of GET
      console.log('Sending POST request with payload:', postPayload);
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(postPayload),
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      
      console.log('Load offers response status:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Could not read error response';
        }
        
        console.error(`Load offers API error (${response.status}): ${errorText}`);
        return { offers: [] };
      }
      
      // Continue with POST response handling
      let responseData;
      try {
        responseData = await response.json();
        console.log('Successfully parsed GET JSON response');
      } catch (e) {
        console.error('Could not parse response as JSON, trying text:', e);
        try {
          const text = await response.text();
          console.log('Load offers text response:', text);
          responseData = JSON.parse(text);
        } catch (e2) {
          console.error('Could not parse load-offers response at all:', e2);
          return { offers: [] };
        }
      }
      
      console.log('Raw loadOffers response:', JSON.stringify(responseData, null, 2));
      
      // Check response format and handle accordingly
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        console.log('loadOffers: Response has array in data property, length:', responseData.data.length);
        
        // Map the response to match our expected format
        const offers = responseData.data.map((offer: ApiOfferResponse) => ({
          id: offer.offerid,
          title: offer.description || 'Untitled Offer',
          description: offer.description || '',
          // Map other properties we need
          validFrom: offer.validfromdate || '',
          validUntil: offer.validtodate || '',
          validFromTime: offer.validfromtime || '',
          validUntilTime: offer.validtotime || '',
          isActive: !offer.expireflag, // expired flag means it's not active
          offerTypeID: offer.offertypeid,
          timeStatus: offer.timestatus,
          mapID: offer.mapid,
          // Add extra fields needed for display
          code: '',
          discount: getDiscountForOfferType(offer.offertypeid, ''),
          redemptionCount: 0,
          createdAt: offer.validfromdate || ''
        }));
        
        return { offers };
      } else if (responseData && responseData.response && Array.isArray(responseData.response)) {
        console.log('loadOffers: Response has array in response property, length:', responseData.response.length);
        
        // Map the response to match our expected format
        const offers = responseData.response.map((offer: ApiOfferResponse) => ({
          id: offer.offerid,
          title: offer.description || 'Untitled Offer',
          description: offer.description || '',
          // Map other properties we need
          validFrom: offer.validfromdate || '',
          validUntil: offer.validtodate || '',
          validFromTime: offer.validfromtime || '',
          validUntilTime: offer.validtotime || '',
          isActive: !offer.expireflag, // expired flag means it's not active
          offerTypeID: offer.offertypeid,
          timeStatus: offer.timestatus,
          mapID: offer.mapid,
          // Add extra fields needed for display
          code: '',
          discount: getDiscountForOfferType(offer.offertypeid, ''),
          redemptionCount: 0,
          createdAt: offer.validfromdate || ''
        }));
        
        return { offers };
      } else if (responseData && Array.isArray(responseData)) {
        console.log('loadOffers: Response is a direct array, length:', responseData.length);
        return { offers: responseData };
      } else if (responseData && responseData.offers && Array.isArray(responseData.offers)) {
        console.log('loadOffers: Response has offers array property, length:', responseData.offers.length);
        return responseData;
      } else {
        console.log('loadOffers: Unexpected response format:', responseData);
        return { offers: [] };
      }
    } catch (error) {
      // Enhanced error handling for network issues
      console.error('Network error during load-offers fetch:', error);
      
      // Check if this was a timeout
      const isAbortError = error instanceof Error && error.name === 'AbortError';
      if (isAbortError) {
        console.error('Load offers request timed out after 15 seconds');
      }
      
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      
      // Return empty array instead of throwing
      return { offers: [] };
    }
  } catch (error) {
    console.error('loadOffers outer error:', error);
    // Return an empty array instead of throwing an error so the UI doesn't break
    return { offers: [] };
  }
}

// Helper function to generate appropriate discount text based on offer type
function getDiscountForOfferType(offerTypeId: number, defaultValue: string): string {
  switch (offerTypeId) {
    case 1: // Buy One Get One
      return 'Buy 1 Get 1';
    case 2: // Percentage Discount
      return '% Off';
    case 3: // Cash Discount
      return '£ Off';
    case 4: // Minimum Spend
      return 'Min Spend';
    case 5: // Multi Buy
      return 'Multi Buy';
    case 6: // Flash Sale
      return 'Flash Sale';
    default:
      return defaultValue;
  }
}

/**
 * Create a new offer
 * @param offerData The offer data to create
 * @returns The response from the API, which may include the list of current offers
 */
export async function createOffer(offerData: any) {
  // Log the full received data for debugging
  console.log("Creating offer with data:", offerData);
  
  // Format the data according to the expected API structure
  const { 
    title, description, offerTypeID, validFrom, validUntil, 
    validFromTime: inputFromTime, validUntilTime: inputUntilTime, // destructure with aliases
    itemsBuying, itemsFree, percentDiscount, cashDiscount,
    minimumSpend, productName, whileStocksLast
  } = offerData;
  
  // Extract date and time components - STRICTLY match format to what the test API used
  // validFromDate must be in exact format YYYY/MM/DD with NO -T anywhere
  const validFromDate = validFrom ? validFrom.replace(/-/g, '/') : ''; 
  const validToDate = validUntil ? validUntil.replace(/-/g, '/') : '';
  
  // Process time values - simplify to follow the format that worked in the test API (HH:MM)
  // Our successful test used the format "00:00" without seconds
  const validFromTime = inputFromTime 
    ? (inputFromTime.includes(':') ? inputFromTime.substring(0, 5) : inputFromTime + ":00")
    : "00:00";
    
  const validToTime = inputUntilTime 
    ? (inputUntilTime.includes(':') ? inputUntilTime.substring(0, 5) : inputUntilTime + ":00")
    : "23:59";

  // Format payload according to API spec exactly as required
  const payload = {
    userID: parseInt(localStorage.getItem('userID') || '1'),
    offerTypeID: offerTypeID,
    // offerID is only needed for predefined=true
    offerName: title,
    // Include both individual date/time fields AND combined fields to satisfy both API validation paths
    validFromDate: validFromDate,
    validFromTime: validFromTime,
    validToDate: validToDate,
    validToTime: validToTime,
    // Additionally include these combined fields that the API is also checking for
    validfrom: `${validFromDate} ${validFromTime}`,
    validto: `${validToDate} ${validToTime}`,
    itemsBuy: itemsBuying || "0",  // Convert to string
    itemsFree: itemsFree || "0",   // Convert to string
    percentageDiscount: percentDiscount || "0",  // Convert to string
    cashDiscount: cashDiscount || "0",           // Convert to string
    minSpend: minimumSpend || "0",               // Convert to string
    offerPicture: "", // Empty string instead of null
    predefined: false, // We're creating a new offer, not using a predefined one
    editFlag: false,   // We're creating, not editing
    deleteFlag: false, // Not deleting
    // mapID not needed since editFlag is false
    whileStocksLast: whileStocksLast || false,
    offerInformation: description
  };
  
  console.log('Sending offer request with payload:', payload);
  
  try {
    // Use a more direct fetch approach for this particular endpoint
    const hichersToken = localStorage.getItem('hichersToken') || localStorage.getItem('token');
    
    if (!hichersToken) {
      throw new Error('No authentication token available');
    }
    
    // Construct the URL and make sure to include the userID as a query parameter
    // as that's how the API expects it for some endpoints
    const userID = payload.userID;
    // We'll continue using save-offer for creating offers since our debug tool showed it's working
    const baseUrl = `https://hichers-api-eight.vercel.app/api/v1/offer/save-offer?userID=${userID}`;
    
    // Set up headers with token
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hichersToken}`
    };
    
    // Make the direct API call
    console.log('Making direct API call to save-offer with payload:', payload);
    
    // Attempt the API call with detailed error handling
    try {
      console.log('Starting fetch request to:', baseUrl);
      
      // Use a timeout to prevent hanging fetch requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      
      console.log('Fetch response received:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Could not read error response';
        }
        
        console.error(`API error (${response.status}): ${errorText}`);
        
        // Create a more detailed error message
        throw new Error(`API error ${response.status}: ${response.statusText}. Details: ${errorText}`);
      }
      
      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          // Try to parse as JSON anyway in case Content-Type is wrong
          data = JSON.parse(text);
        } catch {
          data = { success: true, message: text };
        }
      }
      
      console.log('Raw save-offer response:', JSON.stringify(data, null, 2));
      
      // Log detailed offer info if available
      if (data.offerID) {
        console.log('New offer created with ID:', data.offerID);
      }
      if (data.offerDetails) {
        console.log('Offer details:', data.offerDetails);
      }
      
      return data;
    } catch (error) {
      // Enhanced error logging - safely handle error
      console.error('Network error during save-offer fetch:', error);
      
      // Type guard to check for AbortError
      const isAbortError = error instanceof Error && error.name === 'AbortError';
      
      if (isAbortError) {
        console.error('Request timed out after 15 seconds');
        throw new Error('Request timed out. The server is taking too long to respond.');
      } else {
        // Safe error details extraction for any error type
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : 'No stack trace';
        const errorName = error instanceof Error ? error.name : 'UnknownError';
        
        console.error('Error details:', {
          message: errorMessage,
          stack: errorStack,
          name: errorName
        });
        
        throw new Error(`Network error: ${errorMessage || 'Connection failed'}`);
      }
    }
  } catch (error) {
    console.error('Failed to create offer:', error);
    
    // Show a more user-friendly message even when API fails
    throw new Error('Could not save the offer. Please try again later.');
  }
}

// Helper function to generate the appropriate discount string based on offer type
function getDiscountValueByType(data: any): string {
  switch (data.offerTypeID) {
    case 1: // Buy One Get One
      return `Buy ${data.itemsBuying || '1'} Get ${data.itemsFree || '1'}`;
    case 2: // Percentage Discount
      return `${data.percentageDiscount || '0'}%`;
    case 3: // Cash Discount
      return `£${data.cashDiscount || '0'}`;
    case 4: // Minimum Spend
      return `£${data.minimumSpend || '0'} min`;
    case 5: // Multi Buy
      return `Multi Buy`;
    case 6: // Flash Sale
      return `Flash Sale`;
    default:
      return '';
  }
}

/**
 * Update an existing offer
 * @param offerId The ID of the offer to update
 * @param offerData The updated offer data
 */
export async function updateOffer(offerId: string | number, offerData: any) {
  try {
    // Format the data according to API expectations
    const formattedData = {
      ...offerData,
      userID: parseInt(localStorage.getItem('userID') || '1'),
      offerID: offerId,
      // Add the editing flag to indicate this is an update operation
      editFlag: true
    };
    
    console.log('Updating offer with data:', formattedData);
    
    // Use a direct fetch approach for this endpoint
    const hichersToken = localStorage.getItem('hichersToken') || localStorage.getItem('token');
    const userID = localStorage.getItem('hichersUserID') || localStorage.getItem('userID') || '1';
    
    if (!hichersToken) {
      throw new Error('No authentication token available');
    }
    
    // Construct the URL with userID as a query parameter
    const url = `https://hichers-api-eight.vercel.app/api/v1/offer/update-offer/${offerId}?userID=${userID}`;
    console.log('Making direct API call to update-offer:', url);
    
    // Set up headers with token
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hichersToken}`
    };
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    // Make the API call
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(formattedData),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    console.log('Update offer response status:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      
      console.error(`Update offer API error (${response.status}): ${errorText}`);
      throw new Error(`API error ${response.status}: ${response.statusText}. Details: ${errorText}`);
    }
    
    // Parse the response
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { success: true, message: text || 'Offer updated successfully' };
      }
    }
    
    console.log('Update offer API response:', data);
    return data;
  } catch (error) {
    console.error('Failed to update offer:', error);
    throw new Error('Could not update the offer. Please try again later.');
  }
}

/**
 * Delete an offer
 * @param offerId The ID of the offer to delete
 */
export async function deleteOffer(offerId: string | number) {
  try {
    // Use a direct fetch approach for this endpoint
    const hichersToken = localStorage.getItem('hichersToken') || localStorage.getItem('token');
    const userID = localStorage.getItem('hichersUserID') || localStorage.getItem('userID') || '1';
    
    if (!hichersToken) {
      throw new Error('No authentication token available');
    }
    
    // Construct the URL with userID as a query parameter
    const url = `https://hichers-api-eight.vercel.app/api/v1/offer/delete-offer/${offerId}?userID=${userID}`;
    console.log('Making direct API call to delete-offer:', url);
    
    // Set up headers with token
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hichersToken}`
    };
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    // Make the API call
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    console.log('Delete offer response status:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      
      console.error(`Delete offer API error (${response.status}): ${errorText}`);
      throw new Error(`API error ${response.status}: ${response.statusText}. Details: ${errorText}`);
    }
    
    // Parse the response
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { success: true, message: text || 'Offer deleted successfully' };
      }
    }
    
    console.log('Delete offer API response:', data);
    return data;
  } catch (error) {
    console.error('Failed to delete offer:', error);
    throw new Error('Could not delete the offer. Please try again later.');
  }
}

/**
 * View detailed offer information using the view-offer API
 * @param offerId The ID of the offer to view
 * @param mapId The mapID of the offer
 * @returns Detailed offer information
 */
export async function viewOffer(offerId: string | number, mapId: string | number) {
  console.log(`Viewing details for offer ID: ${offerId}, mapID: ${mapId}`);
  
  try {
    // Get the authentication token and user ID
    const hichersToken = localStorage.getItem('token');
    const hichersUserID = localStorage.getItem('userID') || '1';
    
    if (!hichersToken) {
      console.error('No authentication token found');
      throw new Error('Authentication required');
    }
    
    // Build the URL for the view-offer endpoint
    const baseUrl = 'https://hichers-api-eight.vercel.app/api/v1/offer/view-offer';
    const url = `${baseUrl}?userID=${hichersUserID}`;
    
    console.log('Making view-offer API call to:', url);
    
    // Headers with Bearer token authorization
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hichersToken}`
    };
    
    // Create payload with offer ID and map ID as required by the API
    const postPayload = {
      offerID: parseInt(String(offerId)),
      mapID: parseInt(String(mapId))
    };
    
    console.log('Sending POST request to view-offer with payload:', postPayload);
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    // Make the API call
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(postPayload),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    console.log('View offer response status:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      
      console.error(`View offer API error (${response.status}): ${errorText}`);
      throw new Error(`Failed to fetch offer details: ${errorText}`);
    }
    
    // Parse the response
    const responseData = await response.json();
    console.log('View offer response data:', responseData);
    
    // Return the offer data
    return responseData;
  } catch (error) {
    console.error("Error viewing offer details:", error);
    throw error;
  }
}

/**
 * Get dashboard metrics from the web API
 * @returns Dashboard metrics including customer counts and program data
 */
export async function getDashboardMetrics() {
  console.log("Fetching dashboard metrics from web API...");
  
  try {
    const userID = localStorage.getItem('hichersUserID') || localStorage.getItem('userID') || '1';
    
    // Direct fetch to bypass error handling and see raw response
    const baseUrl = 'https://hichers-api-eight.vercel.app/api/v1';
    const token = localStorage.getItem('hichersToken') || localStorage.getItem('token');
    
    const response = await fetch(`${baseUrl}/web/web-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userID })
    });
    
    const responseText = await response.text();
    console.log("Raw web API response:", response.status, responseText);
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log("Parsed web API data:", data);
        return data;
      } catch (e) {
        console.log("Web API returned non-JSON:", responseText);
        return null;
      }
    } else {
      console.log("Web API failed with status:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Web API network error:", error);
    return null;
  }
}
