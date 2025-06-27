-- Create business_type enum
CREATE TYPE business_type AS ENUM (
  'retail', 
  'restaurant', 
  'cafe', 
  'salon', 
  'barber', 
  'spa', 
  'fitness', 
  'other'
);

-- Create reward_type enum
CREATE TYPE reward_type AS ENUM (
  'discount', 
  'free_item', 
  'cashback', 
  'points', 
  'tier_upgrade', 
  'custom'
);

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  business_type business_type NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  logo TEXT,
  website TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  business_id INTEGER REFERENCES businesses(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create loyalty_programs table
CREATE TABLE IF NOT EXISTS loyalty_programs (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id),
  name TEXT NOT NULL,
  description TEXT,
  points_per_purchase INTEGER DEFAULT 1,
  points_per_dollar INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id SERIAL PRIMARY KEY,
  loyalty_program_id INTEGER NOT NULL REFERENCES loyalty_programs(id),
  name TEXT NOT NULL,
  description TEXT,
  type reward_type NOT NULL,
  points_required INTEGER NOT NULL,
  value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id),
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  birthdate TIMESTAMP,
  joined_date TIMESTAMP DEFAULT NOW(),
  last_visit TIMESTAMP,
  total_spent NUMERIC(10, 2) DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  notes TEXT
);

-- Create customer_points table
CREATE TABLE IF NOT EXISTS customer_points (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  loyalty_program_id INTEGER NOT NULL REFERENCES loyalty_programs(id),
  points INTEGER NOT NULL DEFAULT 0,
  points_used INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  loyalty_program_id INTEGER NOT NULL REFERENCES loyalty_programs(id),
  type TEXT NOT NULL,
  amount NUMERIC(10, 2),
  points INTEGER,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  date_subscribed TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Drop old tables
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;