import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use the provided database URL from environment variables
const connectionString = process.env.DATABASE_URL || "postgresql://Hichers_db_owner:hyjtF4Brc9au@ep-withered-wind-a216jq3j.eu-central-1.aws.neon.tech/Hichers_db?sslmode=require";

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });