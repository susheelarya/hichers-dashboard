import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertNewsletterSchema, 
  insertBusinessSchema, 
  insertUserSchema, 
  insertLoyaltyProgramSchema,
  insertRewardSchema,
  insertCustomerSchema,
  insertTransactionSchema
} from "@shared/schema";
import { z } from "zod";

// Auth middleware for protected routes
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  // For now, we'll allow all requests since we don't have auth implemented
  // In a real app, we would check if req.isAuthenticated() or verify a JWT
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Business API
  app.get("/api/businesses", isAuthenticated, async (req, res) => {
    try {
      const businesses = await storage.getAllBusinesses();
      res.json(businesses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  app.get("/api/businesses/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const business = await storage.getBusiness(parseInt(id));
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.json(business);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch business" });
    }
  });

  app.post("/api/businesses", isAuthenticated, async (req, res) => {
    try {
      const businessData = insertBusinessSchema.parse(req.body);
      const business = await storage.createBusiness(businessData);
      res.status(201).json(business);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid business data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create business" });
    }
  });

  // User API (auth)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Create the user
      const user = await storage.createUser(userData);
      
      // We would normally set up a session here
      res.status(201).json({ id: user.id, email: user.email });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // In a real app, we would verify the password, but for demo purposes
      // we'll just check if the user exists
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // We would normally set up a session or return a JWT token here
      res.json({ id: user.id, email: user.email });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Loyalty Programs API
  app.get("/api/businesses/:businessId/loyalty-programs", isAuthenticated, async (req, res) => {
    try {
      const { businessId } = req.params;
      const programs = await storage.getAllLoyaltyPrograms(parseInt(businessId));
      res.json(programs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch loyalty programs" });
    }
  });

  app.get("/api/loyalty-programs/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const program = await storage.getLoyaltyProgram(parseInt(id));
      
      if (!program) {
        return res.status(404).json({ message: "Loyalty program not found" });
      }
      
      res.json(program);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch loyalty program" });
    }
  });

  app.post("/api/loyalty-programs", isAuthenticated, async (req, res) => {
    try {
      const programData = insertLoyaltyProgramSchema.parse(req.body);
      const program = await storage.createLoyaltyProgram(programData);
      res.status(201).json(program);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid loyalty program data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create loyalty program" });
    }
  });

  app.patch("/api/loyalty-programs/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const programData = req.body;
      
      const program = await storage.updateLoyaltyProgram(parseInt(id), programData);
      
      if (!program) {
        return res.status(404).json({ message: "Loyalty program not found" });
      }
      
      res.json(program);
    } catch (error) {
      res.status(500).json({ message: "Failed to update loyalty program" });
    }
  });

  // Rewards API
  app.get("/api/loyalty-programs/:loyaltyProgramId/rewards", isAuthenticated, async (req, res) => {
    try {
      const { loyaltyProgramId } = req.params;
      const rewards = await storage.getAllRewards(parseInt(loyaltyProgramId));
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rewards" });
    }
  });

  app.get("/api/rewards/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const reward = await storage.getReward(parseInt(id));
      
      if (!reward) {
        return res.status(404).json({ message: "Reward not found" });
      }
      
      res.json(reward);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reward" });
    }
  });

  app.post("/api/rewards", isAuthenticated, async (req, res) => {
    try {
      const rewardData = insertRewardSchema.parse(req.body);
      const reward = await storage.createReward(rewardData);
      res.status(201).json(reward);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reward data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create reward" });
    }
  });

  app.patch("/api/rewards/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const rewardData = req.body;
      
      const reward = await storage.updateReward(parseInt(id), rewardData);
      
      if (!reward) {
        return res.status(404).json({ message: "Reward not found" });
      }
      
      res.json(reward);
    } catch (error) {
      res.status(500).json({ message: "Failed to update reward" });
    }
  });

  // Customers API
  app.get("/api/businesses/:businessId/customers", isAuthenticated, async (req, res) => {
    try {
      const { businessId } = req.params;
      const customers = await storage.getAllCustomers(parseInt(businessId));
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await storage.getCustomer(parseInt(id));
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", isAuthenticated, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.patch("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const customerData = req.body;
      
      const customer = await storage.updateCustomer(parseInt(id), customerData);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  // Customer Points API
  app.get("/api/customers/:customerId/loyalty-programs/:loyaltyProgramId/points", isAuthenticated, async (req, res) => {
    try {
      const { customerId, loyaltyProgramId } = req.params;
      const points = await storage.getCustomerPoints(parseInt(customerId), parseInt(loyaltyProgramId));
      
      if (!points) {
        return res.status(404).json({ message: "Points record not found" });
      }
      
      res.json(points);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer points" });
    }
  });

  app.patch("/api/customers/:customerId/loyalty-programs/:loyaltyProgramId/points", isAuthenticated, async (req, res) => {
    try {
      const { customerId, loyaltyProgramId } = req.params;
      const { points } = req.body;
      
      if (typeof points !== 'number') {
        return res.status(400).json({ message: "Points must be a number" });
      }
      
      const updatedPoints = await storage.updateCustomerPoints(parseInt(customerId), parseInt(loyaltyProgramId), points);
      res.json(updatedPoints);
    } catch (error) {
      res.status(500).json({ message: "Failed to update customer points" });
    }
  });

  // Transactions API
  app.get("/api/customers/:customerId/transactions", isAuthenticated, async (req, res) => {
    try {
      const { customerId } = req.params;
      const transactions = await storage.getCustomerTransactions(parseInt(customerId));
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer transactions" });
    }
  });

  app.post("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Newsletter API
  app.post("/api/newsletter", async (req, res) => {
    try {
      const emailSchema = insertNewsletterSchema.pick({ email: true });
      const { email } = emailSchema.parse(req.body);
      
      const existingSubscriber = await storage.getSubscriberByEmail(email);
      
      if (existingSubscriber) {
        return res.status(400).json({ message: "Email already subscribed" });
      }
      
      const subscriber = await storage.subscribeToNewsletter({ email });
      res.status(201).json(subscriber);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  // Contact form API
  app.post("/api/contact", async (req, res) => {
    try {
      const contactSchema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        subject: z.string().min(1),
        message: z.string().min(1),
      });
      
      const contactData = contactSchema.parse(req.body);
      
      // Just return success (would normally save this or send an email)
      res.status(200).json({ message: "Message received" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid form data" });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  
  // OTP API
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const phoneSchema = z.object({
        phone: z.string().min(6, { message: "Phone number must be at least 6 digits" }),
      });
      
      const { phone } = phoneSchema.parse(req.body);
      
      // In a real app, we would:
      // 1. Generate a random OTP code
      // 2. Send it via SMS using a service like Twilio
      // 3. Store the OTP and phone number in the database with an expiration time
      
      // For demo purposes, we'll just log and return a success message
      console.log(`OTP sent to phone: ${phone}`);
      
      // Generate a fake OTP for dev purposes
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      console.log(`Generated OTP: ${otp} (for testing)`);
      
      res.status(200).json({ 
        success: true, 
        message: "OTP sent successfully",
        // Only in development, we'll return the OTP. In production, this would never be returned.
        devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid phone number", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });
  
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const verifySchema = z.object({
        phone: z.string().min(6),
        otp: z.string().min(4),
      });
      
      const { phone, otp } = verifySchema.parse(req.body);
      
      // In a real app, we would:
      // 1. Retrieve the OTP from the database for this phone number
      // 2. Verify it matches and hasn't expired
      // 3. Create a session or return a JWT token for authentication
      
      // For demo purposes, we'll just log and return a success message
      console.log(`Verifying OTP: ${otp} for phone: ${phone}`);
      
      // In this demo, we'll simulate a successful verification
      // In a real app, we would verify against the stored OTP
      
      res.status(200).json({ 
        success: true, 
        message: "OTP verified successfully",
        // In a real app, we would return a session token or JWT
        token: "sample-auth-token-" + Date.now()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid verification data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
