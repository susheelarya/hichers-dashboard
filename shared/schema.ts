import { pgTable, text, serial, integer, boolean, numeric, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Business types
export const businessTypeEnum = pgEnum('business_type', [
  'retail', 
  'restaurant', 
  'cafe', 
  'salon', 
  'barber', 
  'spa', 
  'fitness', 
  'other'
]);

// Reward types
export const rewardTypeEnum = pgEnum('reward_type', [
  'discount', 
  'free_item', 
  'cashback', 
  'points', 
  'tier_upgrade', 
  'custom'
]);

// Business owners
export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  businessType: businessTypeEnum("business_type").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  logo: text("logo"),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow()
});

// Business owners (users)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isAdmin: boolean("is_admin").default(false),
  businessId: integer("business_id").references(() => businesses.id),
  createdAt: timestamp("created_at").defaultNow()
});

// Loyalty programs
export const loyaltyPrograms = pgTable("loyalty_programs", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => businesses.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  pointsPerPurchase: integer("points_per_purchase").default(1),
  pointsPerDollar: integer("points_per_dollar").default(1),
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  settings: json("settings").$type<{
    expiryPeriod?: number;
    minimumPurchase?: number;
    welcomeBonus?: number;
    referralBonus?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow()
});

// Rewards for loyalty programs
export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  loyaltyProgramId: integer("loyalty_program_id").references(() => loyaltyPrograms.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: rewardTypeEnum("type").notNull(),
  pointsRequired: integer("points_required").notNull(),
  value: text("value").notNull(), // e.g., "10%" for discount, "Coffee" for free item
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow()
});

// Customers with enhanced profile data
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => businesses.id).notNull(),
  email: text("email"),
  phone: text("phone"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  birthdate: timestamp("birthdate"),
  joinedDate: timestamp("joined_date").defaultNow(),
  lastVisit: timestamp("last_visit"),
  totalSpent: numeric("total_spent", { precision: 10, scale: 2 }).default("0"),
  totalVisits: integer("total_visits").default(0),
  notes: text("notes"),
  // Profile enhancement fields
  avatar: text("avatar"),
  preferences: json("preferences").$type<{
    favoriteCategories?: string[];
    preferredOfferTypes?: string[];
    communicationPreferences?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    spendingHabits?: {
      averageOrderValue?: number;
      frequentPurchaseDays?: string[];
      preferredTimeSlots?: string[];
    };
  }>(),
  loyaltyTier: text("loyalty_tier").default("bronze"), // bronze, silver, gold, platinum
  referralCode: text("referral_code"),
  referredBy: integer("referred_by")
});

// Customer points
export const customerPoints = pgTable("customer_points", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  loyaltyProgramId: integer("loyalty_program_id").references(() => loyaltyPrograms.id).notNull(),
  points: integer("points").default(0).notNull(),
  pointsUsed: integer("points_used").default(0),
  level: integer("level").default(1),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  loyaltyProgramId: integer("loyalty_program_id").references(() => loyaltyPrograms.id).notNull(),
  type: text("type").notNull(), // purchase, redemption, bonus, etc.
  amount: numeric("amount", { precision: 10, scale: 2 }),
  points: integer("points"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow()
});

// Newsletter subscribers
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  dateSubscribed: timestamp("date_subscribed").notNull().defaultNow(),
});

// Customer behavior tracking for recommendations
export const customerBehavior = pgTable("customer_behavior", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  businessId: integer("business_id").references(() => businesses.id).notNull(),
  actionType: text("action_type").notNull(), // view, click, purchase, redeem, browse
  targetType: text("target_type").notNull(), // offer, reward, program, category
  targetId: text("target_id"), // ID of the target item
  metadata: json("metadata").$type<{
    offerType?: string;
    categoryName?: string;
    amount?: number;
    duration?: number;
    deviceType?: string;
    timeOfDay?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow()
});

// Personalized recommendations
export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  businessId: integer("business_id").references(() => businesses.id).notNull(),
  type: text("type").notNull(), // offer, reward, program, category
  targetId: text("target_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  score: numeric("score", { precision: 5, scale: 3 }).notNull(), // confidence score 0-1
  reason: text("reason"), // why this was recommended
  status: text("status").default("active"), // active, clicked, dismissed, expired
  metadata: json("metadata").$type<{
    offerType?: string;
    originalOfferId?: string;
    estimatedValue?: number;
    expiryDate?: string;
    categories?: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at")
});

// Customer insights and analytics
export const customerInsights = pgTable("customer_insights", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  businessId: integer("business_id").references(() => businesses.id).notNull(),
  insightType: text("insight_type").notNull(), // spending_pattern, frequency, preference, risk
  data: json("data").$type<{
    totalSpending?: number;
    averageOrderValue?: number;
    visitFrequency?: string;
    favoriteCategories?: string[];
    preferredOfferTypes?: string[];
    loyaltyScore?: number;
    churnRisk?: number;
    lifetimeValue?: number;
    engagementLevel?: string;
  }>(),
  calculatedAt: timestamp("calculated_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Insert schemas
export const insertBusinessSchema = createInsertSchema(businesses).omit({ 
  id: true,
  createdAt: true
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertLoyaltyProgramSchema = createInsertSchema(loyaltyPrograms).omit({
  id: true,
  createdAt: true
});

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
  createdAt: true
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  joinedDate: true,
  totalSpent: true,
  totalVisits: true
});

export const insertCustomerPointsSchema = createInsertSchema(customerPoints).omit({
  id: true,
  updatedAt: true
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true
});

export const insertNewsletterSchema = createInsertSchema(newsletterSubscribers).pick({
  email: true,
});

export const insertCustomerBehaviorSchema = createInsertSchema(customerBehavior).omit({
  id: true,
  createdAt: true
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true
});

export const insertCustomerInsightsSchema = createInsertSchema(customerInsights).omit({
  id: true,
  calculatedAt: true,
  updatedAt: true
});

// Types
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLoyaltyProgram = z.infer<typeof insertLoyaltyProgramSchema>;
export type LoyaltyProgram = typeof loyaltyPrograms.$inferSelect;

export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export type InsertCustomerPoints = z.infer<typeof insertCustomerPointsSchema>;
export type CustomerPoints = typeof customerPoints.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

export type InsertCustomerBehavior = z.infer<typeof insertCustomerBehaviorSchema>;
export type CustomerBehavior = typeof customerBehavior.$inferSelect;

export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;

export type InsertCustomerInsights = z.infer<typeof insertCustomerInsightsSchema>;
export type CustomerInsights = typeof customerInsights.$inferSelect;
