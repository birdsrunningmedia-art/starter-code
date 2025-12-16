import * as dotenv from "dotenv";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema/schema";

dotenv.config({ path: ".env.local" }); // <-- IMPORTANT
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const client = neon(connectionString);

export const db = drizzle(client, {
  schema,
  logger: false, // Optional: helpful to see SQL queries in your console during dev
});
