import { 
  Business, InsertBusiness,
  User, InsertUser,
  LoyaltyProgram, InsertLoyaltyProgram,
  Reward, InsertReward,
  Customer, InsertCustomer,
  CustomerPoints, InsertCustomerPoints,
  Transaction, InsertTransaction,
  NewsletterSubscriber, InsertNewsletterSubscriber,
  CustomerBehavior, InsertCustomerBehavior,
  Recommendation, InsertRecommendation,
  CustomerInsights, InsertCustomerInsights,
  businesses, users, loyaltyPrograms, rewards, customers, customerPoints, transactions, newsletterSubscribers,
  customerBehavior, recommendations, customerInsights
} from "@shared/schema";

interface IStorage {
  // Businesses
  getAllBusinesses(): Promise<Business[]>;
  getBusiness(id: number): Promise<Business | undefined>;
  getBusinessByEmail(email: string): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserBusinesses(userId: number): Promise<Business[]>;
  
  // Loyalty Programs
  getAllLoyaltyPrograms(businessId: number): Promise<LoyaltyProgram[]>;
  getLoyaltyProgram(id: number): Promise<LoyaltyProgram | undefined>;
  createLoyaltyProgram(program: InsertLoyaltyProgram): Promise<LoyaltyProgram>;
  updateLoyaltyProgram(id: number, program: Partial<InsertLoyaltyProgram>): Promise<LoyaltyProgram | undefined>;
  
  // Rewards
  getAllRewards(loyaltyProgramId: number): Promise<Reward[]>;
  getReward(id: number): Promise<Reward | undefined>;
  createReward(reward: InsertReward): Promise<Reward>;
  updateReward(id: number, reward: Partial<InsertReward>): Promise<Reward | undefined>;
  
  // Customers
  getAllCustomers(businessId: number): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string, businessId: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  
  // Customer Points
  getCustomerPoints(customerId: number, loyaltyProgramId: number): Promise<CustomerPoints | undefined>;
  updateCustomerPoints(customerId: number, loyaltyProgramId: number, points: number): Promise<CustomerPoints>;
  
  // Transactions
  getCustomerTransactions(customerId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Newsletter
  subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  getSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined>;
  
  // Customer Behavior Tracking
  trackCustomerBehavior(behavior: InsertCustomerBehavior): Promise<CustomerBehavior>;
  getCustomerBehavior(customerId: number, businessId: number): Promise<CustomerBehavior[]>;
  
  // Recommendations
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  getCustomerRecommendations(customerId: number, businessId: number): Promise<Recommendation[]>;
  updateRecommendationStatus(id: number, status: string): Promise<Recommendation | undefined>;
  
  // Customer Insights
  updateCustomerInsights(insights: InsertCustomerInsights): Promise<CustomerInsights>;
  getCustomerInsights(customerId: number, businessId: number): Promise<CustomerInsights | undefined>;
}

import { db } from './db';
import { eq, and, desc } from 'drizzle-orm';

export class DatabaseStorage implements IStorage {
  // Business Methods
  async getAllBusinesses(): Promise<Business[]> {
    return await db.select().from(businesses);
  }
  
  async getBusiness(id: number): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business;
  }
  
  async getBusinessByEmail(email: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.email, email));
    return business;
  }
  
  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db.insert(businesses).values(business).returning();
    return newBusiness;
  }
  
  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async getUserBusinesses(userId: number): Promise<Business[]> {
    const user = await this.getUser(userId);
    if (!user || !user.businessId) return [];
    
    const [business] = await db.select().from(businesses).where(eq(businesses.id, user.businessId));
    return business ? [business] : [];
  }
  
  // Loyalty Program Methods
  async getAllLoyaltyPrograms(businessId: number): Promise<LoyaltyProgram[]> {
    return await db.select().from(loyaltyPrograms).where(eq(loyaltyPrograms.businessId, businessId));
  }
  
  async getLoyaltyProgram(id: number): Promise<LoyaltyProgram | undefined> {
    const [program] = await db.select().from(loyaltyPrograms).where(eq(loyaltyPrograms.id, id));
    return program;
  }
  
  async createLoyaltyProgram(program: InsertLoyaltyProgram): Promise<LoyaltyProgram> {
    const [newProgram] = await db.insert(loyaltyPrograms).values(program).returning();
    return newProgram;
  }
  
  async updateLoyaltyProgram(id: number, program: Partial<InsertLoyaltyProgram>): Promise<LoyaltyProgram | undefined> {
    const [updatedProgram] = await db
      .update(loyaltyPrograms)
      .set(program)
      .where(eq(loyaltyPrograms.id, id))
      .returning();
    
    return updatedProgram;
  }
  
  // Reward Methods
  async getAllRewards(loyaltyProgramId: number): Promise<Reward[]> {
    return await db.select().from(rewards).where(eq(rewards.loyaltyProgramId, loyaltyProgramId));
  }
  
  async getReward(id: number): Promise<Reward | undefined> {
    const [reward] = await db.select().from(rewards).where(eq(rewards.id, id));
    return reward;
  }
  
  async createReward(reward: InsertReward): Promise<Reward> {
    const [newReward] = await db.insert(rewards).values(reward).returning();
    return newReward;
  }
  
  async updateReward(id: number, reward: Partial<InsertReward>): Promise<Reward | undefined> {
    const [updatedReward] = await db
      .update(rewards)
      .set(reward)
      .where(eq(rewards.id, id))
      .returning();
    
    return updatedReward;
  }
  
  // Customer Methods
  async getAllCustomers(businessId: number): Promise<Customer[]> {
    return await db.select().from(customers).where(eq(customers.businessId, businessId));
  }
  
  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }
  
  async getCustomerByEmail(email: string, businessId: number): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.email, email),
          eq(customers.businessId, businessId)
        )
      );
    
    return customer;
  }
  
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }
  
  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updatedCustomer] = await db
      .update(customers)
      .set(customer)
      .where(eq(customers.id, id))
      .returning();
    
    return updatedCustomer;
  }
  
  // Customer Points Methods
  async getCustomerPoints(customerId: number, loyaltyProgramId: number): Promise<CustomerPoints | undefined> {
    const [points] = await db
      .select()
      .from(customerPoints)
      .where(
        and(
          eq(customerPoints.customerId, customerId),
          eq(customerPoints.loyaltyProgramId, loyaltyProgramId)
        )
      );
    
    return points;
  }
  
  async updateCustomerPoints(customerId: number, loyaltyProgramId: number, points: number): Promise<CustomerPoints> {
    // Check if record exists
    const existingPoints = await this.getCustomerPoints(customerId, loyaltyProgramId);
    
    if (existingPoints) {
      // Update existing record
      const [updatedPoints] = await db
        .update(customerPoints)
        .set({ 
          points,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(customerPoints.customerId, customerId),
            eq(customerPoints.loyaltyProgramId, loyaltyProgramId)
          )
        )
        .returning();
      
      return updatedPoints;
    } else {
      // Create new record
      const [newPoints] = await db
        .insert(customerPoints)
        .values({ 
          customerId, 
          loyaltyProgramId,
          points,
          pointsUsed: 0,
          level: 1
        })
        .returning();
      
      return newPoints;
    }
  }
  
  // Transaction Methods
  async getCustomerTransactions(customerId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.customerId, customerId))
      .orderBy(desc(transactions.createdAt));
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    
    return newTransaction;
  }
  
  // Newsletter Methods
  async subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const [existingSubscriber] = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, subscriber.email));
    
    if (existingSubscriber) {
      return existingSubscriber;
    }
    
    const [newSubscriber] = await db
      .insert(newsletterSubscribers)
      .values(subscriber)
      .returning();
    
    return newSubscriber;
  }
  
  async getSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined> {
    const [subscriber] = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email));
    
    return subscriber;
  }
}

// Seed database if it's empty
async function seedDatabase() {
  // Check if database is empty by checking if any businesses exist
  const existingBusinesses = await db.select().from(businesses);
  
  if (existingBusinesses.length === 0) {
    console.log('Seeding database with initial loyalty platform data...');
    
    // Create initial business
    const [business] = await db.insert(businesses).values({
      name: "Sample Coffee Shop",
      businessType: "cafe",
      email: "sample@coffeshop.com",
      phone: "+1-555-123-4567",
      address: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "US",
      logo: "https://via.placeholder.com/150",
      website: "https://www.samplecoffeshop.com"
    }).returning();
    
    // Create admin user
    const [user] = await db.insert(users).values({
      email: "admin@hichers.com",
      password: "$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm", // "password"
      firstName: "Admin",
      lastName: "User",
      isAdmin: true,
      businessId: business.id
    }).returning();
    
    // Create a loyalty program
    const [loyaltyProgram] = await db.insert(loyaltyPrograms).values({
      businessId: business.id,
      name: "Coffee Rewards",
      description: "Earn points with every purchase and redeem for free drinks and food items.",
      pointsPerPurchase: 1,
      pointsPerDollar: 10,
      isActive: true,
      settings: {
        expiryPeriod: 365,
        minimumPurchase: 5,
        welcomeBonus: 50,
        referralBonus: 25
      }
    }).returning();
    
    // Create rewards
    const rewardsData = [
      {
        loyaltyProgramId: loyaltyProgram.id,
        name: "Free Coffee",
        description: "Get a free coffee of your choice",
        type: "free_item",
        pointsRequired: 100,
        value: "Any Coffee",
        isActive: true
      },
      {
        loyaltyProgramId: loyaltyProgram.id,
        name: "10% Discount",
        description: "10% off your next purchase",
        type: "discount",
        pointsRequired: 50,
        value: "10%",
        isActive: true
      },
      {
        loyaltyProgramId: loyaltyProgram.id,
        name: "Free Pastry",
        description: "One free pastry of your choice",
        type: "free_item",
        pointsRequired: 150,
        value: "Any Pastry",
        isActive: true
      }
    ];
    
    await db.insert(rewards).values(rewardsData);
    
    // Create customers
    const customersData = [
      {
        businessId: business.id,
        email: "john@example.com",
        phone: "+1-555-987-6543",
        firstName: "John",
        lastName: "Doe",
        totalVisits: 5,
        notes: "Prefers lattes"
      },
      {
        businessId: business.id,
        email: "jane@example.com",
        phone: "+1-555-789-0123",
        firstName: "Jane",
        lastName: "Smith",
        totalVisits: 12,
        notes: "Tea lover"
      }
    ];
    
    const createdCustomers = await db.insert(customers).values(customersData).returning();
    
    // Add points to customers
    const pointsData = createdCustomers.map(customer => ({
      customerId: customer.id,
      loyaltyProgramId: loyaltyProgram.id,
      points: customer.id % 2 === 0 ? 120 : 75, // Different points for variety
      pointsUsed: 0,
      level: 1
    }));
    
    await db.insert(customerPoints).values(pointsData);
    
    // Add transactions
    const transactionsData = createdCustomers.flatMap(customer => [
      {
        customerId: customer.id,
        loyaltyProgramId: loyaltyProgram.id,
        type: "purchase",
        amount: "15.75",
        points: 157,
        description: "Coffee and sandwich"
      },
      {
        customerId: customer.id,
        loyaltyProgramId: loyaltyProgram.id,
        type: "purchase",
        amount: "5.25",
        points: 52,
        description: "Morning coffee"
      }
    ]);
    
    await db.insert(transactions).values(transactionsData);
    
    // Add newsletter subscribers
    await db.insert(newsletterSubscribers).values([
      { email: "subscriber1@example.com" },
      { email: "subscriber2@example.com" }
    ]);
    
    console.log('Loyalty platform database seeding completed!');
  }
}

// Initialize database with seed data if needed
seedDatabase().catch(console.error);

export const storage = new DatabaseStorage();
